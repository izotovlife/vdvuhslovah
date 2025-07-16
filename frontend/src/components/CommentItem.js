// frontend/src/components/CommentItem.js

import React, { useState } from 'react';
import CommentForm from './CommentForm';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export default function CommentItem({ comment, postId, depth = 0, onCommentCreated }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        ml: depth * 3,
        mb: 1,
        borderLeft: depth > 0 ? '2px solid #ccc' : 'none',
        pl: 2,
      }}
    >
      <Typography
        variant="body2"
        fontWeight="bold"
        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        onClick={() => navigate(`/user/${comment.user.username}`)}
      >
        {comment.user.username}
      </Typography>

      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.3 }}>
        {comment.content}
      </Typography>

      <Button
        size="small"
        onClick={() => setShowReplyForm(!showReplyForm)}
        sx={{ mt: 0.5, fontSize: 12, textTransform: 'none' }}
      >
        {showReplyForm ? 'Отмена' : 'Ответить'}
      </Button>

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
    </Box>
  );
}
