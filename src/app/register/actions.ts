"use server";

import { calculateSaju, parseSajuParams, toSnapshot } from "@/lib/saju";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isCompletePhone } from "@/lib/phone";

export interface RegisterState {
  ok: boolean;
  error?: string;
}

const REGION_LIMIT = 30;
const NICK_LIMIT = 20;

export async function submitRegistration(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // 1. 사주 원본 입력 복원 (결과 페이지에서 넘어온 hidden 파라미터)
  const sajuQuery = String(formData.get("sajuQuery") ?? "");
  const params = Object.fromEntries(new URLSearchParams(sajuQuery));
  const input = parseSajuParams(params);
  if (!input) {
    return { ok: false, error: "사주 정보가 올바르지 않습니다. 결과 화면에서 다시 시도해 주세요." };
  }

  // 2. 폼 입력 검증
  const nickname = String(formData.get("nickname") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const birthYear = Number(formData.get("birthYear"));
  const residence = String(formData.get("residence") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const consent = formData.get("consent") === "on";

  if (!nickname || nickname.length > NICK_LIMIT)
    return { ok: false, error: "닉네임을 1~20자로 입력해 주세요." };
  if (gender !== "male" && gender !== "female")
    return { ok: false, error: "성별을 선택해 주세요." };
  if (!Number.isInteger(birthYear) || birthYear < 1940 || birthYear > 2025)
    return { ok: false, error: "출생연도를 올바르게 선택해 주세요." };
  if (!residence || residence.length > REGION_LIMIT)
    return { ok: false, error: "거주 지역을 선택해 주세요." };
  // 전화번호 필수 + 숫자 11자리
  if (!phone)
    return { ok: false, error: "전화번호를 입력해 주세요." };
  if (!isCompletePhone(phone))
    return { ok: false, error: "전화번호를 다시 확인해주세요" };
  if (!consent)
    return { ok: false, error: "개인정보 수집·이용에 동의해 주셔야 등록할 수 있습니다." };

  // 3. 사주 스냅샷 계산
  let snapshot;
  try {
    snapshot = toSnapshot(calculateSaju(input));
  } catch {
    return { ok: false, error: "사주 계산에 실패했습니다. 결과 화면에서 다시 시도해 주세요." };
  }

  // 4. 저장
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "지금은 사전등록 접수 준비 중입니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return { ok: false, error: "등록 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }

  const { error } = await supabase.from("match_registrations").insert({
    nickname,
    gender,
    birth_year: birthYear,
    residence,
    phone,
    birth_input: input,
    saju_snapshot: snapshot,
  });

  if (error) {
    return { ok: false, error: "등록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true };
}
