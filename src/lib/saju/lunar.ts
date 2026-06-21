/**
 * 음력 → 양력 변환 (korean-lunar-calendar 사용, 윤달 지원)
 */
import KoreanLunarCalendar from "korean-lunar-calendar";

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth = false
): SolarDate {
  const cal = new KoreanLunarCalendar();
  const ok = cal.setLunarDate(year, month, day, isLeapMonth);
  if (!ok) {
    throw new Error(
      `유효하지 않은 음력 날짜입니다: ${year}년 ${isLeapMonth ? "윤" : ""}${month}월 ${day}일`
    );
  }
  const solar = cal.getSolarCalendar();
  return { year: solar.year, month: solar.month, day: solar.day };
}
