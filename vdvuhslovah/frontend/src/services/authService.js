// C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\frontend\src\services\authService.js
import axios from 'axios';

export async function login(username, password) {
  const response = await axios.post(`${process.env.REACT_APP_API}/token/`, {
    username,
    password,
  });
  localStorage.setItem('token', response.data.access);
}