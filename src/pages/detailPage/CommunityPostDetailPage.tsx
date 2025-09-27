import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CommunityPostDetailPage.css';

interface CommunityPost {
  id: number;
  author: string;
  authorDescription: string;
  image: string;
  likes: number;
  comments: number;
  content: string;
  fullContent: string;
  date: string;
  book?: {
    title: string;
    author: string;
    cover: string;
  };
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

// 목업 데이터
const mockPost: CommunityPost = {
  id: 1,
  author: '홍길동',
  authorDescription: '📚 내가 남은 스물다섯 번의 개월',
  image: '/src/assets/images/cardSample/forest.jpg',
  likes: 125,
  comments: 19,
  content: '오늘 읽은 책에 대한 독후감을 써봤어요! 다들 읽고 한번씩 좋아요 부탁합니다',
  fullContent: `행정자부의 절은 국무위원 중에서 국무총리의 제청으로 대통령이 임명한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별, 종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다. 국가는 대외무역을 육성하며, 이를 규제·조정할 수 있다. 제1항의 지시를 받은 당해 행정기관은 이에 응하여야 한다.

국회의원은 법률이 정하는 직을 겸할 수 없다. 학교교육 및 평생교육을 포함한 교육제도와 그 운영, 교육재정 및 교원의 지위에 관한 기본적인 사항은 법률로 정한다. 일반사면을 명하려면 국회의 동의를 얻어야 한다. 헌법재판소 재판관은 정당에 가입하거나 정치에 관여할 수 없다. 국정의 중요한 사항에 관한 대통령의 자문에 응하기 위하여 국가원로로 구성하는 국가원로자문회의를 둘 수 있다.`,
  date: '2025.08.16',
  book: {
    title: '내게 남은 스물다섯 번의 개월',
    author: '슈테판 세이츠 (지은이), 전은경 (옮긴이)',
    cover: '/src/assets/images/profileSample/sample_book.png'
  }
};

const mockComments: Comment[] = [
  {
    id: 1,
    author: '짱이에요~',
    content: '~ 감사합니다~',
    date: '방금 전'
  },
  {
    id: 2,
    author: '하하',
    content: '좋은 글이네요!',
    date: '1시간 전'
  }
];

function CommunityPostDetailPage() {
  const navigate = useNavigate();
  const [post] = useState<CommunityPost>(mockPost);
  const [comments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // 댓글 추가 로직 (실제 구현에서는 API 호출)
      console.log('새 댓글:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="community-post-detail">
      {/* 헤더 */}
      <div className="detail-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="header-title">김현아님의 글</h1>
        <button className="menu-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="19" cy="12" r="1" fill="currentColor"/>
            <circle cx="5" cy="12" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="detail-content">
        {/* 메인 이미지 */}
        <div className="main-image-container">
          <img src={post.image} alt="게시물 이미지" className="main-image" />
          <div className="image-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* 프로필 및 액션 */}
        <div className="post-info">
          <div className="author-section">
            <div className="author-avatar">
              <img src="/src/assets/images/profileSample/sample_user.png" alt="프로필" />
            </div>
            <div className="author-details">
              <div className="author-name">{post.author}</div>
            </div>
            <div className="post-actions">
              <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                <span className="heart-icon">♡</span>
                <span>{post.likes}</span>
              </button>
              <button className="comment-button">
                <span className="comment-icon">💬</span>
                <span>{post.comments}</span>
              </button>
            </div>
          </div>

          {/* 게시물 내용 */}
          <div className="post-content">
            <p className="post-summary">{post.content}</p>
            <div className="post-full-content">
              {post.fullContent.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* 책 정보 */}
          {post.book && (
            <div className="book-info">
              <img src={post.book.cover} alt="책 표지" className="book-cover" />
              <div className="book-details">
                <div className="book-title">{post.book.title}</div>
                <div className="book-author">{post.book.author}</div>
              </div>
            </div>
          )}

          <div className="post-date">{post.date}</div>
        </div>

        {/* 댓글 섹션 */}
        <div className="comments-section">
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-author">{comment.author}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-date">{comment.date}</div>
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