// src/api/auth.ts

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// JWT 디코딩을 위한 타입 정의
interface JwtPayload {
  exp?: number; // Expiration time in seconds since epoch
  // other claims...
}

/**
 * JWT 토큰을 디코딩하여 페이로드를 반환합니다.
 * @param token - 디코딩할 JWT 토큰 문자열
 * @returns 디코딩된 JWT 페이로드 객체 또는 null (유효하지 않은 토큰 형식 포함)
 */
const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    // JWT는 최소 3개의 부분(헤더, 페이로드, 서명)으로 구성되어야 합니다.
    // parts[1]이 존재하고 string 타입인지 확인하여 undefined 가능성을 제거합니다.
    if (parts.length < 2 || typeof parts[1] !== 'string') {
      console.error("Invalid JWT format: Token does not contain enough parts or payload is not a string.");
      return null;
    }
    const base64Url = parts[1]; // 이제 TypeScript는 base64Url이 string임을 압니다.

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

/**
 * JWT 토큰의 만료 여부를 확인합니다.
 * @param token - 확인할 JWT 토큰 문자열
 * @returns 토큰이 만료되었으면 true, 아니면 false
 */
const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwt(token);
  // 페이로드가 없거나 'exp' 클레임이 없으면 만료되지 않은 것으로 간주 (혹은 유효하지 않은 토큰)
  if (!payload || typeof payload.exp !== 'number') {
    return false; 
  }
  const currentTime = Date.now() / 1000; // 현재 시간을 초 단위 (UTC)로 변환
  return payload.exp < currentTime;
};


// 실제 서버 응답에 맞춰 인터페이스 수정
interface MockLoginResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 임시 로그인 API를 호출하여 JWT 토큰을 가져오는 함수
 * @returns {Promise<string>} JWT 토큰 문자열
 */
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

    if (!response.ok) {
      let errorData: any = {}; 
      try {
        errorData = await response.json();
      } catch (jsonError) {
        console.warn('에러 응답 JSON 파싱 실패 (JSON이 아닐 수 있음):', jsonError);
      }
      throw new Error(`Login failed (HTTP ${response.status}): ${errorData.message || '알 수 없는 오류'}`);
    }

    const data: MockLoginResponse = await response.json();
    console.log('API 응답 데이터 (수정 후):', data); 

    if (!data.accessToken) { 
      throw new Error('Access token not found in the response.');
    }

    const accessToken = data.accessToken; 
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
 * 토큰 만료 여부를 확인하고, 만료되었다면 제거 후 'TOKEN_EXPIRED' 오류 발생
 * @returns {string | null} 유효한 액세스 토큰 문자열 또는 null
 * @throws {Error} 토큰이 만료되었을 경우 'TOKEN_EXPIRED' 오류 발생
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      if (isTokenExpired(token)) {
        console.warn('Access token expired. Removing from localStorage and signaling for redirection.');
        removeAccessToken(); // 만료된 토큰 제거
        // 만료 시 오류를 발생시켜 호출하는 쪽에서 로그인 페이지로 리디렉션하도록 유도
        throw new Error('TOKEN_EXPIRED'); 
      }
      return token;
    }
  }
  return null;
};

/**
 * 로컬 스토리지에 액세스 토큰을 저장하는 함수
 * @param token - 저장할 액세스 토큰 문자열
 */
export const setAccessToken = (token: string) => {
  console.log('--- setAccessToken 호출 시작 ---');
  console.log('setAccessToken에 전달된 토큰 (type, value):', typeof token, token);

  if (typeof window !== 'undefined') {
    try {
      if (token) { 
        localStorage.setItem('accessToken', token);
        console.log('localStorage에 accessToken 저장 완료.');
        console.log('localStorage에서 accessToken 즉시 확인:', localStorage.getItem('accessToken')); 
      } else {
        console.warn('경고: setAccessToken에 유효하지 않은(null/undefined/빈 문자열) 토큰이 전달됨.');
        localStorage.removeItem('accessToken'); 
      }
    } catch (e) {
      console.error('오류: localStorage에 토큰 저장 중 예외 발생:', e); 
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
