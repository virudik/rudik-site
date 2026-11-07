/* «ИИшница» → «Мои видео». rutube: точный ID владельца.
   Rutube-player: https://rutube.ru/play/embed/<ID>.
   Shorts также встраивается в горизонтальном плеере согласно Rutube.
   Карточки без источника сохраняют заглушку «скоро». Старые MP4 в репозитории
   не удаляются; там, где задан Rutube, сайт использует его. */
window.RUDIK_VIDEOS = [
  { title: 'Алексей против тараканов', rutube: '5c9529ad09a354eb24e7fec0030f8108' },
  { title: 'Алина в школе', file: '/video/alina-school.mp4', poster: '/video/alina-school.jpg' },
  { title: 'Алина Новогоднее поздравление', file: '/video/alina-ny.mp4', poster: '/video/alina-ny.jpg' },
  { title: 'Звёздные войны в деревне', rutube: '71a96d88e127f61acd8e49c3831b50d7' },
  { title: 'Котмонавты росКОТмоса', rutube: 'bded60522d4d787ae2df31e8ebe5ad23' },
  { title: 'Канцлер Серёгиус' },
  { title: 'Матиз' },
  { title: 'Финансовые мультики против мошенников', rutube: 'f28cf60c314b00eadc77d88f582e1be0' },
  { title: 'Открытка', rutube: '81a1e6150e98400ce7732b6da6bbc3e6', shorts: true },
  { title: 'Собаки блогеры' },
  { title: 'Кот-детектив' },
  { title: 'Роскосмос' },
  { title: 'Стасов калоген' },
  { title: 'Черепашки в гараже' },
  { title: 'Очень Странный Дед Мороз ОСД (Новогоднее поздравление)', rutube: 'a260d16ec1ec08900d878aec655b62b0' }
];
