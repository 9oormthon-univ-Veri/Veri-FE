import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCompletePage.css'; // 이 페이지에 필요한 CSS 파일이 있는지 확인하세요.

const CardCompletePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // CardCustomizationPage에서 전달된 state를 구조 분해 할당합니다.
    const { image, extractedText, font, bookId } = location.state || {};

    useEffect(() => {
        // 선택 사항: 데이터가 없는 경우 리디렉션하여 페이지가 깨지는 것을 방지합니다.
        if (!image || !extractedText) {
            console.error('CardCompletePage: 필수 데이터 (이미지, 텍스트)가 누락되었습니다. 카드 커스터마이징 페이지로 리디렉션합니다.');
            navigate('/card-customization', { replace: true });
        }
    }, [image, extractedText, navigate]);

    // 이미지가 아직 로드되지 않은 경우 로딩 상태를 렌더링하거나 리디렉션합니다.
    if (!image) {
        return (
            <div className="page-container">
                <p>카드 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="card-complete-wrapper">
                <header className="complete-header">
                    <h2>카드 완성!</h2>
                    {/* 필요하다면 뒤로 가기 버튼 또는 다른 탐색 요소를 추가하세요. */}
                    <button onClick={() => navigate('/')}>메인으로</button>
                </header>

                <div className="completed-card-display">
                    {/* 옵션 1: <img> 태그 사용 */}
                    {/* 일반적으로 콘텐츠 이미지에 선호됩니다. */}
                    <img
                        src={image} // 이미지 URL을 여기에 직접 사용합니다.
                        alt="Customized Card Background"
                        className="completed-card-image"
                        onError={(e) => {
                            // 선택 사항: 깨진 이미지 링크를 처리합니다.
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/cccccc/000000?text=Image+Not+Found';
                        }}
                    />

                    {/* 옵션 2: div에 background-image CSS 속성 사용 */}
                    {/* 텍스트가 전체 이미지 위에 오버레이될 때 좋습니다. */}
                    <div
                        className="completed-card-background-div"
                        style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                        <div
                            className="completed-card-overlay-text"
                            style={{ fontFamily: font }}
                        >
                            {extractedText}
                        </div>
                        {bookId && (
                            <p className="completed-card-book-info">
                                연결된 책 ID: {bookId}
                            </p>
                        )}
                    </div>
                </div>

                {/* 전달된 다른 정보 표시 */}
                <div className="card-details">
                    <p>글꼴: {font}</p>
                    {bookId && <p>선택된 책 ID: {bookId}</p>}
                    {/* CardBookSearchPage에서 selectedBookTitle을 다시 전달받았다면 여기에 표시할 수 있습니다. */}
                </div>
            </div>
        </div>
    );
};

export default CardCompletePage;
