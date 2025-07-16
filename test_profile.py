import requests

BASE_URL = 'http://localhost:8000/api'
USERNAME = 'inkmaster'  # замени на нужное имя пользователя

url = f'{BASE_URL}/users/{USERNAME}/profile/'  # или просто /users/<username>/ если такой маршрут есть

response = requests.get(url)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())

# updated 2025-07-16 21:48:48
