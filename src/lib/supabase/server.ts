/**
 * 서버 전용 Supabase 클라이언트 (service_role 키 사용)
 * - 절대 클라이언트 컴포넌트에서 import 하지 말 것.
 * - service_role 키는 RLS를 우회하므로 서버 액션/라우트에서만 사용한다.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let cached: SupabaseClient | null = null;

/** 설정이 없으면 null 반환 (등록 비활성 상태로 안내) */
export function getServiceClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return cached;
}
