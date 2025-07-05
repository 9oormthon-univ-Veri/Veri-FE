import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookDetailPage.css';
import { MdArrowBackIosNew } from 'react-icons/md'; 
import { MdKeyboardArrowRight } from 'react-icons/md'; 
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdEdit } from 'react-icons/md'; // MdEdit 임포트 추가

// bookApi에서 필요한 타입과 함수들을 정확히 임포트
import { 
    getBookById, 
    deleteBook, 
    updateBookStatusToStart, 
    updateBookStatusToOver, 
    rateBook,
    type Book, 
    type BookStatus, // BookStatus 타입 임포트
    type CardSummary // CardSummary 타입 임포트
} from '../../api/bookApi';
import { StarRatingFullPage } from '../MyBookshelfPage'; // MyBookshelfPage에서 StarRatingFullPage 임포트

// ✨ 평점 수정 모달 컴포넌트
interface RateBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRating: number;
    onSave: (newRating: number) => void;
    isLoading: boolean;
}

const RateBookModal: React.FC<RateBookModalProps> = ({ isOpen, onClose, currentRating, onSave, isLoading }) => {
    const [newRating, setNewRating] = useState(currentRating);

    useEffect(() => {
        // 모달이 열릴 때마다 현재 평점으로 초기화
        if (isOpen) {
            setNewRating(currentRating); 
        }
    }, [isOpen, currentRating]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>별점 수정</h3>
                <div className="rating-input-group">
                    <label htmlFor="newRating">새로운 별점 (0~5):</label>
                    <input
                        type="number"
                        id="newRating"
                        min="0"
                        max="5"
                        step="0.5"
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        disabled={isLoading}
                    />
                </div>
                <div className="modal-actions">
                    <button onClick={() => onSave(newRating)} disabled={isLoading}>
                        {isLoading ? '저장 중...' : '저장'}
                    </button>
                    <button onClick={onClose} disabled={isLoading}>취소</button>
                </div>
            </div>
        </div>
    );
};

// ✨ 상태 변경 모달 컴포넌트
interface UpdateStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: BookStatus;
    onSave: (newStatus: BookStatus) => void;
    isLoading: boolean;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ isOpen, onClose, currentStatus, onSave, isLoading }) => {
    const [selectedStatus, setSelectedStatus] = useState<BookStatus>(currentStatus);

    useEffect(() => {
        // 모달이 열릴 때마다 현재 상태로 초기화
        if (isOpen) {
            setSelectedStatus(currentStatus);
        }
    }, [isOpen, currentStatus]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>읽기 상태 변경</h3>
                <div className="status-select-group">
                    <label htmlFor="statusSelect">상태:</label>
                    <select
                        id="statusSelect"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as BookStatus)}
                        disabled={isLoading}
                    >
                        {/* 백엔드에서 "READING"과 "DONE"만 보낸다고 했으므로, 옵션을 두 개로 제한합니다. */}
                        <option value="READING">읽는 중</option>
                        <option value="DONE">읽기 완료</option> 
                    </select>
                </div>
                <div className="modal-actions">
                    <button onClick={() => onSave(selectedStatus)} disabled={isLoading}>
                        {isLoading ? '저장 중...' : '저장'}
                    </button>
                    <button onClick={onClose} disabled={isLoading}>취소</button>
                </div>
            </div>
        </div>
    );
};


// MyReadingCardSection 컴포넌트 업데이트
interface MyReadingCardSectionProps {
    cards: CardSummary[]; // ✨ CardItem 대신 CardSummary[] 사용
    bookId: number; // 독서카드 생성 시 필요한 bookId 추가
}

const MyReadingCardSection: React.FC<MyReadingCardSectionProps> = ({ cards, bookId }) => {
    const navigate = useNavigate(); // navigate 훅 사용

    const handleSeeAllCards = useCallback(() => {
        // 모든 독서 카드 보기 페이지로 이동하는 로직
        navigate(`/book-detail/${bookId}/cards`); // 실제 bookId를 사용하여 라우팅
    }, [navigate, bookId]);

    // const handleCreateCard = useCallback(() => {
    //   // 독서 카드 만들기 페이지로 이동
    //   navigate('/make-card', { state: { bookId: bookId } }); // MakeCardPage로 bookId 전달
    // }, [navigate, bookId]);

    return (
        <div className="my-reading-card-section">
            <div className="section-header">
                <h4>이 책의 독서카드</h4>
                <button className="see-all-button" onClick={handleSeeAllCards}>
                    <span>전체보기</span>
                    <MdKeyboardArrowRight size={20} />
                </button>
            </div>
            {cards.length > 0 ? (
                <div className="card-list">
                    {cards.map((card, index) => (
                        // cardId가 고유하다고 가정하고 key로 사용
                        <div key={card.cardId || index} className="card-item-container"> 
                            <img src={card.cardImage} alt={`Reading Card ${index + 1}`} className="reading-card-image" /> {/* cardImage 사용 */}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-cards-message">등록된 독서 카드가 없습니다.</p>
            )}
        </div>
    );
};


function BookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [book, setBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // 모달 상태
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isSavingChanges, setIsSavingChanges] = useState(false); // API 저장 중 로딩 상태

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchBookDetails = useCallback(async (memberBookId: number) => {
        setIsLoading(true);
        setError(null);
        setBook(null);

        try {
            const response = await getBookById(memberBookId);

            if (response.isSuccess && response.result) {
                // ✨ API 응답 필드명에 맞춰 Book 객체 생성
                // GetBookByIdResponse의 result는 Book 인터페이스와 거의 일치하지만,
                // cardSummaries는 Book 인터페이스에 직접 포함되어 있지 않으므로 별도로 처리
                const fetchedBook: Book = {
                    memberBookId: response.result.memberBookId,
                    title: response.result.title,
                    author: response.result.author,
                    imageUrl: response.result.imageUrl,
                    score: response.result.score, // 'rating' 대신 'score' 사용
                    status: response.result.status,
                    startedAt: response.result.startedAt || new Date().toISOString(), // 'date' 대신 'startedAt' 사용
                };
                // cardSummaries는 Book 타입에 직접 없으므로, 필요에 따라 임시로 추가
                // 또는 MyReadingCardSection에 직접 전달
                setBook({ 
                    ...fetchedBook, 
                    // GetBookByIdResponse.result.cardSummaries를 직접 할당
                    cardSummaries: response.result.cardSummaries 
                } as Book & { cardSummaries: CardSummary[] }); // 타입 단언으로 cardSummaries 추가
            } else {
                setError(response.message || "책 상세 정보를 가져오는데 실패했습니다.");
            }
        } catch (err: any) {
            setError("책 상세 정보를 불러오는 중 오류가 발생했습니다: " + err.message);
        } finally {
            setIsLoading(false);
        }
    }, []); // fetchWithAuth에서 accessToken을 관리하므로 의존성 배열에서 accessToken 제거

    useEffect(() => {
        if (id) {
            fetchBookDetails(Number(id));
        } else {
            setError("조회할 책 ID가 제공되지 않았습니다.");
            setIsLoading(false);
        }
    }, [id, fetchBookDetails]);

    const getAuthorAndTranslator = useCallback((fullAuthor: string) => {
        const parts = fullAuthor.split(' (지은이), ');
        const authorName = parts[0];
        const translatorName = parts[1] ? `(옮긴이) ${parts[1].replace('(옮긴이)', '')}` : '';
        return { author: authorName, translator: translatorName };
    }, []);

    // ✨ 책 삭제 핸들러
    const handleDeleteBook = useCallback(async () => {
        if (!book || !book.memberBookId) {
            setError("책 정보가 불완전하여 삭제할 수 없습니다.");
            return;
        }

        // 사용자에게 삭제 확인 메시지 표시 (실제 서비스에서는 커스텀 모달 사용 권장)
        // alert 대신 커스텀 모달을 사용해야 합니다. 여기서는 편의상 alert 사용.
        if (window.confirm('정말로 이 책을 서재에서 삭제하시겠습니까?')) { 
            setIsSavingChanges(true); // 저장 중 로딩 상태 시작
            setMenuOpen(false); // 메뉴 닫기

            try {
                const response = await deleteBook(book.memberBookId); // deleteBook API 호출
                if (response.isSuccess) {
                    alert('책이 성공적으로 삭제되었습니다.');
                    navigate('/my-bookshelf'); // 삭제 후 나의 책장으로 이동
                } else {
                    alert(`책 삭제에 실패했습니다: ${response.message || '알 수 없는 오류'}`);
                }
            } catch (err: any) {
                console.error('책 삭제 중 오류 발생:', err);
                alert(`책 삭제 중 오류가 발생했습니다: ${err.message}`);
            } finally {
                setIsSavingChanges(false); // 저장 중 로딩 상태 종료
            }
        }
    }, [book, navigate]);

    // ✨ 별점 수정 핸들러
    const handleSaveRating = useCallback(async (newRating: number) => {
        if (!book || !book.memberBookId) {
            setError("책 정보가 불완전하여 별점을 업데이트할 수 없습니다.");
            return;
        }

        setIsSavingChanges(true); // 저장 중 로딩 상태 시작
        setIsRateModalOpen(false); // 모달 닫기

        try {
            const response = await rateBook(book.memberBookId, newRating); // rateBook API 호출
            if (response.isSuccess) {
                alert('별점이 성공적으로 업데이트되었습니다.');
                // UI 업데이트: book 상태의 score를 변경
                setBook(prevBook => prevBook ? { ...prevBook, score: newRating } : null);
            } else {
                alert(response.message || '별점 업데이트에 실패했습니다.');
            }
        } catch (err: any) {
            console.error('별점 업데이트 중 오류가 발생했습니다:', err);
            alert(`별점 업데이트 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsSavingChanges(false); // 저장 중 로딩 상태 종료
        }
    }, [book]);

    // ✨ 상태 변경 핸들러
    const handleSaveStatus = useCallback(async (newStatus: BookStatus) => {
        if (!book || !book.memberBookId) {
            setError("책 정보가 불완전하여 상태를 업데이트할 수 없습니다.");
            return;
        }

        setIsSavingChanges(true); // 저장 중 로딩 상태 시작
        setIsStatusModalOpen(false); // 모달 닫기

        try {
            let response;
            if (newStatus === 'READING') {
                response = await updateBookStatusToStart(book.memberBookId); // 읽기 시작 API 호출
            } else if (newStatus === 'DONE') { // 백엔드에서 'DONE'으로 보냄
                response = await updateBookStatusToOver(book.memberBookId); // 읽기 완료 API 호출
            } else { 
                 // 예상치 못한 상태 값 처리 (백엔드에서 READING, DONE만 보낸다고 했으므로 이 블록은 사실상 실행되지 않음)
                console.warn(`알 수 없는 책 상태: ${newStatus}. API 호출을 건너뜁니다.`);
                setIsSavingChanges(false);
                return;
            }

            if (response.isSuccess) {
                alert('책 상태가 성공적으로 업데이트되었습니다.');
                // UI 업데이트: book 상태의 status를 변경
                setBook(prevBook => prevBook ? { ...prevBook, status: newStatus } : null);
            } else {
                alert(response.message || '책 상태 업데이트에 실패했습니다.');
            }
        } catch (err: any) {
            console.error('책 상태 업데이트 중 오류가 발생했습니다:', err);
            alert(`책 상태 업데이트 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsSavingChanges(false); // 저장 중 로딩 상태 종료
        }
    }, [book]);


    if (isLoading || isSavingChanges) { // API 저장 중 로딩 상태도 포함
        return (
            <div className="loading-page-container">
                <p>{isSavingChanges ? '변경사항 저장 중...' : '책 정보를 불러오는 중...'}</p>
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

    if (!book) {
        return (
            <div className="book-detail-page-container no-data-state">책 정보를 찾을 수 없습니다.</div>
        );
    }

    const { author, translator } = getAuthorAndTranslator(book.author);

    return (
        <div className="page-container">
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate("/my-bookshelf")}> {/* 뒤로가기 경로 수정 */}
                    <MdArrowBackIosNew size={24} color="#333" />
                </button>
                <h3>내가 읽은 책</h3>
                <div className="header-right-wrapper">
                    <button
                        className="header-menu-button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <BsThreeDotsVertical size={20} color="#333" />
                    </button>

                    {menuOpen && (
                        <div className="header-dropdown-menu" ref={menuRef}>
                            <div className="menu-item" onClick={() => { setMenuOpen(false); alert('책 정보 수정 기능은 아직 구현되지 않았습니다. (제목, 저자 등)'); }}> {/* 책 정보 수정은 별도 API 필요 */}
                                <FiEdit2 size={16} />
                                <span>정보 수정</span>
                            </div>
                            <div className="menu-item" onClick={handleDeleteBook}>
                                <FiTrash2 size={16} />
                                <span>삭제하기</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="book-info-section">
                <div className="book-cover-detail-container">
                    <img src={book.imageUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} alt={book.title} className="book-cover-detail" />
                </div>

                <h2 className="book-detail-title">{book.title}</h2>
                <p className="book-detail-author-translator">
                    {author} {translator}
                </p>

                <div className="setting-sections">
                    <div className="my-rating-section">
                        <span className="section-label">나의 별점</span>
                        <StarRatingFullPage rating={book.score} /> {/* score를 rating prop으로 전달 */}
                        <MdEdit size={16} color="#888" className="edit-icon" onClick={() => setIsRateModalOpen(true)} />
                    </div>

                    <div className="start-date-section">
                        <span className="section-label">시작일</span>
                        {/* startedAt이 문자열 ISO 형식이라고 가정하고 날짜 형식화 */}
                        <span className="start-date-value">{book.startedAt ? new Date(book.startedAt).toLocaleDateString('ko-KR') : '미정'}</span> 
                        <MdEdit size={16} color="#888" className="edit-icon" onClick={() => setIsStatusModalOpen(true)} />
                    </div>
                </div>
            </div>

            {/* cardSummaries를 MyReadingCardSection에 전달 */}
            {/* Book 타입에 cardSummaries가 직접 없으므로, 타입 단언을 사용하여 접근 */}
            <MyReadingCardSection cards={(book as Book & { cardSummaries?: CardSummary[] }).cardSummaries || []} bookId={book.memberBookId} /> 

            {/* 평점 수정 모달 */}
            {book && (
                <RateBookModal
                    isOpen={isRateModalOpen}
                    onClose={() => setIsRateModalOpen(false)}
                    currentRating={book.score}
                    onSave={handleSaveRating}
                    isLoading={isSavingChanges}
                />
            )}

            {/* 상태 변경 모달 */}
            {book && (
                <UpdateStatusModal
                    isOpen={isStatusModalOpen}
                    onClose={() => setIsStatusModalOpen(false)}
                    currentStatus={book.status}
                    onSave={handleSaveStatus}
                    isLoading={isSavingChanges}
                />
            )}
        </div>
    );
}

export default BookDetailPage;
