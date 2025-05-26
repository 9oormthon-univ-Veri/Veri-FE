// src/components/TabBar.tsx
import { useState } from 'react'; // 'React,' 부분을 삭제하고 useState만 임포트

// 탭 아이템의 타입을 정의합니다.
interface TabItem {
  id: string;
  name: string;
  iconClass: string; // CSS 클래스를 통한 아이콘
  isCamera: boolean; // 중앙의 특별한 '촬영' 탭인지 여부
}

// 탭 데이터 정의
const tabsV1: TabItem[] = [
  { id: 'library', name: '서재', iconClass: 'icon-book', isCamera: false },
  { id: 'readingCard', name: '독서카드', iconClass: 'icon-card', isCamera: false },
  { id: 'camera', name: '촬영', iconClass: 'icon-camera', isCamera: true },
  { id: 'community', name: '커뮤니티', iconClass: 'icon-community', isCamera: false },
  { id: 'myPage', name: '마이페이지', iconClass: 'icon-profile', isCamera: false },
];

const tabsV2: TabItem[] = [
    { id: 'library', name: '서재', iconClass: 'icon-book', isCamera: false },
    { id: 'readingCard', name: '독서카드', iconClass: 'icon-card', isCamera: false },
    { id: 'camera', name: '촬영', iconClass: 'icon-camera', isCamera: true },
    { id: 'bookmark', name: '책갈피', iconClass: 'icon-bookmark', isCamera: false },
    { id: 'myPage', name: '마이페이지', iconClass: 'icon-profile', isCamera: false },
  ];


function TabBar() {
  const currentTabs = tabsV1; 

  const [activeTab, setActiveTab] = useState<string>(currentTabs[0]?.id ?? 'library');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    console.log(`탭 "${tabId}" 클릭됨`);
  };

  return (
    <div className="tab-bar-container">
      {currentTabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${tab.isCamera ? 'camera-tab' : ''} ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          {/* 아이콘: CSS background-mask 방식으로 처리 */}
          <div className={`tab-item-icon ${tab.iconClass}`}></div>

          {/* 텍스트 */}
          <span>{tab.name}</span>
        </div>
      ))}
    </div>
  );
}

export default TabBar;