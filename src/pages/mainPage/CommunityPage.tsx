// src/pages/CommunityPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonCard } from '../../components/SkeletonUI';
import { getPostFeed } from '../../api/communityApi';
import type { Post, GetPostFeedQueryParams } from '../../api/communityApi';
import './CommunityPage.css';

// 독서카드 목업 데이터 (독서카드 API가 별도로 있을 것으로 예상)
const mockReadingCards = [
  { id: 1, image: '/src/assets/images/cardSample/color.jpg' },
  { id: 2, image: '/src/assets/images/cardSample/forest.jpg' },
  { id: 3, image: '/src/assets/images/cardSample/river.jpg' },
  { id: 4, image: '/src/assets/images/cardSample/sea.jpg' },
  { id: 5, image: '/src/assets/images/cardSample/sky.jpg' },
  { id: 6, image: '/src/assets/images/cardSample/color.jpg' }
];

const mockRecommendations = [
  {
    id: 1,
    author: '김현아',
    authorDescription: '📚 내가 남은 스물다섯 번의 개월',
    image: '/src/assets/images/cardSample/forest.jpg',
    likes: 125,
    comments: 19,
    content: '행정자부의 절은 국무위원 중에서 국무총리의 제청으로 대통령이 임명한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별, 종교...',
    date: '2025.08.16'
  },
  {
    id: 2,
    author: '김현아',
    authorDescription: '📚 내가 남은 스물다섯 번의 개월',
    image: '/src/assets/images/cardSample/river.jpg',
    likes: 125,
    comments: 19,
    content: '행정자부의 절은 국무위원 중에서 국무총리의 제청으로 대통령이 임명한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별, 종교...',
    date: '2025.08.16'
  }
];

function CommunityPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 게시글 데이터 로드
  const loadPosts = async (page: number = 1, reset: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: GetPostFeedQueryParams = {
        page: page,
        size: 10,
        sort: 'newest'
      };
      
      const response = await getPostFeed(params);
      
      if (response.isSuccess && response.result) {
        const newPosts = response.result.posts;
        
        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        }
        
        setHasMore(page < response.result.totalPages);
        setCurrentPage(page);
      } else {
        throw new Error(response.message || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('게시글 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1, true);
  }, []);

  const handleProfileClick = () => {
    navigate('/my-page');
  };

  const handleMoreCardsClick = () => {
    navigate('/reading-card');
  };

  const handlePostClick = (postId: number) => {
    navigate(`/community/post/${postId}`);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadPosts(currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    loadPosts(1, true);
  };

  const handleWritePost = () => {
    navigate('/write-post');
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  return (
    <div className="page-container">
      <TopBar onProfileClick={handleProfileClick} />
      
      <div className="header-margin"></div>
      
      <div className="community-content">
        {/* 독서카드 섹션 */}
        <div className="reading-cards-section">
          <h2 className="section-title">독서카드</h2>
          
          {isLoading ? (
            <div className="cards-loading">
              <SkeletonList count={6}>
                <SkeletonCard />
              </SkeletonList>
            </div>
          ) : (
            <>
              <div className="reading-cards-grid">
                {mockReadingCards.map((card) => (
                  <div key={card.id} className="reading-card-item">
                    <div 
                      className="reading-card-image"
                      style={{ backgroundImage: `url(${card.image})` }}
                    />
                  </div>
                ))}
              </div>
              
              <button className="more-cards-button" onClick={handleMoreCardsClick}>
                독서카드 더 보러가기
              </button>
            </>
          )}
        </div>

        {/* 이달의 추천 섹션 */}
        <div className="recommendations-section">
          <div className="recommendations-header">
            <div className="header-content">
              <div className="title-section">
                <h2 className="section-title">이달의 추천</h2>
                <p className="section-subtitle">다른 회원들의 글을 만나보세요</p>
              </div>
              <button className="write-post-button" onClick={handleWritePost}>
                <span className="write-icon">✏️</span>
                글쓰기
              </button>
            </div>
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={handleRefresh} className="retry-button">
                  다시 시도
                </button>
              </div>
            )}
          </div>

          {isLoading && posts.length === 0 ? (
            <div className="recommendations-loading">
              <SkeletonList count={2}>
                <SkeletonCard />
              </SkeletonList>
            </div>
          ) : (
            <div className="recommendations-list">
              {posts.map((post) => (
                <div 
                  key={post.postId} 
                  className="recommendation-item"
                  onClick={() => handlePostClick(post.postId)}
                >
                  <div className="recommendation-header">
                    <div className="author-info">
                      <div className="author-avatar">
                        <img 
                          src={post.authorImage || "/src/assets/images/profileSample/sample_user.png"} 
                          alt="프로필" 
                        />
                      </div>
                      <div className="author-details">
                        <div className="author-name">{post.author}</div>
                        <div className="author-description">📚 독서 커뮤니티</div>
                      </div>
                    </div>
                  </div>
                  
                  {post.images && post.images.length > 0 && (
                    <div className="recommendation-image">
                      <img src={post.images[0]} alt="게시글 이미지" />
                    </div>
                  )}
                  
                  <div className="recommendation-actions">
                    <div className="action-buttons">
                      <button 
                        className={`action-button ${post.isLiked ? 'liked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 좋아요 API 호출
                        }}
                      >
                        <span className="heart-icon">{post.isLiked ? '♥' : '♡'}</span>
                        <span>{post.likeCount}</span>
                      </button>
                      <button 
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 댓글 모달 열기
                        }}
                      >
                        <span className="comment-icon">💬</span>
                        <span>{post.commentCount}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="recommendation-content">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content">{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="recommendation-date">{formatDate(post.createdAt)}</div>
                  </div>
                </div>
              ))}
              
              {/* 더 보기 버튼 */}
              {hasMore && (
                <div className="load-more-section">
                  <button 
                    className="load-more-button"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? '로딩 중...' : '더 보기'}
                  </button>
                </div>
              )}
              
              {/* 게시글이 없는 경우 */}
              {!isLoading && posts.length === 0 && !error && (
                <div className="no-posts">
                  <p>아직 게시글이 없습니다.</p>
                  <p>첫 번째 게시글을 작성해보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='main-page-margin'></div>
    </div>
  );
}

export default CommunityPage;