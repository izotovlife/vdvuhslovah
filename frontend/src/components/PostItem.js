// frontend/src/components/PostItem.js
import React from 'react';
import { Link } from 'react-router-dom';

const PostItem = ({ post }) => {
  return (
    <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8, marginBottom: 10 }}>
        <h3>{post.author_username}</h3>
        <p>{post.content}</p>
        <small>{new Date(post.created_at).toLocaleString()}</small>
      </div>
    </Link>
  );
};

export default PostItem;

