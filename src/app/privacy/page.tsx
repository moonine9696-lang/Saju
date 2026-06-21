import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 사주의 길",
};

export const dynamic = "force-static";

const sectionTitle = "font-(family-name:--font-serif-kr) text-base font-semibold text-paper-100 mt-7 mb-2";
const para = "text-sm leading-relaxed text-paper-300";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-14">
      <h1 className="font-(family-name:--font-serif-kr) text-2xl font-bold text-paper-100">
        개인정보처리방침
      </h1>
      <p className="mt-2 text-xs text-paper-500">시행일: 2026년 6월 13일</p>

      <p className={`${para} mt-5`}>
        사주의 길(이하 &lsquo;서비스&rsquo;)은 이용자의 개인정보를 중요하게 생각하며,
        「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 서비스가 어떤 개인정보를
        어떤 목적으로 수집·이용하고, 어떻게 보관·파기하는지를 안내합니다.
      </p>

      <h2 className={sectionTitle}>1. 수집하는 개인정보 항목</h2>
      <p className={para}>
        서비스는 다음 두 가지 경우에 한해 개인정보를 수집합니다.
      </p>
      <ul className={`${para} mt-2 list-disc space-y-1 pl-5`}>
        <li>
          <span className="text-paper-100">사주 미니풀이 조회 시</span>: 생년월일, 출생 시각,
          성별, 출생 지역. 이 정보는 화면에 풀이를 보여드리기 위해서만 사용하며 서버에
          저장하지 않습니다.
        </li>
        <li>
          <span className="text-paper-100">매칭 사전등록 시</span>: 닉네임, 성별, 출생연도,
          거주 지역(시/도), 전화번호, 사주 계산 정보(생년월일시 및
          명식 데이터).
        </li>
      </ul>

      <h2 className={sectionTitle}>2. 개인정보의 수집·이용 목적</h2>
      <ul className={`${para} mt-2 list-disc space-y-1 pl-5`}>
        <li>사주 명식 계산 및 무료 미니풀이 제공</li>
        <li>사주 궁합 매칭을 위한 등록자 간 궁합 분석 및 매칭 결과 안내</li>
        <li>매칭 진행에 관한 연락 및 안내</li>
      </ul>

      <h2 className={sectionTitle}>3. 보유 및 이용 기간</h2>
      <p className={para}>
        매칭 사전등록 정보는 이용자가 등록을 철회하거나 매칭 서비스가 종료될 때까지
        보관하며, 그 이후 지체 없이 파기합니다. 이용자는 언제든지 등록 철회 및 삭제를
        요청할 수 있으며, 요청 시 해당 정보를 즉시 파기합니다. 사주 조회 시 입력한 정보는
        별도로 저장하지 않습니다.
      </p>

      <h2 className={sectionTitle}>4. 개인정보의 파기 절차 및 방법</h2>
      <p className={para}>
        보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다.
        전자적 파일은 복구할 수 없는 방법으로 삭제합니다.
      </p>

      <h2 className={sectionTitle}>5. 개인정보의 제3자 제공</h2>
      <p className={para}>
        서비스는 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 매칭이 성사되어
        양측이 동의한 경우에 한해, 매칭에 필요한 최소한의 정보(닉네임 등)를 상대방에게
        안내할 수 있습니다.
      </p>

      <h2 className={sectionTitle}>6. 이용자의 권리</h2>
      <p className={para}>
        이용자는 자신의 개인정보에 대한 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.
        아래 연락처로 요청하시면 지체 없이 조치합니다.
      </p>

      <h2 className={sectionTitle}>7. 개인정보 보호책임자 및 문의</h2>
      <p className={para}>
        개인정보 관련 문의는 서비스의 카카오톡 채널을 통해 접수합니다. 접수된 문의에
        대해 신속하고 성실하게 답변드리겠습니다.
      </p>

      <h2 className={sectionTitle}>8. 방침의 변경</h2>
      <p className={para}>
        본 개인정보처리방침은 법령이나 서비스 변경에 따라 개정될 수 있으며, 변경 시
        본 페이지를 통해 안내합니다.
      </p>
    </div>
  );
}
