module.exports = function (app) {
  app.get('/', pageIndex);
  app.get('/cabinet', pageCabinet);
  app.get('/courses', pageCourses);
  app.get('/tasks', pageTasks);
  app.get('/tasks/:id', pageTask);
};

var user = {},
    courses = [],
    tasks = [
      {href: '/tasks/single-answer', name: 'Задание с одним вариантом ответа'},
      {href: '/tasks/several-answers', name: 'Задание с несколькими вариантами ответа'},
      {href: '/tasks/single-answer-with-images', name: 'Задание с одним вариантом ответа (картинки)'},
      {href: '/tasks/text-field', name: 'Задание с текстовым полем для ответа'},
      {href: '/tasks/with-table', name: 'Задание с текстовым полем для ответа (поддержка таблицы в описании вопроса)'},
      {href: '', name: 'Задание с выставлением связей'},
      {href: '', name: 'Задание с перетаскиванием вариантов'},
      {href: '', name: 'Задание с текстовыми полями для знаков препинания'},
      {href: '', name: 'Задание с редактированием текста'},
      {href: '', name: 'Задание с выбором из комбобокса'},
      {href: '', name: 'Задание с перемешиванием списка'}
    ];

function pageIndex (req, res) {
  res.render('index', {});
}

function pageCabinet (req, res) {
  res.render('cabinet', {});
};

function pageCourses (req, res) {
  res.render('courses', {
    items: courses
  });
};

function pageTasks (req, res) {
  res.render('tasks', {
    items: tasks
  });
};

function pageTask (req, res) {
  res.render('task', {
    partial: function () {
      return req.params.id;
    }
  });
}
