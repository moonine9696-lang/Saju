/**
 * 만세력 엔진 — 생년월일시(양력/음력)로부터 사주 명식을 계산한다.
 *
 * 계산 규칙:
 * - 연주: 입춘 절입 시각 기준으로 해가 바뀐다
 * - 월주: 12절(節) 절입 시각 기준, 연간에 따른 월두법
 * - 일주: 율리우스적일(JDN) 기반 60갑자 순환 (검증된 앵커: 2000-01-01 = 무오일)
 * - 시주: 일간에 따른 시두법. 기본 정자시(자정에 날짜 변경, 23시~익일 1시 = 자시)
 * - 시각 보정: 서머타임(1987~88) 차감, 1954~1961 UTC+8:30 표준시 처리,
 *   출생 지역 경도 + 균시차에 의한 진태양시 보정 후 시진/일주 판정
 *   (지역 "모름"이면 경도/균시차 보정 생략, 표준시 정규화만 적용)
 */
import {
  STEMS,
  STEMS_HANJA,
  BRANCHES,
  BRANCHES_HANJA,
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  HIDDEN_STEMS,
  TERM_TO_MONTH_BRANCH,
  TEN_GOD_GROUP,
  yinYangOf,
  tenGodOf,
  monthOrderFromIn,
  type Element,
  type TenGodGroup,
} from "./constants";
import { findGoverningTerm, getTerm, SUPPORTED_RANGE } from "./solar-terms";
import { lunarToSolar } from "./lunar";
import { REGIONS, DEFAULT_REGION } from "./regions";
import { normalizeKoreanTime, equationOfTimeMin, apparentSolarWall } from "./time-correction";
import type { SajuInput, SajuResult, Pillar, SajuChar, BranchChar, TimeCorrection } from "./types";

const KST_OFFSET_MS = 9 * 3600 * 1000;

/** 그레고리력 날짜 → 율리우스적일(JDN, 자정 기준 정수) */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** JDN → 60갑자 인덱스 (0 = 갑자). 앵커: 1900-01-01 갑술, 2000-01-01 무오 */
export function dayGanjiIndex(jdn: number): number {
  return (jdn + 49) % 60;
}

function kstEpochMs(year: number, month: number, day: number, hour: number, minute: number): number {
  return Date.UTC(year, month - 1, day, hour, minute) - KST_OFFSET_MS;
}

function isValidSolarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day
  );
}

function makeStemChar(stemIdx: number, dayStem: number, isDayMaster: boolean): SajuChar {
  return {
    index: stemIdx,
    name: STEMS[stemIdx],
    hanja: STEMS_HANJA[stemIdx],
    element: STEM_ELEMENT[stemIdx],
    yinYang: yinYangOf(stemIdx),
    tenGod: isDayMaster ? "일원" : tenGodOf(dayStem, stemIdx),
  };
}

function makeBranchChar(branchIdx: number, dayStem: number): BranchChar {
  const hidden = HIDDEN_STEMS[branchIdx];
  const mainStem = hidden[hidden.length - 1];
  return {
    index: branchIdx,
    name: BRANCHES[branchIdx],
    hanja: BRANCHES_HANJA[branchIdx],
    element: BRANCH_ELEMENT[branchIdx],
    yinYang: yinYangOf(branchIdx),
    tenGod: tenGodOf(dayStem, mainStem),
    hiddenStems: hidden.map((s) => ({
      name: STEMS[s],
      hanja: STEMS_HANJA[s],
      tenGod: tenGodOf(dayStem, s),
    })),
  };
}

function makePillar(stemIdx: number, branchIdx: number, dayStem: number, isDayPillar = false): Pillar {
  // 60갑자 인덱스: 천간과 지지의 짝 (stem ≡ idx mod 10, branch ≡ idx mod 12)
  let ganjiIndex = -1;
  for (let i = stemIdx; i < 60; i += 10) {
    if (i % 12 === branchIdx) {
      ganjiIndex = i;
      break;
    }
  }
  return {
    stem: makeStemChar(stemIdx, dayStem, isDayPillar),
    branch: makeBranchChar(branchIdx, dayStem),
    ganjiIndex,
    ganji: STEMS[stemIdx] + BRANCHES[branchIdx],
    ganjiHanja: STEMS_HANJA[stemIdx] + BRANCHES_HANJA[branchIdx],
  };
}

export function calculateSaju(input: SajuInput): SajuResult {
  const options = input.options ?? {};

  // ----- 1. 입력 검증 및 양력 변환 -----
  let solar: { year: number; month: number; day: number };
  if (input.calendar === "lunar") {
    solar = lunarToSolar(input.year, input.month, input.day, input.isLeapMonth ?? false);
  } else {
    if (!isValidSolarDate(input.year, input.month, input.day)) {
      throw new Error(`유효하지 않은 양력 날짜입니다: ${input.year}-${input.month}-${input.day}`);
    }
    solar = { year: input.year, month: input.month, day: input.day };
  }

  if (solar.year < SUPPORTED_RANGE.start || solar.year > SUPPORTED_RANGE.end) {
    throw new Error(`지원 범위를 벗어난 연도입니다 (양력 ${SUPPORTED_RANGE.start}~${SUPPORTED_RANGE.end}년).`);
  }

  const region = input.region ?? DEFAULT_REGION;
  if (!(region in REGIONS)) {
    throw new Error(`알 수 없는 지역입니다: ${region}`);
  }

  const timeKnown = !input.timeUnknown && input.hour !== undefined;
  const hour = timeKnown ? input.hour! : 12; // 시각 미상이면 절기 비교용으로 정오 사용
  const minute = timeKnown ? input.minute ?? 0 : 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`유효하지 않은 시각입니다: ${hour}:${minute}`);
  }

  // ----- 시각 정규화 및 진태양시 보정 -----
  // birthMs: 절기 비교용 절대 시각 / pillarDate·pillarHour: 일주·시주 판정용 보정 시각
  let birthMs: number;
  let pillarDate = { year: solar.year, month: solar.month, day: solar.day };
  let pillarHour = hour;
  let correction: TimeCorrection | null = null;

  if (timeKnown) {
    const norm = normalizeKoreanTime(solar.year, solar.month, solar.day, hour, minute);
    birthMs = norm.epochUtc;

    const longitude = REGIONS[region];
    let correctedWall: number;
    let lonCorrMin: number | null = null;
    let eotMin: number | null = null;
    if (longitude !== null) {
      eotMin = equationOfTimeMin(norm.stdWall);
      correctedWall = apparentSolarWall(norm.epochUtc, longitude, eotMin);
      lonCorrMin = 4 * longitude - norm.utcOffsetMin;
    } else {
      correctedWall = norm.stdWall; // 지역 모름: 표준시 정규화만 적용
    }

    const c = new Date(correctedWall);
    pillarDate = { year: c.getUTCFullYear(), month: c.getUTCMonth() + 1, day: c.getUTCDate() };
    pillarHour = c.getUTCHours();
    const inputWall = Date.UTC(solar.year, solar.month - 1, solar.day, hour, minute);
    const round1 = (v: number) => Math.round(v * 10) / 10;
    correction = {
      region,
      dstAdjusted: norm.dstAdjusted,
      standardOffsetMin: norm.utcOffsetMin,
      longitudeCorrectionMin: lonCorrMin === null ? null : round1(lonCorrMin),
      equationOfTimeMin: eotMin === null ? null : round1(eotMin),
      totalCorrectionMin: round1((correctedWall - inputWall) / 60000),
      corrected: {
        year: pillarDate.year,
        month: pillarDate.month,
        day: pillarDate.day,
        hour: pillarHour,
        minute: c.getUTCMinutes(),
      },
    };
  } else {
    birthMs = kstEpochMs(solar.year, solar.month, solar.day, hour, minute);
  }

  // ----- 2. 연주: 입춘 기준 -----
  const ipchun = getTerm(solar.year, 1); // n=1 입춘
  const sajuYear = birthMs >= ipchun.t ? solar.year : solar.year - 1;
  const yearStem = (((sajuYear - 4) % 10) + 10) % 10;
  const yearBranch = (((sajuYear - 4) % 12) + 12) % 12;

  // ----- 3. 월주: 직전 절기 기준 + 월두법 -----
  const governing = findGoverningTerm(birthMs);
  const monthBranch = TERM_TO_MONTH_BRANCH[governing.n];
  const monthOrder = monthOrderFromIn(monthBranch); // 인월=0 .. 축월=11
  const monthStem = ((yearStem % 5) * 2 + 2 + monthOrder) % 10;

  // ----- 4. 일주: JDN 앵커 방식 (정자시: 보정 시각 기준 자정에 날짜 변경) -----
  const jdn = julianDayNumber(pillarDate.year, pillarDate.month, pillarDate.day);
  const dayIdx = dayGanjiIndex(jdn);
  const dayStem = dayIdx % 10;
  const dayBranch = dayIdx % 12;

  // ----- 5. 시주: 시두법 (보정 시각 기준) -----
  let hourPillar: Pillar | null = null;
  if (timeKnown) {
    const hourBranch = Math.floor(((pillarHour + 1) % 24) / 2); // 23시~1시=자(0), 1~3시=축(1) ...
    // 야자시 옵션: 23시~24시 출생이면 시간(時干)만 다음 날 일간 기준
    const stemBase =
      options.lateNightZasi && pillarHour >= 23 ? dayGanjiIndex(jdn + 1) % 10 : dayStem;
    const hourStem = ((stemBase % 5) * 2 + hourBranch) % 10;
    hourPillar = makePillar(hourStem, hourBranch, dayStem);
  }

  // ----- 6. 명식 조립 -----
  const pillars = {
    year: makePillar(yearStem, yearBranch, dayStem),
    month: makePillar(monthStem, monthBranch, dayStem),
    day: makePillar(dayStem, dayBranch, dayStem, true),
    hour: hourPillar,
  };

  // ----- 7. 오행 분포 -----
  const elementCount: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const presentPillars = [pillars.year, pillars.month, pillars.day, ...(hourPillar ? [hourPillar] : [])];
  for (const p of presentPillars) {
    elementCount[p.stem.element]++;
    elementCount[p.branch.element]++;
  }

  // ----- 8. 십성 분류 카운트 (일간 제외, 지지는 본기 기준) -----
  const tenGodGroupCount: Record<TenGodGroup, number> = {
    비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0,
  };
  for (const p of presentPillars) {
    if (p.stem.tenGod !== "일원") tenGodGroupCount[TEN_GOD_GROUP[p.stem.tenGod]]++;
    if (p.branch.tenGod !== "일원") tenGodGroupCount[TEN_GOD_GROUP[p.branch.tenGod]]++;
  }
  const groupOrder: TenGodGroup[] = ["비겁", "식상", "재성", "관성", "인성"];
  const dominantTenGodGroup = groupOrder.reduce((best, g) =>
    tenGodGroupCount[g] > tenGodGroupCount[best] ? g : best
  );

  return {
    solarDate: solar,
    time: timeKnown ? { hour, minute } : null,
    birthEpochMs: birthMs,
    correction,
    gender: input.gender,
    pillars,
    elementCount,
    charCount: timeKnown ? 8 : 6,
    tenGodGroupCount,
    dominantTenGodGroup,
  };
}
