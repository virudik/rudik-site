/* «ИИшница → Мои видео». Один фильм — одна карточка, без дублей.
   file: уже размещённое локальное видео; rutube: внешний ID от владельца.
   review:'pending' — публичность Rutube пока не подтверждена (НЕ доказательство
   конкретного статуса модерации); если есть file, пока играет локальное видео.
   Порядок карточек определяется в rudik.js: готовые → проверяемые → «скоро».
   Версии локальных MP4 в GitHub не удалять. */
window.RUDIK_VIDEOS = [
  { title: 'Алексей против тараканов', rutube: '5c9529ad09a354eb24e7fec0030f8108' },
  { title: 'Алина в школе', file: '/video/alina-school.mp4', poster: '/video/alina-school.jpg' },
  { title: 'Алина — Очень Странный Дед Мороз ОСД (Новогоднее поздравление)',
    file: '/video/alina-ny.mp4', poster: '/video/alina-ny.jpg',
    rutube: 'a260d16ec1ec08900d878aec655b62b0', review: 'pending' },
  { title: 'Звёздные войны в деревне (ЗВ)',
    file: '/video/zv.mp4', poster: '/video/zv.jpg',
    rutube: '71a96d88e127f61acd8e49c3831b50d7', review: 'pending' },
  { title: 'Котмонавты росКОТмоса', rutube: 'bded60522d4d787ae2df31e8ebe5ad23' },
  { title: 'Открытка', rutube: '81a1e6150e98400ce7732b6da6bbc3e6', shorts: true },
  { title: 'Финансовые мультики против мошенников',
    rutube: 'f28cf60c314b00eadc77d88f582e1be0', review: 'pending' },
  { title: 'Канцлер Серёгиус' },
  { title: 'Матиз' },
  { title: 'Собаки блогеры' },
  { title: 'Кот-детектив' },
  { title: 'Роскосмос' },
  { title: 'Стасов калоген' },
  { title: 'Черепашки в гараже' }
];
