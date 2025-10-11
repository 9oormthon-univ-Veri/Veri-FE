import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail } from '../../api/communityApi';
import type { PostDetail } from '../../api/communityApi';
import { createComment, deleteComment, updateComment } from '../../api/communityCommentsApi';
import Toast from '../../components/Toast';
import './CommunityPostDetailPage.css';

function CommunityPostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await createComment({
        postId: parseInt(postId),
        content: newComment.trim()
      });

      if (response.isSuccess) {
        // 댓글 작성 성공 후 게시글 다시 로드
        setNewComment('');
        const updatedPost = await getPostDetail(parseInt(postId));
        if (updatedPost.isSuccess && updatedPost.result) {
          setPost(updatedPost.result);
        }
      } else {
        setToast({ message: response.message || '댓글 작성에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      setToast({ message: '댓글 작성 중 오류가 발생했습니다.', type: 'error', isVisible: true });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?') || !postId) return;

    try {
      const response = await deleteComment(commentId);

      if (response.isSuccess) {
        // 댓글 삭제 성공 후 게시글 다시 로드
        const updatedPost = await getPostDetail(parseInt(postId));
        if (updatedPost.isSuccess && updatedPost.result) {
          setPost(updatedPost.result);
        }
      } else {
        setToast({ message: response.message || '댓글 삭제에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      setToast({ message: '댓글 삭제 중 오류가 발생했습니다.', type: 'error', isVisible: true });
    }
  };

  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingContent.trim() || !postId) return;

    try {
      const response = await updateComment(commentId, {
        content: editingContent.trim()
      });

      if (response.isSuccess) {
        // 댓글 수정 성공 후 게시글 다시 로드
        setEditingCommentId(null);
        setEditingContent('');
        const updatedPost = await getPostDetail(parseInt(postId));
        if (updatedPost.isSuccess && updatedPost.result) {
          setPost(updatedPost.result);
        }
      } else {
        setToast({ message: response.message || '댓글 수정에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      setToast({ message: '댓글 수정 중 오류가 발생했습니다.', type: 'error', isVisible: true });
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

  // 이미지 스와이프 핸들러
  const handleImageSwipe = (direction: 'left' | 'right') => {
    if (!post?.images || post.images.length <= 1) return;
    
    if (direction === 'left') {
      setCurrentImageIndex((prev) => 
        prev === post.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? post.images.length - 1 : prev - 1
      );
    }
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    const startX = touch.clientX;
    const startY = touch.clientY;
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      
      const endX = touch.clientX;
      const endY = touch.clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // 수직 스크롤과 구분하기 위해 수평 이동이 더 클 때만 스와이프 처리
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          handleImageSwipe('right'); // 오른쪽으로 스와이프 (이전 이미지)
        } else {
          handleImageSwipe('left'); // 왼쪽으로 스와이프 (다음 이미지)
        }
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (loading) {
    return (
      <div className="loading-page-container">
          <div className="loading-spinner"></div>
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
        <h3>{post.author.nickname} 님의 글</h3>
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
              <img 
                src={post.images[currentImageIndex]} 
                alt="게시물 이미지" 
                className="main-image"
                onTouchStart={handleTouchStart}
              />
            </>
          ) : (
            <div className="no-image-placeholder-detail">
              <span>이미지 없음</span>
            </div>
          )}
        </div>

        {/* 이미지 개수 표시 점들 */}
        {post.images && post.images.length > 1 && (
          <div className="image-dots">
            {post.images.map((_, index) => (
              <span 
                key={index} 
                className={`post-detail-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              ></span>
            ))}
          </div>
        )}

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
                <span className="mgc_heart_line"></span>
                <span>{post.likeCount}</span>
              </button>
              <button className="comment-button">
                <span className="mgc_chat_3_line"></span>
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
            {post.comments.map((comment, index) => (
              <div key={comment.commentId || `deleted-${index}`} className="comment-item">
                <div className="comment-header">
                  <div className="comment-author-info">
                    {comment.author && (
                      <>
                        <div className="comment-author-avatar">
                          <img 
                            src={comment.author.profileImageUrl} 
                            alt={comment.author.nickname}
                            onError={(e) => {
                              e.currentTarget.src = '/images/profileSample/sample_user.png';
                            }}
                          />
                        </div>
                        <div className="comment-author">{comment.author.nickname}</div>
                      </>
                    )}
                    {comment.isDeleted && (
                      <>
                        <div className="comment-author-avatar deleted">
                        </div>
                        <div className="comment-author deleted">삭제된 사용자</div>
                      </>
                    )}
                  </div>
                  <div className="comment-actions">
                    {!comment.isDeleted && comment.commentId && (
                      <>
                        <button 
                          className="comment-action-btn"
                          onClick={() => handleEditComment(comment.commentId!, comment.content)}
                        >
                          수정
                        </button>
                        <button 
                          className="comment-action-btn delete"
                          onClick={() => handleDeleteComment(comment.commentId!)}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {!comment.isDeleted && editingCommentId === comment.commentId ? (
                  <div className="comment-edit-form">
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="comment-edit-input"
                      autoFocus
                    />
                    <div className="comment-edit-buttons">
                      <button 
                        className="comment-edit-btn cancel"
                        onClick={handleCancelEdit}
                      >
                        취소
                      </button>
                      <button 
                        className="comment-edit-btn save"
                        onClick={() => handleUpdateComment(comment.commentId!)}
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`comment-content ${comment.isDeleted ? 'deleted' : ''}`}>
                      {comment.isDeleted ? '삭제된 댓글입니다.' : comment.content}
                    </div>
                    <div className={`comment-date ${comment.isDeleted ? 'deleted' : ''}`}>
                      {formatDate(comment.createdAt)}
                    </div>
                  </>
                )}
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
            disabled={submittingComment}
          />
          <button 
            type="submit" 
            className="comment-submit"
            disabled={submittingComment || !newComment.trim()}
          >
            {submittingComment ? (
              <span>...</span>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* Toast 알림 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default CommunityPostDetailPage; 