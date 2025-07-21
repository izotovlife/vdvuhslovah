// frontend/src/pages/UserPage.js
// Страница профиля пользователя с функционалом Twitter: профиль, вкладки, подписки, лайки и т.д.

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

import ProfileEditModal from '../components/ProfileEditModal';

dayjs.extend(relativeTime);
dayjs.locale('ru');

const PAGE_SIZE = 10;

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const isOwner = user?.username === username;

  const [profile, setProfile] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsHasMore, setPostsHasMore] = useState(true);

  const [reposts, setReposts] = useState([]);
  const [repostsPage, setRepostsPage] = useState(1);
  const [repostsLoading, setRepostsLoading] = useState(false);
  const [repostsHasMore, setRepostsHasMore] = useState(true);

  const [likedPosts, setLikedPosts] = useState([]);
  const [likedPage, setLikedPage] = useState(1);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedHasMore, setLikedHasMore] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsHasMore, setCommentsHasMore] = useState(true);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const [pinnedPost, setPinnedPost] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);

  const [followStatus, setFollowStatus] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const showError = (msg) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(true);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`/api/users/${username}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setPinnedPost(res.data.pinned_post || null);
      setFollowStatus(res.data.is_following);
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      showError('Ошибка загрузки профиля');
    }
  }, [username, token]);

  const fetchFollowers = async () => {
    try {
      const res = await axios.get(`/api/users/${username}/followers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowers(res.data);
      setFollowersOpen(true);
    } catch (err) {
      console.error('Ошибка загрузки подписчиков:', err);
      showError('Ошибка загрузки подписчиков');
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await axios.get(`/api/users/${username}/following/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowing(res.data);
      setFollowingOpen(true);
    } catch (err) {
      console.error('Ошибка загрузки подписок:', err);
      showError('Ошибка загрузки подписок');
    }
  };

  const fetchPostsPage = async (type, page) => {
    let url = '';
    if (type === 'posts') url = `/api/users/${username}/posts/?page=${page}&page_size=${PAGE_SIZE}`;
    else if (type === 'reposts') url = `/api/users/${username}/reposts/?page=${page}&page_size=${PAGE_SIZE}`;
    else if (type === 'liked') url = `/api/users/${username}/liked-posts/?page=${page}&page_size=${PAGE_SIZE}`;
    else if (type === 'comments') url = `/api/users/${username}/comments/?page=${page}&page_size=${PAGE_SIZE}`;
    else return;

    try {
      if (type === 'posts') setPostsLoading(true);
      else if (type === 'reposts') setRepostsLoading(true);
      else if (type === 'liked') setLikedLoading(true);
      else if (type === 'comments') setCommentsLoading(true);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.results || res.data;

      if (type === 'posts') {
        setPosts(page === 1 ? data : [...posts, ...data]);
        setPostsHasMore(res.data.next !== null);
        setPostsPage(page);
      } else if (type === 'reposts') {
        setReposts(page === 1 ? data : [...reposts, ...data]);
        setRepostsHasMore(res.data.next !== null);
        setRepostsPage(page);
      } else if (type === 'liked') {
        setLikedPosts(page === 1 ? data : [...likedPosts, ...data]);
        setLikedHasMore(res.data.next !== null);
        setLikedPage(page);
      } else if (type === 'comments') {
        setComments(page === 1 ? data : [...comments, ...data]);
        setCommentsHasMore(res.data.next !== null);
        setCommentsPage(page);
      }
    } catch (err) {
      console.error(`Ошибка загрузки ${type}:`, err);
      showError(`Ошибка загрузки ${type}`);
    } finally {
      if (type === 'posts') setPostsLoading(false);
      else if (type === 'reposts') setRepostsLoading(false);
      else if (type === 'liked') setLikedLoading(false);
      else if (type === 'comments') setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    if (tabIndex === 0 && posts.length === 0) fetchPostsPage('posts', 1);
    else if (tabIndex === 1 && reposts.length === 0) fetchPostsPage('reposts', 1);
    else if (tabIndex === 2 && likedPosts.length === 0) fetchPostsPage('liked', 1);
    else if (tabIndex === 3 && comments.length === 0) fetchPostsPage('comments', 1);
  }, [tabIndex, profile]);

  useEffect(() => {
    fetchProfile();
    setPosts([]);
    setReposts([]);
    setLikedPosts([]);
    setComments([]);
    setPostsPage(1);
    setRepostsPage(1);
    setLikedPage(1);
    setCommentsPage(1);
    setPostsHasMore(true);
    setRepostsHasMore(true);
    setLikedHasMore(true);
    setCommentsHasMore(true);
  }, [username, fetchProfile]);

  const handleLike = async (postId, liked) => {
    if (!token) return showError('Войдите, чтобы ставить лайки');
    try {
      if (liked) await axios.delete(`/api/posts/${postId}/like/`, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`/api/posts/${postId}/like/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchPostsPage(tabIndex === 0 ? 'posts' : tabIndex === 1 ? 'reposts' : tabIndex === 2 ? 'liked' : 'comments', 1);
    } catch (err) {
      console.error('Ошибка лайка:', err);
      showError('Ошибка при постановке лайка');
    }
  };

  const handleRepost = async (postId, reposted) => {
    if (!token) return showError('Войдите, чтобы делать репосты');
    try {
      if (reposted) await axios.delete(`/api/posts/${postId}/repost/`, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`/api/posts/${postId}/repost/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchPostsPage(tabIndex === 0 ? 'posts' : tabIndex === 1 ? 'reposts' : tabIndex === 2 ? 'liked' : 'comments', 1);
    } catch (err) {
      console.error('Ошибка репоста:', err);
      showError('Ошибка при репосте');
    }
  };

  const handleFollowToggle = async () => {
    if (!token) return showError('Войдите, чтобы подписаться');
    setFollowLoading(true);
    try {
      if (followStatus) {
        await axios.delete(`/api/users/${username}/unfollow/`, { headers: { Authorization: `Bearer ${token}` } });
        setFollowStatus(false);
      } else {
        await axios.post(`/api/users/${username}/follow/`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setFollowStatus(true);
      }
      fetchProfile();
    } catch (err) {
      console.error('Ошибка подписки:', err);
      showError('Ошибка при подписке');
    } finally {
      setFollowLoading(false);
    }
  };

  const togglePinPost = async (postId) => {
    if (!token) return showError('Войдите, чтобы редактировать профиль');
    setPinLoading(true);
    try {
      if (pinnedPost && pinnedPost.id === postId) {
        await axios.delete(`/api/posts/${postId}/unpin/`, { headers: { Authorization: `Bearer ${token}` } });
        setPinnedPost(null);
      } else {
        await axios.post(`/api/posts/${postId}/pin/`, {}, { headers: { Authorization: `Bearer ${token}` } });
        fetchProfile();
      }
    } catch (err) {
      console.error('Ошибка закрепления поста:', err);
      showError('Ошибка закрепления поста');
    } finally {
      setPinLoading(false);
    }
  };

  const loadMore = () => {
    if (tabIndex === 0 && postsHasMore && !postsLoading) fetchPostsPage('posts', postsPage + 1);
    else if (tabIndex === 1 && repostsHasMore && !repostsLoading) fetchPostsPage('reposts', repostsPage + 1);
    else if (tabIndex === 2 && likedHasMore && !likedLoading) fetchPostsPage('liked', likedPage + 1);
    else if (tabIndex === 3 && commentsHasMore && !commentsLoading) fetchPostsPage('comments', commentsPage + 1);
  };

  const UserListDialog = ({ open, onClose, users, title }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {users.map(u => (
            <ListItem
              button
              key={u.id}
              onClick={() => {
                navigate(`/users/${u.username}`);
                onClose();
              }}
            >
              <ListItemAvatar>
                <Avatar src={u.avatar} />
              </ListItemAvatar>
              <ListItemText primary={u.display_name || u.username} secondary={`@${u.username}`} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );

  const PostItem = ({ post }) => {
    const [liked, setLiked] = useState(post.is_liked);
    const [reposted, setReposted] = useState(post.is_reposted);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [repostCount, setRepostCount] = useState(post.repost_count);
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingRepost, setLoadingRepost] = useState(false);

    const onLikeClick = async () => {
      if (loadingLike) return;
      setLoadingLike(true);
      try {
        if (liked) await axios.delete(`/api/posts/${post.id}/like/`, { headers: { Authorization: `Bearer ${token}` } });
        else await axios.post(`/api/posts/${post.id}/like/`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setLiked(!liked);
        setLikeCount(likeCount + (liked ? -1 : 1));
      } catch (err) {
        console.error('Ошибка лайка:', err);
        showError('Ошибка при лайке');
      } finally {
        setLoadingLike(false);
      }
    };

    const onRepostClick = async () => {
      if (loadingRepost) return;
      setLoadingRepost(true);
      try {
        if (reposted) await axios.delete(`/api/posts/${post.id}/repost/`, { headers: { Authorization: `Bearer ${token}` } });
        else await axios.post(`/api/posts/${post.id}/repost/`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setReposted(!reposted);
        setRepostCount(repostCount + (reposted ? -1 : 1));
      } catch (err) {
        console.error('Ошибка репоста:', err);
        showError('Ошибка при репосте');
      } finally {
        setLoadingRepost(false);
      }
    };

    return (
      <Box mb={2} p={2} border="1px solid #ccc" borderRadius={2}>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
        <Box display="flex" alignItems="center" mt={1} gap={1} color="text.secondary">
          <Tooltip title="Лайк">
            <IconButton size="small" onClick={onLikeClick} disabled={loadingLike}>
              <ThumbUpIcon color={liked ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">{likeCount}</Typography>

          <Tooltip title="Репост">
            <IconButton size="small" onClick={onRepostClick} disabled={loadingRepost}>
              <RepeatIcon color={reposted ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">{repostCount}</Typography>

          <Tooltip title="Комментарии">
            <IconButton size="small" onClick={() => navigate(`/posts/${post.id}`)}>
              <CommentIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="caption" sx={{ ml: 'auto' }}>
            {dayjs(post.created_at).fromNow()}
          </Typography>

          {isOwner && (
            <Button
              size="small"
              variant={pinnedPost?.id === post.id ? 'contained' : 'outlined'}
              onClick={() => togglePinPost(post.id)}
              disabled={pinLoading}
              sx={{ ml: 1 }}
            >
              {pinnedPost?.id === post.id ? 'Открепить' : 'Закрепить'}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  if (!profile) return <Box p={4} textAlign="center"><CircularProgress /></Box>;

  return (
    <Box maxWidth={720} mx="auto" p={2}>
      {profile.banner && (
        <Box
          sx={{
            width: '100%',
            height: 160,
            backgroundImage: `url(${profile.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 1,
            mb: 2,
          }}
        />
      )}

      <Box display="flex" alignItems="center" mb={2}>
        <Avatar src={profile.avatar} sx={{ width: 96, height: 96, mr: 2 }} />
        <Box flexGrow={1}>
          <Typography variant="h5">{profile.display_name || profile.username}</Typography>
          <Typography variant="subtitle1" color="text.secondary">@{profile.username}</Typography>
          <Typography variant="caption" color="text.secondary">
            Зарегистрирован: {dayjs(profile.date_joined).format('DD MMMM YYYY')}
          </Typography>
        </Box>

        {isOwner ? (
          <ProfileEditModal userProfile={profile} onProfileUpdated={fetchProfile} />
        ) : (
          <Button
            variant={followStatus ? 'outlined' : 'contained'}
            color={followStatus ? 'primary' : 'secondary'}
            startIcon={followStatus ? <PersonRemoveIcon /> : <PersonAddIcon />}
            onClick={handleFollowToggle}
            disabled={followLoading}
          >
            {followStatus ? 'Отписаться' : 'Подписаться'}
          </Button>
        )}
      </Box>

      {profile.bio && (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {profile.bio}
        </Typography>
      )}

      <Box mb={2}>
        <Button onClick={fetchFollowers} sx={{ mr: 2 }}>
          Подписчики: {profile.followers_count}
        </Button>
        <Button onClick={fetchFollowing}>
          Подписки: {profile.following_count}
        </Button>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(e, v) => setTabIndex(v)}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
      >
        <Tab label="Посты" />
        <Tab label="Репосты" />
        <Tab label="Нравится" />
        <Tab label="Комментарии" />
      </Tabs>

      <Box mt={2}>
        {(tabIndex === 0 && posts.length === 0 && !postsLoading) && <Typography>Постов нет.</Typography>}
        {(tabIndex === 1 && reposts.length === 0 && !repostsLoading) && <Typography>Репостов нет.</Typography>}
        {(tabIndex === 2 && likedPosts.length === 0 && !likedLoading) && <Typography>Понравившихся постов нет.</Typography>}
        {(tabIndex === 3 && comments.length === 0 && !commentsLoading) && <Typography>Комментариев нет.</Typography>}

        {(tabIndex === 0) && posts.map(post => <PostItem key={post.id} post={post} />)}
        {(tabIndex === 1) && reposts.map(post => <PostItem key={post.id} post={post} />)}
        {(tabIndex === 2) && likedPosts.map(post => <PostItem key={post.id} post={post} />)}
        {(tabIndex === 3) && comments.map(post => <PostItem key={post.id} post={post} />)}

        {(tabIndex === 0 && postsHasMore && !postsLoading) && (
          <Button fullWidth onClick={loadMore}>Загрузить еще</Button>
        )}
        {(tabIndex === 1 && repostsHasMore && !repostsLoading) && (
          <Button fullWidth onClick={loadMore}>Загрузить еще</Button>
        )}
        {(tabIndex === 2 && likedHasMore && !likedLoading) && (
          <Button fullWidth onClick={loadMore}>Загрузить еще</Button>
        )}
        {(tabIndex === 3 && commentsHasMore && !commentsLoading) && (
          <Button fullWidth onClick={loadMore}>Загрузить еще</Button>
        )}
      </Box>

      <UserListDialog
        open={followersOpen}
        onClose={() => setFollowersOpen(false)}
        users={followers}
        title="Подписчики"
      />

      <UserListDialog
        open={followingOpen}
        onClose={() => setFollowingOpen(false)}
        users={following}
        title="Подписки"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserPage;
