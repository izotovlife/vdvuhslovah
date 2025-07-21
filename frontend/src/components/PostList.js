// frontend/src/components/PostList.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CommentsList from './CommentsList';  // Импортируем компонент вложенных комментариев
import CommentForm from './CommentForm';
import { Link } from 'react-router-dom';

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
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                like_count: liked ? post.like_count + 1 : post.like_count - 1,
                liked_by_user: liked,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Ошибка при лайке:', error);
    }
  };

  const handleRepost = async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/repost/`);
      if (res.status === 201) {
        setPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, repost_count: post.repost_count + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Ошибка при репосте:', error);
    }
  };

  const handleNewComment = (postId, newComment) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [...(post.comments || []), newComment],
              comment_count: post.comment_count + 1,
            }
          : post
      )
    );
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
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
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
            {/* Здесь используем CommentsList для вложенных комментариев */}
            <CommentsList comments={post.comments || []} postId={post.id} onReplyAdded={(newComment) => handleNewComment(post.id, newComment)} />
            <CommentForm postId={post.id} onCommentCreated={(newComment) => handleNewComment(post.id, newComment)} />
          </div>
        </div>
      ))}
    </div>
  );
}
