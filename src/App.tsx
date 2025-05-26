// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import TabBar from './components/TabBar';
import FloatingCameraButton from './components/FloatingCameraButton';
import './App.css';

// 각 페이지 컴포넌트들을 별도의 파일에서 임포트합니다.
import LibraryPage from './pages/LibraryPage';
import ReadingCardPage from './pages/ReadingCardPage';
import CameraPage from './pages/CameraPage';
import CommunityPage from './pages/CommunityPage';
import BookmarkPage from './pages/BookmarkPage';
import MyPage from './pages/MyPage';
import MyBookshelfPage from './pages/MyBookshelfPage'; // 새로 추가된 실제 책장 페이지 임포트
// import MyBookshelfImagePage from './pages/MyBookshelfImagePage'; // 이제 필요 없으므로 제거 또는 주석 처리

function App() {
  const location = useLocation();

  // TabBar와 FloatingButton을 특정 경로에서만 숨깁니다.
  const showTabBar = location.pathname !== '/camera' && location.pathname !== '/my-bookshelf'; 
  // '/my-bookshelf' 경로에서도 TabBar와 FloatingButton을 숨기려면 조건 추가
  // 만약 책장 페이지에서 TabBar를 보여주고 싶다면 location.pathname !== '/camera' 로 유지

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/reading-card" element={<ReadingCardPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/bookmark" element={<BookmarkPage />} />
        <Route path="/my-page" element={<MyPage />} />
        <Route path="/my-bookshelf" element={<MyBookshelfPage />} /> {/* 새 책장 페이지 라우트 추가 */}
        <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - 페이지를 찾을 수 없습니다</h2></div>} />
      </Routes>

      {showTabBar && <TabBar />}
      {showTabBar && <FloatingCameraButton />}
    </div>
  );
}

export default App;