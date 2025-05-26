// src/App.tsx
// import React from 'react'; // React 17+에서는 필요 없음
import TabBar from './components/TabBar'; // TabBar 컴포넌트 임포트
import './App.css'; // App 전반적인 스타일 임포트

function App() {
  return (
    <div className="App">
      {/* 여기에 페이지 컨텐츠가 올 수 있습니다. */}
      <h1>카카오 페이지 스타일 탭 바</h1>
      <p>아래 탭 바를 클릭해보세요.</p>

      {/* TabBar 컴포넌트 렌더링 */}
      <TabBar />
    </div>
  );
}

export default App;