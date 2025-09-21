/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 주어진 날짜가 속한 주의 시작일(일요일)과 종료일(토요일) 계산
 */
export function getWeekRange(date: Date = new Date()): {
  start: Date
  end: Date
} {
  // KST 기준 날짜 문자열로 정규화 후, 그 자정을 기준으로 주 계산
  const kstDateStr = toKSTDateString(date)
  const kstMidnight = parseKSTDate(kstDateStr)

  // KST 자정 기준 요일 (일=0)
  const kstForWeekday = new Date(kstMidnight.getTime() + 9 * 60 * 60 * 1000)
  const day = kstForWeekday.getUTCDay()

  const start = new Date(kstMidnight)
  start.setUTCDate(start.getUTCDate() - day)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * URL 날짜 파라미터 파싱
 */
export function parseDateParams(searchParams: URLSearchParams): {
  startDate?: Date
  endDate?: Date
  date?: Date
} {
  const result: { startDate?: Date; endDate?: Date; date?: Date } = {}

  // date 파라미터 파싱 (rooms 목록용)
  const dateParam = searchParams.get('date')
  if (dateParam) {
    const parsedDate = parseKSTDate(dateParam)
    if (!isNaN(parsedDate.getTime())) {
      result.date = parsedDate
    }
  }

  // startDate, endDate 파라미터 파싱 (rooms 상세용)
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  if (startDateParam) {
    const parsedStartDate = parseKSTDate(startDateParam)
    if (!isNaN(parsedStartDate.getTime())) {
      result.startDate = parsedStartDate
    }
  }

  if (endDateParam) {
    const parsedEndDate = parseKSTDate(endDateParam)
    if (!isNaN(parsedEndDate.getTime())) {
      result.endDate = parsedEndDate
    }
  }

  return result
}

/**
 * 날짜를 URL 포맷(YYYY-MM-DD)으로 변환
 */
export function formatDateForURL(date: Date): string {
  return toKSTDateString(date)
}

/**
 * 주간 날짜 배열 생성 (일요일부터 토요일까지)
 */
export function getWeekDates(date: Date = new Date()): Date[] {
  const { start } = getWeekRange(date)
  const dates = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }

  return dates
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return toKSTDateString(date1) === toKSTDateString(date2)
}

// ===== 한국 시간대(KST) 헬퍼 함수 =====

/**
 * KST 날짜 문자열('YYYY-MM-DD')을 Date 객체로 변환
 * PostgreSQL의 Date 타입과 일치하도록 UTC 자정으로 설정
 */
export function parseKSTDate(dateStr: string): Date {
  // 날짜 부분 추출
  const [year, month, day] = dateStr.split('-').map(Number)
  // UTC 자정으로 설정 (PostgreSQL Date 타입은 날짜만 저장)
  // 이렇게 하면 DB에 저장될 때 날짜가 변경되지 않음
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
}

/**
 * Date 객체를 KST 기준 'YYYY-MM-DD' 문자열로 변환
 * toISOString()과 달리 로컬 시간대 기준으로 변환
 */
export function toKSTDateString(date: Date): string {
  // UTC 타임스탬프에 +9h 보정 후 UTC 컴포넌트 사용
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  const year = shifted.getUTCFullYear()
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const day = String(shifted.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 현재 한국 시간 가져오기
 */
export function getKSTNow(): Date {
  return new Date()
}

/**
 * Date 객체를 한국 시간 기준으로 시작 시간(00:00:00)으로 설정
 */
export function setToKSTStartOfDay(date: Date): Date {
  const kstString = toKSTDateString(date)
  return parseKSTDate(kstString)
}

/**
 * Date 객체를 한국 시간 기준으로 종료 시간(23:59:59)으로 설정
 */
export function setToKSTEndOfDay(date: Date): Date {
  const start = setToKSTStartOfDay(date)
  return new Date(start.getTime() + (24 * 60 * 60 * 1000 - 1))
}
