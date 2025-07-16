// frontend/src/components/PostList.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CommentForm from './CommentForm';
import { Link } from 'react-router-dom';

// Компонент для одного комментария и его ответов
function CommentItem({ comment, postId, depth, onCommentCreated }) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div style={{ marginLeft: depth * 16, marginBottom: 8 }}>
      <strong>{comment.user.username}</strong>: {comment.content}
      <button
        onClick={() => setShowReplyForm(!showReplyForm)}
        style={{ marginLeft: 8, fontSize: 12 }}
      >
        {showReplyForm ? 'Отмена' : 'Ответить'}
      </button>
      {showReplyForm && (
        <CommentForm
          postId={postId}
          parentId={comment.id}
          onCommentCreated={(newReply) => {
            onCommentCreated(postId, newReply, comment.id);
            setShowReplyForm(false);
          }}
        />
      )}
      {(comment.replies || []).map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          depth={depth + 1}
          onCommentCreated={onCommentCreated}
        />
      ))}
    </div>
  );
}

export default function PostList() {
  const { axiosInstance } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [axiosInstance]);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get('/posts/');
      setPosts(res.data);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/like/`);
      const liked = res.data.liked;
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const likeCount = liked ? post.like_count + 1 : post.like_count - 1;
          return {
            ...post,
            like_count: likeCount < 0 ? 0 : likeCount,
            liked_by_user: liked,
          };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Ошибка при лайке:', error);
    }
  };

  const handleRepost = async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/repost/`);
      if (res.status === 201) {
        const updatedPosts = posts.map(post =>
          post.id === postId
            ? { ...post, repost_count: post.repost_count + 1 }
            : post
        );
        setPosts(updatedPosts);
      }
    } catch (error) {
      console.error('Ошибка при репосте:', error);
    }
  };

  const handleNewComment = (postId, newComment, parentId = null) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              comment_count: post.comment_count + 1,
              comments: insertComment(post.comments || [], newComment, parentId),
            }
          : post
      )
    );
  };

  const insertComment = (comments, newComment, parentId) => {
    if (!parentId) return [...comments, newComment];

    return comments.map(comment => {
      if (comment.id === parentId) {
        const replies = comment.replies || [];
        return { ...comment, replies: [...replies, newComment] };
      }
      if (comment.replies) {
        return { ...comment, replies: insertComment(comment.replies, newComment, parentId) };
      }
      return comment;
    });
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/default-avatar.png';
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:8000${avatarPath}`;
  };

  return (
    <div>
      <h2>Лента постов</h2>
      {posts.map(post => (
        <div key={post.id} style={{ border: '1px solid #ccc', marginBottom: 16, padding: 8 }}>
          <Link
            to={`/user/${post.author.username}`}
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <img
              src={getAvatarUrl(post.author?.profile?.avatar)}
              alt="avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 10,
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            <strong>{post.author.username}</strong>
          </Link>

          <p style={{ marginTop: 8 }}>{post.content}</p>

          <small>
            ❤️ {post.like_count} | 💬 {post.comment_count} | 🔁 {post.repost_count}
          </small>

          <div style={{ marginTop: 8 }}>
            <button onClick={() => handleLike(post.id)}>
              {post.liked_by_user ? 'Убрать лайк' : 'Поставить лайк'}
            </button>
            <button onClick={() => handleRepost(post.id)} style={{ marginLeft: 8 }}>
              Репостнуть
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>Комментарии:</h4>
            {(post.comments || []).map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                depth={0}
                onCommentCreated={handleNewComment}
              />
            ))}
            <CommentForm
              postId={post.id}
              onCommentCreated={(newComment) => handleNewComment(post.id, newComment)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
