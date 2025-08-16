// src/components/TabBar.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// SVG 아이콘들을 import합니다.
import LibraryActiveIcon from '../assets/icons/NavBar/Active/library.svg';
import LibraryDeactiveIcon from '../assets/icons/NavBar/Deactive/library.svg';
import ReadingCardActiveIcon from '../assets/icons/NavBar/Active/reading_card.svg';
import ReadingCardDeactiveIcon from '../assets/icons/NavBar/Deactive/reading_card.svg';
import CommunityActiveIcon from '../assets/icons/NavBar/Active/community.svg';
import CommunityDeactiveIcon from '../assets/icons/NavBar/Deactive/community.svg';
import MyPageActiveIcon from '../assets/icons/NavBar/Active/my_page.svg';
import MyPageDeactiveIcon from '../assets/icons/NavBar/Deactive/my_page.svg';

// 아이콘 컴포넌트를 정의합니다.
const LibraryIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? LibraryActiveIcon : LibraryDeactiveIcon} 
        alt="서재" 
        className="tab-item-icon"
    />
);

const ReadingCardIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? ReadingCardActiveIcon : ReadingCardDeactiveIcon} 
        alt="독서카드" 
        className="tab-item-icon"
    />
);

const CommunityIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? CommunityActiveIcon : CommunityDeactiveIcon} 
        alt="커뮤니티" 
        className="tab-item-icon"
    />
);

const MyPageIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? MyPageActiveIcon : MyPageDeactiveIcon} 
        alt="마이페이지" 
        className="tab-item-icon"
    />
);

interface TabItem {
    id: string;
    name: string;
    icon: React.ComponentType<{ active: boolean }>;
    path: string;
    isDummy?: boolean;
}

const currentTabs: TabItem[] = [
    { id: 'library', name: '서재', icon: LibraryIcon, path: '/library' },
    { id: 'readingCard', name: '독서카드', icon: ReadingCardIcon, path: '/reading-card' },
    { id: 'camera', name: '', icon: () => null, path: '', isDummy: true },
    { id: 'community', name: '커뮤니티', icon: CommunityIcon, path: '/community' },
    { id: 'myPage', name: '마이페이지', icon: MyPageIcon, path: '/my-page' },
];

function TabBar() {
    const navigate = useNavigate();
    const location = useLocation();

    // location.pathname이 변경될 때마다 activeTab을 업데이트하는 useEffect
    // ✨ 이 부분을 추가하거나 수정합니다.
    useEffect(() => {
        const currentTab = currentTabs.find(tab => tab.path === location.pathname);
        if (currentTab) {
            setActiveTab(currentTab.id);
        } else {
            // 현재 경로가 탭바에 없는 경우, 기본값 또는 특정 로직 처리
            // 예를 들어, 상세 페이지로 이동했을 때 탭이 비활성화되도록 할 수 있습니다.
            // setActiveTab(''); // 모든 탭 비활성화
        }
    }, [location.pathname]); // location.pathname이 변경될 때마다 이 효과를 재실행

    const initialActiveTabId = currentTabs.find(tab => tab.path === location.pathname)?.id ?? 'library';
    const [activeTab, setActiveTab] = useState<string>(initialActiveTabId);


    const handleTabClick = (tab: TabItem) => {
        if (tab.isDummy) {
            return;
        }
        setActiveTab(tab.id); // 탭 클릭 시에도 상태 업데이트
        console.log(`탭 "${tab.name}" 클릭됨. 경로: ${tab.path}`);
        navigate(tab.path);
    };

    return (
        <div className="tab-bar-container">
            {currentTabs.map((tab) => {
                const isActive = activeTab === tab.id || location.pathname === tab.path;
                const IconComponent = tab.icon;

                return (
                    <div
                        key={tab.id}
                        className={`${tab.isDummy ? 'dummy-tab-item' : 'tab-item'} ${isActive ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}
                    >
                        {!tab.isDummy && (
                            <>
                                <IconComponent active={isActive} />
                                <span className='tab-item-text'>{tab.name}</span>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default TabBar;