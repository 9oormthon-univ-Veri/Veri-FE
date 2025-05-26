// src/components/TabBar.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 탭 아이템의 타입을 정의합니다.
interface TabItem {
  id: string;
  name: string;
  iconClass: string;
  path: string;
  isDummy?: boolean; // 더미 탭인지 여부를 나타내는 속성 추가
}

// 탭 데이터 정의 (카메라 탭 자리에 더미 탭 추가)
const currentTabs: TabItem[] = [
  { id: 'library', name: '서재', iconClass: 'icon-book', path: '/library' },
  { id: 'readingCard', name: '독서카드', iconClass: 'icon-card', path: '/reading-card' },
  { id: 'dummyCamera', name: '', iconClass: '', path: '/camera', isDummy: true }, // 더미 탭 추가
  { id: 'community', name: '커뮤니티', iconClass: 'icon-community', path: '/community' },
  { id: 'myPage', name: '마이페이지', iconClass: 'icon-profile', path: '/my-page' },
];

function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialActiveTabId = currentTabs.find(tab => tab.path === location.pathname)?.id ?? 'library';
  const [activeTab, setActiveTab] = useState<string>(initialActiveTabId);


  const handleTabClick = (tab: TabItem) => {
    // 더미 탭은 클릭해도 아무 동작하지 않도록 방지
    if (tab.isDummy) {
      return;
    }
    setActiveTab(tab.id);
    console.log(`탭 "${tab.name}" 클릭됨. 경로: ${tab.path}`);
    navigate(tab.path);
  };

  return (
    <div className="tab-bar-container">
      {currentTabs.map((tab) => (
        <div
          key={tab.id}
          // 더미 탭에는 'tab-item' 클래스와 'active' 클래스를 적용하지 않음
          // 대신 'dummy-tab-item' 클래스를 적용하여 별도 스타일링
          className={`${tab.isDummy ? 'dummy-tab-item' : 'tab-item'} ${activeTab === tab.id || location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => handleTabClick(tab)}
        >
          {/* 더미 탭은 아이콘과 텍스트를 렌더링하지 않음 */}
          {!tab.isDummy && <div className={`tab-item-icon ${tab.iconClass}`}></div>}
          {!tab.isDummy && <span>{tab.name}</span>}
        </div>
      ))}
    </div>
  );
}

export default TabBar;