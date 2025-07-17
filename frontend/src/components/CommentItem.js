//C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\frontend\src\components\CommentItem.js

import React, { useState } from 'react';
import CommentForm from './CommentForm';

export default function CommentItem({ comment, postId, onReplyAdded }) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Обработка успешного создания ответа
  const handleReplyCreated = (newComment) => {
    setShowReplyForm(false);
    onReplyAdded(newComment);
  };

  return (
    <div style={{ marginLeft: comment.parent ? 20 : 0, marginTop: 12, borderLeft: comment.parent ? '1px solid #ccc' : 'none', paddingLeft: 10 }}>
      <div>
        <b>{comment.user.username}</b> — <small>{new Date(comment.created_at).toLocaleString()}</small>
      </div>
      <div>{comment.content}</div>

      <button
        style={{ marginTop: 4, fontSize: 12, cursor: 'pointer', color: 'blue', background: 'none', border: 'none', padding: 0 }}
        onClick={() => setShowReplyForm(!showReplyForm)}
      >
        {showReplyForm ? 'Отмена' : 'Ответить'}
      </button>

      {showReplyForm && (
        <CommentForm postId={postId} parentId={comment.id} onCommentCreated={handleReplyCreated} />
      )}

      {/* Рекурсивно выводим ответы */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onReplyAdded={onReplyAdded} />
          ))}
        </div>
      )}
    </div>
  );
}
