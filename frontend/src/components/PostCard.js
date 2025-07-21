// frontend/src/components/PostCard.js

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import CommentIcon from '@mui/icons-material/Comment';

export default function PostCard({
  post,
  onLike,
  onRepost,
  onToggleCommentInput,
  showCommentInput,
  onToggleComments,
  commentsVisible,
  comments,
  commentCount,
  renderCommentForm,
  renderComments,
}) {
  // Печать лога для отладки
  console.log(post);

  // Безопасная обработка данных для аватара и имени пользователя
  const avatarUrl = post?.author?.profile?.avatar
    ? `http://localhost:8000${post.author.profile.avatar}`
    : '/default-avatar.png'; // Заглушка, если аватар отсутствует
  const username = post?.author?.username || 'Неизвестный пользователь'; // Защита от отсутствия имени

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Avatar src={avatarUrl} alt={username} />
        <Box>
          <Typography fontWeight="bold">{username}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(post.created_at).toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body1"
        sx={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', mb: 2 }}
      >
        {post.content}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Лайк">
          <IconButton onClick={() => onLike(post.id)}>
            <ThumbUpIcon />
          </IconButton>
        </Tooltip>
        <Typography>{post.like_count}</Typography>

        <Tooltip title="Репост">
          <IconButton onClick={() => onRepost(post.id)}>
            <RepeatIcon />
          </IconButton>
        </Tooltip>
        <Typography>{post.repost_count}</Typography>

        <Tooltip title="Комментарий">
          <IconButton
            onClick={() => onToggleCommentInput(post.id)}
            color={showCommentInput ? 'primary' : 'default'}
          >
            <CommentIcon />
          </IconButton>
        </Tooltip>

        <Typography variant="body2" sx={{ ml: 'auto' }}>
          💬 {commentCount}
        </Typography>
      </Box>

      {renderCommentForm?.()}

      {commentCount > 0 && (
        <Box mt={2}>
          <Box display="flex" justifyContent="flex-end">
            <button
              onClick={() => onToggleComments(post.id)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1976d2' }}
            >
              {commentsVisible ? 'Скрыть комментарии' : 'Показать комментарии'}
            </button>
          </Box>
          {commentsVisible && (
            <Box mt={1}>
              <Divider sx={{ mb: 1 }} />
              {renderComments?.()}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
