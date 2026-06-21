/**
 * 매칭 궁합 계산(4단계)에 필요한 최소 사주 스냅샷 추출.
 * DB에 저장되어 추후 등록자 간 궁합 점수 계산의 입력이 된다.
 */
import type { SajuResult } from "./types";
import type { Element, TenGodGroup } from "./constants";

export interface SajuSnapshot {
  dayStem: number;
  dayBranch: number;
  monthBranch: number;
  yearStem: number;
  yearBranch: number;
  hourStem: number | null;
  hourBranch: number | null;
  elementCount: Record<Element, number>;
  dominantTenGodGroup: TenGodGroup;
  charCount: 6 | 8;
}

export function toSnapshot(r: SajuResult): SajuSnapshot {
  return {
    dayStem: r.pillars.day.stem.index,
    dayBranch: r.pillars.day.branch.index,
    monthBranch: r.pillars.month.branch.index,
    yearStem: r.pillars.year.stem.index,
    yearBranch: r.pillars.year.branch.index,
    hourStem: r.pillars.hour?.stem.index ?? null,
    hourBranch: r.pillars.hour?.branch.index ?? null,
    elementCount: r.elementCount,
    dominantTenGodGroup: r.dominantTenGodGroup,
    charCount: r.charCount,
  };
}
