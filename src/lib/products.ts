/**
 * 상품 라인업 (수동 판매 모델).
 * 가격·구성은 발주자 확정값 그대로. 임의 변경 금지.
 */
export type ProductType = "single" | "package" | "premium";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  /** 입력 인원 (1 또는 2). 2이면 상대방 정보가 추가로 필요 */
  persons: 1 | 2;
  /** 한 줄 설명 */
  desc: string;
  /** 판매 페이지용 헤드라인(마케팅 한 줄). 없으면 desc 사용 */
  tagline?: string;
  /** 판매 페이지: 이 풀이에서 받아보는 내용(범위 설명. 풀이 본문 아님) */
  coverage?: string[];
  /** 패키지 구성 단품들 (표시용) */
  components?: string[];
  /** 패키지일 때 단품 합산 정가 (취소선 표시용) */
  originalSum?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "jaemul",
    name: "재물",
    type: "single",
    price: 14900,
    persons: 1,
    desc: "타고난 재물의 결과 흐름",
    tagline: "타고난 재물의 그릇과 흐름을 사주로 풀어드립니다",
    coverage: [
      "타고난 재물의 크기와 재물이 들어오는 방식",
      "재물이 새기 쉬운 지점과 지키는 법",
      "재물운이 트이는 시기와 주의해야 할 시기",
    ],
  },
  {
    id: "yeonae",
    name: "연애",
    type: "single",
    price: 14900,
    persons: 1,
    desc: "연애 성향과 인연의 방향",
    tagline: "당신의 연애 성향과 올해의 인연 흐름을 사주로 풀어드립니다.",
    coverage: [
      "연애에서 드러나는 성향과 매력",
      "나를 받쳐주고 채워주는 상대의 결",
      "올해의 연애 흐름과 인연의 온도",
    ],
  },
  {
    id: "daeun",
    name: "대운",
    type: "single",
    price: 14900,
    persons: 1,
    desc: "삶의 큰 흐름과 시기별 운",
    tagline: "10년 단위로 흐르는 삶 전체의 큰 결을 사주로 풀어드립니다.",
    coverage: [
      "지금 지나는 대운의 의미",
      "시기별로 바뀌는 삶의 큰 흐름",
      "앞으로의 큰 그림과 절정의 시기",
    ],
  },
  {
    id: "gyeolhon",
    name: "결혼",
    type: "single",
    price: 14900,
    persons: 1,
    desc: "결혼 시기와 배우자, 결혼 후의 흐름",
    tagline: "결혼의 시기와 배우자의 결, 결혼 후의 흐름까지 짚어드립니다.",
    coverage: [
      "인연이 무르익는 결혼의 시기",
      "사주가 보여주는 배우자의 결",
      "결혼 후 삶의 흐름과 함께 살아가는 법",
    ],
  },
  {
    id: "solo",
    name: "솔로의 인연",
    type: "single",
    price: 14900,
    persons: 1,
    desc: "아직 만나지 못한 인연이 오는 길",
    tagline: "아직 만나지 못한 인연이 언제 어떻게 오는지 풀어드립니다.",
    coverage: [
      "인연이 다가오는 시기",
      "만남이 시작되는 계기와 자리",
      "좋은 인연을 알아보는 단서",
    ],
  },
  {
    id: "maeryeok",
    name: "매력",
    type: "single",
    price: 14900,
    persons: 1,
    desc: "남에게 비치는 나의 매력",
    tagline: "남에게 비치는 당신의 매력과 가장 빛나는 자리를 짚어드립니다.",
    coverage: [
      "첫인상과 사람을 끌어당기는 매력",
      "내가 가장 빛나는 자리",
      "매력을 흐리는 순간과 다듬는 법",
    ],
  },
  {
    id: "career",
    name: "커리어",
    type: "single",
    price: 14900,
    persons: 1,
    desc: "직업 적성과 일의 흐름",
    tagline: "타고난 직업 적성과 일하는 방식, 커리어의 시기를 풀어드립니다.",
    coverage: [
      "나에게 맞는 일과 적성",
      "힘이 살아나는 일하는 방식",
      "커리어가 풀리는 시기와 의식할 점",
    ],
  },
  {
    id: "gunghap",
    name: "궁합",
    type: "single",
    price: 19900,
    persons: 2,
    desc: "두 사람의 사주 궁합",
    tagline: "두 사람의 사주가 실제로 어떻게 맞물리는지 풀어드립니다.",
    coverage: [
      "서로의 기운을 채워주는지 보는 오행 궁합",
      "일간과 배우자궁의 관계",
      "관계의 강점과 함께 풀어갈 과제",
    ],
  },
  {
    id: "yeonae-package",
    name: "연애 패키지",
    type: "package",
    price: 29900,
    persons: 2,
    desc: "연애 + 궁합",
    tagline: "내 연애 성향과 두 사람의 궁합을 한 번에 풀어드립니다.",
    coverage: ["연애 단품 전체", "궁합 단품 전체", "혼자만의 결과 둘의 결을 함께"],
    components: ["연애", "궁합"],
    originalSum: 14900 + 19900,
  },
  {
    id: "jaemul-career-package",
    name: "재물 패키지",
    type: "package",
    price: 24900,
    persons: 1,
    desc: "재물 + 대운",
    tagline: "재물의 결과 삶 전체의 큰 흐름을 함께 풀어드립니다.",
    coverage: ["재물 단품 전체", "대운 단품 전체", "돈과 삶의 흐름을 한 줄기로"],
    components: ["재물", "대운"],
    originalSum: 14900 + 14900,
  },
  {
    id: "premium",
    name: "종합 프리미엄",
    type: "premium",
    price: 34900,
    persons: 1,
    desc: "재물, 연애, 대운을 아우르는 종합 풀이 (수십 페이지)",
    tagline: "재물부터 연애, 일, 건강, 인연까지 삶 전체를 통합해 풀어드리는 최상위 분석입니다.",
    coverage: [
      "사주 전체 분석과 인생의 황금기",
      "연애와 재물과 직업과 건강과 귀인의 영역별 흐름",
      "향후 10년 연도별과 다가올 12개월 월별",
    ],
  },
];

export function getProduct(id: string | undefined | null): Product | null {
  if (!id) return null;
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

/** 입금 계좌 정보 (env로 관리, 기본값은 발주자 확정값) */
export const PAYMENT = {
  bank: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? "카카오뱅크",
  account: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER ?? "3333-32-0545057",
  holder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER ?? "문*인",
} as const;
