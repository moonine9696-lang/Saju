/**
 * 절기 테이블 조회. 데이터는 scripts/generate-solar-terms.ts 로 생성된
 * data/solar-terms.json (1939~2050년, KST 분 단위) 을 사용한다.
 */
import data from "./data/solar-terms.json";

export interface TermRecord {
  y: number; // 양력 연도
  n: number; // 절기 인덱스 (0=소한 .. 11=대설)
  t: number; // 절입 시각 epoch ms (UTC)
  kst: string;
}

const TERMS: TermRecord[] = (data as { terms: TermRecord[] }).terms;

export const TERM_NAMES: string[] = (data as { termNames: string[] }).termNames;

/** 엔진이 지원하는 출생 연도 범위 */
export const SUPPORTED_RANGE = { start: 1940, end: 2050 } as const;

/** 주어진 시각(epoch ms) 이전(이하)의 가장 최근 절기 — 월주의 기준 */
export function findGoverningTerm(epochMs: number): TermRecord {
  let lo = 0;
  let hi = TERMS.length - 1;
  if (epochMs < TERMS[0].t) {
    throw new Error("지원 범위(1940~2050년) 이전의 날짜입니다.");
  }
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (TERMS[mid].t <= epochMs) lo = mid;
    else hi = mid - 1;
  }
  return TERMS[lo];
}

/**
 * 주어진 시각을 감싸는 직전·직후 절기. 대운수(절입까지/부터 일수) 계산용.
 * (직전 = 그 시각 이하의 가장 최근 절, 직후 = 그 다음 절)
 */
export function findEnclosingTerms(epochMs: number): { prev: TermRecord; next: TermRecord } {
  if (epochMs < TERMS[0].t || epochMs >= TERMS[TERMS.length - 1].t) {
    throw new Error("지원 범위를 벗어난 날짜입니다 (대운 계산 불가).");
  }
  let lo = 0;
  let hi = TERMS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (TERMS[mid].t <= epochMs) lo = mid;
    else hi = mid - 1;
  }
  return { prev: TERMS[lo], next: TERMS[lo + 1] };
}

/**
 * 주어진 시각을 포함하는 절(節)부터 count개의 연속 절기를 반환. 월운 계산용.
 * (시작 = 그 시각 이하의 가장 최근 절입)
 */
export function termsFrom(epochMs: number, count: number): TermRecord[] {
  if (epochMs < TERMS[0].t) {
    throw new Error("지원 범위(1940~2050년) 이전의 날짜입니다.");
  }
  let lo = 0;
  let hi = TERMS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (TERMS[mid].t <= epochMs) lo = mid;
    else hi = mid - 1;
  }
  const out = TERMS.slice(lo, lo + count);
  if (out.length < count) {
    throw new Error("지원 범위(2050년)를 벗어나는 월운 요청입니다.");
  }
  return out;
}

/** 특정 연도의 특정 절기 (예: 입춘 = n 1) */
export function getTerm(year: number, n: number): TermRecord {
  const found = TERMS.find((r) => r.y === year && r.n === n);
  if (!found) {
    throw new Error(`절기 데이터가 없습니다: ${year}년 (지원 범위 1940~2050)`);
  }
  return found;
}
