// frontend/src/pages/NotificationsPage.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

export default function NotificationsPage() {
  const { axiosInstance } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axiosInstance.get('/notifications/')
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));
  }, [axiosInstance]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Уведомления</Typography>
      <List>
        {notifications.map((notif) => (
          <React.Fragment key={notif.id}>
            <ListItem>
              <ListItemText
                primary={`${notif.sender_username} сделал(а) ${notif.notif_type}`}
                secondary={new Date(notif.created_at).toLocaleString()}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
}
