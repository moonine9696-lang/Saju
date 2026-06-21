/**
 * 만세력 엔진 자체 검증 테스트
 *
 * 검증 케이스 출처:
 * - 일주 앵커: 1900-01-01=갑술일, 2000-01-01=무오일, 2024-01-01=갑자일 (만세력 공인 값)
 * - 절기: 한국천문연구원 발표값과 교차확인 (2024 입춘 2/4 17:27, 2025 입춘 2/3 23:10 KST)
 * - 전체 명식 케이스: 연주(입춘)/월주(절기+월두법)/일주(JDN)/시주(시두법) 규칙으로
 *   단계별 수기 도출 후 교차확인
 *
 * 발주자 제공 검증 케이스는 아래 OWNER_CASES 배열에 추가하면 된다.
 */
import { describe, it, expect } from "vitest";
import {
  calculateSaju,
  julianDayNumber,
  dayGanjiIndex,
  lunarToSolar,
  getTerm,
  STEMS,
  BRANCHES,
} from "../src/lib/saju";
import type { SajuInput } from "../src/lib/saju";

function ganji(idx: number): string {
  return STEMS[idx % 10] + BRANCHES[idx % 12];
}

describe("일주 계산 (JDN 앵커)", () => {
  it("1900-01-01 = 갑술일", () => {
    expect(ganji(dayGanjiIndex(julianDayNumber(1900, 1, 1)))).toBe("갑술");
  });
  it("2000-01-01 = 무오일", () => {
    expect(ganji(dayGanjiIndex(julianDayNumber(2000, 1, 1)))).toBe("무오");
  });
  it("2024-01-01 = 갑자일", () => {
    expect(ganji(dayGanjiIndex(julianDayNumber(2024, 1, 1)))).toBe("갑자");
  });
});

describe("절기 테이블 (한국천문연구원 값 교차확인)", () => {
  it("2024년 입춘 = 2024-02-04 17:27 KST", () => {
    expect(getTerm(2024, 1).kst).toBe("2024-02-04 17:27");
  });
  it("2025년 입춘 = 2025-02-03 23:10 KST", () => {
    expect(getTerm(2025, 1).kst).toBe("2025-02-03 23:10");
  });
  it("1990년 입춘 = 1990-02-04", () => {
    expect(getTerm(1990, 1).kst.startsWith("1990-02-04")).toBe(true);
  });
});

describe("전체 명식 계산", () => {
  it("양력 1990-05-15 14:30 남성 → 경오년 신사월 경진일 계미시", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1990, month: 5, day: 15,
      hour: 14, minute: 30, gender: "male",
    });
    expect(r.pillars.year.ganji).toBe("경오");
    expect(r.pillars.month.ganji).toBe("신사");
    expect(r.pillars.day.ganji).toBe("경진");
    expect(r.pillars.hour?.ganji).toBe("계미");
  });

  it("양력 2000-01-01 00:30 (지역 모름) → 기묘년 병자월 무오일 임자시", () => {
    const r = calculateSaju({
      calendar: "solar", year: 2000, month: 1, day: 1,
      hour: 0, minute: 30, gender: "female", region: "모름",
    });
    expect(r.pillars.year.ganji).toBe("기묘"); // 입춘 전이므로 1999년 기묘
    expect(r.pillars.month.ganji).toBe("병자"); // 1/1은 소한(1/6) 전이므로 자월
    expect(r.pillars.day.ganji).toBe("무오");
    expect(r.pillars.hour?.ganji).toBe("임자");
  });
});

describe("입춘 경계 (2024-02-04 17:27 KST, 지역 모름=무보정)", () => {
  const base = {
    calendar: "solar" as const, year: 2024, month: 2, day: 4,
    gender: "male" as const, region: "모름" as const,
  };

  it("입춘 직전(12:00) → 계묘년 을축월", () => {
    const r = calculateSaju({ ...base, hour: 12, minute: 0 });
    expect(r.pillars.year.ganji).toBe("계묘");
    expect(r.pillars.month.ganji).toBe("을축");
    expect(r.pillars.day.ganji).toBe("무술");
    expect(r.pillars.hour?.ganji).toBe("무오");
  });

  it("입춘 직후(18:00) → 갑진년 병인월", () => {
    const r = calculateSaju({ ...base, hour: 18, minute: 0 });
    expect(r.pillars.year.ganji).toBe("갑진");
    expect(r.pillars.month.ganji).toBe("병인");
    expect(r.pillars.day.ganji).toBe("무술"); // 일주는 자정 기준이므로 그대로
    expect(r.pillars.hour?.ganji).toBe("신유");
  });

  it("절입 분 단위 경계: 17:26은 계묘년, 17:27은 갑진년", () => {
    expect(calculateSaju({ ...base, hour: 17, minute: 26 }).pillars.year.ganji).toBe("계묘");
    expect(calculateSaju({ ...base, hour: 17, minute: 27 }).pillars.year.ganji).toBe("갑진");
  });
});

describe("시주 규칙", () => {
  it("시각 미상이면 시주는 null, 6글자", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1990, month: 5, day: 15,
      timeUnknown: true, gender: "male",
    });
    expect(r.pillars.hour).toBeNull();
    expect(r.charCount).toBe(6);
    expect(r.time).toBeNull();
  });

  it("정자시(기본): 23:30 출생 (지역 모름) → 일주 유지, 당일 일간 기준 자시", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1990, month: 5, day: 15,
      hour: 23, minute: 30, gender: "male", region: "모름",
    });
    expect(r.pillars.day.ganji).toBe("경진"); // 날짜는 자정 기준
    expect(r.pillars.hour?.ganji).toBe("병자"); // 을경일 → 병자시
  });

  it("야자시 옵션: 23:30 출생 (지역 모름) → 일주 유지, 익일 일간 기준 자시 천간", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1990, month: 5, day: 15,
      hour: 23, minute: 30, gender: "male", region: "모름",
      options: { lateNightZasi: true },
    });
    expect(r.pillars.day.ganji).toBe("경진");
    expect(r.pillars.hour?.ganji).toBe("무자"); // 익일 신사일 → 무자시
  });

  it("시간 경계 (지역 모름): 13:00은 미시, 12:59는 오시", () => {
    const base = {
      calendar: "solar" as const, year: 1990, month: 5, day: 15,
      gender: "male" as const, region: "모름" as const,
    };
    expect(calculateSaju({ ...base, hour: 12, minute: 59 }).pillars.hour?.branch.name).toBe("오");
    expect(calculateSaju({ ...base, hour: 13, minute: 0 }).pillars.hour?.branch.name).toBe("미");
  });
});

describe("음력 입력", () => {
  it("음력 1990-01-01(설날) = 양력 1990-01-27", () => {
    expect(lunarToSolar(1990, 1, 1)).toEqual({ year: 1990, month: 1, day: 27 });
  });

  it("음력 입력과 변환된 양력 입력의 명식이 동일", () => {
    const lunar = calculateSaju({
      calendar: "lunar", year: 1990, month: 1, day: 1,
      hour: 10, minute: 0, gender: "female",
    });
    const solar = calculateSaju({
      calendar: "solar", year: 1990, month: 1, day: 27,
      hour: 10, minute: 0, gender: "female",
    });
    expect(lunar.pillars.year.ganji).toBe(solar.pillars.year.ganji);
    expect(lunar.pillars.month.ganji).toBe(solar.pillars.month.ganji);
    expect(lunar.pillars.day.ganji).toBe(solar.pillars.day.ganji);
    expect(lunar.pillars.hour?.ganji).toBe(solar.pillars.hour?.ganji);
  });

  it("윤달 입력 지원: 2020년 윤4월은 평달 4월과 다른 양력 날짜로 변환", () => {
    const normal = lunarToSolar(2020, 4, 1, false);
    const leap = lunarToSolar(2020, 4, 1, true);
    expect(normal).not.toEqual(leap);
    // 윤4월은 평4월의 약 한 달 뒤
    const diffDays =
      (Date.UTC(leap.year, leap.month - 1, leap.day) -
        Date.UTC(normal.year, normal.month - 1, normal.day)) / 86400000;
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(30);
  });
});

describe("십성·오행 분포 (1990-05-15 14:30, 일간 경금)", () => {
  const r = calculateSaju({
    calendar: "solar", year: 1990, month: 5, day: 15,
    hour: 14, minute: 30, gender: "male",
  });

  it("천간 십성: 연간 경=비견, 월간 신=겁재, 시간 계=상관, 일간=일원", () => {
    expect(r.pillars.year.stem.tenGod).toBe("비견");
    expect(r.pillars.month.stem.tenGod).toBe("겁재");
    expect(r.pillars.hour?.stem.tenGod).toBe("상관");
    expect(r.pillars.day.stem.tenGod).toBe("일원");
  });

  it("지지 십성(본기 기준): 오=정관, 사=편관, 진=편인, 미=정인", () => {
    expect(r.pillars.year.branch.tenGod).toBe("정관");
    expect(r.pillars.month.branch.tenGod).toBe("편관");
    expect(r.pillars.day.branch.tenGod).toBe("편인");
    expect(r.pillars.hour?.branch.tenGod).toBe("정인");
  });

  it("오행 분포: 금3 화2 토2 수1 목0", () => {
    expect(r.elementCount).toEqual({ 목: 0, 화: 2, 토: 2, 금: 3, 수: 1 });
  });

  it("십성 분류 카운트: 비겁2 식상1 재성0 관성2 인성2", () => {
    expect(r.tenGodGroupCount).toEqual({ 비겁: 2, 식상: 1, 재성: 0, 관성: 2, 인성: 2 });
  });
});

describe("진태양시·표준시 보정", () => {
  it("발주자 확정 케이스: 1997-09-29 17:03 부산 여 → 정축년 기유월 갑술일 임신시 (보정 후 16:49 신시)", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1997, month: 9, day: 29,
      hour: 17, minute: 3, gender: "female", region: "부산",
    });
    expect(r.pillars.year.ganji).toBe("정축");
    expect(r.pillars.month.ganji).toBe("기유");
    expect(r.pillars.day.ganji).toBe("갑술");
    expect(r.pillars.hour?.ganji).toBe("임신");
    expect(r.pillars.hour?.branch.name).toBe("신");
    expect(r.correction?.corrected.hour).toBe(16);
    expect(r.correction?.corrected.minute).toBe(49);
  });

  it("서울 보정으로 자정을 넘으면 일주가 전날로 바뀐다: 2000-01-01 00:10 서울", () => {
    // 보정 약 -35분 → 1999-12-31 23:35 → 일주 정사(12/31), 자시
    const r = calculateSaju({
      calendar: "solar", year: 2000, month: 1, day: 1,
      hour: 0, minute: 10, gender: "male", region: "서울",
    });
    expect(r.pillars.year.ganji).toBe("기묘");
    expect(r.pillars.month.ganji).toBe("병자");
    expect(r.pillars.day.ganji).toBe("정사"); // 1999-12-31
    expect(r.pillars.hour?.ganji).toBe("경자"); // 정임일 → 경자시
    expect(r.correction?.corrected.day).toBe(31);
  });

  it("서머타임(1987~88) 자동 차감: 1987-08-15 13:30 (지역 모름) → 표준시 12:30 오시", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1987, month: 8, day: 15,
      hour: 13, minute: 30, gender: "female", region: "모름",
    });
    expect(r.correction?.dstAdjusted).toBe(true);
    expect(r.correction?.corrected.hour).toBe(12);
    expect(r.correction?.corrected.minute).toBe(30);
    expect(r.pillars.hour?.branch.name).toBe("오");
  });

  it("1954~1961 표준시(UTC+8:30) 처리: 1955-06-15 12:00 서울 → 보정 후 약 11:58 오시", () => {
    // 당시 표준시가 동경 127.5도 기준이라 서울의 경도 보정이 거의 0에 가깝다
    const r = calculateSaju({
      calendar: "solar", year: 1955, month: 6, day: 15,
      hour: 12, minute: 0, gender: "male", region: "서울",
    });
    expect(r.correction?.standardOffsetMin).toBe(510);
    expect(r.correction?.corrected.hour).toBe(11);
    expect(r.pillars.hour?.branch.name).toBe("오");
  });

  it("지역 모름이면 경도/균시차 보정을 생략한다", () => {
    const r = calculateSaju({
      calendar: "solar", year: 1990, month: 5, day: 15,
      hour: 14, minute: 30, gender: "male", region: "모름",
    });
    expect(r.correction?.longitudeCorrectionMin).toBeNull();
    expect(r.correction?.equationOfTimeMin).toBeNull();
    expect(r.correction?.corrected.hour).toBe(14);
    expect(r.correction?.corrected.minute).toBe(30);
  });
});

describe("입력 검증", () => {
  it("지원 범위 밖 연도는 오류", () => {
    expect(() =>
      calculateSaju({ calendar: "solar", year: 1939, month: 6, day: 1, timeUnknown: true, gender: "male" })
    ).toThrow();
    expect(() =>
      calculateSaju({ calendar: "solar", year: 2051, month: 6, day: 1, timeUnknown: true, gender: "male" })
    ).toThrow();
  });

  it("존재하지 않는 날짜는 오류", () => {
    expect(() =>
      calculateSaju({ calendar: "solar", year: 2023, month: 2, day: 29, timeUnknown: true, gender: "male" })
    ).toThrow();
  });
});

// ---------------------------------------------------------------
// 발주자 제공 검증 케이스 — 실제 만세력 사이트와 교차확인한 정답을
// 아래 형식으로 추가해 주세요. (시 미상이면 hour 항목 생략)
// ---------------------------------------------------------------
const OWNER_CASES: {
  name: string;
  input: SajuInput;
  expected: { year: string; month: string; day: string; hour?: string };
}[] = [
  {
    // 발주자 확정 케이스 (2026-06-12): 정자시 표준 확정의 기준 케이스.
    // 23시 이후 출생이라도 일주는 자정 기준 당일 유지(갑오), 자시 처리(갑자시).
    name: "1996-06-26 23:38 남 → 병자년 갑오월 갑오일 갑자시 (정자시 표준)",
    input: { calendar: "solar", year: 1996, month: 6, day: 26, hour: 23, minute: 38, gender: "male" },
    expected: { year: "병자", month: "갑오", day: "갑오", hour: "갑자" },
  },
  {
    // 발주자 확정 케이스 (2026-06-12): 진태양시 보정 기준 케이스. PDF 엔진과 동일 결과여야 함.
    name: "1997-09-29 17:03 부산 여 → 정축년 기유월 갑술일 임신시 (진태양시 보정)",
    input: { calendar: "solar", year: 1997, month: 9, day: 29, hour: 17, minute: 3, gender: "female", region: "부산" },
    expected: { year: "정축", month: "기유", day: "갑술", hour: "임신" },
  },
];

describe.skipIf(OWNER_CASES.length === 0)("발주자 제공 검증 케이스", () => {
  for (const c of OWNER_CASES) {
    it(c.name, () => {
      const r = calculateSaju(c.input);
      expect(r.pillars.year.ganji).toBe(c.expected.year);
      expect(r.pillars.month.ganji).toBe(c.expected.month);
      expect(r.pillars.day.ganji).toBe(c.expected.day);
      if (c.expected.hour) expect(r.pillars.hour?.ganji).toBe(c.expected.hour);
    });
  }
});
