"""
만세력 계산 스크립트 — 정자시(正子時) 기준
========================================================

사주의 길 채택 기준:
- 일주는 자정(00:00)에 변경
- 23:00~24:00 출생 → 당일 일주 유지, 시주는 당일 일간 기준 자시(子時)
- 예: 1996.06.26 23:38 → 甲午일 甲子시
- 월주는 절기(節) 기준 (평균 절입일 적용 — 절입일 부근 출생은 경고 출력, 정밀 만세력 교차 확인 필요)

사용:
  python manse.py --name "문인구" --gender M --year 1996 --month 6 --day 26 \\
                  --hour 23 --minute 0 --calendar solar

또는 모듈 import:
  from manse import calculate_saju
  result = calculate_saju(name="문인구", gender="M",
                          year=1996, month=6, day=26,
                          hour=23, minute=0, calendar="solar")

필요 라이브러리:
  pip install korean_lunar_calendar
"""

from datetime import datetime, timedelta
from korean_lunar_calendar import KoreanLunarCalendar

# ============================================================
# 1. 기본 데이터 — 천간·지지·오행·십신
# ============================================================

# 천간(天干) 10자 — [한자, 한글, 음양, 오행]
TIANGAN = [
    {"hanja": "甲", "hangul": "갑", "yin_yang": "양", "ohaeng": "목"},
    {"hanja": "乙", "hangul": "을", "yin_yang": "음", "ohaeng": "목"},
    {"hanja": "丙", "hangul": "병", "yin_yang": "양", "ohaeng": "화"},
    {"hanja": "丁", "hangul": "정", "yin_yang": "음", "ohaeng": "화"},
    {"hanja": "戊", "hangul": "무", "yin_yang": "양", "ohaeng": "토"},
    {"hanja": "己", "hangul": "기", "yin_yang": "음", "ohaeng": "토"},
    {"hanja": "庚", "hangul": "경", "yin_yang": "양", "ohaeng": "금"},
    {"hanja": "辛", "hangul": "신", "yin_yang": "음", "ohaeng": "금"},
    {"hanja": "壬", "hangul": "임", "yin_yang": "양", "ohaeng": "수"},
    {"hanja": "癸", "hangul": "계", "yin_yang": "음", "ohaeng": "수"},
]

# 지지(地支) 12자 — [한자, 한글, 음양, 오행, 동물]
DIZHI = [
    {"hanja": "子", "hangul": "자", "yin_yang": "양", "ohaeng": "수", "animal": "쥐"},
    {"hanja": "丑", "hangul": "축", "yin_yang": "음", "ohaeng": "토", "animal": "소"},
    {"hanja": "寅", "hangul": "인", "yin_yang": "양", "ohaeng": "목", "animal": "호랑이"},
    {"hanja": "卯", "hangul": "묘", "yin_yang": "음", "ohaeng": "목", "animal": "토끼"},
    {"hanja": "辰", "hangul": "진", "yin_yang": "양", "ohaeng": "토", "animal": "용"},
    {"hanja": "巳", "hangul": "사", "yin_yang": "음", "ohaeng": "화", "animal": "뱀"},
    {"hanja": "午", "hangul": "오", "yin_yang": "양", "ohaeng": "화", "animal": "말"},
    {"hanja": "未", "hangul": "미", "yin_yang": "음", "ohaeng": "토", "animal": "양"},
    {"hanja": "申", "hangul": "신", "yin_yang": "양", "ohaeng": "금", "animal": "원숭이"},
    {"hanja": "酉", "hangul": "유", "yin_yang": "음", "ohaeng": "금", "animal": "닭"},
    {"hanja": "戌", "hangul": "술", "yin_yang": "양", "ohaeng": "토", "animal": "개"},
    {"hanja": "亥", "hangul": "해", "yin_yang": "음", "ohaeng": "수", "animal": "돼지"},
]

# 지장간(支藏干) — 각 지지에 숨겨진 천간들 [여기, 중기, 정기]
JIJANGGAN = {
    "子": ["壬", "", "癸"],
    "丑": ["癸", "辛", "己"],
    "寅": ["戊", "丙", "甲"],
    "卯": ["甲", "", "乙"],
    "辰": ["乙", "癸", "戊"],
    "巳": ["戊", "庚", "丙"],
    "午": ["丙", "己", "丁"],
    "未": ["丁", "乙", "己"],
    "申": ["戊", "壬", "庚"],
    "酉": ["庚", "", "辛"],
    "戌": ["辛", "丁", "戊"],
    "亥": ["戊", "甲", "壬"],
}

# 십신(十神) 매핑 — 일간 기준 [상대 천간/지지 오행+음양] → 십신
# 일간을 기준으로 상대의 관계: 같은오행=비겁, 일간이생=식상, 일간이극=재성, 일간을극=관성, 일간을생=인성
def get_sipsin(ilgan_ohaeng, ilgan_yinyang, target_ohaeng, target_yinyang):
    """일간과 대상 천간/지지의 십신 관계 계산"""
    same_yinyang = (ilgan_yinyang == target_yinyang)

    # 같은 오행 = 비겁
    if ilgan_ohaeng == target_ohaeng:
        return "비견" if same_yinyang else "겁재"

    # 상생 관계: 목→화→토→금→수→목
    sheng_chain = {"목": "화", "화": "토", "토": "금", "금": "수", "수": "목"}

    # 일간이 생함 = 식상
    if sheng_chain[ilgan_ohaeng] == target_ohaeng:
        return "식신" if same_yinyang else "상관"

    # 일간을 생함 = 인성
    if sheng_chain[target_ohaeng] == ilgan_ohaeng:
        return "편인" if same_yinyang else "정인"

    # 상극 관계: 목→토→수→화→금→목
    ke_chain = {"목": "토", "토": "수", "수": "화", "화": "금", "금": "목"}

    # 일간이 극함 = 재성
    if ke_chain[ilgan_ohaeng] == target_ohaeng:
        return "편재" if same_yinyang else "정재"

    # 일간을 극함 = 관성
    if ke_chain[target_ohaeng] == ilgan_ohaeng:
        return "편관" if same_yinyang else "정관"

    return "미분류"


# ============================================================
# 2. 60갑자 계산
# ============================================================

def get_gapja(index):
    """60갑자 인덱스(0~59)로 천간·지지 반환"""
    tiangan = TIANGAN[index % 10]
    dizhi = DIZHI[index % 12]
    return tiangan, dizhi


def get_year_pillar(year):
    """년주 계산 — 1984년이 갑자(甲子)년 = 0번"""
    # 입춘 기준 처리는 별도 함수에서 (여기서는 양력 연도만 사용)
    base_year = 1984
    index = (year - base_year) % 60
    return get_gapja(index)


# 사주 월 경계 — 절기(節) 평균 절입일. 실제 절입은 해마다 ±1일 변동.
# (양력 월, 일, 사주월 순번: 寅=1 ... 丑=12)
SAJU_MONTH_BOUNDARIES = [
    (1, 6, 12),   # 소한 → 丑월
    (2, 4, 1),    # 입춘 → 寅월
    (3, 6, 2),    # 경칩 → 卯월
    (4, 5, 3),    # 청명 → 辰월
    (5, 6, 4),    # 입하 → 巳월
    (6, 6, 5),    # 망종 → 午월
    (7, 7, 6),    # 소서 → 未월
    (8, 8, 7),    # 입추 → 申월
    (9, 8, 8),    # 백로 → 酉월
    (10, 8, 9),   # 한로 → 戌월
    (11, 7, 10),  # 입동 → 亥월
    (12, 7, 11),  # 대설 → 子월
]


def get_saju_month_order(month, day):
    """양력 (월, 일) → 사주 월 순번(寅=1 ... 丑=12)과 절입 경계 근접 경고.

    반환: (order, warning)
    - order: 1(寅)~12(丑)
    - warning: 절입일 평균치 ±1일 이내 출생이면 경고 문자열, 아니면 None
      (실제 절입 시각은 해마다 ±1일 변동하므로 이 구간은 정밀 만세력 교차 확인 필수)
    """
    order = 11  # (1, 6) 이전, 즉 1월 1~5일은 子월
    for (m, d, o) in SAJU_MONTH_BOUNDARIES:
        if (month, day) >= (m, d):
            order = o

    warning = None
    base = datetime(2000, month, day)  # 윤년으로 두어 2/29 입력도 안전
    for (m, d, _o) in SAJU_MONTH_BOUNDARIES:
        boundary = datetime(2000, m, d)
        if abs((base - boundary).days) <= 1:
            warning = (
                f"절입일({m}월 {d}일 전후) 부근 출생 — 월주가 해당 연도 실제 절입 시각에 따라 "
                f"달라질 수 있으니 정밀 만세력으로 교차 확인 필요"
            )
            break
    return order, warning


def get_month_pillar(year_tiangan_idx, month):
    """월주 계산 — 년간에 따라 월간이 결정됨 (오호둔법)
    month 인자는 양력 달력 월이 아니라 사주 월 순번(寅=1 ... 丑=12).
    반드시 get_saju_month_order()의 결과를 넘길 것.
    甲己년 → 寅월부터 丙寅 (월간 인덱스 2부터 시작)
    乙庚년 → 寅월부터 戊寅 (월간 인덱스 4부터 시작)
    丙辛년 → 寅월부터 庚寅 (월간 인덱스 6부터 시작)
    丁壬년 → 寅월부터 壬寅 (월간 인덱스 8부터 시작)
    戊癸년 → 寅월부터 甲寅 (월간 인덱스 0부터 시작)
    """
    # 月支는 寅(2)부터 시작: 순번1 = 寅(2), 순번12 = 丑(1)
    month_zhi_idx = (month + 1) % 12  # 1월=寅(2), 12월=丑(1)

    # 月干 시작 인덱스 (寅월의 천간)
    year_to_month_start = {0: 2, 5: 2,   # 갑·기년 → 丙
                            1: 4, 6: 4,   # 을·경년 → 戊
                            2: 6, 7: 6,   # 병·신년 → 庚
                            3: 8, 8: 8,   # 정·임년 → 壬
                            4: 0, 9: 0}   # 무·계년 → 甲

    start_tian_idx = year_to_month_start[year_tiangan_idx]
    # 寅월(1월) = start, 卯월(2월) = start+1, ...
    month_tian_idx = (start_tian_idx + (month - 1)) % 10

    return TIANGAN[month_tian_idx], DIZHI[month_zhi_idx]


def get_day_pillar(year, month, day):
    """일주 계산 — Julian Day Number 활용"""
    # 1900-01-01이 갑술(甲戌)일 = 60갑자 인덱스 10
    # Julian Day로 변환 후 모드 계산
    a = (14 - month) // 12
    y = year + 4800 - a
    m = month + 12 * a - 3
    jdn = day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045

    # 1900-01-01 = JDN 2415021, 갑술일 (인덱스 10)
    base_jdn = 2415021
    base_index = 10  # 甲戌

    day_index = (base_index + (jdn - base_jdn)) % 60
    return get_gapja(day_index)


def get_hour_pillar(day_tiangan_idx, hour):
    """시주 계산 — 정자시 기준
    23:00~01:00 = 子시. 자시의 천간은 당일 일간 기준으로 산출
    (정자시: 일주가 자정에 바뀌므로, 23~24시는 당일 일간, 00~01시는 새 날 일간이 자동 적용됨)
    01:00~03:00 = 丑시
    03:00~05:00 = 寅시
    ...

    일간에 따라 시간이 결정됨 (오자둔법):
    甲己日 → 子시부터 甲子
    乙庚日 → 子시부터 丙子
    丙辛日 → 子시부터 戊子
    丁壬日 → 子시부터 庚子
    戊癸日 → 子시부터 壬子
    """
    # 시지 인덱스: 23~01시 = 子(0), 01~03 = 丑(1), ...
    if hour == 23 or hour == 0:
        hour_zhi_idx = 0  # 子
    else:
        hour_zhi_idx = ((hour + 1) // 2) % 12

    # 시간 시작 인덱스 (자시의 천간)
    day_to_hour_start = {0: 0, 5: 0,   # 갑·기일 → 甲子
                          1: 2, 6: 2,   # 을·경일 → 丙子
                          2: 4, 7: 4,   # 병·신일 → 戊子
                          3: 6, 8: 6,   # 정·임일 → 庚子
                          4: 8, 9: 8}   # 무·계일 → 壬子

    start_tian_idx = day_to_hour_start[day_tiangan_idx]
    hour_tian_idx = (start_tian_idx + hour_zhi_idx) % 10

    return TIANGAN[hour_tian_idx], DIZHI[hour_zhi_idx]


# ============================================================
# 3. 12운성·12신살 (간략 버전 — 추후 확장)
# ============================================================

# 12운성 — 일간별 12지지 위치
UNSEONG_MAP = {
    "甲": {"亥": "장생", "子": "목욕", "丑": "관대", "寅": "건록", "卯": "제왕",
           "辰": "쇠", "巳": "병", "午": "사", "未": "묘", "申": "절",
           "酉": "태", "戌": "양"},
    "乙": {"午": "장생", "巳": "목욕", "辰": "관대", "卯": "건록", "寅": "제왕",
           "丑": "쇠", "子": "병", "亥": "사", "戌": "묘", "酉": "절",
           "申": "태", "未": "양"},
    "丙": {"寅": "장생", "卯": "목욕", "辰": "관대", "巳": "건록", "午": "제왕",
           "未": "쇠", "申": "병", "酉": "사", "戌": "묘", "亥": "절",
           "子": "태", "丑": "양"},
    "丁": {"酉": "장생", "申": "목욕", "未": "관대", "午": "건록", "巳": "제왕",
           "辰": "쇠", "卯": "병", "寅": "사", "丑": "묘", "子": "절",
           "亥": "태", "戌": "양"},
    "戊": {"寅": "장생", "卯": "목욕", "辰": "관대", "巳": "건록", "午": "제왕",
           "未": "쇠", "申": "병", "酉": "사", "戌": "묘", "亥": "절",
           "子": "태", "丑": "양"},
    "己": {"酉": "장생", "申": "목욕", "未": "관대", "午": "건록", "巳": "제왕",
           "辰": "쇠", "卯": "병", "寅": "사", "丑": "묘", "子": "절",
           "亥": "태", "戌": "양"},
    "庚": {"巳": "장생", "午": "목욕", "未": "관대", "申": "건록", "酉": "제왕",
           "戌": "쇠", "亥": "병", "子": "사", "丑": "묘", "寅": "절",
           "卯": "태", "辰": "양"},
    "辛": {"子": "장생", "亥": "목욕", "戌": "관대", "酉": "건록", "申": "제왕",
           "未": "쇠", "午": "병", "巳": "사", "辰": "묘", "卯": "절",
           "寅": "태", "丑": "양"},
    "壬": {"申": "장생", "酉": "목욕", "戌": "관대", "亥": "건록", "子": "제왕",
           "丑": "쇠", "寅": "병", "卯": "사", "辰": "묘", "巳": "절",
           "午": "태", "未": "양"},
    "癸": {"卯": "장생", "寅": "목욕", "丑": "관대", "子": "건록", "亥": "제왕",
           "戌": "쇠", "酉": "병", "申": "사", "未": "묘", "午": "절",
           "巳": "태", "辰": "양"},
}

# 12신살 — 년지(또는 일지) 기준
# 삼합국에 따라 12신살 위치가 결정됨
SINSAL_MAP = {
    # 寅午戌 (火局)
    "寅": "지살", "午": "장성살", "戌": "화개살",
    "申": "역마살", "子": "재살", "辰": "월살",
    "卯": "년살(도화)", "未": "반안살", "亥": "겁살",
    "酉": "육해살", "丑": "천살", "巳": "망신살",
}


# ============================================================
# 4. 음양·오행 분포 계산
# ============================================================

def calculate_distribution(pillars):
    """8글자(시·일·월·년주의 천간/지지)의 음양·오행 분포 계산"""
    yin_count = 0
    yang_count = 0
    ohaeng_count = {"목": 0, "화": 0, "토": 0, "금": 0, "수": 0}

    for pillar in pillars:
        for elem in [pillar["tiangan"], pillar["dizhi"]]:
            if elem["yin_yang"] == "양":
                yang_count += 1
            else:
                yin_count += 1
            ohaeng_count[elem["ohaeng"]] += 1

    return {
        "yin_yang": {"양": yang_count, "음": yin_count},
        "ohaeng": ohaeng_count,
        "yang_palthong": yang_count == 8,
        "yin_palthong": yin_count == 8,
    }


def calculate_sipsin_distribution(pillars, ilgan):
    """8글자의 십신 분포 계산"""
    sipsin_count = {
        "비견": 0, "겁재": 0, "식신": 0, "상관": 0,
        "편재": 0, "정재": 0, "편관": 0, "정관": 0,
        "편인": 0, "정인": 0,
    }

    ilgan_ohaeng = ilgan["ohaeng"]
    ilgan_yinyang = ilgan["yin_yang"]

    for i, pillar in enumerate(pillars):
        # 일간 자체는 제외
        if i == 1:  # 일주의 천간(일간)은 카운트 제외
            sipsin_count["비견"] += 0  # skip
        else:
            sipsin = get_sipsin(ilgan_ohaeng, ilgan_yinyang,
                                pillar["tiangan"]["ohaeng"],
                                pillar["tiangan"]["yin_yang"])
            if sipsin in sipsin_count:
                sipsin_count[sipsin] += 1

        # 지지의 십신
        sipsin = get_sipsin(ilgan_ohaeng, ilgan_yinyang,
                            pillar["dizhi"]["ohaeng"],
                            pillar["dizhi"]["yin_yang"])
        if sipsin in sipsin_count:
            sipsin_count[sipsin] += 1

    return sipsin_count


# ============================================================
# 5. 메인 함수
# ============================================================

# ============================================================
# 진태양시(眞太陽時) 보정 — 사이트 만세력과 동일 기준
# ============================================================
# 시진(時辰)은 시계 시각이 아니라 출생지의 실제 태양 시각으로 판정한다.
# 보정 = 경도 보정((경도-표준자오선)×4분) + 균시차(equation of time)
# 검증: 1997-09-29 부산 → 남중 12:14 (공인 만세력 차트와 1분 이내 일치)

# 시/도 단위 대표 경도 — 사이트 엔진(src/lib/saju/regions.ts)과 반드시 동일하게 유지할 것.
# "모름"은 경도/균시차 보정을 생략한다(표준시 기준 판정).
REGION_LONGITUDES = {
    "서울": 126.978, "인천": 126.705, "경기": 127.009, "강원": 127.73,
    "충북": 127.491, "충남": 126.673, "대전": 127.385, "세종": 127.289,
    "전북": 127.108, "전남": 126.463, "광주": 126.852,
    "경북": 128.505, "경남": 128.692, "대구": 128.601, "울산": 129.311,
    "부산": 129.0756, "제주": 126.531,
    "모름": None,
}

# 하위 호환 별칭 (기존 호출부가 CITY_LONGITUDES를 참조하는 경우)
CITY_LONGITUDES = REGION_LONGITUDES

import math


def equation_of_time(dt):
    """균시차(분) — Spencer(1971) 공식. 사이트 엔진(src/lib/saju/time-correction.ts)과
    완전히 동일한 식·동일한 입력(0-기준 연중일수 + 시각 보정)을 사용한다.
    양수면 태양이 시계보다 빠름(진태양시 = 시계 + EoT). 오차 약 ±0.3분."""
    n0 = (dt - datetime(dt.year, 1, 1)).days  # 0-based 연중 일수 (윤년 자동 반영)
    g = 2.0 * math.pi / 365.0 * (n0 + (dt.hour - 12) / 24.0)
    return 229.18 * (
        0.000075
        + 0.001868 * math.cos(g)
        - 0.032077 * math.sin(g)
        - 0.014615 * math.cos(2 * g)
        - 0.04089 * math.sin(2 * g)
    )


def to_true_solar(dt, longitude):
    """표준시 datetime → 출생지 진태양시 datetime.
    사이트 엔진(src/lib/saju/time-correction.ts)과 동일 규칙.

    한국 표준시 변천 자동 처리:
    - 1954-03-21 ~ 1961-08-09: 표준자오선 127.5°E (UTC+8:30 시대)
    - 그 외: 표준자오선 135°E (UTC+9)
    - 서머타임 1987-05-10 02:00 ~ 10-11 03:00, 1988-05-08 02:00 ~ 10-09 03:00:
      시계 -1시간 후 보정 (경계 시각까지 사이트 엔진과 동일)
    - 1948~1951, 1955~1960 서머타임 시행기: 시행 일자가 해마다 달라
      자동 보정하지 않고 경고만 반환 (운영자 교차 확인)
    - longitude가 None(지역 모름)이면 경도/균시차 보정을 생략하고
      서머타임 차감만 적용된 표준시를 그대로 반환

    반환: (보정된 datetime, 경고 리스트)
    """
    warnings = []
    d = dt

    # 서머타임 자동 보정 (1987~1988 — 시행 기간이 명확)
    if (datetime(1987, 5, 10, 2) <= d < datetime(1987, 10, 11, 3)) or \
       (datetime(1988, 5, 8, 2) <= d < datetime(1988, 10, 9, 3)):
        d = d - timedelta(hours=1)
        warnings.append("서머타임 시행기 출생 — 시계에서 1시간을 빼고 보정함")

    # 1948~1951, 1955~1960 서머타임은 경고만
    if d.year in (1948, 1949, 1950, 1951, 1955, 1956, 1957, 1958, 1959, 1960) \
            and 4 <= d.month <= 9:
        warnings.append(
            f"{d.year}년은 서머타임 시행 연도(시행 일자 연도별 상이) — "
            "여름철 출생이면 시계 -1시간 가능성, 공인 만세력으로 교차 확인 필요"
        )

    # 지역 모름: 경도/균시차 보정 생략
    if longitude is None:
        return d, warnings

    # 표준자오선: 1954-03-21 ~ 1961-08-09는 127.5°E
    if datetime(1954, 3, 21) <= d < datetime(1961, 8, 10):
        meridian = 127.5
    else:
        meridian = 135.0

    corr_min = (longitude - meridian) * 4.0 + equation_of_time(d)
    return d + timedelta(minutes=corr_min), warnings



def calculate_saju(name, gender, year, month, day, hour, minute, calendar="solar",
                   city=None, longitude=None):
    """
    사주 계산 메인 함수

    파라미터:
        name (str): 의뢰자 이름
        gender (str): "M" 또는 "F"
        year, month, day, hour, minute (int): 출생 일시 (시계 시각 그대로 입력)
        calendar (str): "solar" 또는 "lunar"
        city (str): 출생 도시 (CITY_LONGITUDES 참조). 미입력 시 서울 기준 보정 + 경고
        longitude (float): 출생지 경도 직접 입력 (city보다 우선)

    반환:
        dict: 사주 분석 결과 (8글자, 음양·오행·십신 분포, 12운성, 진태양시 보정 내역 등)
    """

    # 1. 음력 → 양력 변환 (필요 시)
    if calendar == "lunar":
        cal = KoreanLunarCalendar()
        cal.setLunarDate(year, month, day, False)
        solar_year = cal.solarYear
        solar_month = cal.solarMonth
        solar_day = cal.solarDay
    else:
        solar_year, solar_month, solar_day = year, month, day

    warnings = []

    # 2. 진태양시 보정 — 출생지 경도 + 균시차 (사이트 만세력과 동일 기준)
    # city가 "모름"이면 longitude=None이 되어 경도/균시차 보정을 생략한다.
    if longitude is None:
        if city and city in REGION_LONGITUDES:
            longitude = REGION_LONGITUDES[city]
            if longitude is None:
                warnings.append("출생지 모름 — 경도/균시차 보정 생략 (표준시 기준 판정)")
        else:
            longitude = REGION_LONGITUDES["서울"]
            warnings.append("출생지 미입력 — 서울 경도 기준으로 보정함 (출생지를 알면 city 인자로 입력 권장)")

    clock_dt = datetime(solar_year, solar_month, solar_day, hour, minute)
    solar_dt, tz_warnings = to_true_solar(clock_dt, longitude)
    warnings.extend(tz_warnings)

    # 이후 모든 기둥(년·월·일·시)은 보정된 진태양시 기준으로 계산한다.
    # 정자시: 일주는 (보정 시각 기준) 자정 00:00에 변경. 23:00~24:00 출생도 당일 일주 유지.
    day_for_calc = datetime(solar_dt.year, solar_dt.month, solar_dt.day)
    eff_hour, eff_minute = solar_dt.hour, solar_dt.minute

    # 2-1. 잔여 경계 경고 — 보정 후 시각이 시진 경계(홀수 정각)나 자정에서 ±10분 이내면
    # 균시차 근사 오차(±1~2분)와 출생 시각 기록 오차를 감안해 교차 확인 권고
    minutes_of_day = eff_hour * 60 + eff_minute
    for boundary_h in (1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23):
        if abs(minutes_of_day - boundary_h * 60) <= 10:
            warnings.append(
                f"보정 후 시각 {eff_hour:02d}:{eff_minute:02d}가 시진 경계({boundary_h:02d}:00) "
                f"±10분 이내 — 공인 만세력으로 시주 교차 확인 권장"
            )
            break
    if minutes_of_day <= 10 or minutes_of_day >= 1430:
        warnings.append(
            f"보정 후 시각 {eff_hour:02d}:{eff_minute:02d}가 자정 ±10분 이내 — "
            "일주가 갈릴 수 있으니 공인 만세력으로 교차 확인 권장"
        )

    # 3. 입춘세수 — 입춘(평균 2월 4일) 전 출생은 전년도 년주
    year_for_pillar = day_for_calc.year
    if day_for_calc.month == 1 or (day_for_calc.month == 2 and day_for_calc.day < 4):
        year_for_pillar -= 1
    if day_for_calc.month == 2 and day_for_calc.day in (3, 4, 5):
        warnings.append(
            "입춘(2월 4일 전후) 부근 출생 — 년주가 해당 연도 실제 입춘 시각에 따라 "
            "달라질 수 있으니 정밀 만세력으로 교차 확인 필요"
        )

    # 4. 년주 계산
    year_tian, year_zhi = get_year_pillar(year_for_pillar)

    # 5. 월주 계산 — 절기(節) 기준 사주 월 순번 사용 (평균 절입일 기반, 경계 부근은 경고)
    saju_month_order, month_warning = get_saju_month_order(day_for_calc.month, day_for_calc.day)
    if month_warning:
        warnings.append(month_warning)
    year_tian_idx = TIANGAN.index(year_tian)
    month_tian, month_zhi = get_month_pillar(year_tian_idx, saju_month_order)

    # 6. 일주 계산
    day_tian, day_zhi = get_day_pillar(day_for_calc.year, day_for_calc.month, day_for_calc.day)

    # 7. 시주 계산
    day_tian_idx = TIANGAN.index(day_tian)
    hour_tian, hour_zhi = get_hour_pillar(day_tian_idx, eff_hour)

    # 8. 4주 구성
    pillars = [
        {"name": "시주", "tiangan": hour_tian, "dizhi": hour_zhi},
        {"name": "일주", "tiangan": day_tian, "dizhi": day_zhi},
        {"name": "월주", "tiangan": month_tian, "dizhi": month_zhi},
        {"name": "년주", "tiangan": year_tian, "dizhi": year_zhi},
    ]

    # 9. 지장간 추가
    for pillar in pillars:
        pillar["jijanggan"] = JIJANGGAN[pillar["dizhi"]["hanja"]]

    # 10. 일간 기준 십신 분석 (각 천간/지지의 십신)
    ilgan = day_tian
    for pillar in pillars:
        if pillar["name"] != "일주":
            pillar["tiangan_sipsin"] = get_sipsin(
                ilgan["ohaeng"], ilgan["yin_yang"],
                pillar["tiangan"]["ohaeng"], pillar["tiangan"]["yin_yang"]
            )
        else:
            pillar["tiangan_sipsin"] = "일간"

        pillar["dizhi_sipsin"] = get_sipsin(
            ilgan["ohaeng"], ilgan["yin_yang"],
            pillar["dizhi"]["ohaeng"], pillar["dizhi"]["yin_yang"]
        )

    # 11. 12운성 추가 (각 지지에 대해)
    for pillar in pillars:
        unseong_for_ilgan = UNSEONG_MAP.get(ilgan["hanja"], {})
        pillar["unseong"] = unseong_for_ilgan.get(pillar["dizhi"]["hanja"], "")

    # 12. 음양·오행 분포
    distribution = calculate_distribution(pillars)

    # 13. 십신 분포
    sipsin_distribution = calculate_sipsin_distribution(pillars, ilgan)

    # 14. 일간 왕쇠 판별 — 관법 기반 (득령/득지/득세, KWANBEOP.md 3절)
    # 단순 오행 개수 합산이 아니라, 자리(궁)별 가중치로 판정한다.
    # 비겁(같은 오행)·인성(나를 생하는 오행)에 해당하는 글자만 득점.
    ilgan_ohaeng = ilgan["ohaeng"]
    sheng_to_ilgan = {"화": "목", "토": "화", "금": "토", "수": "금", "목": "수"}
    in_ohaeng = sheng_to_ilgan[ilgan_ohaeng]  # 인성 오행

    def _supports(ohaeng):
        return ohaeng in (ilgan_ohaeng, in_ohaeng)

    pillar_by_name = {p["name"]: p for p in pillars}
    score = 0
    deukryeong = _supports(pillar_by_name["월주"]["dizhi"]["ohaeng"])   # 득령 (월지)
    deukji = _supports(pillar_by_name["일주"]["dizhi"]["ohaeng"])       # 득지 (일지)
    if deukryeong:
        score += 40
    if deukji:
        score += 20
    for pname in ("년주", "시주"):                                       # 득세 — 기타 지지
        if _supports(pillar_by_name[pname]["dizhi"]["ohaeng"]):
            score += 10
    for pname in ("년주", "월주", "시주"):                               # 득세 — 천간 (뿌리 약하므로 소액)
        if _supports(pillar_by_name[pname]["tiangan"]["ohaeng"]):
            score += 5

    if score >= 60:
        ilgan_strength = "신강"
    elif score >= 40:
        ilgan_strength = "중화"
    else:
        ilgan_strength = "신약"

    ilgan_strength_detail = {
        "score": score,
        "deukryeong": deukryeong,
        "deukji": deukji,
        "note": "참고용 1차 판정 — 최종 왕쇠·용신은 KWANBEOP.md 절차로 확정해 입력 데이터에 기재",
    }

    # 15. 결과 종합
    result = {
        "name": name,
        "gender": "남" if gender == "M" else "여",
        "solar_birth": f"{solar_year}-{solar_month:02d}-{solar_day:02d} {hour:02d}:{minute:02d}",
        "true_solar_time": f"{solar_dt.year}-{solar_dt.month:02d}-{solar_dt.day:02d} {solar_dt.hour:02d}:{solar_dt.minute:02d}"
                           + (f" (경도 {longitude}° 보정)" if longitude is not None else " (보정 생략 — 지역 모름)"),
        "calendar_used": "정자시 기준 (일주 자정 변경) + 진태양시 보정",
        "warnings": warnings,
        "pillars": [
            {
                "name": p["name"],
                "tiangan": f"{p['tiangan']['hanja']}({p['tiangan']['hangul']}) {p['tiangan']['ohaeng']}",
                "dizhi": f"{p['dizhi']['hanja']}({p['dizhi']['hangul']}) {p['dizhi']['ohaeng']}",
                "tiangan_sipsin": p["tiangan_sipsin"],
                "dizhi_sipsin": p["dizhi_sipsin"],
                "unseong": p["unseong"],
                "jijanggan": "/".join([j for j in p["jijanggan"] if j])
            }
            for p in pillars
        ],
        "ilgan": f"{ilgan['hanja']}({ilgan['hangul']}) {ilgan['ohaeng']}",
        "ilgan_strength": ilgan_strength,
        "ilgan_strength_detail": ilgan_strength_detail,
        "distribution": distribution,
        "sipsin_distribution": sipsin_distribution,
    }

    return result


# ============================================================
# 6. 출력 헬퍼
# ============================================================

def print_saju(result):
    """사주 결과를 보기 좋게 출력"""
    print("=" * 60)
    print(f"  {result['name']} ({result['gender']})")
    print(f"  생년월일: {result['solar_birth']} (양력)")
    print(f"  진태양시: {result.get('true_solar_time', '-')}")
    print(f"  적용 학설: {result['calendar_used']}")
    for w in result.get("warnings", []):
        print(f"  ⚠️  {w}")
    print("=" * 60)

    print("\n[사주 원국]")
    print(f"{'':<6}{'시주':<14}{'일주':<14}{'월주':<14}{'년주':<14}")
    print("-" * 64)

    # 천간 행
    row = "천간   "
    for p in result["pillars"]:
        row += f"{p['tiangan']:<14}"
    print(row)

    # 지지 행
    row = "지지   "
    for p in result["pillars"]:
        row += f"{p['dizhi']:<14}"
    print(row)

    # 천간 십신
    row = "천간십성"
    for p in result["pillars"]:
        row += f"{p['tiangan_sipsin']:<14}"
    print(row)

    # 지지 십신
    row = "지지십성"
    for p in result["pillars"]:
        row += f"{p['dizhi_sipsin']:<14}"
    print(row)

    # 12운성
    row = "12운성  "
    for p in result["pillars"]:
        row += f"{p['unseong']:<14}"
    print(row)

    # 지장간
    row = "지장간  "
    for p in result["pillars"]:
        row += f"{p['jijanggan']:<14}"
    print(row)

    print(f"\n일간: {result['ilgan']} | 일간 왕쇠: {result['ilgan_strength']}")

    print("\n[음양 분포]")
    yy = result["distribution"]["yin_yang"]
    print(f"  양(陽): {yy['양']}개 / 음(陰): {yy['음']}개")
    if result["distribution"]["yang_palthong"]:
        print("  ★ 양팔통(陽八通)")
    if result["distribution"]["yin_palthong"]:
        print("  ★ 음팔통(陰八通)")

    print("\n[오행 분포]")
    for ohaeng, count in result["distribution"]["ohaeng"].items():
        bar = "■" * count + "□" * (8 - count)
        print(f"  {ohaeng}: {bar} {count}개")

    print("\n[십신 분포]")
    for sipsin, count in result["sipsin_distribution"].items():
        if count > 0:
            bar = "■" * count
            print(f"  {sipsin}: {bar} {count}개")

    print("=" * 60)


# ============================================================
# 7. 메인 실행 (테스트)
# ============================================================

if __name__ == "__main__":
    # Moon 본인 사주 테스트 — 정자시 + 진태양시 보정 검증
    print("\n>> Moon 본인 사주 테스트 (1996-06-26 23:00, 양력, 부산)")
    print(">> 예상 결과: 시주 甲子, 일주 甲午, 월주 甲午, 년주 丙子 (정자시 기준)")
    print()

    result = calculate_saju(
        name="문인구",
        gender="M",
        year=1996,
        month=6,
        day=26,
        hour=23,
        minute=0,
        calendar="solar",
        city="부산"
    )

    print_saju(result)

    # JSON 형식으로도 출력 (시스템 프롬프트 입력용)
    import json
    print("\n[JSON 출력 — 시스템 프롬프트 입력용]")
    print(json.dumps(result, ensure_ascii=False, indent=2))
