import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';

import './PostBookSearchPage.css';
import { removeAccessToken } from '../../api/auth';
import { getAllBooks, type Book } from '../../api/bookApi';
import Toast from '../../components/Toast';
import type { BookItem } from '../../api/bookSearchApi';

// 선택된 책 정보 타입 (memberBookId 포함)
interface SelectedBookInfo extends BookItem {
    bookId?: number;
    memberBookId?: number;
}

const PostBookSearchPage: React.FC = () => {
    const navigate = useNavigate();

    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(false);
    const [myBooksError, setMyBooksError] = useState<string | null>(null);

    const [selectedBook, setSelectedBook] = useState<SelectedBookInfo | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const fetchMyBooks = useCallback(async () => {
        setIsLoadingMyBooks(true);
        setMyBooksError(null);
        try {
            const response = await getAllBooks({ page: 1, size: 100 });
            
            if (!response.isSuccess || !response.result) {
                setMyBooksError(response.message || '내 책장을 불러오는데 실패했습니다.');
                return;
            }
            
            setMyBooks(response.result.memberBooks);
        } catch (error: any) {
            console.error('내 책장 로드 중 오류:', error);
            if (error.message === 'TOKEN_EXPIRED') {
                showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
                removeAccessToken();
                navigate('/login');
            } else {
                setMyBooksError(`내 책장 로드 중 오류: ${error.message}`);
            }
        } finally {
            setIsLoadingMyBooks(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchMyBooks();
    }, [fetchMyBooks]);

    const handleSelectMyBook = useCallback((book: Book) => {
        // 내 책장의 책을 선택 (memberBookId 포함)
        const bookItem: SelectedBookInfo = {
            bookId: book.bookId,
            title: book.title,
            author: book.author,
            imageUrl: book.imageUrl,
            publisher: '',
            isbn: '',
            memberBookId: book.memberBookId
        };
        setSelectedBook(bookItem);
    }, []);

    const handleConfirmSelection = useCallback(() => {
        if (!selectedBook) return;

        // 선택된 책 정보를 WritePostPage로 전달 (memberBookId 포함)
        navigate('/write-post', {
            state: {
                selectedBook: selectedBook
            }
        });
    }, [selectedBook, navigate]);

    return (
        <div className="page-container">
            <header className="search-header">
                <div className="header-left-icon" onClick={() => navigate(-1)}>
                    <MdArrowBackIosNew size={24} color="#333" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0', flex: 1, textAlign: 'center', paddingRight: '24px' }}>나의 책장</h2>
            </header>

            <div className="search-results-area">
                {isLoadingMyBooks && <p className="loading-message">내 책장을 불러오는 중입니다...</p>}
                {myBooksError && <p className="error-message">{myBooksError}</p>}

                {/* 나의 책장 표시 */}
                {!isLoadingMyBooks && !myBooksError && myBooks.length > 0 ? (
                    <div>
                        <div className="book-list">
                            {myBooks.map((book) => {
                                const isSelected = selectedBook?.title === book.title && selectedBook?.author === book.author;
                                return (
                                    <div
                                        key={`mybook-${book.memberBookId}`}
                                        className={`book-item ${isSelected ? 'book-item-selected' : ''}`}
                                        onClick={() => handleSelectMyBook(book)}
                                    >
                                        <img src={book.imageUrl} alt={book.title} className="book-cover-thumbnail" />
                                        <div className="book-details">
                                            <p className="book-title">{book.title}</p>
                                            <p className="book-author">{book.author}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="check-mark">
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="10" cy="10" r="10" fill="var(--primary-green)"/>
                                                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : !isLoadingMyBooks && myBooks.length === 0 && !myBooksError ? (
                    <p className="initial-message">아직 책장에 등록된 책이 없습니다.</p>
                ) : null}
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* 하단 선택된 책 정보 또는 안내 메시지 */}
            <div className={`bottom-selection-area ${selectedBook ? 'has-selection' : ''}`}>
                {selectedBook ? (
                    <div className="selected-book-info">
                        <div className="selected-book-details">
                            <div className="selected-book-text">
                                <p className="selected-book-title">{selectedBook.title}</p>
                                <p className="selected-book-author">{selectedBook.author}</p>
                            </div>
                        </div>
                        <button 
                            className="register-button"
                            onClick={handleConfirmSelection}
                        >
                            선택완료
                        </button>
                    </div>
                ) : (
                    <div className="no-selection-info">
                        <div className="no-selection-icon">📚</div>
                        <p className="no-selection-text">선택된 책이 없어요</p>
                        <button className="disabled-button" disabled>
                            선택완료
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostBookSearchPage;

