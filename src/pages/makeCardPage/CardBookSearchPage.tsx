import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';

import './CardBookSearchPage.css';
import type { BookItem, BookSearchResponseResult } from '../../api/bookSearchApi';
import { searchBooks } from '../../api/bookSearchApi';
import { removeAccessToken } from '../../api/auth';
import { createBook } from '../../api/bookApi';
import type { CreateBookRequest } from '../../api/bookApi';
import Toast from '../../components/Toast';

const CardBookSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const initialImage = location.state?.image as string | undefined;
    const initialExtractedText = location.state?.extractedText as string | undefined;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchedQuery, setSearchedQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        try {
            const storedSearches = localStorage.getItem('recentSearches');
            return storedSearches ? JSON.parse(storedSearches) : [];
        } catch (error) {
            console.error("Failed to load recent searches from localStorage", error);
            return [];
        }
    });

    const [searchResults, setSearchResults] = useState<BookItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(9);

    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
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
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
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

    const handleRegisterBook = useCallback(async (book: BookItem) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!book.title?.trim() || !book.imageUrl?.trim() || !book.author?.trim() || !book.publisher?.trim() || !book.isbn?.trim()) {
            setSubmitError('필수 책 정보가 누락되었습니다. (제목, 이미지, 저자, 출판사, ISBN)');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload: CreateBookRequest = {
                title: book.title.trim(),
                image: book.imageUrl.trim(),
                author: book.author.trim(),
                publisher: book.publisher.trim(),
                isbn: book.isbn.trim(),
            };

            const response = await createBook(payload);

            if (response.isSuccess && response.result?.memberBookId) {
                setSubmitSuccess(true);
                showToast('책이 성공적으로 등록되었습니다! 독서카드에 추가됩니다.', 'success');

                navigate('/customize-card', {
                    state: {
                        image: initialImage,
                        extractedText: initialExtractedText,
                        selectedBookId: response.result.memberBookId,
                        selectedBookTitle: book.title,
                    }
                });
            } else {
                setSubmitError(response.message || '책 등록에 실패했습니다.');
            }
        } catch (err: any) {
            console.error('책 등록 중 예상치 못한 오류:', err);
            setSubmitError('책 등록 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
        } finally {
            setIsSubmitting(false);
        }
    }, [navigate, initialImage, initialExtractedText]);

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
                        disabled={isSearching || isSubmitting}
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
                {searchError && <p className="error-message">{searchError}</p>}
                {submitError && <p className="error-message">{submitError}</p>}
                {isSubmitting && <p className="loading-message">책을 등록 중입니다...</p>}

                {!isSearching && !searchError && searchResults.length > 0 ? (
                    <div className="book-list">
                        {searchResults.map((book, index) => {
                            const isLastElement = searchResults.length === index + 1;
                            return (
                                <div
                                    ref={isLastElement && hasMore ? lastBookElementRef : null}
                                    key={book.isbn}
                                    className="book-item"
                                    onClick={() => handleRegisterBook(book)}
                                >
                                    <img src={book.imageUrl} alt={book.title} className="book-cover-thumbnail" />
                                    <div className="book-details">
                                        <p className="book-title">{book.title}</p>
                                        <p className="book-author">{book.author}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {loadingMore && <p className="loading-message">더 많은 책을 불러오는 중...</p>}
                    </div>
                ) : (
                    !isSearching && !searchError && !submitError && (
                        (searchedQuery === '' && searchTerm.length === 0 && !isInputFocused && recentSearches.length === 0) ? (
                            <p className="initial-message">책 제목, 저자, ISBN으로 검색해보세요.</p>
                        ) :
                            (searchedQuery === '' && searchTerm.length > 0 && isInputFocused) ? (
                                <p className="initial-message">검색 버튼을 눌러 책을 찾아보세요.</p>
                            ) :
                                (searchedQuery !== '' && searchResults.length === 0) ? (
                                    <p className="no-results-message">'{searchedQuery}'에 대한 검색 결과가 없습니다.</p>
                                ) : null
                    )
                )}
                {submitSuccess && (
                    <p className="success-message">책이 성공적으로 등록되었습니다!</p>
                )}
            </div>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
};

export default CardBookSearchPage;