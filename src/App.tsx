// src/App.tsx

import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TabBar from './components/TabBar';
import FloatingCameraButton from './components/FloatingCameraButton';
import './App.css';

// Import page components
import LibraryPage from './pages/mainPage/LibraryPage';
import ReadingCardPage from './pages/mainPage/ReadingCardPage';
import CommunityPage from './pages/mainPage/CommunityPage';
import BookmarkPage from './pages/bookmarkPage';
import MyPage from './pages/mainPage/MyPage';
import MyBookshelfPage from './pages/MyBookshelfPage';
import BookDetailPage from './pages/detailPage/BookDetailPage';
import ReadingCardDetailPage from './pages/detailPage/ReadingCardDetailPage';
import LoginPage from './pages/LoginPage';
import MakeCardPage from './pages/makeCardPage/MakeCardPage';
import TextExtractionLoadingPage from './pages/makeCardPage/TextExtractionLoadingPage';
import TextExtractionResultPage from './pages/makeCardPage/TextExtractionResultPage';
import CardCustomizationPage from './pages/makeCardPage/CardCustomizationPage';
import CardCustomizationCompletePage from './pages/makeCardPage/CardCustomizationCompletePage';
import BookSearchPage from './pages/BookSearchPage'; 
import DownloadCardPage from './pages/DownloadCardPage';
import BookAddPage from './pages/BookAddPage';

// 인증 상태를 확인하는 헬퍼 함수 (로직은 그대로 유지)
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate(); // 이 변수는 로그인 성공 시 LoginPage에서 사용될 수 있으므로 유지

  useEffect(() => {
    // ✨ 이 블록을 주석 처리하거나 제거하여 로그인 리디렉션을 일시적으로 비활성화합니다.
    const publicPaths = ['/login'];

    if (!isAuthenticated() && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }

    // 개발 중 편의를 위해 로그인 무시
    // 주의: 실제 배포 시에는 이 로직을 다시 활성화하거나 적절한 인증 로직을 구현해야 합니다.
  }, [location.pathname, navigate]);

  const showTabBar = [
    '/',
    '/library',
    '/reading-card',
    '/camera',
    '/community',
    '/my-page'
  ].includes(location.pathname);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LibraryPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/reading-card" element={<ReadingCardPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/bookmark" element={<BookmarkPage />} />
        <Route path="/my-page" element={<MyPage />} />
        <Route path="/my-bookshelf" element={<MyBookshelfPage />} />
        <Route path="/book-detail/:id" element={<BookDetailPage />} />
        <Route path="/reading-card-detail/:id" element={<ReadingCardDetailPage />} />
        <Route path="/make-card" element={<MakeCardPage />} />
        <Route path="/text-extraction-loading" element={<TextExtractionLoadingPage />} />
        <Route path="/text-extraction-result" element={<TextExtractionResultPage />} />
        <Route path="/customize-card" element={<CardCustomizationPage />} />
        <Route path="/card-complete" element={<CardCustomizationCompletePage />} />
        <Route path="/book-search" element={<BookSearchPage />} />
        <Route path="/download-card" element={<DownloadCardPage />} />
        <Route path="/book-add" element={<BookAddPage />} />
        {/* 404 페이지 */}
        <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>} />
      </Routes>
      {showTabBar && <TabBar />}
      {showTabBar && <FloatingCameraButton />}
    </div>
  );
}

export default App;