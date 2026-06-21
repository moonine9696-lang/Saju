/**
 * 등록 폼 전화번호 규칙 테스트
 * RegisterForm(클라이언트 입력 차단·제출 검증)과 서버 액션이 공유하는 로직.
 */
import { describe, it, expect } from "vitest";
import { phoneDigits, isWithinPhoneLimit, isCompletePhone } from "../src/lib/phone";

describe("전화번호 입력 차단 (숫자 11자리 초과 차단)", () => {
  it("하이픈 제외 11자리까지는 입력 허용", () => {
    expect(isWithinPhoneLimit("010-1234-5678")).toBe(true); // 11자리
    expect(isWithinPhoneLimit("0101234567")).toBe(true); // 10자리
  });

  it("숫자 12자리 입력 시도는 차단된다", () => {
    expect(isWithinPhoneLimit("010-1234-56789")).toBe(false); // 12자리
    expect(isWithinPhoneLimit("010123456789")).toBe(false); // 12자리
  });

  it("하이픈은 자릿수에 포함하지 않는다", () => {
    expect(phoneDigits("010-1234-5678")).toBe("01012345678");
    expect(phoneDigits("010-1234-5678").length).toBe(11);
  });
});

describe("전화번호 제출 검증 (11자리 미만이면 막힘)", () => {
  it("10자리는 미완성으로 제출 불가", () => {
    expect(isCompletePhone("010-1234-567")).toBe(false); // 10자리
    expect(isCompletePhone("0101234567")).toBe(false);
  });

  it("정확히 11자리만 제출 가능", () => {
    expect(isCompletePhone("010-1234-5678")).toBe(true);
    expect(isCompletePhone("01012345678")).toBe(true);
  });

  it("빈 값은 제출 불가", () => {
    expect(isCompletePhone("")).toBe(false);
  });
});
