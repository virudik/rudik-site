/* Блок «Мои видео» (ИИшница). Каждая карточка:
     title  — подпись
     rutube — ID ролика на Rutube (из ссылки https://rutube.ru/video/<ID>/ — берётся длинный код), встроится плеер Rutube
     youtube — ID ролика YouTube (необязательно start: секунды)
     file / poster — свой mp4 в репозитории и картинка-превью (не рекомендуется — занимает место)
   Если ничего не указано — показывается заглушка «скоро». */
window.RUDIK_VIDEOS = [
  { title: 'Алексей',                           rutube: '', file: '/video/alexey.mp4', poster: '/video/alexey.jpg' },
  { title: 'Алина в школе',                     rutube: '', file: '/video/alina-school.mp4', poster: '/video/alina-school.jpg' },
  { title: 'Алина Новогоднее поздравление',     rutube: '', file: '/video/alina-ny.mp4', poster: '/video/alina-ny.jpg' },
  { title: 'ЗВ',                                rutube: '', file: '/video/zv.mp4', poster: '/video/zv.jpg' },
  { title: 'Котмонавты',                        rutube: '', file: '/video/kotmonavty.mp4', poster: '/video/kotmonavty.jpg' },
  { title: 'Канцлер',                           rutube: '' },
  { title: 'Мошенники',                         rutube: '' },
  { title: 'Открытка',                          rutube: '' },
  { title: 'Собаки блогеры',                    rutube: '' },
  { title: 'Кот-детектив',                      rutube: '' },
  { title: 'Роскосмос',                         rutube: '' },
  { title: 'Серёгиус',                          rutube: '' },
  { title: 'Стасов калоген',                    rutube: '' },
  { title: 'Черепашки в гараже',                rutube: '' }
];
