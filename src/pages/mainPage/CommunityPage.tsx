// src/pages/CommunityPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonCard } from '../../components/SkeletonUI';
import { getPostFeed, getCards } from '../../api/communityApi';
import type { Post, GetPostFeedQueryParams, Card, GetCardsQueryParams } from '../../api/communityApi';
import './CommunityPage.css';

function CommunityPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  // IntersectionObserver를 위한 ref callback
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore || isLoading) return;

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
  }, [loadingMore, isLoading, hasMore]);

  // 게시글 데이터 로드
  const loadPosts = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
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
      setLoadingMore(false);
    }
  }, []);

  // 추가 게시글 로드
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || isLoading || !hasMore) return;

    await loadPosts(currentPage, false);
  }, [currentPage, loadingMore, isLoading, hasMore, loadPosts]);

  // 카드 데이터 로드
  const loadCards = useCallback(async () => {
    try {
      setCardsLoading(true);
      
      const params: GetCardsQueryParams = {
        page: 1,
        size: 6,
        sort: 'newest'
      };
      
      const response = await getCards(params);
      
      if (response.isSuccess && response.result) {
        setCards(response.result.cards);
      } else {
        console.error('카드 로드 실패:', response.message);
      }
    } catch (err) {
      console.error('카드 로드 실패:', err);
    } finally {
      setCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1, true);
    loadCards();
  }, [loadPosts, loadCards]);

  useEffect(() => {
    if (currentPage > 1 && hasMore) {
      loadMorePosts();
    }
  }, [currentPage]);

  const handleProfileClick = () => {
    navigate('/my-page');
  };

  const handleMoreCardsClick = () => {
    navigate('/reading-card');
  };

  const handlePostClick = (postId: number) => {
    navigate(`/community/post/${postId}`);
  };

  const handleRefresh = () => {
    loadPosts(1, true);
  };

  const handleWritePost = () => {
    navigate('/write-post');
  };
  
  return (
    <div className="page-container">
      <TopBar onProfileClick={handleProfileClick} />
      
      <div className="header-margin"></div>
      
      <div className="community-content">
        {/* 독서카드 섹션 */}
        <div className="reading-cards-section">
          <h2 className="section-title">독서카드</h2>
          
          {cardsLoading ? (
            <div className="cards-loading">
              <SkeletonList count={6}>
                <SkeletonCard />
              </SkeletonList>
            </div>
          ) : (
            <>
              <div className="reading-cards-grid">
                {cards.map((card) => (
                  <div key={card.cardId} className="reading-card-item">
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
              {posts.map((post, index) => {
                const isLastElement = posts.length === index + 1;
                return (
                  <div 
                    ref={isLastElement && hasMore ? lastPostElementRef : null}
                    key={post.postId} 
                    className="recommendation-item"
                    onClick={() => handlePostClick(post.postId)}
                  >
                  <div className="recommendation-header">
                    <div className="author-info">
                      <div className="author-avatar">
                        <img 
                          src={post.author.profileImageUrl} 
                          alt="프로필" 
                        />
                      </div>
                      <div className="author-details">
                        <div className="author-name">
                          {post.author.nickname}
                        </div>
                        <div className="author-book-title">
                          {post.book?.title || '책 정보 없음'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="recommendation-image">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt="게시글 이미지" />
                    ) : (
                      <div className="no-image-placeholder">
                        <span>이미지 없음</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="recommendation-actions">
                    <div className="action-buttons">
                      <button 
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 좋아요 API 호출
                        }}
                      >
                        <span className="heart-icon">♡</span>
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
                    <p className="post-content">{post.content}</p>
                  </div>
                </div>
              );
            })}
              
              {/* 로딩 인디케이터 */}
              {loadingMore && (
                <div className="loading-more">
                  <p>더 많은 게시글을 불러오는 중...</p>
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