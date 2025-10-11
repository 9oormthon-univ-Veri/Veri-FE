import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';

import './PostBookSearchPage.css';
import type { BookItem, BookSearchResponseResult } from '../../api/bookSearchApi';
import { searchBooks } from '../../api/bookSearchApi';
import { removeAccessToken } from '../../api/auth';
import { getAllBooks, type Book, searchMyBook, createBook, type CreateBookRequest } from '../../api/bookApi';
import Toast from '../../components/Toast';

// 선택된 책 정보 타입 (memberBookId 포함)
interface SelectedBookInfo extends BookItem {
    memberBookId?: number;
}

const PostBookSearchPage: React.FC = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchedQuery, setSearchedQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        try {
            const storedSearches = localStorage.getItem('postRecentSearches');
            return storedSearches ? JSON.parse(storedSearches) : [];
        } catch (error) {
            console.error("Failed to load recent searches from localStorage", error);
            return [];
        }
    });

    const [searchResults, setSearchResults] = useState<BookItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(false);
    const [myBooksError, setMyBooksError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(9);

    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const [selectedBook, setSelectedBook] = useState<SelectedBookInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const lastBookElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore || isSearching) return;

        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(entries => {
            if (entries[0] && entries[0].isIntersecting && hasMore) {
                setCurrentPage(prevPage => prevPage + 1);
            }
        }, { threshold: 0.5 });

        if (node) {
            observer.current.observe(node);
        }
    }, [loadingMore, isSearching, hasMore]);

    useEffect(() => {
        try {
            localStorage.setItem('postRecentSearches', JSON.stringify(recentSearches));
        } catch (error) {
            console.error("Failed to save recent searches to localStorage", error);
        }
    }, [recentSearches]);

    useEffect(() => {
        if (currentPage > 1 && hasMore) {
            loadMoreBooks();
        }
    }, [currentPage]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleInputFocus = useCallback(() => {
        setIsInputFocused(true);
    }, []);

    const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (e.relatedTarget && (e.relatedTarget as HTMLElement).classList.contains('clear-search-button')) {
            return;
        }
        setIsInputFocused(false);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults([]);
        setSearchedQuery('');
        setSearchError(null);
        setCurrentPage(1);
        setHasMore(false);
        inputRef.current?.focus();
        setIsInputFocused(true);
    }, []);

    const fetchData = useCallback(async (query: string, page: number, size: number): Promise<BookSearchResponseResult> => {
        setSearchError(null);
        try {
            const response = await searchBooks(query, page, size);

            if (!response.isSuccess || !response.result) {
                setSearchError(response.message || '책 검색에 실패했습니다. (데이터를 가져올 수 없습니다)');
                return { books: [], totalPages: 0, page: 1, size: size, totalElements: 0 };
            }

            return response.result;
        } catch (error: any) {
            console.error('책 검색 중 예상치 못한 오류:', error);
            if (error.message === 'TOKEN_EXPIRED') {
                showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
                removeAccessToken();
                navigate('/login');
            } else {
                setSearchError(`검색 중 오류 발생: ${error.message}`);
            }
            return { books: [], totalPages: 0, page: 1, size: size, totalElements: 0 };
        }
    }, [navigate]);

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

    const handleSearch = useCallback(async (event: React.FormEvent | null, currentSearchTerm: string = searchTerm) => {
        event?.preventDefault();

        const trimmedSearchTerm = currentSearchTerm.trim();

        if (!trimmedSearchTerm) {
            setSearchError('검색어를 입력해주세요.');
            setSearchResults([]);
            setCurrentPage(1);
            setHasMore(false);
            setSearchedQuery('');
            setIsInputFocused(false);
            return;
        }

        setIsSearching(true);
        setSearchResults([]);
        setSearchedQuery(trimmedSearchTerm);
        setCurrentPage(1);

        const resultData = await fetchData(trimmedSearchTerm, 1, pageSize);

        setIsSearching(false);

        setSearchResults(resultData.books);
        setHasMore(resultData.page < resultData.totalPages);

        inputRef.current?.focus();

        if (resultData.books.length > 0) {
            setRecentSearches(prevSearches => {
                const newSearches = [trimmedSearchTerm, ...prevSearches.filter(item => item !== trimmedSearchTerm)];
                return newSearches.slice(0, 5);
            });
        }
    }, [searchTerm, pageSize, fetchData]);

    const loadMoreBooks = useCallback(async () => {
        if (loadingMore || isSearching || !hasMore || !searchedQuery) return;

        setLoadingMore(true);

        const resultData = await fetchData(searchedQuery, currentPage, pageSize);

        setLoadingMore(false);

        if (resultData.books.length > 0) {
            setSearchResults(prevResults => [...prevResults, ...resultData.books]);
            setHasMore(resultData.page < resultData.totalPages);
        } else {
            setHasMore(false);
        }
    }, [searchedQuery, currentPage, pageSize, loadingMore, isSearching, hasMore, fetchData]);

    const handleDeleteRecentSearch = useCallback((itemToDelete: string) => {
        setRecentSearches(prevSearches => prevSearches.filter(item => item !== itemToDelete));
    }, []);

    const handleSelectBook = useCallback((book: BookItem) => {
        // 검색 결과의 책을 선택 (memberBookId 없음)
        setSelectedBook(book);
    }, []);

    const handleSelectMyBook = useCallback((book: Book) => {
        // 내 책장의 책을 선택 (memberBookId 포함)
        const bookItem: SelectedBookInfo = {
            title: book.title,
            author: book.author,
            imageUrl: book.imageUrl,
            publisher: '',
            isbn: '',
            memberBookId: book.memberBookId
        };
        setSelectedBook(bookItem);
    }, []);

    const handleConfirmSelection = useCallback(async () => {
        if (!selectedBook) return;

        setIsSubmitting(true);

        try {
            let memberBookId: number | undefined = selectedBook.memberBookId;

            // 검색 결과에서 선택한 책인 경우 (memberBookId가 없음)
            if (!memberBookId && selectedBook.isbn) {
                // 먼저 내 책장에 동일한 책이 있는지 확인
                const searchResponse = await searchMyBook({
                    title: selectedBook.title.trim(),
                    author: selectedBook.author.trim(),
                });

                if (searchResponse.isSuccess && searchResponse.result > 0) {
                    // 기존 책이 있으면 해당 책 ID 사용
                    memberBookId = searchResponse.result;
                    showToast('내 책장에 있는 책입니다.', 'info');
                } else {
                    // 기존 책이 없으면 새로 생성
                    const payload: CreateBookRequest = {
                        title: selectedBook.title.trim(),
                        image: selectedBook.imageUrl.trim(),
                        author: selectedBook.author.trim(),
                        publisher: selectedBook.publisher.trim(),
                        isbn: selectedBook.isbn.trim(),
                    };

                    const createResponse = await createBook(payload);

                    if (!createResponse.isSuccess || !createResponse.result?.memberBookId) {
                        showToast(createResponse.message || '책 등록에 실패했습니다.', 'error');
                        setIsSubmitting(false);
                        return;
                    }

                    memberBookId = createResponse.result.memberBookId;
                    showToast('새로운 책이 내 책장에 추가되었습니다!', 'success');
                }
            }

            // 선택된 책 정보를 WritePostPage로 전달 (memberBookId 포함)
            navigate('/write-post', {
                state: {
                    selectedBook: {
                        ...selectedBook,
                        memberBookId: memberBookId
                    }
                }
            });
        } catch (error: any) {
            console.error('책 선택 중 오류:', error);
            showToast('책 선택 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedBook, navigate]);

    return (
        <div className="page-container">
            <header className="search-header">
                <div className="header-left-icon" onClick={() => navigate(-1)}>
                    <MdArrowBackIosNew size={24} color="#333" />
                </div>
                <form onSubmit={(e) => handleSearch(e, searchTerm)} className="search-input-form">
                    {!isInputFocused && <FiSearch size={20} color="#999" className="search-icon" />}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="원하는 책을 입력하세요"
                        value={searchTerm}
                        onChange={handleInputChange}
                        className={`search-input ${isInputFocused || searchTerm.length > 0 ? 'input-focused-persistent' : ''}`}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    {searchTerm.length > 0 && !isSearching && (
                        <button
                            type="button"
                            className="clear-search-button"
                            onClick={handleClearSearch}
                            aria-label="검색어 지우기"
                        >
                            <AiOutlineClose size={20} color="#999" />
                        </button>
                    )}
                </form>
            </header>

            {!isInputFocused && recentSearches.length > 0 && searchResults.length === 0 && (
                <div className="recent-searches-section">
                    <p className="section-title">최근 검색어</p>
                    <div className="recent-search-tags">
                        {recentSearches.map((item, index) => (
                            <div key={index} className="search-tag"
                                onClick={() => {
                                    setIsInputFocused(false);
                                    setSearchTerm(item);
                                    handleSearch(null, item);
                                }}>
                                <span>{item}</span>
                                <span
                                    className="delete-tag-button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRecentSearch(item); setIsInputFocused(true); }}
                                >
                                    &times;
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="search-results-area">
                {isSearching && !loadingMore && <p className="loading-message">책을 검색 중입니다...</p>}
                {isLoadingMyBooks && <p className="loading-message">내 책장을 불러오는 중입니다...</p>}
                {searchError && <p className="error-message">{searchError}</p>}
                {myBooksError && <p className="error-message">{myBooksError}</p>}
                {isSubmitting && <p className="loading-message">책을 확인하는 중입니다...</p>}

                {/* 검색 결과가 있는 경우 */}
                {!isSearching && !searchError && searchResults.length > 0 ? (
                    <div>
                        <p className="section-title">검색 결과</p>
                        <div className="book-list">
                            {searchResults.map((book, index) => {
                                const isLastElement = searchResults.length === index + 1;
                                const isSelected = selectedBook?.title === book.title && selectedBook?.author === book.author;
                                return (
                                    <div
                                        ref={isLastElement && hasMore ? lastBookElementRef : null}
                                        key={`search-${book.isbn}-${index}`}
                                        className={`book-item ${isSelected ? 'book-item-selected' : ''}`}
                                        onClick={() => handleSelectBook(book)}
                                    >
                                        <div className="book-cover-thumbnail">
                                            <img src={book.imageUrl} alt={book.title} />
                                        </div>
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
                            {loadingMore && <p className="loading-message">더 많은 책을 불러오는 중...</p>}
                        </div>
                    </div>
                ) : (
                    /* 검색어가 없거나 검색 결과가 없는 경우 내 책장 표시 */
                    !isSearching && !searchError && (
                        searchTerm.trim() === '' ? (
                            /* 검색어가 없는 경우 - 내 책장 표시 */
                            !isLoadingMyBooks && !myBooksError && myBooks.length > 0 ? (
                                <div>
                                    <p className="section-title">나의 책장</p>
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
                                <p className="initial-message">아직 책장에 등록된 책이 없습니다. 책 제목, 저자, ISBN으로 검색해보세요.</p>
                            ) : null
                        ) : (
                            /* 검색어는 있지만 결과가 없는 경우 */
                            searchedQuery !== '' && searchResults.length === 0 ? (
                                <p className="no-results-message">'{searchedQuery}'에 대한 검색 결과가 없습니다.</p>
                            ) : (
                                searchTerm.length > 0 && isInputFocused ? (
                                    <p className="initial-message">검색 버튼을 눌러 책을 찾아보세요.</p>
                                ) : null
                            )
                        )
                    )
                )}
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '처리 중...' : '선택완료'}
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

