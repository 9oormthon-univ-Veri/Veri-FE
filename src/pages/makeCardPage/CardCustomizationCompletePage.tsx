// src/pages/CardCustomizationCompletePage/CardCustomizationCompletePage.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MdClose } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationCompletePage.css';
import { createCard } from '../../api/cardApi';
import { getBookById, type GetBookByIdResponse } from '../../api/bookApi';

const DOWN_ICON = '/icons/down.svg';
const INSTAR_ICON = '/icons/instar.svg';

const CardCustomizationCompletePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined; // 카드 배경 이미지 (Public URL)
    const extractedText = location.state?.extractedText as string | undefined; // 카드에 들어갈 텍스트
    const memberBookId = location.state?.bookId as number | undefined; // 이 값이 memberBookId로 사용됩니다.
    const selectedFont = location.state?.font as string | undefined; // 선택된 폰트

    const cardRef = useRef<HTMLDivElement>(null); // html2canvas로 캡처할 카드 요소의 ref (공유 기능용)
    const hasSaved = useRef(false); // 저장 함수가 이미 호출되었는지 추적하는 useRef

    // 저장 과정의 로딩 및 에러 상태를 관리합니다.
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [bookTitle, setBookTitle] = useState<string>('책 제목 불러오는 중...');
    const [bookDetail, setBookDetail] = useState<GetBookByIdResponse['result'] | null>(null); // 책 상세 정보 상태 추가

    // 책 제목 및 상세 정보를 불러오는 useEffect
    useEffect(() => {
        const fetchBookDetails = async () => {
            if (memberBookId !== undefined) {
                try {
                    const response: GetBookByIdResponse = await getBookById(memberBookId);
                    if (response.isSuccess && response.result) {
                        setBookTitle(response.result.title);
                        setBookDetail(response.result); // 책 상세 정보 저장
                    } else {
                        console.error('Failed to fetch book details:', response.message);
                        setBookTitle('책 제목 불러오기 실패');
                        setBookDetail(null);
                    }
                } catch (err) {
                    console.error('Error fetching book details:', err);
                    setBookTitle('책 제목 불러오기 실패');
                    setBookDetail(null);
                }
            } else {
                setBookTitle('책 ID 없음');
                setBookDetail(null);
            }
        };

        fetchBookDetails();
    }, [memberBookId]);

    // 다운로드 페이지로 이동하는 함수
    const handleGoToDownloadPage = useCallback(() => {
        // DownloadCardPage로 전달할 cardDetail 객체 구성
        if (image && extractedText && memberBookId !== undefined && bookDetail) {
            const cardDataForDownloadPage = {
                cardId: undefined, // 이 페이지는 카드를 '생성'하는 시점이므로 cardId는 아직 없습니다.
                content: extractedText,
                imageUrl: image,
                createdAt: new Date().toISOString(),
                book: {
                    // 사용자 요청에 따라 bookDetail.memberBookId로 유지하고 coverImageUrl은 제외
                    id: bookDetail.memberBookId,
                    title: bookDetail.title,
                    author: bookDetail.author,
                },
            };
            navigate('/download-card', { state: { cardDetail: cardDataForDownloadPage, action: 'download' } }); // action 추가
        } else {
            alert('다운로드 페이지로 이동할 정보를 준비하는 데 실패했습니다. (이미지, 텍스트, 책 정보 확인)');
            console.error('다운로드 페이지 이동 실패: 필수 데이터 누락', { image, extractedText, memberBookId, bookDetail });
        }
    }, [image, extractedText, memberBookId, bookDetail, navigate]);


    // 카드 공유 처리 함수 (DownloadCardPage로 이동하도록 변경)
    const handleShare = useCallback(() => {
        if (image && extractedText && memberBookId !== undefined && bookDetail) {
            const cardDataForDownloadPage = {
                cardId: undefined, // cardId는 아직 생성되지 않았으므로 undefined
                content: extractedText,
                imageUrl: image,
                createdAt: new Date().toISOString(),
                book: {
                    // 사용자 요청에 따라 bookDetail.memberBookId로 유지하고 coverImageUrl은 제외
                    id: bookDetail.memberBookId,
                    title: bookDetail.title,
                    author: bookDetail.author,
                },
            };
            // DownloadCardPage로 이동하며 action을 'share'로 설정
            navigate('/download-card', { state: { cardDetail: cardDataForDownloadPage, action: 'share' } });
        } else {
            alert('공유 페이지로 이동할 정보를 준비하는 데 실패했습니다. (이미지, 텍스트, 책 정보 확인)');
            console.error('공유 페이지 이동 실패: 필수 데이터 누락', { image, extractedText, memberBookId, bookDetail });
        }
    }, [image, extractedText, memberBookId, bookDetail, navigate]);


    // 카드를 저장하는 비동기 함수 (이미지 업로드 후 카드 생성 API 호출)
    const handleSave = useCallback(async () => {
        // hasSaved.current가 true이면 이미 저장 중이거나 저장이 완료된 것이므로 함수 종료
        if (hasSaved.current || isSaving || !extractedText || memberBookId === undefined) {
            if (!hasSaved.current && !isSaving) { // 처음 저장 시도 시에만 에러 로깅
                console.error('카드를 저장하는 데 필요한 정보가 부족합니다. (텍스트 또는 책 ID)');
                setSaveError('카드 저장에 필요한 정보가 부족합니다.');
            }
            return;
        }

        // image (원본 배경 이미지 URL)가 없으면 저장 불가
        if (!image) {
            console.error('카드를 저장하는 데 필요한 이미지 URL이 없습니다.');
            setSaveError('카드 저장에 필요한 이미지 URL이 없습니다.');
            return;
        }

        hasSaved.current = true; // 저장 시작 플래그 설정
        setIsSaving(true); // 저장 시작
        setSaveError(null); // 에러 초기화

        try {
            // 1. createCard API를 호출하여 카드의 메타데이터를 저장합니다.
            //    이때 imageUrl은 원본 배경 이미지 URL(image)을 직접 사용합니다.
            const response = await createCard({
                memberBookId: memberBookId,
                content: extractedText,
                imageUrl: image, // 원본 배경 이미지 URL을 직접 사용
            });

            console.log('카드가 성공적으로 저장되었어요! 카드 ID:', response.result.cardId);
            alert('독서카드가 성공적으로 생성 및 저장되었습니다!'); // 사용자에게 저장 완료 알림

        } catch (saveError: any) {
            console.error('카드 메타데이터 저장 중 오류:', saveError);
            setSaveError(`카드 저장 실패: ${saveError.message || '알 수 없는 오류'}`);
        } finally {
            setIsSaving(false); // 저장 완료 (성공 또는 실패)
        }
    }, [isSaving, extractedText, memberBookId, image]); // image를 의존성 배열에 추가

    // useEffect 훅을 사용하여 컴포넌트가 마운트될 때 handleSave를 자동으로 호출합니다.
    useEffect(() => {
        // 이미지, 추출된 텍스트, 책 ID가 모두 존재하고 아직 저장되지 않았을 때만 저장을 시도합니다.
        if (image && extractedText && memberBookId !== undefined && !hasSaved.current) {
            handleSave();
        } else if (!image || !extractedText || memberBookId === undefined) {
            // 필수 데이터가 없으면 사용자에게 메시지를 남기고 카드 생성 페이지로 돌려보냅니다.
            console.error('자동 저장을 위한 필수 데이터가 누락되었습니다. 카드 생성 페이지로 리디렉션합니다.');
            navigate('/make-card');
        }
    }, [image, extractedText, memberBookId, navigate, handleSave]); // handleSave를 의존성 배열에 추가

    // 이미지, 추출된 텍스트 또는 책 ID가 없을 경우 로딩 상태를 보여주거나 리디렉션합니다.
    if (!image || !extractedText || memberBookId === undefined || !bookDetail) { // bookDetail 로딩 추가
        return <div className="page-container">카드 정보를 불러오는 중...</div>;
    }

    // 저장 중일 때 로딩 UI 표시
    if (isSaving) {
        return (
            <div className="page-container loading-state">
                <p>독서카드를 저장 중입니다...</p>
                {saveError && <p style={{ color: 'red' }}>오류: {saveError}</p>}
            </div>
        );
    }

    // 저장 실패 시 에러 메시지 표시
    if (saveError) {
        return (
            <div className="page-container error-state">
                <p style={{ color: 'red' }}>카드 저장에 실패했습니다.</p>
                <p style={{ color: 'red' }}>오류: {saveError}</p>
                <button onClick={() => navigate('/make-card')} style={{ marginTop: '20px' }}>다시 시도하기</button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate('/reading-card')}>
                    <MdClose size={24} color="#333" />
                </button>
                <h3>나의 독서카드</h3>
                <div className="dummy-box" />
            </header>

            {/* header-margin div는 그대로 유지됩니다. */}
            <div className="header-margin"></div>
            <div className="customization-complete-page-wapper">
                <p className="completion-message">독서카드 생성이 완료되었어요!</p>

                <div className="action-icons">
                    <button className="share-icon-btn" onClick={handleShare} aria-label="사진 공유">
                        <img width={20} height={20}
                            src={INSTAR_ICON}
                        />
                    </button>

                    <button className="download-icon-btn" onClick={handleGoToDownloadPage} aria-label="다운로드">
                        <img width={20} height={20}
                            src={DOWN_ICON}
                        />
                    </button>
                </div>

                <div className="card-preview-complete" ref={cardRef}>
                    <div className="card-preview-complete-card">
                        <img src={image} alt="완성된 카드" className="card-image"
                            onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/350x500/cccccc/333333?text=Image+Load+Failed';
                                e.currentTarget.alt = '이미지 로드 실패';
                                console.error('Failed to load image for display:', image);
                            }}
                        />
                        <div className="card-overlay-text" style={{ fontFamily: selectedFont }}>
                            {extractedText}
                        </div>
                    </div>

                    <div className="card-summary-text">
                        <strong style={{ fontFamily: selectedFont }}>{bookTitle}</strong>
                        <p className="summary-body" style={{ fontFamily: selectedFont }}>
                            {extractedText.length > 80 ? extractedText.slice(0, 80) + '...' : extractedText}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CardCustomizationCompletePage;
