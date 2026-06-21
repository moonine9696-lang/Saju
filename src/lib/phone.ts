/**
 * 전화번호 입력 규칙 (등록 폼 클라이언트 + 서버 액션 공용)
 * - 하이픈 등 구분자는 허용하되 숫자만 셈
 * - 숫자 최대 11자리, 제출 시 정확히 11자리 필요
 */
export const PHONE_DIGITS = 11;

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** 입력 허용 여부: 숫자가 11자리 이하인가 (초과 입력 차단용) */
export function isWithinPhoneLimit(value: string): boolean {
  return phoneDigits(value).length <= PHONE_DIGITS;
}

/** 제출 유효성: 숫자가 정확히 11자리인가 */
export function isCompletePhone(value: string): boolean {
  return phoneDigits(value).length === PHONE_DIGITS;
}
