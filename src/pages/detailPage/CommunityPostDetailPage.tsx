import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail } from '../../api/communityApi';
import type { PostDetail } from '../../api/communityApi';
import './CommunityPostDetailPage.css';

function CommunityPostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // 게시글 데이터 로드
  useEffect(() => {
    const loadPostDetail = async () => {
      if (!postId) {
        setError('게시글 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await getPostDetail(parseInt(postId));
        
        if (response.isSuccess && response.result) {
          setPost(response.result);
          setIsLiked(response.result.isLiked);
        } else {
          throw new Error(response.message || '게시글을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('게시글 상세 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPostDetail();
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: 좋아요 API 호출
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // TODO: 댓글 작성 API 호출
      console.log('새 댓글:', newComment);
      setNewComment('');
    }
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

  if (loading) {
    return (
      <div className="community-post-detail">
        <div className="detail-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="header-title">로딩 중...</h1>
        </div>
        <div className="loading-content">
          <p>게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="community-post-detail">
        <div className="detail-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="header-title">오류</h1>
        </div>
        <div className="error-content">
          <p>{error || '게시글을 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate(-1)} className="retry-button">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 헤더 */}
      <header className="detail-header">
        <button className="header-left-arrow" onClick={() => navigate(-1)}>
          <span
            className="mgc_left_fill"
          ></span>
        </button>
        <h3>나의 독서카드</h3>
        <div className="header-right-wrapper">
          <button
            className="header-menu-button"
          >
          </button>
        </div>
      </header>

      <div className="detail-content">
        {/* 메인 이미지 */}
        <div className="main-image-container">
          {post.images && post.images.length > 0 ? (
            <>
              <img src={post.images[0]} alt="게시물 이미지" className="main-image" />
              {post.images.length > 1 && (
                <div className="image-dots">
                  {post.images.map((_, index) => (
                    <span key={index} className={`dot ${index === 0 ? 'active' : ''}`}></span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image-placeholder-detail">
              <span>이미지 없음</span>
            </div>
          )}
        </div>

        {/* 프로필 및 액션 */}
        <div className="post-info">
          <div className="author-section">
            <div className="author-avatar">
              <img src={post.author.profileImageUrl} alt="프로필" />
            </div>
            <div className="author-details">
              <div className="author-name-detail">{post.author.nickname}</div>
            </div>
            <div className="post-actions">
              <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                <span className="heart-icon">♡</span>
                <span>{post.likeCount}</span>
              </button>
              <button className="comment-button">
                <span className="comment-icon">💬</span>
                <span>{post.commentCount}</span>
              </button>
            </div>
          </div>

          {/* 게시물 내용 */}
          <div className="post-content">
            <p className="post-summary">{post.content}</p>
          </div>

          {/* 책 정보 */}
          {post.book && (
            <div className="book-info">
              <img src={post.book.imageUrl} alt="책 표지" className="book-cover" />
              <div className="book-details">
                <div className="community-detail-book-title">{post.book.title}</div>
                <div className="community-detail-book-author">{post.book.author}</div>
              </div>
            </div>
          )}

          <div className="post-date">{formatDate(post.createdAt)}</div>
        </div>

        {/* 댓글 섹션 */}
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.map((comment) => (
              <div key={comment.commentId} className="comment-item">
                <div className="comment-author">{comment.author.nickname}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-date">{formatDate(comment.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 댓글 입력 */}
      <div className="comment-input-section">
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력해 주세요"
            className="comment-input"
          />
          <button type="submit" className="comment-submit">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default CommunityPostDetailPage; 