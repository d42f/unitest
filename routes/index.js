var _ = require('underscore');

module.exports = function (app) {
  app.get('/', pageIndex);
  app.get('/cabinet', pageCabinet);
  app.get('/courses', pageCourses);
  app.get('/courses/:id', pageCourse);
  app.get('/courses/:id/buy', pageCourseBuy);
  app.get('/courses/:id/buy/select', pageCourseBuySelect);
  app.get('/courses/:id/buy/select/complete', pageCourseBuySelectComplete);
  app.get('/courses/:id/:lessonid', pageCourseLesson);
  app.get('/courses/:id/:lessonid/:stepid', pageCourseLessonStep);
  app.get('/tasks', pageTasks);
  app.get('/tasks/:id', pageTask);
};

var user = {},
    courses = [],
    tasks = [
      {
        href: '/tasks/single-answer',
        num: 'A1',
        name: 'Задание с одним вариантом ответа',
        json: {
          next: '/tasks/several-answers',
          count: 12,
          index: 1,
          title: 'Прочтите отрывок и определите, о каких событиях идет речь.',
          description: '«Внутри России началось сочувственное славянам движение... 12 апреля ... Александр Николаевич подписал манифест... Война была трудная. Приходилось воевать в Азии и в Европе. Одна Плевна стоила нам огромных жертв, но в конце концов она была взята. Русские войска в плотную подошли к Константинополю».',
          type: 'single-answer',
          answers: [
            {label: 'Проведение переписи населения'},
            {label: 'Введение десятины', isCorrect: true},
            {label: 'Введение пятины'},
            {label: 'Полюдье'},
          ]
        }
      },
      {
        href: '/tasks/several-answers',
        num: 'A2',
        name: 'Задание с несколькими вариантами ответа',
        json: {
          next: '/tasks/single-answer-with-images',
          count: 12,
          index: 2,
          title: 'Выберите из списка основные итоги экономического развития России в XVIII в.',
          hint: 'Выберите 3 варианта<br>из списка ответов',
          type: 'several-answers',
          answers: [
            {label: 'Проведение переписи населения'},
            {label: 'Введение десятины', isCorrect: true},
            {label: 'Введение пятины', isCorrect: true},
            {label: 'Полюдье'},
          ]
        }
      },
      {
        href: '/tasks/single-answer-with-images',
        num: 'A3',
        name: 'Задание с одним вариантом ответа (картинки)',
        json: {
          next: '/tasks/text-field',
          count: 12,
          index: 3,
          title: 'Какой из храмов был создан когда в России правил царь , изображенный на портрете?',
          image: 'http://www.lorempixum.com/800/600/cats',
          type: 'single-answer-with-images',
          answers: [
            {image: 'http://www.lorempixum.com/640/480/cats'},
            {image: 'http://www.lorempixum.com/641/481/cats'},
            {image: 'http://www.lorempixum.com/642/482/cats', isCorrect: true},
            {image: 'http://www.lorempixum.com/643/483/cats'},
            {image: 'http://www.lorempixum.com/648/484/cats'}
          ]
        }
      },
      {
        href: '/tasks/text-field',
        num: 'A4',
        name: 'Задание с текстовым полем для ответа',
        json: {
          next: '/tasks/with-table',
          count: 12,
          index: 4,
          title: 'Напишите пропущенное понятие (термин).',
          description: 'Политическое течение, выступающее за уничтожение государства и замену его свободным, добровольным объединением граждан называется _____________ русские войска вплотную подошли к Константинополю.',
          type: 'text-field',
          answer: 'анархизм'
        }
      },
      {
        href: '/tasks/with-table',
        num: 'A5',
        name: 'Задание с текстовым полем для ответа (поддержка таблицы в описании вопроса)',
        json: {
          next: '/tasks/inputs-punctuation-marks',
          count: 12,
          index: 5,
          title: 'Напишите пропущенное понятие (термин).',
          table: {
            cols: ['Типы избирательных систем', 'Признаки'],
            cells: ['', 'От каждого избирательного округа избирается один депутат, который набрал большинство голосов.', 'Пропорциональная', 'Места в представленном органе распределяются в соотвествии с колличеством голосов, поданных за партийный срок.']
          },
          type: 'text-field',
          answer: 'мажоритарная'
        }
      },
      {
        href: '/tasks/inputs-punctuation-marks',
        num: 'A6',
        name: 'Задание с текстовыми полями для знаков препинания',
        json: {
          next: '/tasks/inputs-words',
          count: 12,
          index: 6,
          title: 'Расставьте знаки препинания.',
          editor: 'Поздней осенью или зимой на улицах городов появляются стайки то мелодично щебечущих, то резко кричащих птиц. Вот {} видимо {} за этот крик и получили птицы свое имя - свиристели, ведь глагол «свиристель» {} как считают лингвисты {} когда-то означал «резко свистеть, кричать».',
          type: 'input-words',
          answer: [',', ',', ',', ',']
        }
      },
      {
        href: '/tasks/inputs-words',
        num: 'A7',
        name: 'Задание с редактированием текста',
        json: {
          next: '/tasks/inputs-combobox',
          count: 12,
          index: 7,
          title: 'Расставьте знаки препинания.',
          editor: 'Он взял с этажерки и подал ему {пол листа} серой бумаги. Отец его, боевой генерал 1812 года, {полу грамотный} грубый, но не злой русский человек, всю жизнь тянул свою лямку. Коляска проехала {пол версты} прежде чем разговор возобновился между ними.',
          type: 'input-words',
          answer: ['пол листа', 'полу грамотный', 'пол версты']
        }
      },
      {
        href: '/tasks/inputs-combobox',
        num: 'A8',
        name: 'Задание с выбором из комбобокса',
        json: {
          next: '/tasks/table-with-fragments',
          count: 12,
          index: 8,
          title: 'Прочитайте приведенный ниже текст, в котором пропущен ряд слов. Выберите из предлагаемого списка слова, которые необходимо вставить на место пропусков.',
          subtitle: 'Слова в списке даны в именительном падеже. Каждое слово (словосочетание) может быть использовано только один раз. Выбирайте последовательно одно слово за другим, мысленно заполняя каждый пропуск. Обратите внимание на то, что в списке слов больше, чем вам потребуется для заполнения пропусков.',
          editor: 'Под {постиндустриальное общество|отношение|традиционное общество|эволюция|подъем|прогресс|регресс|простая форма} понимается направление развития, для которого характерно поступательное движение общества от низших и {постиндустриальное общество|отношение|традиционное общество|эволюция|подъем|прогресс|регресс|простая форма} общественной организации к более высоким и сложным. Этому понятию противоположно понятие {постиндустриальное общество|отношение|традиционное общество|эволюция|подъем|прогресс|регресс|простая форма} для которого характерно обратное движение - от высшего к низшему.',
          type: 'input-words',
          answer: ['постиндустриальное общество', 'прогресс', 'простая форма']
        }
      },
      {
        href: '/tasks/table-with-fragments',
        num: 'A9',
        name: 'Задание с фрагментами',
        json: {
          next: '/tasks/sorting',
          count: 12,
          index: 9,
          title: 'Установите соответствие между фрагментами исторических источников и их краткими характеристиками: к кажому, обозначенному буквой, подберите по две соответствующие характеристики, обозначенные цифрами.',
          table: {
            cols: ['Фрагмент А', 'Фрагмент Б'],
            cells: ['«Но, по словам Балуоля, Урфин и сам немного получил радости, став повелителем Изумрудного города. Подавая блюда, повар наблюдал, как диктатор сидел во главе стола, угрюмо слушал льстивые речи придворных и чувствовалось, что он не менее одинок, чем тогда, когда был простым столяром в стране жевунов. Наверно, тогда он мог легче привлечь к себе сердца людей, чем теперь, когда все они ненавидели его или угождали ему только из выгоды.»', '«Мы никак не могли понять, откуда он достает выпивку. Весь корабль ломал голову над этой загадкой. Мы следили за ним, но ничего не выследили. Когда мы спрашивали его напрямик, он, если был пьян, только хохотал нам в глаза, а если был трезв, торжественно клялся, что за всю жизнь ничего не пил, кроме воды.»']
          },
          subdescription: [
            '<h5>Характеристики</h5>',
            '<ol>',
              '<li><span>Данный договор был подписан в Берлине.</span></li>',
              '<li><span>По данному договору Россия получила выход к Балтийскому морю</span></li>',
              '<li><span>Данный договор был подписан в Вене.</span></li>',
              '<li><span>Современником подписания данного договора был А. Л. Ордин-Нащекин.</span></li>',
              '<li><span>Данный договор был подписан по итогам Северной войны.</span></li>',
            '</ol>'
          ].join(''),
          type: 'input-characteristics',
          answer: [
            {
              title: 'Фрагмент А',
              values: [1, 2]
            },
            {
              title: 'Фрагмент Б',
              values: [4, 5]
            }
          ]
        }
      },
      {
        href: '/tasks/sorting',
        num: 'B1',
        name: 'Задание с перемешиванием списка',
        json: {
          next: '/tasks/relations',
          count: 12,
          index: 10,
          title: 'Расположите названия событий в хронологическом порядке.',
          type: 'list-sorting',
          list: ['Завершение смуты', 'Создание русского флота', 'Отмена местничества', 'Присоединение России к континентальной блокаде', 'Введение десятины'],
          answer: ['Отмена местничества', 'Введение десятины', 'Завершение смуты', 'Создание русского флота', 'Присоединение России к континентальной блокаде']
        }
      },
      {
        href: '/tasks/relations',
        num: 'B2',
        name: 'Задание с выставлением связей',
        json: {
          next: '/tasks/drag-and-drop',
          count: 12,
          index: 11,
          title: 'Установите соответствие между именами русских царей и событиями, относящимися ко времени их правления.',
          hint: 'Перетащите один стикер на другой,<br>чтобы создать пару',
          type: 'relations',
          dragtitle: 'События',
          droptitle: 'Имена',
          draggables: ['Завершение смуты', 'Создание русского флота', 'Отмена местничества', 'Присоединение России к континентальной блокаде', 'Введение десятины'],
          droppables: ['Иван IV', 'Михаил Романов', 'Петр I', 'Александр I'],
          answer: [['Завершение смуты', 'Александр I'], ['Присоединение России к континентальной блокаде', 'Иван IV'], ['Создание русского флота', 'Петр I'], ['Отмена местничества', 'Михаил Романов']]
        }
      },
      {
        href: '/tasks/drag-and-drop',
        num: 'B3',
        name: 'Задание с перетаскиванием вариантов',
        json: {
          next: undefined,
          count: 12,
          index: 12,
          table: {
            cols: ['Правитель', 'Годы правления', 'Современник'],
            cells: ['Екатерина II', '', '', '', '1881-1894гг.', 'С. Ю. Витте', 'Алексей Михайлович', '', 'Аввакум', '', '1801-1825гг.', '']
          },
          type: 'drag-and-drop-table',
          columns: [
            ['Завершение смуты', 'Создание русского флота', 'Отмена местничества', 'Присоединение России к континентальной блокаде', 'Введение десятины'],
            ['Иван IV', 'Михаил Романов', 'Петр I', 'Александр I']
          ],
          answer: ['Завершение смуты', 'Иван IV', 'Создание русского флота', 'Михаил Романов', 'Отмена местничества', 'Петр I']
        }
      }
    ];

function pageIndex (req, res) {
  res.render('index', _.extend({isauth: !!Math.round(Math.random())}, {
    //
  }));
}

function pageCabinet (req, res) {
  res.render('cabinet', _.extend({isauth: !!Math.round(Math.random())}, {
    //
  }));
}

function pageCourses (req, res) {
  res.render('courses', _.extend({isauth: !!Math.round(Math.random())}, {
    items: courses
  }));
}

function pageCourse (req, res) {
  res.render('course', _.extend({isauth: !!Math.round(Math.random())}, {
    //
  }));
}

function pageCourseBuy (req, res) {
  res.render('course-buy', _.extend({isauth: !!Math.round(Math.random())}, {
    //
  }));
}

function pageCourseBuySelect (req, res) {
  res.render('course-buy-select', _.extend({isauth: !!Math.round(Math.random())}, {
    //
  }));
}

function pageCourseBuySelectComplete (req, res) {
  res.render('course-buy-select-complete', _.extend({isauth: !!Math.round(Math.random())}, {
    issuccess: !!Math.round(Math.random())
  }));
}

function pageCourseLesson (req, res) {
  res.render('course-lesson', _.extend({isauth: !!Math.round(Math.random())}, {
    taskdata: JSON.stringify(tasks[Math.round(Math.random() * tasks.length)].json),
    resultdata: JSON.stringify({
      count: 12,
      skips: Math.round(Math.random()) ? Math.round(Math.random() * 12) : 0,
      first: '/tasks/single-answer'
    }),
    completedata: JSON.stringify({
      percents: Math.round(Math.random() * 100),
      experience: Math.round(Math.random() * 50)
    })
  }));
}

function pageCourseLessonStep (req, res) {
  res.render('course-lesson-step-' + req.params.stepid, _.extend({isauth: !!Math.round(Math.random())}, {
    //
  }));
}

function pageTasks (req, res) {
  res.render('tasks', _.extend({isauth: !!Math.round(Math.random())}, {
    items: tasks
  }));
}

function pageTask (req, res) {
  var task = _.findWhere(tasks, {href: '/tasks/' + req.params.id});
  res.render('task', _.extend({isauth: !!Math.round(Math.random())}, {
    taskdata: JSON.stringify((task || {json: {}}).json),
    resultdata: JSON.stringify({
      count: 12,
      skips: Math.round(Math.random()) ? Math.round(Math.random() * 12) : 0,
      first: '/tasks/single-answer'
    }),
    completedata: JSON.stringify({
      percents: Math.round(Math.random() * 100),
      experience: Math.round(Math.random() * 50)
    })
  }));
}
