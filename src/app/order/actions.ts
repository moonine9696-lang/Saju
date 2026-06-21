"use server";

import { getProduct } from "@/lib/products";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface OrderState {
  ok: boolean;
  error?: string;
}

interface BirthData {
  calendar: "solar" | "lunar";
  isLeapMonth: boolean;
  year: number;
  month: number;
  day: number;
  timeUnknown: boolean;
  hour: number | null;
  minute: number | null;
  gender: "male" | "female";
}

/** prefix(a_/b_) 기준으로 생년월일 묶음을 파싱·검증. 실패 시 null */
function parseBirth(formData: FormData, prefix: string): BirthData | null {
  const g = (k: string) => String(formData.get(prefix + k) ?? "").trim();
  const calendar = g("cal") === "lunar" ? "lunar" : "solar";
  const year = Number(g("year"));
  const month = Number(g("month"));
  const day = Number(g("day"));
  const gender = g("gender");
  const timeUnknown = formData.get(prefix + "tu") !== null;

  if (!Number.isInteger(year) || year < 1940 || year > 2025) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;
  if (gender !== "male" && gender !== "female") return null;

  let hour: number | null = null;
  let minute: number | null = null;
  if (!timeUnknown) {
    hour = Number(g("hour"));
    minute = Number(g("min"));
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) minute = 0;
  }

  return {
    calendar,
    isLeapMonth: calendar === "lunar" && formData.get(prefix + "leap") !== null,
    year,
    month,
    day,
    timeUnknown,
    hour,
    minute,
    gender,
  };
}

export async function submitOrder(_prev: OrderState, formData: FormData): Promise<OrderState> {
  // 1. 상품 확인
  const product = getProduct(String(formData.get("productId") ?? ""));
  if (!product) {
    return { ok: false, error: "상품 정보가 올바르지 않습니다. 상품을 다시 선택해 주세요." };
  }

  // 2. 신청자 생년월일
  const applicant = parseBirth(formData, "a_");
  if (!applicant) {
    return { ok: false, error: "신청자 생년월일·성별을 올바르게 입력해 주세요." };
  }

  // 3. 상대방 (2인 상품만)
  let partner: BirthData | null = null;
  if (product.persons === 2) {
    partner = parseBirth(formData, "b_");
    if (!partner) {
      return { ok: false, error: "상대방 생년월일·성별을 올바르게 입력해 주세요." };
    }
  }

  // 4. 연락처 (메일 또는 카카오톡 중 1개)
  const contactChannel = String(formData.get("contactChannel") ?? "");
  const contact = String(formData.get("contact") ?? "").trim();
  if (contactChannel !== "email" && contactChannel !== "kakao") {
    return { ok: false, error: "연락받을 방법을 선택해 주세요." };
  }
  if (!contact || contact.length > 100) {
    return { ok: false, error: "연락처를 입력해 주세요." };
  }
  if (contactChannel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    return { ok: false, error: "메일 주소 형식을 확인해 주세요." };
  }

  // 5. 궁금한 점·고민 (선택, 맞춤 메일용)
  const question = String(formData.get("question") ?? "").trim().slice(0, 1000);

  // 6. 환불 제한 동의 (필수)
  if (formData.get("consent") !== "on") {
    return { ok: false, error: "환불 제한 안내에 동의해 주셔야 신청할 수 있습니다." };
  }

  // 7. 저장 (운영자만 조회 가능 — service_role)
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "지금은 신청 접수 준비 중입니다. 잠시 후 다시 시도해 주세요." };
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return { ok: false, error: "신청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }

  const { error } = await supabase.from("orders").insert({
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    applicant,
    partner,
    contact_channel: contactChannel,
    contact,
    question: question || null,
    status: "입금대기",
  });

  if (error) {
    return { ok: false, error: "신청 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true };
}
