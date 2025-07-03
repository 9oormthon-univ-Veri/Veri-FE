import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiDownload, FiShare2 } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

// cardApi에서 Card 타입과 getCardDetailById, deleteCard 함수를 임포트
import { getCardDetailById, deleteCard, type Card } from '../../api/cardApi';
import './ReadingCardDetailPage.css';

function ReadingCardDetailPage() {
  const { id } = useParams<{ id: string }>(); // URL 파라미터에서 cardId 가져오기
  const navigate = useNavigate();

  const [cardDetail, setCardDetail] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // 다운로드/공유/삭제 등 처리 중 상태

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null); // 캡처할 요소의 ref

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
          // API 응답의 'id'를 'cardId'로 매핑하고,
          // 'createdAt' 필드는 API 명세에 없으므로 포함하지 않습니다.
          setCardDetail({
            cardId: response.result.id,
            content: response.result.content,
            imageUrl: response.result.imageUrl,
            book: {
              title: response.result.book.title,
              coverImageUrl: response.result.book.coverImageUrl,
              author: response.result.book.author,
            },
            // createdAt 필드는 API에서 제공되지 않으므로, 더 이상 여기에 설정하지 않습니다.
            // 만약 날짜 정보가 필요하다면, 카드 생성 시점에 저장하거나 다른 API를 통해 가져와야 합니다.
          });
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

  // 독서 카드 다운로드 기능
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
      link.download = `독서카드_${cardDetail?.book.title || '제목없음'}_${cardDetail?.cardId}.png`;
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

  // 독서 카드 공유 기능
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

        const file = new File([blob], `독서카드_${cardDetail?.book.title || '제목없음'}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `나의 독서카드: ${cardDetail?.book.title || '제목없음'}`,
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

  // 독서 카드 삭제 기능
  const handleDeleteCard = useCallback(async () => {
    if (!cardDetail || !cardDetail.cardId) {
      alert('삭제할 독서 카드 정보가 없습니다.');
      return;
    }

    if (window.confirm('정말로 이 독서 카드를 삭제하시겠습니까?')) {
      setIsProcessing(true);
      setMenuOpen(false); // 메뉴 닫기
      try {
        const response = await deleteCard(cardDetail.cardId);
        if (response.isSuccess) {
          alert('독서 카드가 성공적으로 삭제되었습니다.');
          navigate('/reading-card'); // 독서 카드 목록 페이지로 이동
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

  // 독서 카드 수정 기능 (현재는 알림만, 실제 구현 시 navigate)
  const handleEditCard = useCallback(() => {
    if (!cardDetail) return;
    setMenuOpen(false); // 메뉴 닫기
    alert('독서 카드 수정 기능은 아직 구현되지 않았습니다.');
    // 실제 구현 시: navigate('/customize-card', { state: { cardData: cardDetail } });
  }, [cardDetail]);

  // createdAt 필드가 API에서 제공되지 않으므로, 날짜 포맷팅 함수는 더 이상 사용하지 않습니다.
  // 대신 '날짜 정보 없음'을 직접 표시합니다.

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
            alt={`독서 카드: ${cardDetail.book.title}`}
            className="card-main-image"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/300x400?text=No+Card+Image";
              e.currentTarget.alt = "이미지 로드 실패";
            }}
          />
        </div>

        <div className="card-text-info">
          <p className="book-title-for-card">{cardDetail.book.title}</p>
          <p className="card-content-text">{cardDetail.content}</p>
          {/* createdAt 필드가 API에서 제거되었으므로, 날짜 정보는 임시로 '날짜 정보 없음'을 표시합니다. */}
          <p className="card-upload-date">날짜 정보 없음</p>
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
