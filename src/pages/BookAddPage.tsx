// src/pages/BookAddPage.tsx
import React, { useEffect, useState, useCallback } from 'react'; // useState는 isSubmitting, submitError, submitSuccess 때문에 남겨둡니다.
import { useLocation, useNavigate } from 'react-router-dom';
import './BookAddPage.css'; // CSS 파일 임포트 유지
import { MdArrowBackIosNew } from 'react-icons/md';

// 새로운 책 등록을 위한 API 함수와 타입을 bookApi.ts에서 임포트
import {
    createBook,
    type CreateBookRequest,
    type BookSearchResult // BookSearchPage에서 넘어오는 데이터 타입 (bookApi.ts에 정의되어 있음)
} from '../api/bookApi';

function BookAddPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // BookSearchPage에서 navigate의 state로 전달받은 bookInfo의 타입이 BookSearchResult임을 명시
    const initialBookInfo = location.state?.bookInfo as BookSearchResult | undefined;

    // 책 정보는 이 페이지에서 수정되지 않으므로 const 변수로 선언합니다.
    // 이렇게 하면 setter 함수에 대한 'never read' 경고가 사라집니다.
    const title = initialBookInfo?.title || '';
    const imageUrl = initialBookInfo?.imageUrl || '';
    const author = initialBookInfo?.author || '';
    const publisher = initialBookInfo?.publisher || '';
    const isbn = initialBookInfo?.isbn || '';

    const [isSubmitting, setIsSubmitting] = useState(false); // 등록 중 상태
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

    useEffect(() => {
        // 만약 initialBookInfo가 없이 이 페이지에 직접 접근했다면 검색 페이지로 리디렉션
        if (!initialBookInfo) {
            alert('책 정보를 불러올 수 없습니다. 책 검색 페이지로 이동합니다.');
            navigate('/book-search', { replace: true });
        }
    }, [initialBookInfo, navigate]);

    // getAuthorAndTranslator 함수는 더 이상 사용되지 않으므로 제거합니다.

    const handleRegisterBook = useCallback(async (e: React.FormEvent) => {
        e.preventDefault(); // 폼 제출 기본 동작 방지

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        // 필수 입력 필드 유효성 검사 (CreateBookRequest에 맞춰 5가지 필드 모두 확인)
        // 이 값들은 initialBookInfo에서 왔으므로, 값이 비어있지 않은지만 확인합니다.
        if (!title.trim() || !imageUrl.trim() || !author.trim() || !publisher.trim() || !isbn.trim()) {
            setSubmitError('필수 책 정보가 누락되었습니다. (제목, 이미지, 저자, 출판사, ISBN)');
            setIsSubmitting(false);
            return;
        }

        try {
            // CreateBookRequest 타입에 맞춰 데이터 구성
            const payload: CreateBookRequest = {
                title: title.trim(),
                image: imageUrl.trim(), // API의 CreateBookRequest는 'image' 필드를 요구하므로 'imageUrl'을 'image'로 매핑
                author: author.trim(),
                publisher: publisher.trim(),
                isbn: isbn.trim(),
            };

            const response = await createBook(payload); // createBook API 호출

            if (response.isSuccess) {
                setSubmitSuccess(true);
                alert('책이 성공적으로 등록되었습니다!');
                // 등록 성공 후, 마이 북셀프 페이지로 이동
                navigate('/my-bookshelf');
            } else {
                setSubmitError(response.message || '책 등록에 실패했습니다.');
            }
        } catch (err: any) {
            console.error('책 등록 중 예상치 못한 오류:', err);
            setSubmitError('책 등록 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
        } finally {
            setIsSubmitting(false);
        }
    }, [title, imageUrl, author, publisher, isbn, navigate]); // 의존성 배열에 const 변수들도 포함합니다.


    // initialBookInfo가 아직 로드되지 않았거나 (매우 짧은 순간)
    // 혹은 useLocation으로 state를 받지 못했을 경우의 로딩/에러 처리
    if (!initialBookInfo) {
        return (
            <div className="loading-page-container">
                {submitError ? <p style={{ color: 'red' }}>{submitError}</p> : <p>책 정보를 불러오는 중...</p>}
                {submitError && <button onClick={() => navigate(-1)} className="back-button">뒤로 가기</button>}
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate("/book-search")}>
                    <MdArrowBackIosNew size={24} color="#fff" />
                </button>
                <h3 className='h3-white'>새 책 등록</h3> {/* 헤더 텍스트 유지 */}
                <div className="header-right-wrapper">
                    <div className="dummy-box" />
                </div>
            </header>

            <form onSubmit={handleRegisterBook} className="book-register-form">
                <div className="book-info-section">
                    <div className="book-cover-detail-container">
                        <img
                            src={imageUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                            alt={title || '책 표지'}
                            className="book-cover-detail"
                        />
                        <div className="top-shadow-overlay" />
                    </div>
                    <div className="book-info-detail-container">
                        <p className="book-title-display">{title}</p>
                        <p className="book-author-display">{author}</p>
                    </div>
                </div>

                {submitSuccess && <p className="success-message">책이 성공적으로 등록되었습니다!</p>}
                {submitError && <p className="error-message">{submitError}</p>}

                <div className="add-book-container">
                    <button type="submit" className="add-book-button" disabled={isSubmitting}>
                        {isSubmitting ? '등록 중...' : '책 등록하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BookAddPage;