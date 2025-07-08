// src/api/auth.ts

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// JWT 디코딩을 위한 타입 정의
interface JwtPayload {
  exp?: number; // Expiration time in seconds since epoch
  // 다른 JWT 클레임이 있다면 여기에 추가할 수 있습니다.
}

/**
 * JWT 토큰을 디코딩하여 페이로드를 반환합니다.
 * @param token - 디코딩할 JWT 토큰 문자열
 * @returns 디코딩된 JWT 페이로드 객체 또는 null (유효하지 않은 토큰 형식 포함)
 */
const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || typeof parts[1] !== 'string') {
      console.error("유효하지 않은 JWT 형식: 토큰에 충분한 부분이 없거나 페이로드가 문자열이 아닙니다.");
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT 디코딩 실패:", e);
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
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

// 백엔드 응답 구조에 맞춘 인터페이스
interface AuthResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * 소셜 로그인 콜백 처리를 위한 함수.
 * 소셜 서비스로부터 받은 인가 코드(code)를 백엔드 API에 전송하여 토큰을 발급받습니다.
 * @param provider - 소셜 로그인 제공자 (예: 'kakao', 'google')
 * @param code - 소셜 서비스로부터 받은 인가 코드
 * @returns JWT 액세스 토큰 문자열
 * @throws API 호출 실패 시 에러 발생
 */
export async function handleSocialLoginCallback(provider: string, code: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/oauth2/${provider}?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // 무시
      }
      throw new Error(`소셜 로그인 실패 (${provider}, HTTP ${response.status}): ${errorData.message || '알 수 없는 오류'}`);
    }

    const data: AuthResponse = await response.json();

    if (!data.isSuccess || !data.result?.accessToken) {
      throw new Error('응답에서 액세스 토큰을 찾을 수 없습니다.');
    }

    return data.result.accessToken;

  } catch (error) {
    if (error instanceof Error) {
      console.error('소셜 로그인 콜백 에러:', error.message);
    } else {
      console.error('알 수 없는 소셜 로그인 콜백 에러:', error);
    }
    throw error;
  }
}

/**
 * 개발/테스트 목적으로만 사용되는 임시 토큰 발급 API를 호출합니다.
 * @returns 테스트용 JWT 액세스 토큰 문자열
 */
export async function fetchTestToken(): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/oauth2/test-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // 무시
      }
      throw new Error(`테스트 토큰 발급 실패 (HTTP ${response.status}): ${errorData.message || '알 수 없는 오류'}`);
    }

    const data: AuthResponse = await response.json();

    if (!data.isSuccess || !data.result?.accessToken) {
      throw new Error('응답에서 액세스 토큰을 찾을 수 없습니다.');
    }

    return data.result.accessToken;

  } catch (error) {
    if (error instanceof Error) {
      console.error('테스트 토큰 발급 에러:', error.message);
    } else {
      console.error('알 수 없는 테스트 토큰 발급 에러:', error);
    }
    throw error;
  }
}

/**
 * 로컬 스토리지에서 액세스 토큰을 가져오는 함수
 * 토큰 만료 여부를 확인하고, 만료되었다면 제거 후 'TOKEN_EXPIRED' 오류 발생
 * @returns 유효한 액세스 토큰 문자열 또는 null
 * @throws 토큰이 만료되었을 경우 'TOKEN_EXPIRED' 오류 발생
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      if (isTokenExpired(token)) {
        console.warn('액세스 토큰이 만료되었습니다. 로컬 스토리지에서 제거합니다.');
        removeAccessToken();
        throw new Error('TOKEN_EXPIRED');
      }
      return token;
    }
  }
  return null;
};

/**
 * 로컬 스토리지에 액세스 토큰을 저장하는 함수
 * @param token 저장할 액세스 토큰 문자열
 */
export const setAccessToken = (token: string) => {
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch (e) {
      console.error('localStorage에 토큰 저장 중 오류:', e);
    }
  }
};

/**
 * 로컬 스토리지에서 액세스 토큰을 제거하는 함수
 */
export const removeAccessToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};
