import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';

import './BookSearchPage.css';
import type { BookItem, BookSearchResponseResult } from '../../api/bookSearchApi';
import { searchBooks } from '../../api/bookSearchApi';
import { removeAccessToken } from '../../api/auth';

const BookSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedQuery, setSearchedQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const [searchResults, setSearchResults] = useState<BookItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleSearch = useCallback(async (event: React.FormEvent | null, pageToFetch: number = 1, currentSearchTerm: string = searchTerm) => {
        event?.preventDefault();

        const trimmedSearchTerm = currentSearchTerm.trim();

        if (!trimmedSearchTerm) {
            setSearchError('검색어를 입력해주세요.');
            setSearchResults([]);
            setTotalPages(0);
            setSearchedQuery('');
            return;
        }

        setIsSearching(true);
        setSearchError(null);

        // 새 페이지를 검색할 때는 무조건 검색 결과를 초기화합니다.
        setSearchResults([]); // ✨ 이 줄이 핵심 변경 사항입니다.
        setTotalPages(0);
        setSearchedQuery(trimmedSearchTerm); // 검색이 시작될 때마다 searchedQuery 업데이트

        try {
            const response = await searchBooks(trimmedSearchTerm, pageToFetch, pageSize);

            if (!response.isSuccess || !response.result) {
                setSearchError(response.message || '책 검색에 실패했습니다. (데이터를 가져올 수 없습니다)');
                setSearchResults([]);
                setTotalPages(0);
                return;
            }

            const resultData: BookSearchResponseResult = response.result;

            // ✨ 이전과 다르게, 항상 새 결과로 교체합니다.
            setSearchResults(resultData.books);

            setCurrentPage(resultData.page);
            setTotalPages(resultData.totalPages);

            if (pageToFetch === 1) { // 첫 페이지 검색일 때만 최근 검색어에 추가하고 검색창 비우기
                setRecentSearches(prevSearches => {
                    const newSearches = [trimmedSearchTerm, ...prevSearches.filter(item => item !== trimmedSearchTerm)];
                    return newSearches.slice(0, 5);
                });
                setSearchTerm('');
            }

        } catch (error: any) {
            console.error('책 검색 중 예상치 못한 오류:', error);
            if (error.message === 'TOKEN_EXPIRED') {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                removeAccessToken();
                navigate('/login');
            } else {
                setSearchError(`검색 중 오류 발생: ${error.message}`);
            }
            setSearchResults([]);
            setTotalPages(0);
            setSearchedQuery(trimmedSearchTerm);
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm, pageSize, navigate]);

    const handleDeleteRecentSearch = useCallback((itemToDelete: string) => {
        setRecentSearches(prevSearches => prevSearches.filter(item => item !== itemToDelete));
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && !isSearching) {
            setCurrentPage(newPage);
            handleSearch(null, newPage, searchedQuery);
        }
    }, [totalPages, isSearching, handleSearch, searchedQuery]);

    return (
        <div className="page-container">
            <header className="search-header">
                <div className="header-left-icon" onClick={() => navigate(-1)}>
                    <MdArrowBackIosNew size={24} color="#333" />
                </div>
                <form onSubmit={(e) => handleSearch(e, 1, searchTerm)} className="search-input-form">
                    <FiSearch size={20} color="#999" className="search-icon" />
                    <input
                        type="text"
                        placeholder="원하는 책을 입력하세요"
                        value={searchTerm}
                        onChange={handleInputChange}
                        className="search-input"
                        disabled={isSearching}
                    />
                </form>
            </header>

            <div className="recent-searches-section">
                <p className="section-title">최근 검색어</p>
                <div className="recent-search-tags">
                    {recentSearches.map((item, index) => (
                        <div key={index} className="search-tag"
                            onClick={() => {
                                setSearchTerm(item);
                                handleSearch(null, 1, item);
                            }}>
                            <span>{item}</span>
                            <span
                                className="delete-tag-button"
                                onClick={(e) => { e.stopPropagation(); handleDeleteRecentSearch(item); }}
                            >
                                &times;
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="search-results-area">
                {isSearching && <p className="loading-message">책을 검색 중입니다...</p>}
                {searchError && <p className="error-message">{searchError}</p>}

                {!isSearching && !searchError && searchResults.length > 0 && (
                    <>
                        <div className="book-list">
                            {searchResults.map(book => (
                                <div key={book.isbn} className="book-item">
                                    <img src={book.imageUrl} alt={book.title} className="book-cover-thumbnail" />
                                    <div className="book-details">
                                        <p className="book-title">{book.title}</p>
                                        <p className="book-author">{book.author}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isSearching}
                                >
                                    이전
                                </button>
                                <span>{currentPage} / {totalPages}</span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isSearching}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!isSearching && !searchError && searchResults.length === 0 && searchedQuery === '' && recentSearches.length === 0 && (
                     <p className="initial-message">책 제목, 저자, ISBN으로 검색해보세요.</p>
                )}
                {!isSearching && !searchError && searchResults.length === 0 && searchedQuery !== '' && (
                     <p className="no-results-message">'{searchedQuery}'에 대한 검색 결과가 없습니다.</p>
                )}
                {!isSearching && !searchError && searchResults.length === 0 && searchTerm.length > 0 && searchedQuery === '' && (
                    <p className="no-results-message">검색어를 입력해주세요.</p>
                )}
            </div>
        </div>
    );
};

export default BookSearchPage;