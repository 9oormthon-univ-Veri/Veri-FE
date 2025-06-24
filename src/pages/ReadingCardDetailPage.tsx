// src/pages/ReadingCardDetailPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md'; // 뒤로가기 아이콘
import { FiDownload, FiShare2 } from 'react-icons/fi'; // 다운로드, 공유 아이콘

import { getCardDetailById, type Card } from '../api/cardApi'; // CardDetail 대신 Card 타입 사용
import './ReadingCardDetailPage.css';

function ReadingCardDetailPage() {
  const { id } = useParams<{ id: string }>(); // URL 파라미터에서 cardId 가져오기
  const navigate = useNavigate();

  const [cardDetail, setCardDetail] = useState<Card | null>(null); // CardDetail 대신 Card 타입 사용
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = "your_dummy_access_token"; // 실제 유효한 Access Token으로 교체 필요

  useEffect(() => {
    const fetchCardDetail = async (cardId: number) => {
      setIsLoading(true);
      setError(null);
      setCardDetail(null); // 새로운 카드 불러올 때 기존 데이터 초기화

      try {
        const response = await getCardDetailById(cardId); // API 호출

        if (response.isSuccess && response.result) {
          setCardDetail(response.result);
        } else {
          setError(response.message || "독서 카드 상세 정보를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('독서 카드 상세 정보를 불러오는 중 오류 발생:', err);
        setError(`독서 카드 상세 정보를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCardDetail(Number(id)); // cardId를 숫자로 변환하여 API 호출
    } else {
      setError("조회할 독서 카드 ID가 제공되지 않았습니다.");
      setIsLoading(false);
    }
  }, [id, accessToken]);

  const handleDownload = useCallback(() => {
    alert('다운로드 기능은 아직 구현되지 않았습니다.');
  }, []);

  const handleShare = useCallback(() => {
    alert('공유하기 기능은 아직 구현되지 않았습니다.');
  }, []);

  // 날짜 포맷팅 함수
  const formatUploadDate = useCallback((isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day} 업로드`;
  }, []);


  if (isLoading) {
    return <div className="reading-card-detail-page-container loading-state">독서 카드 상세 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="reading-card-detail-page-container error-state">
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">뒤로 가기</button>
      </div>
    );
  }

  if (!cardDetail) {
    return (
      <div className="reading-card-detail-page-container no-data-state">독서 카드 정보를 찾을 수 없습니다.</div>
    );
  }

  return (
    <div className="reading-card-detail-page-container">
      <header className="detail-header">
        <button className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </button>
        <h3>내가 읽은 책</h3>
        <div className="spacer"></div>
      </header>

      <div className="card-content-area">
        <div className="card-image-wrapper">
          <img
            src={cardDetail.imageUrl || 'https://placehold.co/300x400?text=No+Card+Image'}
            alt={`독서 카드: ${cardDetail.book.title}`}
            className="card-main-image"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/300x400?text=No+Card+Image";
            }}
          />
        </div>

        <div className="card-text-info">
          {/* 책 제목 */}
          <p className="book-title-for-card">{cardDetail.book.title}</p>
          {/* 독서 카드 내용 */}
          <p className="card-content-text">{cardDetail.content}</p>
          {/* 업로드 날짜 */}
          <p className="card-upload-date">{formatUploadDate(cardDetail.createdAt)}</p>
        </div>
      </div>

      {/* 하단 버튼 섹션 */}
      <div className="action-buttons-container">
        <button className="action-button download-button" onClick={handleDownload}>
          <FiDownload size={20} />
          <span>다운로드</span>
        </button>
        <button className="action-button share-button" onClick={handleShare}>
          <FiShare2 size={20} />
          <span>공유하기</span>
        </button>
      </div>
    </div>
  );
}

export default ReadingCardDetailPage;
