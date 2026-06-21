/**
 * 미니풀이 조립 함수 테스트
 * (텍스트 내용이 아니라 "올바른 항목이 선택되는지"를 검증한다)
 */
import { describe, it, expect } from "vitest";
import { calculateSaju } from "../src/lib/saju";
import { assembleReading } from "../src/lib/saju/interpretation";

describe("미니풀이 조립", () => {
  it("일주 풀이는 일주 간지에 맞는 항목을 고른다 (1997-09-29 부산 → 갑술)", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1997, month: 9, day: 29,
      hour: 17, minute: 3, gender: "female", region: "부산",
    });
    const sections = assembleReading(r, { includeEmpty: true });
    const daySection = sections.find((s) => s.kind === "일주");
    expect(daySection?.id).toBe("dp-갑술");
  });

  it("오행 부족(0개)이면 부족 섹션이 들어간다 (1996-06-26 → 토·금 부족)", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1996, month: 6, day: 26,
      hour: 23, minute: 38, gender: "male",
    });
    const sections = assembleReading(r, { includeEmpty: true });
    const deficientIds = sections.filter((s) => s.kind === "오행부족").map((s) => s.id);
    expect(deficientIds).toContain("el-토-부족");
    expect(deficientIds).toContain("el-금-부족");
  });

  it("가장 강한 십성 분류의 코멘트를 고른다", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1997, month: 9, day: 29,
      hour: 17, minute: 3, gender: "female", region: "부산",
    });
    const sections = assembleReading(r, { includeEmpty: true });
    const tgSection = sections.find((s) => s.kind === "십성");
    expect(tgSection?.id).toBe(`tg-${r.dominantTenGodGroup}`);
  });

  it("시각 미상이면 안내 문구 섹션이 포함된다", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1995, month: 8, day: 20,
      timeUnknown: true, gender: "female",
    });
    const sections = assembleReading(r);
    expect(sections.some((s) => s.kind === "시주미상")).toBe(true);
  });

  it("기본 모드에서는 아직 작성되지 않은(빈) 섹션을 제외한다", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1997, month: 9, day: 29,
      hour: 17, minute: 3, gender: "female", region: "부산",
    });
    const sections = assembleReading(r);
    for (const s of sections) {
      expect(s.text.trim()).not.toBe("");
    }
  });

  it("갑자 일주는 핵심·강점·주의점이 모두 조립된다", () => {
    // 2024-01-01 = 갑자일 (테스트 앵커와 동일)
    const r = calculateSaju({
      calendar: "solar", year: 2024, month: 1, day: 1,
      timeUnknown: true, gender: "male",
    });
    expect(r.pillars.day.ganji).toBe("갑자");
    const sections = assembleReading(r);
    const daySection = sections.find((s) => s.kind === "일주");
    expect(daySection).toBeDefined();
    expect(daySection!.title).toContain("갑자");
    // core/strengths/cautions 가 빈 줄 기준으로 3문단 합쳐졌는지
    expect(daySection!.text.split("\n\n").length).toBe(3);
    expect(daySection!.text).toContain("甲子");
  });

  it("60갑자 일주 텍스트가 빠짐없이 채워져 있다", () => {
    // 60갑자를 모두 도는 60개 연속 달력 날짜로 각 일주 풀이가 비어있지 않은지 확인
    const seen = new Set<string>();
    const base = Date.UTC(2024, 0, 1); // 2024-01-01 = 갑자일
    for (let i = 0; i < 60; i++) {
      const d = new Date(base + i * 86400000);
      const r = calculateSaju({
        calendar: "solar",
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        timeUnknown: true,
        gender: "male",
      });
      seen.add(r.pillars.day.ganji);
      const daySection = assembleReading(r).find((s) => s.kind === "일주");
      expect(daySection, `${r.pillars.day.ganji} 일주 풀이 누락`).toBeDefined();
      expect(daySection!.text.trim().length).toBeGreaterThan(30);
    }
    expect(seen.size).toBe(60); // 60갑자 전부 커버
  });
});
