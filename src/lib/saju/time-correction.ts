/**
 * 시각 보정 모듈
 *
 * 1) 서머타임 차감: 1987~88년 시행기 출생은 시계가 1시간 빨랐으므로 1시간 차감
 * 2) 표준시 변경기: 1954-03-21 ~ 1961-08-09 한국 표준시는 UTC+8:30 (이외 UTC+9)
 * 3) 진태양시: 출생 지역 경도 보정(동경 135도 기준 1도당 4분) + 균시차(태양 위치에
 *    따른 ±16분 연중 변동, Spencer 공식)를 적용한 시각으로 시진/일주를 판정
 *
 * 시각 표현: "벽시계 프레임" 숫자 = Date.UTC(연,월-1,일,시,분).
 * 실제 절대 시각(epoch UTC)은 표준시 오프셋을 빼서 얻는다.
 */

const MIN = 60000;
const HOUR = 3600000;

/** 서머타임 시행 구간 (벽시계 기준) */
const DST_PERIODS = [
  { start: Date.UTC(1987, 4, 10, 2, 0), end: Date.UTC(1987, 9, 11, 3, 0) },
  { start: Date.UTC(1988, 4, 8, 2, 0), end: Date.UTC(1988, 9, 9, 3, 0) },
];

/** UTC+8:30 표준시 시행 구간 (벽시계 기준): 1954-03-21 ~ 1961-08-09 */
const UTC830_START = Date.UTC(1954, 2, 21, 0, 0);
const UTC830_END = Date.UTC(1961, 7, 10, 0, 0);

export interface TimeNormalization {
  /** 서머타임 차감 후의 표준시 (벽시계 프레임 숫자) */
  stdWall: number;
  /** 실제 절대 시각 (epoch ms, UTC) — 절기 비교용 */
  epochUtc: number;
  /** 서머타임 차감이 적용되었는지 */
  dstAdjusted: boolean;
  /** 당시 표준시의 UTC 오프셋 (분): 540=UTC+9, 510=UTC+8:30 */
  utcOffsetMin: number;
}

/** 출생 당시의 시계 시각 → 표준시·절대시각으로 정규화 */
export function normalizeKoreanTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): TimeNormalization {
  let wall = Date.UTC(year, month - 1, day, hour, minute);
  let dstAdjusted = false;
  for (const p of DST_PERIODS) {
    if (wall >= p.start && wall < p.end) {
      wall -= HOUR;
      dstAdjusted = true;
      break;
    }
  }
  const utcOffsetMin = wall >= UTC830_START && wall < UTC830_END ? 510 : 540;
  return { stdWall: wall, epochUtc: wall - utcOffsetMin * MIN, dstAdjusted, utcOffsetMin };
}

/**
 * 균시차 (Equation of Time, 분 단위) — Spencer(1971) 공식, 오차 약 ±0.3분
 * 양수이면 진태양시가 평균태양시보다 빠르다.
 */
export function equationOfTimeMin(stdWall: number): number {
  const d = new Date(stdWall);
  const startOfYear = Date.UTC(d.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((stdWall - startOfYear) / 86400000); // 0-based
  const g = ((2 * Math.PI) / 365) * (dayOfYear + (d.getUTCHours() - 12) / 24);
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.04089 * Math.sin(2 * g))
  );
}

/**
 * 절대 시각 + 지역 경도 → 진태양시 (벽시계 프레임 숫자)
 * 진태양시 = UTC + 경도×4분 + 균시차
 */
export function apparentSolarWall(epochUtc: number, longitudeDeg: number, eotMin: number): number {
  return epochUtc + (4 * longitudeDeg + eotMin) * MIN;
}
