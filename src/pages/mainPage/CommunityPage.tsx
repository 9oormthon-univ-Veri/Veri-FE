// src/pages/CommunityPage.tsx
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';

function CommunityPage() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/my-page');
  };

  return <div className="page-container">
    <TopBar onProfileClick={handleProfileClick} />

    <div className='main-page-margin'>
    </div>
  </div>
}

export default CommunityPage;