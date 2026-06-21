-- ============================================================
-- 사주의 길 — 매칭 사전등록 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

create table if not exists public.match_registrations (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- 등록자 입력 정보
  nickname     text not null,
  gender       text not null check (gender in ('male', 'female')),
  birth_year   int  not null,
  residence    text not null,                 -- 거주 지역 (시/도)
  phone        text not null,                 -- 전화번호 (필수, 숫자 11자리)

  -- 사주 계산 원본 입력 (재계산·매칭에 사용)
  birth_input  jsonb not null,                -- { calendar, year, month, day, isLeapMonth, hour, minute, timeUnknown, region }

  -- 매칭 계산용 사주 스냅샷 (4단계 궁합 알고리즘 입력)
  saju_snapshot jsonb not null,               -- { dayStem, dayBranch, monthBranch, yearStem, yearBranch, hourStem, hourBranch, elementCount, dominantTenGodGroup, charCount }

  consent_at   timestamptz not null default now()  -- 개인정보 수집·이용 동의 시각
);

-- ============================================================
-- RLS (Row Level Security)
--  - 등록 데이터는 민감정보이므로 클라이언트(anon)에서 읽기/수정/삭제 전면 차단.
--  - 저장은 서버(service_role 키)에서만 수행 → service_role은 RLS를 우회.
--  - 따라서 anon/authenticated 용 정책을 만들지 않음으로써 모든 접근을 막는다.
-- ============================================================
alter table public.match_registrations enable row level security;

-- (정책 없음 = anon/authenticated 는 select/insert/update/delete 모두 불가)
-- service_role 키로 접근하는 서버 코드만 데이터를 기록/조회할 수 있습니다.

-- 조회·매칭은 Supabase 대시보드 또는 service_role 스크립트로 수행하세요.
-- 예: select nickname, gender, birth_year, residence, created_at
--     from public.match_registrations order by created_at desc;


-- ============================================================
-- 상품 주문(신청) 테이블 — 수동 판매 모델
-- 손님이 상품 선택 + 신청서 작성 → 운영자가 입금 확인 후 수동 발송.
-- ============================================================
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- 상품
  product_id      text not null,                  -- 예: premium, gunghap, yeonae-package
  product_name    text not null,
  price           int  not null,

  -- 신청자 생년월일 정보 (재계산용 원본)
  applicant       jsonb not null,                 -- { calendar, isLeapMonth, year, month, day, timeUnknown, hour, minute, gender }
  -- 상대방 (궁합/연애 패키지 등 2인 상품만, 그 외 null)
  partner         jsonb,

  -- 연락처
  contact_channel text not null check (contact_channel in ('email', 'kakao')),
  contact         text not null,                  -- 메일 주소 또는 카카오톡 ID

  -- 손님이 적은 궁금한 점·고민 (선택, 맞춤 메일 작성에 사용)
  question        text,

  -- 운영 상태 (운영자가 수동 갱신: 입금대기 → 발송완료 등)
  status          text not null default '입금대기',

  consent_at      timestamptz not null default now()  -- 환불 제한 동의 시각
);

-- RLS: orders도 민감정보이므로 anon 전면 차단, service_role(서버)만 접근.
alter table public.orders enable row level security;
-- (정책 없음 = anon/authenticated 접근 불가. 서버 service_role만 기록/조회)

-- 조회는 Supabase 대시보드 또는 service_role 스크립트로:
-- 예: select created_at, product_name, price, contact_channel, contact, status
--     from public.orders order by created_at desc;
