// CommentItem.js
// Компонент для отображения одного комментария и его вложенных ответов.
// Использует рекурсию для построения дерева.

import React, { useState } from 'react';
import CommentForm from './CommentForm';

export default function CommentItem({ comment, postId, onReplyAdded }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const handleReplyCreated = (newComment) => {
    setShowReplyForm(false);
    setReplies([...replies, newComment]);
  };

  return (
    <div
      style={{
        marginLeft: comment.parent ? 20 : 0,
        marginTop: 12,
        borderLeft: comment.parent ? '1px solid #ccc' : 'none',
        paddingLeft: 10,
      }}
    >
      <div>
        <b>{comment.user.username}</b> — <small>{new Date(comment.created_at).toLocaleString()}</small>
      </div>
      <div>{comment.content}</div>

      <button
        style={{
          marginTop: 4,
          fontSize: 12,
          cursor: 'pointer',
          color: 'blue',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        onClick={() => setShowReplyForm(!showReplyForm)}
      >
        {showReplyForm ? 'Отмена' : 'Ответить'}
      </button>

      {showReplyForm && (
        <CommentForm
          postId={postId}
          parentId={comment.id}
          onCommentCreated={handleReplyCreated}
        />
      )}

      {replies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplyAdded={(newReply) => {
                setReplies([...replies, newReply]);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
