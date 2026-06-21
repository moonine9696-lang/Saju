/**
 * 출생 지역(시/도) → 대표 경도(도, 동경) 테이블
 * 진태양시 보정에 사용. "모름"은 경도/균시차 보정을 생략한다.
 * 대표 경도는 각 시/도청 소재지 기준.
 */
export const REGIONS = {
  서울: 126.978,
  인천: 126.705,
  경기: 127.009,
  강원: 127.73,
  충북: 127.491,
  충남: 126.673,
  대전: 127.385,
  세종: 127.289,
  전북: 127.108,
  전남: 126.463,
  광주: 126.852,
  경북: 128.505,
  경남: 128.692,
  대구: 128.601,
  울산: 129.311,
  부산: 129.0756,
  제주: 126.531,
  모름: null,
} as const;

export type RegionKey = keyof typeof REGIONS;

export const REGION_KEYS = Object.keys(REGIONS) as RegionKey[];

export const DEFAULT_REGION: RegionKey = "서울";
