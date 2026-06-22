import SajuForm from "@/components/SajuForm";
import ProductCarousel from "@/components/ProductCarousel";

export default function Home() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-10 pb-8">
      <section className="text-center mb-9">
        <h1 className="font-(family-name:--font-serif-kr) text-3xl font-bold leading-snug text-paper-100">
          생년월일시 하나로
          <br />
          당신이 어떤 사람인지 풀어드립니다
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-paper-400">
          태어난 시간으로 정확하게 계산한 내 사주,
          <br className="hidden sm:block" />
          지금 무료로 확인해보세요.
        </p>
      </section>

      <section className="rounded-2xl border border-night-600/70 bg-night-800/60 p-5 sm:p-6">
        <SajuForm />
      </section>

      <section className="mt-8 grid gap-3 text-sm text-paper-400">
        <div className="flex gap-3">
          <span className="text-gold-400">○</span>
          <p>절기 절입 시각(분 단위)과 출생 지역의 진태양시까지 반영하는 정밀 만세력입니다.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold-400">○</span>
          <p>음력 생일과 윤달 입력을 지원합니다. 태어난 시각을 몰라도 여섯 글자로 풀이해 드립니다.</p>
        </div>
      </section>

      <ProductCarousel />
    </div>
  );
}
