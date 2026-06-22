"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { submitOrder, type OrderState } from "@/app/order/actions";
import BirthFields from "@/components/BirthFields";

const inputCls =
  "w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-paper-200 " +
  "focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50";
const labelCls = "block text-sm font-medium text-paper-400 mb-1.5";

const initial: OrderState = { ok: false };

export default function OrderForm({
  product,
  payment,
}: {
  product: Product;
  payment: { bank: string; account: string; holder: string };
}) {
  const [state, formAction, pending] = useActionState(submitOrder, initial);
  const [channel, setChannel] = useState<"email" | "kakao">("email");

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-gold-500/50 bg-gold-500/10 p-6 text-center">
        <p className="font-(family-name:--font-serif-kr) text-lg font-bold text-gold-300">
          신청이 접수되었습니다
        </p>
        <p className="mt-3 text-sm leading-relaxed text-paper-300">
          안내된 계좌로 입금해 주시면, 입금 확인 후 24시간 이내에 작성하신 연락처로
          풀이를 보내 드립니다. (주말·공휴일은 다소 늦어질 수 있습니다.)
        </p>
        <div className="mt-4 rounded-xl border border-night-600 bg-night-900/60 p-4 text-left">
          <p className="text-sm text-paper-400">입금 계좌</p>
          <p className="font-(family-name:--font-serif-kr) text-lg font-bold tracking-wide text-paper-100">
            {payment.bank} {payment.account}
          </p>
          <p className="mt-0.5 text-sm text-paper-400">예금주 {payment.holder}</p>
          <p className="mt-2 text-sm text-gold-300">{formatPrice(product.price)} · {product.name}</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-night-900 hover:bg-gold-400"
        >
          처음으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="productId" value={product.id} />

      {/* 선택한 상품 요약: 이름·가격·받아보는 내용(coverage) */}
      <div className="rounded-2xl border border-gold-500/40 bg-gold-500/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-(family-name:--font-serif-kr) text-base font-bold text-gold-300">
              {product.name}
            </p>
            <p className="mt-0.5 text-xs text-paper-400">{product.tagline ?? product.desc}</p>
          </div>
          <span className="shrink-0 text-lg font-bold text-paper-100">{formatPrice(product.price)}</span>
        </div>
        {product.coverage && product.coverage.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-gold-500/20 pt-3">
            {product.coverage.map((c, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-paper-300">
                <span className="text-gold-400">○</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 신청자 정보 */}
      <BirthFields prefix="a_" legend={product.persons === 2 ? "신청자 (나)" : "생년월일 정보"} />

      {/* 상대방 정보 (2인 상품만) */}
      {product.persons === 2 && <BirthFields prefix="b_" legend="상대방" />}

      {/* 연락처 */}
      <div>
        <span className={labelCls}>풀이 받을 연락처</span>
        <div className="mb-2 grid grid-cols-2 gap-2">
          {([["email", "메일"], ["kakao", "카카오톡"]] as const).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setChannel(v)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                channel === v
                  ? "border-gold-500 bg-gold-500/10 text-gold-300"
                  : "border-night-600 bg-night-800 text-paper-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input type="hidden" name="contactChannel" value={channel} />
        <input
          name="contact"
          type={channel === "email" ? "email" : "text"}
          inputMode={channel === "email" ? "email" : "text"}
          maxLength={100}
          required
          placeholder={channel === "email" ? "받을 메일 주소" : "카카오톡 ID"}
          className={inputCls}
        />
      </div>

      {/* 궁금한 점·고민 (선택). 종합 프리미엄은 강조·확대 */}
      {product.type === "premium" ? (
        <div className="rounded-2xl border border-gold-500/50 bg-gold-500/10 p-5">
          <label htmlFor="question" className="block font-(family-name:--font-serif-kr) text-base font-bold text-gold-300">
            꼭 풀어드리고 싶은 고민
          </label>
          <p className="mt-1.5 text-xs leading-relaxed text-paper-300">
            종합 프리미엄은 이 내용을 맞춤으로 깊이 다룹니다. 지금 가장 궁금하거나 고민되는 점을
            자세히 적어주실수록 풀이가 깊어집니다. (선택)
          </p>
          <textarea
            id="question"
            name="question"
            rows={6}
            maxLength={1000}
            placeholder="예) 올해 이직을 고민 중인데 재물운과 직업운이 어떤지, 결혼 시기도 함께 봐주시면 좋겠어요."
            className={`${inputCls} mt-3 resize-y border-gold-500/40`}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="question" className={labelCls}>
            궁금한 점이나 고민 <span className="font-normal text-paper-500">(선택)</span>
          </label>
          <textarea
            id="question"
            name="question"
            rows={3}
            maxLength={1000}
            placeholder="사주로 풀어보고 싶은 점이 있으면 적어주세요."
            className={`${inputCls} resize-y`}
          />
        </div>
      )}

      {/* 안내 문구 */}
      <ul className="space-y-1.5 rounded-xl border border-night-600/70 bg-night-800/40 p-4 text-xs leading-relaxed text-paper-400">
        <li>· 태어난 시간을 모르면 일부 해석의 정밀도가 낮아질 수 있습니다.</li>
        <li>· 궁합/연애 패키지는 두 분의 정보가 모두 필요합니다.</li>
      </ul>

      {/* 입금·발송 안내 (입금 전 분명히 보이게) */}
      <div className="rounded-2xl border border-night-600/70 bg-night-800/60 p-5 text-sm leading-relaxed text-paper-200">
        <p className="mb-3 font-(family-name:--font-serif-kr) font-semibold text-paper-100">신청·결제 안내</p>
        <p>원하는 상품을 고르고 신청서를 작성한 뒤, 안내된 계좌로 입금해 주세요.</p>
        <p className="mt-2">입금자명과 신청자명을 같게 해 주시면 확인이 빠릅니다.</p>
        <p className="mt-2">
          입금이 확인되면 <span className="text-gold-300">24시간 이내</span>에 작성하신 메일 또는
          카카오톡으로 풀이를 보내 드립니다.
        </p>
        <p className="mt-1 text-xs text-paper-500">(주말·공휴일에는 발송이 다소 늦어질 수 있습니다.)</p>

        <div className="mt-4 rounded-xl border border-night-600 bg-night-900/60 p-4">
          <p className="text-xs text-paper-400">입금 계좌</p>
          <p className="font-(family-name:--font-serif-kr) text-lg font-bold tracking-wide text-paper-100">
            {payment.bank} {payment.account}
          </p>
          <p className="mt-0.5 text-sm text-paper-400">예금주 {payment.holder}</p>
        </div>
        <p className="mt-3 text-xs text-paper-500">
          신청 전{" "}
          <Link href="/refund" target="_blank" className="text-gold-300 underline underline-offset-2">
            환불 정책
          </Link>
          을 확인해 주세요.
        </p>
      </div>

      {/* 필수 동의 */}
      <label className="flex items-start gap-2.5 rounded-lg border border-night-600 bg-night-800/60 p-3 text-sm text-paper-300">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-gold-500" />
        <span>
          <span className="text-paper-200">(필수)</span> 사주 풀이는 발송이 시작되면 콘텐츠 특성상
          환불이 제한됨에 동의합니다.
        </span>
      </label>

      {state.error && (
        <p className="rounded-lg border border-el-fire/40 bg-el-fire/10 px-3 py-2.5 text-sm text-el-fire">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gold-500 px-4 py-3.5 text-base font-bold text-night-900 transition-colors hover:bg-gold-400 disabled:opacity-50"
      >
        {pending ? "신청 접수 중…" : `${formatPrice(product.price)} 신청하기`}
      </button>
      <p className="text-center text-xs text-paper-500">
        신청서 제출 후 안내된 계좌로 입금해 주시면 접수가 완료됩니다.
      </p>
    </form>
  );
}
