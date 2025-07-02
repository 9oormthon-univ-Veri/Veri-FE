// src/api/auth.ts

const BASE_URL = "https://api.very.miensoap.me";

// 실제 서버 응답에 맞춰 인터페이스 수정
interface MockLoginResponse {
  accessToken: string;
  refreshToken: string;
  // isSuccess, code, message, result 필드는 실제 응답에 없으므로 제거
}

/**
 * 임시 로그인 API를 호출하여 JWT 토큰을 가져오는 함수
 * @returns {Promise<string>} JWT 토큰 문자열
 */
// src/api/auth.ts

export async function mockLogin(): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/oauth2/mock/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API 응답 객체:', response);
    console.log('API 응답 상태:', response.status);

    // 1. 응답 상태 코드 확인 (여전히 중요)
    if (!response.ok) {
      let errorData: any = {}; // <-- 여기에 any 타입 명시
      try {
        errorData = await response.json();
      } catch (jsonError) {
        console.warn('에러 응답 JSON 파싱 실패 (JSON이 아닐 수 있음):', jsonError);
      }
      // errorData.message에 접근 시 안전하게 처리
      throw new Error(`Login failed (HTTP ${response.status}): ${errorData.message || '알 수 없는 오류'}`);
    }

    // 2. JSON 파싱
    // 실제 응답 형식에 맞춰 MockLoginResponse를 사용
    const data: MockLoginResponse = await response.json();
    console.log('API 응답 데이터 (수정 후):', data); // 파싱된 JSON 데이터 로깅

    // 3. 실제 응답 형식에 맞춰 토큰 존재 여부만 확인
    // data.isSuccess나 data.result가 없으므로 해당 조건 제거
    if (!data.accessToken) { // 오직 accessToken이 있는지 없는지만 확인
      throw new Error('Access token not found in the response.');
    }

    const accessToken = data.accessToken; // 직접 accessToken에 접근
    return accessToken;

  } catch (error) {
    if (error instanceof Error) {
      console.error('Login Error:', error.message);
    } else {
      console.error('An unknown login error occurred:', error);
    }
    throw error;
  }
}

/**
 * 로컬 스토리지에서 액세스 토큰을 가져오는 함수
 * 브라우저 환경에서만 동작하도록 처리
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

/**
 * 로컬 스토리지에 액세스 토큰을 저장하는 함수
 */
export const setAccessToken = (token: string) => {
  console.log('--- setAccessToken 호출 시작 ---');
  console.log('setAccessToken에 전달된 토큰 (type, value):', typeof token, token); // 🚨 여기에 주목! 전달된 토큰 값 확인

  if (typeof window !== 'undefined') {
    try {
      if (token) { // 토큰 값이 유효한지 한 번 더 확인 (선택 사항)
        localStorage.setItem('accessToken', token);
        console.log('localStorage에 accessToken 저장 완료.');
        console.log('localStorage에서 accessToken 즉시 확인:', localStorage.getItem('accessToken')); // 🚨 저장된 값 즉시 읽어 확인
      } else {
        console.warn('경고: setAccessToken에 유효하지 않은(null/undefined/빈 문자열) 토큰이 전달됨.');
        localStorage.removeItem('accessToken'); // 유효하지 않은 토큰이면 기존 값 제거
      }
    } catch (e) {
      console.error('오류: localStorage에 토큰 저장 중 예외 발생:', e); // 저장 중 예외 발생 시
    }
  } else {
    console.warn('경고: window 객체가 없어 localStorage에 토큰을 저장할 수 없습니다 (SSR 환경?).');
  }
  console.log('--- setAccessToken 호출 종료 ---');
};

/**
 * 로컬 스토리지에서 액세스 토큰을 제거하는 함수
 */
export const removeAccessToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};