/**
 * 미니풀이 조립 함수
 *
 * 엔진 출력(SajuResult)에서 해당하는 해석 텍스트를 골라
 * 화면에 그대로 뿌릴 수 있는 섹션 배열로 조립한다.
 * 모든 텍스트는 data/*.json에 빌드 시점에 박제되어 있다 (런타임 AI 호출 없음).
 */
import dayPillars from "./data/day-pillars.json";
import elements from "./data/elements.json";
import tenGodGroups from "./data/ten-god-groups.json";
import general from "./data/general.json";
import jaemulRules from "./data/jaemul-rules.json";
import type { SajuResult } from "../types";
import type { Element, TenGodGroup } from "../constants";

/** 과다/부족 판정 기준 — 발주자가 조정 가능 */
export const INTERPRETATION_RULES = {
  /** 오행이 이 개수 이상이면 "과다" (8글자 기준) */
  EXCESS_MIN_COUNT_8: 4,
  /** 시주 미상(6글자)일 때의 과다 기준 */
  EXCESS_MIN_COUNT_6: 3,
  /** 오행이 이 개수 이하이면 "부족" */
  DEFICIENT_MAX_COUNT: 0,
} as const;

export type ReadingSectionKind = "일주" | "오행과다" | "오행부족" | "십성" | "시주미상";

export interface ReadingSection {
  /** 해석 텍스트의 고유 id (JSON 항목의 id) */
  id: string;
  kind: ReadingSectionKind;
  /** 화면용 제목 (예: "갑술 일주 이야기") */
  title: string;
  text: string;
}

/**
 * 일주별 손으로 쓴 본문 4개 섹션 (①물상 ②기질 ③강점 ⑤조심할점).
 * ④오행은 엔진 elementCount, ⑥재물은 jaemul-rules로 자동 조립하므로 여기 없음.
 */
export interface FullReadingData {
  mulsang: { title: string; body: string };
  gijil: string[];
  gangjeom: string[];
  josim: { intro: string; items: string[] };
}

interface DayPillarEntry {
  id: string;
  ganji: string;
  hanja: string;
  core: string;
  strengths: string;
  cautions: string;
  full?: FullReadingData;
}

const DAY_PILLARS = dayPillars as Record<string, DayPillarEntry>;
const ELEMENTS = elements as Record<
  Element,
  { excess: { id: string; text: string }; deficient: { id: string; text: string } }
>;
const TEN_GOD_GROUPS = tenGodGroups as Record<TenGodGroup, { id: string; text: string }>;

const ELEMENT_ORDER: Element[] = ["목", "화", "토", "금", "수"];

/**
 * 미니풀이 섹션 조립.
 * 기본으로는 텍스트가 비어 있는 섹션(아직 작성 전)은 제외한다.
 * includeEmpty: true 이면 빈 섹션도 포함 (개발/검수용).
 */
export function assembleReading(
  result: SajuResult,
  opts: { includeEmpty?: boolean } = {}
): ReadingSection[] {
  const sections: ReadingSection[] = [];

  // 1. 일주 풀이 (성격 핵심 → 강점 → 주의점 순서로 합침)
  const dayGanji = result.pillars.day.ganji;
  const dp = DAY_PILLARS[dayGanji];
  if (dp) {
    sections.push({
      id: dp.id,
      kind: "일주",
      title: `${dp.ganji}(${dp.hanja}) 일주 이야기`,
      text: [dp.core, dp.strengths, dp.cautions].filter((t) => t.trim() !== "").join("\n\n"),
    });
  }

  // 2. 오행 과다/부족
  const excessThreshold =
    result.charCount === 8
      ? INTERPRETATION_RULES.EXCESS_MIN_COUNT_8
      : INTERPRETATION_RULES.EXCESS_MIN_COUNT_6;
  for (const el of ELEMENT_ORDER) {
    const count = result.elementCount[el];
    if (count >= excessThreshold) {
      sections.push({
        id: ELEMENTS[el].excess.id,
        kind: "오행과다",
        title: `${el} 기운이 강한 사주`,
        text: ELEMENTS[el].excess.text,
      });
    } else if (count <= INTERPRETATION_RULES.DEFICIENT_MAX_COUNT) {
      sections.push({
        id: ELEMENTS[el].deficient.id,
        kind: "오행부족",
        title: `${el} 기운이 부족한 사주`,
        text: ELEMENTS[el].deficient.text,
      });
    }
  }

  // 3. 십성 구조 (가장 강한 분류 기준)
  const tg = TEN_GOD_GROUPS[result.dominantTenGodGroup];
  sections.push({
    id: tg.id,
    kind: "십성",
    title: `${result.dominantTenGodGroup}이 강한 구조`,
    text: tg.text,
  });

  // 4. 시주 미상 안내
  if (!result.pillars.hour) {
    sections.push({
      id: general.hourUnknown.id,
      kind: "시주미상",
      title: "출생 시각을 모르는 경우",
      text: general.hourUnknown.text,
    });
  }

  return opts.includeEmpty ? sections : sections.filter((s) => s.text.trim() !== "");
}

// ---------------------------------------------------------------
// 6단계 상세 풀이 (full) — 해당 일주에 작성돼 있을 때만 반환
// ---------------------------------------------------------------

export interface ElementCountDisplay {
  /** 한글 이름 (예: 나무) */
  name: string;
  /** 한자 (예: 木) */
  hanja: string;
  /** 엔진이 계산한 실제 개수 */
  count: number;
}

export interface FullReadingView extends FullReadingData {
  ganji: string;
  hanja: string;
  /** 엔진 elementCount를 화면 표기용으로 변환한 값 (木火水土金 순) */
  elementCounts: ElementCountDisplay[];
  /** 엔진 값으로 자동 조립된 ⑥재물 섹션 본문 (문단 배열) */
  jaemulBody: string[];
}

/** 오행 표기: 木火水土金 순서 + 한글 이름 */
const ELEMENT_DISPLAY: { key: Element; name: string; hanja: string }[] = [
  { key: "목", name: "나무", hanja: "木" },
  { key: "화", name: "불", hanja: "火" },
  { key: "수", name: "물", hanja: "水" },
  { key: "토", name: "흙", hanja: "土" },
  { key: "금", name: "쇠", hanja: "金" },
];

// ----- ⑥재물 자동 조립 (jaemul-rules.json 규칙) -----
const JAEMUL = jaemulRules as {
  front: Record<TenGodGroup, string>;
  front_blend: { phrase: Record<TenGodGroup, string>; template: string };
  back_결핍: Record<Element, string>;
  back_과다: Record<Element, string>;
  back_중화: string;
  back_connectors: string[];
};

/** 동률을 깰 때의 재물 우선순위 */
const JAEMUL_PRIORITY: TenGodGroup[] = ["재성", "식상", "관성", "인성", "비겁"];
/** 오행 점검 순서 */
const ELEMENT_SCAN_ORDER: Element[] = ["목", "화", "토", "금", "수"];

/**
 * ⑥재물 본문을 엔진 값(tenGodGroupCount, elementCount)으로 조립한다.
 * (CLAUDE_CODE_지시_재물조립.md 알고리즘 그대로)
 */
export function assembleJaemul(
  tenGodGroupCount: Record<TenGodGroup, number>,
  elementCount: Record<Element, number>
): string[] {
  // [앞문단] 십성 분류를 카운트 내림차순, 동률이면 재물우선순위 순으로 정렬
  const ranked = JAEMUL_PRIORITY.map((key) => ({ key, count: tenGodGroupCount[key] }))
    .sort((a, b) =>
      b.count - a.count ||
      JAEMUL_PRIORITY.indexOf(a.key) - JAEMUL_PRIORITY.indexOf(b.key)
    );
  const lead = ranked[0];
  const sec = ranked[1];
  // 혼합형: 2위 카운트가 1위와 1 이내 + 2위가 2 이상 + 둘 다 비겁 아님
  const isBlend =
    sec.count >= lead.count - 1 &&
    sec.count >= 2 &&
    lead.key !== "비겁" &&
    sec.key !== "비겁";
  const front = isBlend
    ? JAEMUL.front_blend.template
        .replace("{A}", JAEMUL.front_blend.phrase[lead.key])
        .replace("{B}", JAEMUL.front_blend.phrase[sec.key])
    : JAEMUL.front[lead.key];

  // [뒷문단] 결핍(0개) 오행이 있으면 각각 별도 문단, 없으면 과다(3+) 또는 중화
  const zeros = ELEMENT_SCAN_ORDER.filter((x) => elementCount[x] === 0);
  let backs: string[];
  if (zeros.length > 0) {
    backs = zeros.map((x) => JAEMUL.back_결핍[x]);
  } else {
    const overs = ELEMENT_SCAN_ORDER.filter((x) => elementCount[x] >= 3);
    backs = overs.length > 0 ? [JAEMUL.back_과다[overs[0]]] : [JAEMUL.back_중화];
  }

  // [연결어] 뒷문단 앞에 연결어 부착 (1번째/2번째/3번째 이상)
  const withConnectors = backs.map(
    (text, i) => JAEMUL.back_connectors[Math.min(i, JAEMUL.back_connectors.length - 1)] + text
  );

  return [front, ...withConnectors];
}

/**
 * 일주의 6단계 상세 풀이를 조립한다.
 * ①②③⑤는 일주별 본문(full), ④오행 개수와 ⑥재물은 엔진 실제 값으로 채운다.
 * 해당 일주에 full 텍스트가 없으면 null (호출부는 기존 섹션으로 폴백).
 */
export function getFullReading(result: SajuResult): FullReadingView | null {
  const dp = DAY_PILLARS[result.pillars.day.ganji];
  if (!dp?.full) return null;
  return {
    ...dp.full,
    ganji: dp.ganji,
    hanja: dp.hanja,
    elementCounts: ELEMENT_DISPLAY.map((e) => ({
      name: e.name,
      hanja: e.hanja,
      count: result.elementCount[e.key],
    })),
    jaemulBody: assembleJaemul(result.tenGodGroupCount, result.elementCount),
  };
}
