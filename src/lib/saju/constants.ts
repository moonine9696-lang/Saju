/**
 * 사주 기초 데이터: 천간·지지·오행·음양·지장간·십성 관계
 * 모든 계산은 인덱스 기반 (천간 0~9, 지지 0~11, 60갑자 0~59 / 0 = 갑자)
 */

export type Element = "목" | "화" | "토" | "금" | "수";
export type YinYang = "양" | "음";
export type TenGod =
  | "비견" | "겁재"
  | "식신" | "상관"
  | "편재" | "정재"
  | "편관" | "정관"
  | "편인" | "정인";
export type TenGodGroup = "비겁" | "식상" | "재성" | "관성" | "인성";

// ----- 천간 (天干) -----
export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const STEM_ELEMENT: readonly Element[] = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];

// ----- 지지 (地支) -----
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const BRANCHES_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const BRANCH_ELEMENT: readonly Element[] = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];

// 짝수 인덱스 = 양, 홀수 인덱스 = 음 (천간·지지 공통)
export function yinYangOf(index: number): YinYang {
  return index % 2 === 0 ? "양" : "음";
}

// ----- 지장간 (支藏干): 각 지지에 숨은 천간 인덱스, 마지막 원소가 본기(本氣) -----
export const HIDDEN_STEMS: readonly (readonly number[])[] = [
  [8, 9],       // 자: 임 계
  [9, 7, 5],    // 축: 계 신 기
  [4, 2, 0],    // 인: 무 병 갑
  [0, 1],       // 묘: 갑 을
  [1, 9, 4],    // 진: 을 계 무
  [4, 6, 2],    // 사: 무 경 병
  [2, 5, 3],    // 오: 병 기 정
  [3, 1, 5],    // 미: 정 을 기
  [4, 8, 6],    // 신: 무 임 경
  [6, 7],       // 유: 경 신
  [7, 3, 4],    // 술: 신 정 무
  [4, 0, 8],    // 해: 무 갑 임
];

// ----- 오행 상생·상극 -----
export const GENERATES: Record<Element, Element> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
export const CONTROLS: Record<Element, Element> = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" };

// ----- 십성 (十星): 일간 기준으로 다른 천간의 관계 -----
export function tenGodOf(dayStem: number, targetStem: number): TenGod {
  const de = STEM_ELEMENT[dayStem];
  const te = STEM_ELEMENT[targetStem];
  const sameYY = dayStem % 2 === targetStem % 2;
  if (de === te) return sameYY ? "비견" : "겁재";
  if (GENERATES[de] === te) return sameYY ? "식신" : "상관";
  if (CONTROLS[de] === te) return sameYY ? "편재" : "정재";
  if (CONTROLS[te] === de) return sameYY ? "편관" : "정관";
  return sameYY ? "편인" : "정인"; // GENERATES[te] === de
}

export const TEN_GOD_GROUP: Record<TenGod, TenGodGroup> = {
  비견: "비겁", 겁재: "비겁",
  식신: "식상", 상관: "식상",
  편재: "재성", 정재: "재성",
  편관: "관성", 정관: "관성",
  편인: "인성", 정인: "인성",
};

// ----- 절기 인덱스(0=소한..11=대설) → 그 절기로 시작하는 달의 지지 -----
// 소한→축, 입춘→인, 경칩→묘, 청명→진, 입하→사, 망종→오,
// 소서→미, 입추→신, 백로→유, 한로→술, 입동→해, 대설→자
export const TERM_TO_MONTH_BRANCH: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];

// 인월(寅月)을 0으로 하는 월 차례 (월두법 계산용)
export function monthOrderFromIn(monthBranch: number): number {
  return (monthBranch - 2 + 12) % 12;
}
