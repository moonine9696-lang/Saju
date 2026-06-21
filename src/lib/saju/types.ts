import type { Element, YinYang, TenGod, TenGodGroup } from "./constants";
import type { RegionKey } from "./regions";

export type Gender = "male" | "female";
export type CalendarType = "solar" | "lunar";

export interface SajuOptions {
  /**
   * 야자시(夜子時) 적용 여부. true이면 23시~24시 출생 시
   * 일주는 당일 그대로 두고 시주 천간만 다음 날 일간 기준으로 세운다.
   * 기본값 false (정자시).
   */
  lateNightZasi?: boolean;
}

export interface SajuInput {
  calendar: CalendarType;
  year: number;
  month: number;
  day: number;
  /** 음력 입력일 때 윤달 여부 */
  isLeapMonth?: boolean;
  /** 출생 시각 (모르면 생략하고 timeUnknown: true) */
  hour?: number;
  minute?: number;
  timeUnknown?: boolean;
  gender: Gender;
  /** 출생 지역 (시/도). 생략하면 "서울". "모름"이면 경도/균시차 보정 생략 */
  region?: RegionKey;
  options?: SajuOptions;
}

/** 진태양시·표준시 보정 내역 (시각 미상이면 null) */
export interface TimeCorrection {
  region: RegionKey;
  /** 서머타임(1987~88) 1시간 차감 적용 여부 */
  dstAdjusted: boolean;
  /** 출생 당시 표준시의 UTC 오프셋(분): 540=UTC+9, 510=UTC+8:30(1954~1961) */
  standardOffsetMin: number;
  /** 경도 보정(분, 당시 표준시 대비). 지역 "모름"이면 null */
  longitudeCorrectionMin: number | null;
  /** 균시차(분). 지역 "모름"이면 null */
  equationOfTimeMin: number | null;
  /** 입력 시각 대비 총 보정량(분) */
  totalCorrectionMin: number;
  /** 보정 후 시각 — 시진/일주 판정에 사용된 값 */
  corrected: { year: number; month: number; day: number; hour: number; minute: number };
}

/** 명식표의 글자 하나 (천간 또는 지지) */
export interface SajuChar {
  index: number;
  name: string; // 한글 (예: "갑")
  hanja: string; // 한자 (예: "甲")
  element: Element;
  yinYang: YinYang;
  /** 일간 기준 십성. 일간 자신은 "일원" */
  tenGod: TenGod | "일원";
}

export interface BranchChar extends SajuChar {
  /** 지장간 (마지막이 본기). 십성은 본기 기준 */
  hiddenStems: { name: string; hanja: string; tenGod: TenGod | "일원" }[];
}

export interface Pillar {
  stem: SajuChar;
  branch: BranchChar;
  /** 60갑자 인덱스 (0 = 갑자) */
  ganjiIndex: number;
  ganji: string; // 예: "갑자"
  ganjiHanja: string; // 예: "甲子"
}

export interface SajuResult {
  /** 계산에 사용된 양력 날짜 (음력 입력 시 변환 결과) */
  solarDate: { year: number; month: number; day: number };
  time: { hour: number; minute: number } | null;
  /**
   * 출생 절대시각 (epoch ms, UTC). 절기 비교·대운수 계산에 사용.
   * 시각 미상이면 정오(KST) 기준이라 대운수는 근사값이 된다.
   */
  birthEpochMs: number;
  /** 진태양시·표준시 보정 내역 (시각 미상이면 null) */
  correction: TimeCorrection | null;
  gender: Gender;
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    /** 시주. 출생 시각 미상이면 null */
    hour: Pillar | null;
  };
  /** 오행 분포 (시주 미상이면 6글자 기준) */
  elementCount: Record<Element, number>;
  /** 글자 수: 시주 포함 8, 미상 6 */
  charCount: 6 | 8;
  /** 십성 5분류 카운트 (일간 제외, 지지는 본기 기준) */
  tenGodGroupCount: Record<TenGodGroup, number>;
  /** 가장 강한 십성 분류 (동률이면 비겁→식상→재성→관성→인성 순 우선) */
  dominantTenGodGroup: TenGodGroup;
}
