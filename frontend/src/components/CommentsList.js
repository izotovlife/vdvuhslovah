// frontend/src/components/CommentsList.js
// Компонент для отображения списка комментариев в виде дерева.
// Преобразует массив в дерево и отрисовывает его через CommentItem.

import React from 'react';
import CommentItem from './CommentItem';

export default function CommentsList({ comments, postId, onReplyAdded }) {
  const buildTree = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach(comment => {
      comment.replies = [];
      map[comment.id] = comment;
    });

    comments.forEach(comment => {
      if (comment.parent) {
        if (map[comment.parent]) {
          map[comment.parent].replies.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    return roots;
  };

  const tree = buildTree(comments);

  return (
    <div>
      {tree.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onReplyAdded={onReplyAdded}
        />
      ))}
    </div>
  );
}
