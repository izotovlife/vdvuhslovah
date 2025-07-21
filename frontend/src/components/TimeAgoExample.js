// frontend/src/components/TimeAgoExample.js
// Компонент для демонстрации работы библиотеки dayjs с плагином relativeTime и русской локализацией.
// Показывает, как отображать дату в формате "X времени назад" (например, "5 минут назад") на русском языке.

import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

// Подключаем плагин и устанавливаем русскую локаль
dayjs.extend(relativeTime);
dayjs.locale('ru');

const TimeAgoExample = () => {
  // Пример: дата 5 минут назад
  const fiveMinutesAgo = dayjs().subtract(5, 'minute');

  return (
    <div>
      <p>Пример времени с dayjs (русский):</p>
      <p>Текущее время: {dayjs().format('HH:mm:ss')}</p>
      <p>5 минут назад: {fiveMinutesAgo.fromNow()}</p>
    </div>
  );
};

export default TimeAgoExample;
