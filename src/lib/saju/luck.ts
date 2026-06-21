/**
 * 대운(大運)·세운(歲運) 계산.
 *
 * 대운:
 *  - 방향: 연간 양(陽)+남, 연간 음(陰)+여 → 순행 / 그 반대 → 역행
 *  - 대운수(시작 나이): 순행은 출생→다음 절입, 역행은 직전 절입→출생 까지의
 *    실제 일수를 3으로 나눈 값(3일=1년). 반올림하여 시작 나이로 쓴다.
 *  - 간지: 월주에서 순행이면 다음 간지, 역행이면 이전 간지부터 10년 단위.
 * 세운: 해당 연도의 간지 ((연도-4) 기준 60갑자).
 * 각 대운·세운 기둥에 12운성(일간 기준)·12신살(년지 기준)을 함께 계산한다.
 */
import {
  STEMS, BRANCHES, STEMS_HANJA, BRANCHES_HANJA,
  TERM_TO_MONTH_BRANCH, monthOrderFromIn,
} from "./constants";
import { findEnclosingTerms, termsFrom, TERM_NAMES } from "./solar-terms";
import { twelveStageOf, sinsalOf, type TwelveStage, type Sinsal } from "./twelve";
import type { SajuResult } from "./types";

const DAY_MS = 86_400_000;

export interface LuckPillar {
  ganjiIndex: number;
  ganji: string;
  ganjiHanja: string;
  stem: number;
  branch: number;
  /** 12운성 (일간 기준) */
  twelveStage: TwelveStage;
  /** 12신살 (년지 기준) */
  sinsal: Sinsal;
}

export interface DaeunPillar extends LuckPillar {
  /** 이 대운이 시작되는 만 나이 */
  startAge: number;
  /** 이 대운이 시작되는 양력 연도 (근사: 출생연도 + 시작 나이) */
  startYear: number;
}

export interface DaeunResult {
  /** 순행 여부 (false = 역행) */
  forward: boolean;
  /** 대운수 (시작 나이, 반올림 정수) */
  daeunSu: number;
  /** 대운수 정밀값 (반올림 전) */
  daeunSuExact: number;
  /** 대운수 산출에 쓰인 절입까지/부터의 일수 */
  daysToTerm: number;
  list: DaeunPillar[];
}

export interface SeunPillar extends LuckPillar {
  year: number;
}

function makeGanji(idx60: number) {
  const i = ((idx60 % 60) + 60) % 60;
  const stem = i % 10;
  const branch = i % 12;
  return {
    ganjiIndex: i,
    stem,
    branch,
    ganji: STEMS[stem] + BRANCHES[branch],
    ganjiHanja: STEMS_HANJA[stem] + BRANCHES_HANJA[branch],
  };
}

/** 천간·지지 인덱스로 60갑자 기둥 만들기 (월운 월간지용) */
function ganjiFromStemBranch(stem: number, branch: number) {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) return makeGanji(i);
  }
  throw new Error(`유효하지 않은 간지 조합: 천간${stem} 지지${branch}`);
}

/**
 * 대운 계산. count = 산출할 대운 개수 (기본 9개, 약 90년).
 * 시각 미상이면 birthEpochMs가 정오 기준이라 대운수가 근사값이 된다.
 */
export function getDaeun(result: SajuResult, count = 9): DaeunResult {
  const yearStem = result.pillars.year.stem.index;
  const dayStem = result.pillars.day.stem.index;
  const yearBranch = result.pillars.year.branch.index;
  const monthIdx = result.pillars.month.ganjiIndex;
  const birthYear = result.solarDate.year;

  const isYangYear = yearStem % 2 === 0;
  const male = result.gender === "male";
  const forward = (isYangYear && male) || (!isYangYear && !male);

  const { prev, next } = findEnclosingTerms(result.birthEpochMs);
  const days = forward
    ? (next.t - result.birthEpochMs) / DAY_MS
    : (result.birthEpochMs - prev.t) / DAY_MS;
  const daeunSuExact = days / 3;
  const daeunSu = Math.max(0, Math.round(daeunSuExact));

  const list: DaeunPillar[] = [];
  for (let i = 1; i <= count; i++) {
    const g = makeGanji(forward ? monthIdx + i : monthIdx - i);
    const startAge = daeunSu + (i - 1) * 10;
    list.push({
      ...g,
      twelveStage: twelveStageOf(dayStem, g.branch),
      sinsal: sinsalOf(yearBranch, g.branch),
      startAge,
      startYear: birthYear + startAge,
    });
  }

  return { forward, daeunSu, daeunSuExact, daysToTerm: days, list };
}

export interface WolunPillar extends LuckPillar {
  /** 절기 인덱스 (0=소한 .. 11=대설) */
  termIndex: number;
  /** 절기 이름 (예: 망종) */
  termName: string;
  /** 절입 시작 시각 (KST 표기, 예: "2026-06-05 22:48") */
  startKst: string;
  /** 절입 시작 시각 (epoch ms, UTC) */
  startEpochMs: number;
}

/**
 * 월운(月運): fromEpochMs를 포함하는 절(節)부터 count개월의 월건.
 * 달력 월이 아니라 절기 절입을 경계로 월간지를 잡는다(월두법).
 * 각 월에 12운성(일간 기준)·12신살(년지 기준)을 함께 계산한다.
 */
export function getWolun(result: SajuResult, fromEpochMs: number, count = 13): WolunPillar[] {
  const dayStem = result.pillars.day.stem.index;
  const yearBranch = result.pillars.year.branch.index;

  return termsFrom(fromEpochMs, count).map((term) => {
    // 해당 절입 시점의 사주 연도(입춘 기준): 소한(n=0)은 입춘 전이라 전년도 소속
    const sajuYear = term.n === 0 ? term.y - 1 : term.y;
    const yearStem = (((sajuYear - 4) % 10) + 10) % 10;

    const monthBranch = TERM_TO_MONTH_BRANCH[term.n];
    const monthOrder = monthOrderFromIn(monthBranch);
    const monthStem = ((yearStem % 5) * 2 + 2 + monthOrder) % 10; // 월두법

    const g = ganjiFromStemBranch(monthStem, monthBranch);
    return {
      ...g,
      twelveStage: twelveStageOf(dayStem, g.branch),
      sinsal: sinsalOf(yearBranch, g.branch),
      termIndex: term.n,
      termName: TERM_NAMES[term.n],
      startKst: term.kst,
      startEpochMs: term.t,
    };
  });
}

/** 세운: startYear~endYear 각 해의 간지 + 12운성(일간 기준) + 12신살(년지 기준) */
export function getSeun(result: SajuResult, startYear: number, endYear: number): SeunPillar[] {
  const dayStem = result.pillars.day.stem.index;
  const yearBranch = result.pillars.year.branch.index;
  const out: SeunPillar[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const g = makeGanji(y - 4); // 1984=갑자 기준 60갑자
    out.push({
      ...g,
      twelveStage: twelveStageOf(dayStem, g.branch),
      sinsal: sinsalOf(yearBranch, g.branch),
      year: y,
    });
  }
  return out;
}
