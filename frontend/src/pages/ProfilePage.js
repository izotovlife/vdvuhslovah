// frontend/src/pages/ProfilePage.js
//
// Страница профиля пользователя с функционалом:
// - Просмотр и редактирование профиля (имя, email, телефон, город, аватар, баннер)
// - Вкладки "Основное" и "Активность" с подвкладками публикаций, репостов и понравившихся
// - Загрузка и предпросмотр изображений аватара и баннера
// - Подписка/отписка на пользователя с отображением количества подписчиков и подписок
// - Удаление профиля с подтверждением
// - Уведомления через Snackbar
//
// Использует контекст AuthContext для API запросов и глобального обновления пользователя.
// Поддерживает пагинацию и обновление состояния подписок.

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const { axiosInstance, user: currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { username } = useParams(); // получаем имя пользователя из URL (например /profile/:username)

  const [tabIndex, setTabIndex] = useState(0);
  const [activityTab, setActivityTab] = useState(0);

  const [profile, setProfile] = useState({});
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
  });
  const [file, setFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const [snackMessage, setSnackMessage] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  // Подписка/статус подписки
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Пагинация для постов, репостов, лайков
  const [postsPage, setPostsPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsHasMore, setPostsHasMore] = useState(true);

  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    setLoadingProfile(true);
    // Получаем профиль пользователя (по username или текущий)
    const url = username ? `/users/${username}/profile/` : '/profile/';
    axiosInstance.get(url)
      .then(res => {
        const data = res.data;
        setProfile(data);
        // Если это текущий пользователь — заполняем поля редактирования
        if (!username || currentUser?.username === username) {
          setEditData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
            city: data.city || '',
          });
        }

        // Подписки
        setIsFollowing(data.is_following || false);
        setFollowersCount(data.followers_count || 0);
        setFollowingCount(data.following_count || 0);

        setPosts(data.posts || []);
        setReposts(data.reposts || []);
        setLikedPosts(data.liked_posts || []);
      })
      .catch(err => {
        console.error(err);
        setSnackMessage('Ошибка при загрузке профиля');
        setSnackOpen(true);
      })
      .finally(() => setLoadingProfile(false));
  }, [axiosInstance, username, currentUser]);

  // Обработчик подписки/отписки
  const handleFollowToggle = () => {
    if (!currentUser) {
      setSnackMessage('Войдите, чтобы подписаться');
      setSnackOpen(true);
      return;
    }
    setLoadingFollow(true);

    const url = `/users/${profile.user?.username}/follow-toggle/`; // нужно реализовать на бекенде
    axiosInstance.post(url)
      .then(res => {
        setIsFollowing(res.data.is_following);
        setFollowersCount(res.data.followers_count);
        setSnackMessage(res.data.is_following ? 'Вы подписались' : 'Вы отписались');
        setSnackOpen(true);
      })
      .catch(() => {
        setSnackMessage('Ошибка при изменении подписки');
        setSnackOpen(true);
      })
      .finally(() => setLoadingFollow(false));
  };

  // Загрузка следующей страницы публикаций (пагинация)
  const loadMorePosts = () => {
    if (postsLoading || !postsHasMore) return;
    setPostsLoading(true);
    axiosInstance.get(`/users/${profile.user?.username}/posts/?page=${postsPage + 1}`)
      .then(res => {
        setPosts(prev => [...prev, ...res.data.results]);
        setPostsPage(prev => prev + 1);
        setPostsHasMore(res.data.next !== null);
      })
      .catch(() => {
        setSnackMessage('Ошибка при загрузке публикаций');
        setSnackOpen(true);
      })
      .finally(() => setPostsLoading(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleBannerChange = (e) => {
    const selectedBanner = e.target.files[0];
    setBannerFile(selectedBanner);
  };

  const handleSave = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('first_name', editData.first_name);
    formData.append('last_name', editData.last_name);
    formData.append('email', editData.email);
    formData.append('phone', editData.phone);
    formData.append('city', editData.city);
    if (file) formData.append('avatar', file);
    if (bannerFile) formData.append('banner', bannerFile);

    axiosInstance.put('/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => {
        setProfile(res.data);
        updateUser(res.data);
        setLoading(false);
        setSnackMessage('Профиль успешно обновлен');
        setSnackOpen(true);
        setFile(null);
        setBannerFile(null);
      })
      .catch(() => {
        setLoading(false);
        setSnackMessage('Ошибка при обновлении профиля');
        setSnackOpen(true);
      });
  };

  const handlePasswordChange = () => {
    navigate('/change-password');
  };

  const handleDelete = () => {
    axiosInstance.delete('/profile/')
      .then(() => window.location.href = '/goodbye')
      .catch(() => {
        setSnackMessage('Ошибка при удалении профиля');
        setSnackOpen(true);
      });
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleActivityTabChange = (event, newValue) => {
    setActivityTab(newValue);
  };

  if (loadingProfile) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {/* Баннер */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          backgroundImage: `url(${bannerFile ? URL.createObjectURL(bannerFile) : profile.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          mb: -10,
          cursor: username ? 'default' : 'pointer', // нельзя менять чужой баннер
          filter: username && username !== currentUser?.username ? 'grayscale(30%)' : 'none',
        }}
        onClick={() => !username && document.getElementById('banner-input').click()}
      >
        {!username && (
          <>
            <input
              type="file"
              accept="image/*"
              id="banner-input"
              style={{ display: 'none' }}
              onChange={handleBannerChange}
            />
            <IconButton
              sx={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)' }}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('banner-input').click();
              }}
            >
              <PhotoCamera />
            </IconButton>
          </>
        )}
      </Box>

      {/* Аватар и имя */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexDirection: 'column', position: 'relative' }}>
        <Box
          sx={{
            position: 'relative',
            cursor: username ? 'default' : 'pointer',
            filter: username && username !== currentUser?.username ? 'grayscale(30%)' : 'none',
          }}
          onClick={() => !username && document.getElementById('avatar-input').click()}
        >
          <Avatar
            src={file ? URL.createObjectURL(file) : profile.avatar}
            sx={{ width: 100, height: 100, mb: 2, border: '3px solid white' }}
          />
          {!username && (
            <>
              <input
                type="file"
                accept="image/*"
                id="avatar-input"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <IconButton
                sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('avatar-input').click();
                }}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        <Typography variant="h5">{profile.first_name} {profile.last_name}</Typography>

        {/* Подписка и статистика, только если это не текущий профиль */}
        {username && username !== currentUser?.username && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              onClick={handleFollowToggle}
              disabled={loadingFollow}
            >
              {loadingFollow ? 'Обрабатывается...' : isFollowing ? 'Отписаться' : 'Подписаться'}
            </Button>
            <Typography>Подписчики: {followersCount}</Typography>
            <Typography>Подписки: {followingCount}</Typography>
          </Box>
        )}

        {/* Статистика для своего профиля */}
        {!username && (
          <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
            <Typography>Подписчики: {followersCount}</Typography>
            <Typography>Подписки: {followingCount}</Typography>
          </Box>
        )}
      </Box>

      {/* Вкладки профиля */}
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Основное" />
        <Tab label="Активность" />
      </Tabs>

      {/* Основное */}
      <TabPanel value={tabIndex} index={0}>
        {username && username !== currentUser?.username ? (
          // Просмотр чужого профиля
          <Box sx={{ mt: 2 }}>
            <Typography><b>Имя:</b> {profile.first_name}</Typography>
            <Typography><b>Фамилия:</b> {profile.last_name}</Typography>
            <Typography><b>Email:</b> {profile.email}</Typography>
            <Typography><b>Телефон:</b> {profile.phone}</Typography>
            <Typography><b>Город:</b> {profile.city}</Typography>
            <Typography><b>Биография:</b> {profile.bio}</Typography>
          </Box>
        ) : (
          // Редактирование своего профиля
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField fullWidth label="Имя" name="first_name" value={editData.first_name} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Фамилия" name="last_name" value={editData.last_name} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" name="email" value={editData.email} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Телефон" name="phone" value={editData.phone} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Город" name="city" value={editData.city} onChange={handleChange} sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                {loading ? 'Сохраняю...' : 'Сохранить'}
              </Button>
              <Button variant="outlined" onClick={handlePasswordChange}>
                Сменить пароль
              </Button>
              <Button color="error" onClick={() => setOpenConfirm(true)}>
                Удалить профиль
              </Button>
            </Box>
          </Box>
        )}
      </TabPanel>

      {/* Активность */}
      <TabPanel value={tabIndex} index={1}>
        <Tabs value={activityTab} onChange={handleActivityTabChange} centered sx={{ mb: 2 }}>
          <Tab label="Публикации" />
          <Tab label="Репосты" />
          <Tab label="Понравившиеся" />
        </Tabs>

        {/* Публикации */}
        <TabPanel value={activityTab} index={0}>
          {posts.length > 0 ? posts.map(post => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Typography>{post.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Paper>
          )) : <Typography>Публикаций нет</Typography>}

          {postsHasMore && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button onClick={loadMorePosts} disabled={postsLoading}>
                {postsLoading ? 'Загрузка...' : 'Загрузить ещё'}
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Репосты */}
        <TabPanel value={activityTab} index={1}>
          {reposts.length > 0 ? reposts.map(repost => (
            <Paper key={repost.id} sx={{ p: 2, mb: 2 }}>
              <Typography>
                Репост от {repost.user?.username || 'неизвестный'} — оригинал: {repost.original_post?.content?.slice(0, 50) || '...'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(repost.created_at).toLocaleString()}
              </Typography>
            </Paper>
          )) : <Typography>Репостов нет</Typography>}
        </TabPanel>

        {/* Понравившиеся */}
        <TabPanel value={activityTab} index={2}>
          {likedPosts.length > 0 ? likedPosts.map(post => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Typography>{post.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Paper>
          )) : <Typography>Нет понравившихся публикаций</Typography>}
        </TabPanel>
      </TabPanel>

      {/* Диалог подтверждения удаления */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить профиль? Это действие необратимо.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Отмена</Button>
          <Button color="error" onClick={handleDelete}>Удалить</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
      />
    </Container>
  );
}
