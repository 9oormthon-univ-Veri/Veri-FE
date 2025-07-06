import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';

import './BookSearchPage.css';
import type { BookItem, BookSearchResponseResult } from '../../api/bookSearchApi';
import { searchBooks } from '../../api/bookSearchApi';
import { removeAccessToken } from '../../api/auth';

const BookSearchPage: React.FC = () => {
    const navigate = useNavigate();
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
        // 'X' 버튼을 클릭한 경우에는 blur 이벤트 무시 (즉, 포커스 상태 유지)
        if (e.relatedTarget && (e.relatedTarget as HTMLElement).classList.contains('clear-search-button')) {
            return;
        }
        // 그 외의 경우에는 무조건 포커스 상태 해제 (돋보기 아이콘이 다시 나타나게 함)
        setIsInputFocused(false);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm(''); // 검색어 지우기
        setSearchResults([]); // 검색 결과 지우기
        setSearchedQuery(''); // 검색 쿼리 지우기
        setSearchError(null); // 에러 메시지 지우기
        setCurrentPage(1);
        setHasMore(false);
        inputRef.current?.focus(); // 입력 필드에 다시 포커스
        setIsInputFocused(true); // 입력 필드가 비어있어도 잠시 포커스된 상태로 시작하도록
    }, []);

    // fetchData 함수의 반환 타입을 BookSearchResponseResult로 명시
    const fetchData = useCallback(async (query: string, page: number, size: number): Promise<BookSearchResponseResult> => {
        setSearchError(null);
        try {
            const response = await searchBooks(query, page, size);

            if (!response.isSuccess || !response.result) {
                setSearchError(response.message || '책 검색에 실패했습니다. (데이터를 가져올 수 없습니다)');
                // 실패 시 BookSearchResponseResult 타입에 맞는 빈 객체를 반환
                return { books: [], totalPages: 0, page: 1, size: size, totalElements: 0 };
            }

            return response.result;
        } catch (error: any) {
            console.error('책 검색 중 예상치 못한 오류:', error);
            if (error.message === 'TOKEN_EXPIRED') {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                removeAccessToken();
                navigate('/login');
            } else {
                setSearchError(`검색 중 오류 발생: ${error.message}`);
            }
            // 에러 발생 시 BookSearchResponseResult 타입에 맞는 빈 객체를 반환
            return { books: [], totalPages: 0, page: 1, size: size, totalElements: 0 };
        }
    }, [navigate]);

    // pageToFetch 매개변수 제거
    const handleSearch = useCallback(async (event: React.FormEvent | null, currentSearchTerm: string = searchTerm) => {
        event?.preventDefault(); // 폼 제출 기본 동작 방지

        const trimmedSearchTerm = currentSearchTerm.trim();

        if (!trimmedSearchTerm) {
            setSearchError('검색어를 입력해주세요.');
            setSearchResults([]);
            setCurrentPage(1);
            setHasMore(false);
            setSearchedQuery('');
            setIsInputFocused(false); // 검색어가 없으면 포커스 상태 해제하여 최근 검색어 표시
            return;
        }

        setIsSearching(true);
        setSearchResults([]); // 새 검색 시작 시 기존 결과 초기화
        setSearchedQuery(trimmedSearchTerm); // 현재 검색된 쿼리 저장
        setCurrentPage(1); // 항상 1페이지부터 검색 시작

        const resultData = await fetchData(trimmedSearchTerm, 1, pageSize);

        setIsSearching(false);

        setSearchResults(resultData.books);
        setHasMore(resultData.page < resultData.totalPages);

        inputRef.current?.focus();
        setIsInputFocused(false);

        if (resultData.books.length > 0) {
            setRecentSearches(prevSearches => {
                const newSearches = [trimmedSearchTerm, ...prevSearches.filter(item => item !== trimmedSearchTerm)];
                return newSearches.slice(0, 5);
            });
        }
    }, [searchTerm, pageSize, fetchData]);

    const loadMoreBooks = useCallback(async () => {
        // 이미 로딩 중이거나, 검색 중이거나, 더 이상 데이터가 없거나, 검색 쿼리가 없으면 중단
        if (loadingMore || isSearching || !hasMore || !searchedQuery) return;

        setLoadingMore(true);

        // 현재 페이지 + 1로 다음 페이지 데이터를 요청
        const resultData = await fetchData(searchedQuery, currentPage, pageSize);

        setLoadingMore(false);

        if (resultData.books.length > 0) {
            setSearchResults(prevResults => [...prevResults, ...resultData.books]);
            // 다음 페이지가 총 페이지보다 작으면 hasMore를 true로 유지
            setHasMore(resultData.page < resultData.totalPages);
        } else {
            // 불러온 책이 없으면 더 이상 데이터가 없다고 판단
            setHasMore(false);
        }
    }, [searchedQuery, currentPage, pageSize, loadingMore, isSearching, hasMore, fetchData]);


    const handleDeleteRecentSearch = useCallback((itemToDelete: string) => {
        setRecentSearches(prevSearches => prevSearches.filter(item => item !== itemToDelete));
    }, []);

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
                        disabled={isSearching}
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

            {/* 최근 검색어 섹션:
                - 입력 필드가 포커스되어 있지 않고 (즉, 돋보기 아이콘이 보이는 상태),
                - 최근 검색어가 존재하며,
                - 검색 결과가 없을 때 (초기 상태이거나 검색 결과가 없는 경우)
            */}
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

                {!isSearching && !searchError && searchResults.length > 0 ? (
                    <div className="book-list">
                        {searchResults.map((book, index) => {
                            const isLastElement = searchResults.length === index + 1;
                            return (
                                <div ref={isLastElement && hasMore ? lastBookElementRef : null} key={book.isbn} className="book-item">
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
                    !isSearching && !searchError && (
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
            </div>
        </div>
    );
};

export default BookSearchPage;