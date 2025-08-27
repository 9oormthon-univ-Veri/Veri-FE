import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookDetailPage.css';
import DeleteConfirmationModal from '../../components/BookDetailPage/DeleteConfirmationModal';
import BottomEditModal from '../../components/BottomEditModal'; // ✨ 경로 확인
import { MdKeyboardArrowRight } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {
    getBookById,
    deleteBook,
    type Book,
    type CardSummary
} from '../../api/bookApi';
import { StarRatingFullPage } from '../mainPage/LibraryPage';

interface MyReadingCardSectionProps {
    cards: CardSummary[];
    bookId: number;
}

const MyReadingCardSection: React.FC<MyReadingCardSectionProps> = ({ cards, bookId }) => {
    const navigate = useNavigate();

    const handleSeeAllCards = useCallback(() => {
        // Correctly use bookId to navigate to a page showing all cards for this specific book
        navigate(`/reading-card/book/${bookId}`);
    }, [navigate, bookId]);

    // This function should accept cardId as an argument
    const handleClick = useCallback((cardId: number) => {
        navigate(`/reading-card-detail/${cardId}`);
    }, [navigate]);

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
                        <div
                            key={card.cardId || index}
                            className="card-item-container"
                            onClick={() => handleClick(card.cardId)}
                            role="button"
                            tabIndex={0}
                        >
                            <img src={card.cardImage} alt={`Reading Card ${index + 1}`} className="reading-card-image" />
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
    const [isSavingChanges, setIsSavingChanges] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
                const fetchedBook: Book = {
                    memberBookId: response.result.memberBookId,
                    title: response.result.title,
                    author: response.result.author,
                    imageUrl: response.result.imageUrl,
                    score: response.result.score,
                    status: response.result.status,
                    startedAt: response.result.startedAt || null,
                    endedAt: response.result.endedAt || null,
                };
                setBook({
                    ...fetchedBook,
                    cardSummaries: response.result.cardSummaries
                } as Book & { cardSummaries: CardSummary[] });
            } else {
                setError(response.message || "책 상세 정보를 가져오는데 실패했습니다.");
            }
        } catch (err: any) {
            setError("책 상세 정보를 불러오는 중 오류가 발생했습니다: " + err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

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

    const handleDeleteBook = useCallback(() => {
        if (!book || !book.memberBookId) {
            setError("책 정보가 불완전하여 삭제할 수 없습니다.");
            return;
        }
        setMenuOpen(false);
        setIsDeleteConfirmModalOpen(true);
    }, [book]);

    const confirmDeleteBook = useCallback(async () => {
        if (!book || !book.memberBookId) {
            setError("책 정보가 불완전하여 삭제할 수 없습니다.");
            setIsDeleteConfirmModalOpen(false);
            return;
        }

        setIsSavingChanges(true);

        try {
            const response = await deleteBook(book.memberBookId);
            if (response.isSuccess) {
                alert('책이 성공적으로 삭제되었습니다.');
                navigate('/my-bookshelf');
            } else {
                alert(`책 삭제에 실패했습니다: ${response.message || '알 수 없는 오류'}`);
            }
        } catch (err: any) {
            console.error('책 삭제 중 오류 발생:', err);
            alert(`책 삭제 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsSavingChanges(false);
            setIsDeleteConfirmModalOpen(false);
        }
    }, [book, navigate]);

    // BottomEditModal이 닫힐 때 책 정보를 다시 불러오는 함수
    const handleEditModalClose = useCallback(() => {
        setIsEditModalOpen(false);
        if (id) {
            fetchBookDetails(Number(id)); // 책 정보 업데이트 후 다시 불러오기
        }
    }, [id, fetchBookDetails]);


    if (isLoading || isSavingChanges) {
        return (
            <div className="loading-page-container">
                <div className="loading-spinner"></div>
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
                <button className="white-header-left-arrow" onClick={() => navigate(-1)}>
                    <span
                        className="mgc_left_fill"
                    ></span>
                </button>
                <h3 className='h3-white'>내가 읽은 책</h3>
                <div className="header-right-wrapper">
                    <button
                        className="header-menu-button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <BsThreeDotsVertical size={20} color="#fff" />
                    </button>

                    {menuOpen && (
                        <div className="header-dropdown-menu" ref={menuRef}>
                            <div
                                className="menu-item"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setIsEditModalOpen(true);
                                }}
                            >
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
                    <img
                        src={book.imageUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                        alt={book.title}
                        className="book-cover-detail"
                    />
                    <div className="top-shadow-overlay" />
                </div>

                <h2 className="book-detail-title">{book.title}</h2>
                <p className="book-detail-author-translator">
                    {author} {translator}
                </p>

                <div className="setting-sections">
                    <div className="my-rating-section">
                        <span className="section-label">나의 별점</span>
                        <StarRatingFullPage rating={book.score} />
                    </div>

                    <div className="start-date-section">
                        <div className="start-date">
                            <span className="section-label">시작일</span>
                            <span className="start-date-value">
                                {book.startedAt ? new Date(book.startedAt).toLocaleDateString('ko-KR') : '미정'}
                            </span>
                        </div>
                        <div className="end-date">
                            <span className="section-label">종료일</span>
                            <span className="start-date-value">
                                {book.endedAt ? new Date(book.endedAt).toLocaleDateString('ko-KR') : '미정'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <MyReadingCardSection
                cards={(book as Book & { cardSummaries?: CardSummary[] }).cardSummaries || []}
                bookId={book.memberBookId}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteConfirmModalOpen}
                onClose={() => setIsDeleteConfirmModalOpen(false)}
                onConfirm={confirmDeleteBook}
                isLoading={isSavingChanges}
            />

            {/* ✨ BottomEditModal에 책 제목과 작가 props 추가 */}
            <BottomEditModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose} // 수정 후 책 정보를 다시 불러오도록 onClose 핸들러 변경
                memberBookId={book.memberBookId}
                defaultScore={book.score}
                defaultStartedAt={book.startedAt}
                defaultEndedAt={book.endedAt}
                bookTitle={book.title} // ✨ 책 제목 전달
                bookAuthor={book.author} // ✨ 책 작가 전달
            />
        </div>
    );
}

export default BookDetailPage;