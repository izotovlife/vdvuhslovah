// frontend/src/components/PostList.js

// frontend/src/components/PostList.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CommentForm from './CommentForm';

export default function PostList() {
  const { axiosInstance } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [axiosInstance]);

  // Функция для получения постов
  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get('/posts/');
      setPosts(res.data);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
    }
  };

  // Обработчик лайка
  const handleLike = async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/like/`);
      const liked = res.data.liked;  // Получаем, лайкнут ли пост
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            like_count: liked ? post.like_count + 1 : post.like_count - 1,
          };
        }
        return post;
      });
      setPosts(updatedPosts);  // Обновляем стейт с учётом нового лайка
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error);
    }
  };

  // Добавляем новый комментарий к нужному посту в локальном стейте
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

  return (
    <div>
      <h2>Лента постов</h2>
      {posts.map(post => (
        <div key={post.id} style={{ border: '1px solid #ccc', marginBottom: 16, padding: 8 }}>
          <p><strong>{post.author.username}</strong>: {post.content}</p>
          <small>
            ❤️ {post.like_count} | 💬 {post.comment_count} | 🔁 {post.repost_count}
          </small>

          {/* Обработчик лайка */}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => handleLike(post.id)}>
              {post.liked_by_user ? 'Убрать лайк' : 'Поставить лайк'}
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <h4>Комментарии:</h4>
            {(post.comments || []).map(comment => (
              <div key={comment.id} style={{ marginLeft: 16, marginBottom: 8 }}>
                <strong>{comment.user.username}</strong>: {comment.content}
              </div>
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
