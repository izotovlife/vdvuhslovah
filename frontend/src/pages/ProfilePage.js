// frontend/src/pages/ProfilePage.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  IconButton
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
  const { axiosInstance, updateUser } = useContext(AuthContext); // <-- добавил updateUser
  const navigate = useNavigate();

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
  const [snackMessage, setSnackMessage] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    axiosInstance.get('/profile/')
      .then(res => {
        setProfile(res.data);
        setEditData({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          city: res.data.city || '',
        });
      })
      .catch(console.error);
  }, [axiosInstance]);

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
        updateUser(res.data);  // <-- обновляем глобальный user в контексте!
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
      .catch(console.error);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleActivityTabChange = (event, newValue) => {
    setActivityTab(newValue);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          position: 'relative',
          height: 200,
          backgroundImage: `url(${bannerFile ? URL.createObjectURL(bannerFile) : profile.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          mb: -10,
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('banner-input').click()}
      >
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
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexDirection: 'column', position: 'relative' }}>
        <Box
          sx={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => document.getElementById('avatar-input').click()}
        >
          <Avatar
            src={file ? URL.createObjectURL(file) : profile.avatar}
            sx={{ width: 100, height: 100, mb: 2, border: '3px solid white' }}
          />
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
        </Box>

        <Typography variant="h5">{profile.first_name} {profile.last_name}</Typography>
        {profile.pinned_post && (
          <Paper sx={{ mt: 2, p: 2, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="caption" color="text.secondary">
              Закреплённый пост
            </Typography>
            <Typography variant="body1">{profile.pinned_post.content}</Typography>
          </Paper>
        )}
      </Box>

      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Основное" />
        <Tab label="Активность" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
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
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <Tabs value={activityTab} onChange={handleActivityTabChange} centered sx={{ mb: 2 }}>
          <Tab label="Публикации" />
          <Tab label="Репосты" />
          <Tab label="Понравившиеся" />
        </Tabs>

        <TabPanel value={activityTab} index={0}>
          {profile.posts && profile.posts.length > 0 ? profile.posts.map(post => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Typography>{post.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Paper>
          )) : <Typography>Публикаций нет</Typography>}
        </TabPanel>

        <TabPanel value={activityTab} index={1}>
          {profile.reposts && profile.reposts.length > 0 ? profile.reposts.map(repost => (
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

        <TabPanel value={activityTab} index={2}>
          {profile.liked_posts && profile.liked_posts.length > 0 ? profile.liked_posts.map(post => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Typography>{post.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Paper>
          )) : <Typography>Нет понравившихся публикаций</Typography>}
        </TabPanel>
      </TabPanel>

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

      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
      />
    </Container>
  );
}
