import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { PRICE_PDF, PRICE_MATCHING, formatPrice } from "@/lib/format";

const BANK = process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? "카카오뱅크";
const ACCOUNT = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER ?? "";
const HOLDER = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER ?? "";
const KAKAO = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ?? "";

const PRODUCTS = {
  pdf: { name: "정식 사주풀이 PDF", desc: "약 100페이지 분량의 상세 풀이", price: PRICE_PDF },
  matching: { name: "사주 궁합 매칭", desc: "매칭 성사 시 진행되는 정식 궁합 분석", price: PRICE_MATCHING },
} as const;

type ProductKey = keyof typeof PRODUCTS;

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.product) ? params.product[0] : params.product;
  const key: ProductKey = raw === "matching" ? "matching" : "pdf";
  const product = PRODUCTS[key];

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-12">
      <header className="text-center mb-7">
        <p className="text-xs tracking-[0.25em] text-gold-400 mb-2">결제 안내</p>
        <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
          계좌이체로 신청해 주세요
        </h1>
      </header>

      {/* 상품 / 가격 */}
      <section className="rounded-2xl border border-night-600/70 bg-night-800/60 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-night-600/60 pb-4">
          <div>
            <p className="font-(family-name:--font-serif-kr) text-base font-bold text-paper-100">
              {product.name}
            </p>
            <p className="mt-1 text-xs text-paper-400">{product.desc}</p>
          </div>
          <span className="shrink-0 text-lg font-bold text-gold-300">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* 입금 계좌 */}
        <div className="pt-4">
          <p className="mb-2 text-sm font-medium text-paper-400">입금 계좌</p>
          <div className="rounded-xl border border-night-600 bg-night-900/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-paper-400">{BANK}</p>
                <p className="font-(family-name:--font-serif-kr) text-lg font-bold tracking-wide text-paper-100">
                  {ACCOUNT}
                </p>
                <p className="mt-0.5 text-sm text-paper-400">예금주 {HOLDER}</p>
              </div>
              {ACCOUNT && <CopyButton text={ACCOUNT} />}
            </div>
          </div>
        </div>
      </section>

      {/* 안내 문구 */}
      <section className="mt-5 rounded-2xl border border-night-600/70 bg-night-800/40 p-5">
        <p className="text-sm leading-relaxed text-paper-200">
          입금 후 카카오톡 채널로 <span className="text-gold-300 font-medium">입금자명</span>을
          알려주시면 신청서를 보내드립니다.
        </p>
        {KAKAO ? (
          <a
            href={KAKAO}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-lg bg-gold-500 px-4 py-3.5 text-center text-base font-bold text-night-900 transition-colors hover:bg-gold-400"
          >
            카카오톡 채널로 입금자명 알리기
          </a>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-night-600 px-4 py-3 text-center text-xs text-paper-500">
            카카오톡 채널 링크가 아직 설정되지 않았습니다.
          </p>
        )}
      </section>

      <div className="mt-6 text-center">
        <Link href="/" className="text-xs text-paper-500 underline underline-offset-2 hover:text-paper-400">
          처음으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
