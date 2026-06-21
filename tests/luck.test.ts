/**
 * 대운·세운·12운성·12신살 테스트
 */
import { describe, it, expect } from "vitest";
import { calculateSaju, getDaeun, getSeun, getWolun, twelveStageOf, sinsalOf } from "../src/lib/saju";
import type { SajuInput } from "../src/lib/saju";

/** 2026-06-18 12:00 KST = 망종(오월) 절기 안 */
const JUNE_2026 = Date.UTC(2026, 5, 18, 3, 0, 0);

const MOON: SajuInput = {
  calendar: "solar", year: 1996, month: 6, day: 26,
  hour: 23, minute: 38, gender: "male", region: "부산",
};

describe("12운성 (일간 기준)", () => {
  it("갑일간: 해=장생, 자=목욕, 인=건록, 오=사 (manse_v2 UNSEONG와 일치)", () => {
    // 인덱스: 자0 축1 인2 묘3 진4 사5 오6 미7 신8 유9 술10 해11
    expect(twelveStageOf(0, 11)).toBe("장생");
    expect(twelveStageOf(0, 0)).toBe("목욕");
    expect(twelveStageOf(0, 2)).toBe("건록");
    expect(twelveStageOf(0, 6)).toBe("사");
  });
  it("을일간(음간 역행): 오=장생, 해=사", () => {
    expect(twelveStageOf(1, 6)).toBe("장생");
    expect(twelveStageOf(1, 11)).toBe("사");
  });
});

describe("12신살 (기준 지지의 삼합국)", () => {
  it("신자진(수국) 생지=신: 신=지살, 자=장성살, 진=화개살, 오=재살", () => {
    // 기준 자(0) → 수국
    expect(sinsalOf(0, 8)).toBe("지살");
    expect(sinsalOf(0, 0)).toBe("장성살");
    expect(sinsalOf(0, 4)).toBe("화개살");
    expect(sinsalOf(0, 6)).toBe("재살");
    expect(sinsalOf(0, 2)).toBe("역마살"); // 생지(신)의 충=인
  });
  it("인오술(화국) 생지=인: 인=지살, 오=장성살, 술=화개살", () => {
    expect(sinsalOf(6, 2)).toBe("지살");
    expect(sinsalOf(6, 6)).toBe("장성살");
    expect(sinsalOf(6, 10)).toBe("화개살");
  });
});

describe("대운 (문인구 1996-06-26 23:38 부산 남)", () => {
  const r = calculateSaju(MOON);
  const d = getDaeun(r, 9);

  it("연간 병(양)+남 → 순행", () => {
    expect(r.pillars.year.ganji).toBe("병자");
    expect(d.forward).toBe(true);
  });

  it("대운수는 3 (출생→소서까지 약 10일 / 3)", () => {
    expect(d.daeunSu).toBe(3);
    expect(d.daysToTerm).toBeGreaterThan(9);
    expect(d.daysToTerm).toBeLessThan(12);
  });

  it("순행: 월주(갑오) 다음 간지부터 — 을미·병신·정유…", () => {
    expect(r.pillars.month.ganji).toBe("갑오");
    expect(d.list[0].ganji).toBe("을미");
    expect(d.list[1].ganji).toBe("병신");
    expect(d.list[2].ganji).toBe("정유");
    expect(d.list[0].startAge).toBe(3);
    expect(d.list[1].startAge).toBe(13);
    expect(d.list[0].startYear).toBe(1999);
  });

  it("각 대운에 12운성·12신살이 붙는다", () => {
    // 첫 대운 을미: 일간 갑 기준 미=묘, 년지 자(수국) 기준 미=천살
    expect(d.list[0].twelveStage).toBe("묘");
    expect(d.list[0].sinsal).toBe("천살");
  });
});

describe("역행 대운 (음년생 남자)", () => {
  it("정묘년 남자 → 역행", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1987, month: 5, day: 5,
      hour: 10, minute: 0, gender: "male", region: "서울",
    });
    // 1987 정묘년(정=음간) + 남 → 역행
    expect(r.pillars.year.stem.name).toBe("정");
    expect(getDaeun(r).forward).toBe(false);
  });
});

describe("세운 (문인구, 2026~2032)", () => {
  const r = calculateSaju(MOON);
  const seun = getSeun(r, 2026, 2032);

  it("2026=병오, 2032=임자 (7개)", () => {
    expect(seun).toHaveLength(7);
    expect(seun[0].year).toBe(2026);
    expect(seun[0].ganji).toBe("병오");
    expect(seun[6].ganji).toBe("임자");
  });

  it("세운 12운성·12신살: 2026 병오 → 일간 갑 기준 오=사, 년지 자 기준 오=재살", () => {
    expect(seun[0].twelveStage).toBe("사");
    expect(seun[0].sinsal).toBe("재살");
  });
});

describe("월운 (문인구, 2026-06부터 13개월, 절기 월건)", () => {
  const r = calculateSaju(MOON);
  const w = getWolun(r, JUNE_2026, 13);

  it("13개월, 첫 달은 망종(오월) 갑오", () => {
    expect(w).toHaveLength(13);
    expect(w[0].termName).toBe("망종");
    expect(w[0].ganji).toBe("갑오");
    expect(w[0].startKst.startsWith("2026-06")).toBe(true);
  });

  it("절기 순서대로 월지가 흐른다: 오·미·신·유·술·해·자·축·인·묘·진·사·오", () => {
    expect(w.map((m) => m.branch)).toEqual([6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]);
  });

  it("입춘(2027)에서 사주 연도가 정미로 바뀌어 월간지가 월두법대로 변한다", () => {
    // 8번째(소한 2027, 축월)는 아직 병오년 → 신축, 9번째(입춘, 인월)는 정미년 → 임인
    const sohan = w.find((m) => m.termName === "소한")!;
    const ipchun = w.find((m) => m.termName === "입춘")!;
    expect(sohan.ganji).toBe("신축");
    expect(ipchun.ganji).toBe("임인");
  });

  it("월운에 12운성(일간 갑)·12신살(년지 자)이 붙는다: 망종 오월 → 사·재살", () => {
    expect(w[0].twelveStage).toBe("사");
    expect(w[0].sinsal).toBe("재살");
  });
});
