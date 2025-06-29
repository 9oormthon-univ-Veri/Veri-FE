// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import TabBar from './components/TabBar';
import FloatingCameraButton from './components/FloatingCameraButton';
import './App.css';

// Import page components from their respective files.
import LibraryPage from './pages/MainPage/LibraryPage';
import ReadingCardPage from './pages/MainPage/ReadingCardPage';
import CameraPage from './pages/MainPage/CameraPage';
import CommunityPage from './pages/MainPage/CommunityPage';
import BookmarkPage from './pages/BookmarkPage';
import MyPage from './pages/MainPage/MyPage';
import MyBookshelfPage from './pages/MyBookshelfPage';
import BookDetailPage from './pages/DetailPage/BookDetailPage';
import ReadingCardDetailPage from './pages/DetailPage/ReadingCardDetailPage'; // ✨ ReadingCardDetailPage 임포트

function App() {
  const location = useLocation();

  // Determine if the TabBar and FloatingCameraButton should be shown.
  // They are only shown on these specific paths.
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
        {/* Define the routes for various pages */}
        <Route path="/" element={<LibraryPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/reading-card" element={<ReadingCardPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/bookmark" element={<BookmarkPage />} />
        <Route path="/my-page" element={<MyPage />} />
        <Route path="/my-bookshelf" element={<MyBookshelfPage />} />
        <Route path="/book-detail/:id" element={<BookDetailPage />} />
        <Route path="/reading-card-detail/:id" element={<ReadingCardDetailPage />} />
        <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>} />
      </Routes>

      {/* Conditionally render the TabBar and FloatingCameraButton */}
      {showTabBar && <TabBar />}
      {showTabBar && <FloatingCameraButton />}
    </div>
  );
}

export default App;
