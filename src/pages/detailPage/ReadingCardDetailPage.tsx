import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiDownload, FiShare2 } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

import { getCardDetailById, deleteCard, type Card } from '../../api/cardApi';
import './ReadingCardDetailPage.css';

function ReadingCardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cardDetail, setCardDetail] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCardDetail = async (cardId: number) => {
      setIsLoading(true);
      setError(null);
      setCardDetail(null);

      try {
        const response = await getCardDetailById(cardId);

        if (response.isSuccess && response.result) {
          // **Modification Start**
          // Safely access book properties using optional chaining
          const bookData = response.result.book;
          setCardDetail({
            cardId: response.result.id,
            content: response.result.content,
            imageUrl: response.result.imageUrl,
            createdAt: response.result.createdAt,
            book: bookData ? {
              id: bookData.id,
              title: bookData.title,
              coverImageUrl: bookData.coverImageUrl,
              author: bookData.author,
            } : null, // Set book to null if bookData is not available
          });
          // **Modification End**
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
      fetchCardDetail(Number(id));
    } else {
      setError("조회할 독서 카드 ID가 제공되지 않았습니다.");
      setIsLoading(false);
    }
  }, [id]);

  const handleDownload = useCallback(async () => {
    if (!cardContentRef.current) {
      alert('다운로드할 카드를 찾을 수 없습니다.');
      return;
    }
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(cardContentRef.current, { useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `독서카드_${cardDetail?.book?.title || '제목없음'}_${cardDetail?.cardId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('독서카드가 다운로드되었습니다!');
    } catch (err: any) {
      console.error('독서카드 다운로드 실패:', err);
      alert(`독서카드 다운로드에 실패했습니다: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [cardDetail]);

  const handleShare = useCallback(async () => {
    if (!cardContentRef.current) {
      alert('공유할 카드를 찾을 수 없습니다.');
      return;
    }
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(cardContentRef.current, { useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Blob 생성에 실패했습니다.');
          alert('독서카드 공유에 실패했습니다.');
          setIsProcessing(false);
          return;
        }

        const file = new File([blob], `독서카드_${cardDetail?.book?.title || '제목없음'}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `나의 독서카드: ${cardDetail?.book?.title || '제목없음'}`,
              text: cardDetail?.content || '나만의 독서카드를 공유해요!',
              files: [file],
            });
            console.log('독서카드 공유 성공');
          } catch (error: any) {
            console.error('독서카드 공유 실패:', error);
            if (error.name !== 'AbortError') {
              alert(`독서카드 공유에 실패했습니다: ${error.message}`);
            }
          }
        } else {
          alert('현재 브라우저에서는 파일 공유를 지원하지 않습니다.');
        }
        setIsProcessing(false);
      }, 'image/png');
    } catch (err: any) {
      console.error('독서카드 공유 준비 실패:', err);
      alert(`독서카드 공유 준비에 실패했습니다: ${err.message}`);
      setIsProcessing(false);
    }
  }, [cardDetail]);

  const handleDeleteCard = useCallback(async () => {
    if (!cardDetail || !cardDetail.cardId) {
      alert('삭제할 독서 카드 정보가 없습니다.');
      return;
    }

    if (window.confirm('정말로 이 독서 카드를 삭제하시겠습니까?')) {
      setIsProcessing(true);
      setMenuOpen(false);
      try {
        const response = await deleteCard(cardDetail.cardId);
        if (response.isSuccess) {
          alert('독서 카드가 성공적으로 삭제되었습니다.');
          navigate('/reading-card');
        } else {
          alert(`독서 카드 삭제에 실패했습니다: ${response.message || '알 수 없는 오류'}`);
        }
      } catch (err: any) {
        console.error('독서 카드 삭제 중 오류 발생:', err);
        alert(`독서 카드 삭제 중 오류가 발생했습니다: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [cardDetail, navigate]);

  const handleEditCard = useCallback(() => {
    if (!cardDetail) return;
    setMenuOpen(false);
    alert('독서 카드 수정 기능은 아직 구현되지 않았습니다.');
  }, [cardDetail]);

  const handleBookTitleClick = () => {
    // Check if cardDetail and cardDetail.book exist before accessing id
    if (cardDetail && cardDetail.book && cardDetail.book.id) {
      navigate(`/book-detail/${cardDetail.book.id}`);
    } else {
      alert("책 ID 정보를 찾을 수 없습니다.");
    }
  };

  const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hour = (`0${date.getHours()}`).slice(-2);
    const minute = (`0${date.getMinutes()}`).slice(-2);
    return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
  };

  if (isLoading || isProcessing) {
    return (
      <div className="loading-page-container">
        <p>{isProcessing ? '처리 중...' : '독서 카드 상세 정보를 불러오는 중...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page-container">
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
    <div className="page-container">
      <header className="detail-header">
        <button className="header-left-arrow" onClick={() => navigate("/reading-card")}>
          <MdArrowBackIosNew size={24} color="#333" />
        </button>
        <h3>나의 독서카드</h3>
        <div className="header-right-wrapper">
          <button
            className="header-menu-button"
            onClick={() => setMenuOpen((prev) => !prev)}
            disabled={isProcessing}
          >
            <BsThreeDotsVertical size={20} color="#333" />
          </button>

          {menuOpen && (
            <div className="header-dropdown-menu" ref={menuRef}>
              <div className="menu-item" onClick={handleEditCard}>
                <FiEdit2 size={16} />
                <span>수정하기</span>
              </div>
              <div className="menu-item" onClick={handleDeleteCard}>
                <FiTrash2 size={16} />
                <span>삭제하기</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="header-margin"></div>

      <div className="card-content-area" ref={cardContentRef}>
        <div className="card-image-wrapper">
          <img
            src={cardDetail.imageUrl || 'https://placehold.co/300x400?text=No+Card+Image'}
            alt={`독서 카드: ${cardDetail.book?.title || '제목없음'}`}
            className="card-main-image"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/300x400?text=No+Card+Image";
              e.currentTarget.alt = "이미지 로드 실패";
            }}
          />
        </div>

        <div className="card-text-info">
          <button className="book-title-for-card-button" onClick={handleBookTitleClick}>
            <p>
              {cardDetail.book?.title || '책 정보 없음'}
              {!cardDetail.book && <span className="no-book-info-message"> (책 정보 없음)</span>}
            </p>
          </button>

          <p className="card-content-text">{cardDetail.content}</p>
          <p className="card-upload-date">{cardDetail.createdAt ? formatDateTime(cardDetail.createdAt) : '업로드일 정보 없음'}</p>
        </div>
      </div>

      <div className="action-buttons-container-revised">
        <button className="action-button-revised download-button-revised" onClick={handleDownload} disabled={isProcessing}>
          <FiDownload size={24} />
          <span>다운로드</span>
        </button>
        <button className="action-button-revised share-button-revised" onClick={handleShare} disabled={isProcessing}>
          <FiShare2 size={24} />
          <span>공유하기</span>
        </button>
      </div>
    </div>
  );
}

export default ReadingCardDetailPage;