if (!String.format) {
  String.prototype.format = function () {
    var str = this, pos, cnd, ind, cnds = str.match(/{(\d+)}/g) || [], cndsInd = cnds.length;
    while (cndsInd--) {
      pos = -1;
      cnd = cnds[cndsInd];
      ind = cnd.replace(/[{}]+/g, '');
      str = str.split(cnd).join(String(arguments[+ind]) || '');
    }
    return str;
  };
}

if (!Object.create) {
  Object.create = (function () {
    function F () {}
    return function (o) {
      if (arguments.length != 1) {
        throw new Error('Object.create implementation only accepts one parameter.');
      }
      F.prototype = o;
      return new F();
    };
  })();
}

;(function (win, $) {

var MAXSEVERALANSWERS = 3;

function setMinHeight (i ,o) {
  $(o).css('min-height', $(o).height() + 'px');
}

function savePosition (i, o) {
  var $o = $(o), position = $(o).position();
  $o.data('originalPosition', {
    top: position.top + $o.outerHeight(true) - $o.outerHeight(false),
    left: position.left
  });
}

function setPosition (i, o) {
  var $o = $(o), position = $o.data('originalPosition');
  $o.css({
    width: $o.width(),
    margin: '0',
    position: 'absolute',
    top: position.top + 'px',
    left: position.left + 'px'
  });
}

function updateDragDropItem ($draggable, $droppable) {
  $draggable.parent().prepend($draggable).find('.is-primary:last').after($draggable);
  $droppable.parent().prepend($droppable).find('.is-primary:last').after($droppable);
  $draggable.draggable('disable').addClass('is-primary');
  $droppable.droppable('disable').addClass('is-primary');
}

function resizeDragDropItems () {
  var $draggables = $('.b-testcard__body-answers__columns-left:first').find('li'),
      $droppables = $('.b-testcard__body-answers__columns-right:first').find('li'),
      leftTop = 0, rightTop = 0;
  $draggables.addClass('is-transition');
  $droppables.addClass('is-transition');
  for (var i = 0, n = Math.max($draggables.length, $droppables.length); i < n; i++) {
    var $drag = $draggables.eq(i),
        $drop = $droppables.eq(i);
    $drag.css({top: leftTop + 'px', left: 0});
    $drop.css({top: rightTop + 'px', left: 0});
    leftTop += $drag.outerHeight() + 16; //16 - margin-top
    rightTop += $drop.outerHeight() + 16; //16 - margin-top
    if ($drag.hasClass('is-primary') && $drop.hasClass('is-primary')) {
      leftTop = rightTop = Math.max(leftTop, rightTop);
    }
  }
  setTimeout(function () {
    $draggables.removeClass('is-transition');
    $droppables.removeClass('is-transition');
  }, 600);
}

function onKeydownOnlyNumbers (evt) {
  if ($.inArray(evt.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 || 
    // Allow: Ctrl+A, Command+A
    (evt.keyCode == 65 && (evt.ctrlKey === true || evt.metaKey === true)) || 
    // Allow: home, end, left, right, down, up
    (evt.keyCode >= 35 && evt.keyCode <= 40)) {
    // let it happen, don't do anything
    return undefined;
  }
  // Ensure that it is a number and stop the keypress
  if ((evt.shiftKey || (evt.keyCode < 48 || evt.keyCode > 57)) && (evt.keyCode < 96 || evt.keyCode > 105)) {
    evt.preventDefault();
    return false;
  }
}

function isEqualWords (s1, s2) {
  if (typeof s1 !== 'string' || typeof s2 !== 'string') {
    return false;
  }
  return $.trim(s1).toLowerCase() === $.trim(s2).toLowerCase();
}

function verifyEditorIntuts ($inputs, answers, showAnswer) {
  var isVerify = true;
  for (var i = $inputs.length; i-- > 0;) {
    var $o = $inputs.eq(i);
    if (showAnswer === true) {
      $o.removeClass('is-success').addClass('is-danger').attr('disabled', true).val(answers[i]);
      continue;
    }
    if (!isEqualWords($inputs[i].value, answers[i])) {
      isVerify = false;
      $o.removeClass('is-success').addClass('is-danger').attr('disabled', true);
    } else {
      $o.removeClass('is-danger').addClass('is-success').attr('disabled', false);
    }
  }
  return isVerify;
}

function verifyEditorComboboxes ($comboboxes, answers, showAnswer) {
  var isVerify = true;
  for (var i = $comboboxes.length; i-- > 0;) {
    var $o = $comboboxes.eq(i);
    if (showAnswer === true) {
      $o.removeClass('is-success').addClass('is-danger').find('span:first').html(answers[i]);
      continue;
    }
    if (!isEqualWords($o.find('span:first').html(), answers[i])) {
      isVerify = false;
      $o.removeClass('is-success').addClass('is-danger');
    } else {
      $o.removeClass('is-danger').addClass('is-success');
    }
  }
  return isVerify;
}

function verifyTableCells ($cells, answers, showAnswer) {
  var isVerify = true;
  for (var i = $cells.length; i-- > 0;) {
    var $o = $cells.eq(i);
    if (showAnswer === true) {
      $o.removeClass('is-empty').addClass('is-filled').removeClass('is-success').addClass('is-danger');
      $o.find('span').remove();
      $o.append('<span>' + answers[i] + '</span>')
      continue;
    }
    if (!isEqualWords($cells.eq(i).find('span:first').html(), answers[i])) {
      isVerify = false;
      $o.removeClass('is-success').addClass('is-danger');
    } else {
      $o.removeClass('is-danger').addClass('is-success');
    }
  }
  return isVerify;
}

function verifyDragDropRelations ($draggables, $droppables, answers, showAnswer) {
  if (showAnswer === true) {
    for (var i = 0, n = answers.length; i < n; i++) {
      var $draggable, $droppable;
      for (var j = $draggables.length; j-- > 0;) {
        if (answers[i][0] === $draggables.eq(j).find('span:first').text()) {
          $draggable = $draggables.eq(j);
          break;
        }
      }
      for (var j = $droppables.length; j-- > 0;) {
        if (answers[i][1] === $droppables.eq(j).find('span:first').text()) {
          $droppable = $droppables.eq(j);
          break;
        }
      }
      if ($draggable && $droppable) {
        updateDragDropItem($draggable, $droppable);
        $draggable.removeClass('is-success').addClass('is-danger');
        $droppable.removeClass('is-success').addClass('is-danger');
      }
    }
    resizeDragDropItems();
    return undefined;
  }
  var isVerify = true;
  for (var i = 0, n = Math.min($draggables.length, $droppables.length); i < n; i++) {
    var $draggable = $draggables.eq(i),
        $droppable = $droppables.eq(i),
        dragtitle = $draggable.find('span:first').text(),
        droptitle = $droppable.find('span:first').text(),
        isFind = false;
    for (var j = answers.length; j-- > 0;) {
      if (answers[j][0] === dragtitle && answers[j][1] === droptitle) {
        isFind = true;
        break;
      }
    }
    if (isFind) {
      $draggable.removeClass('is-danger').addClass('is-success');
      $droppable.removeClass('is-danger').addClass('is-success');
    } else {
      isVerify = false;
      $draggable.removeClass('is-success').addClass('is-danger');
      $droppable.removeClass('is-success').addClass('is-danger');
    }
  }
  return isVerify;
}

angular.module('TaskApp', [])

.filter('trusthtml', function ($sce) {
  return function (html) {
    return $sce.trustAsHtml(html);
  }
})

.filter('trustsrc', function ($sce) {
  return function (src) {
    return $sce.trustAsResourceUrl(str);
  };
})

.filter('editor', function () {
  var WORDINPUT = '<input class="editor-input" type="text" autocomplete="off" size="{0}" value="{1}">';
  var COMBOBOX = '<span class="editor-combobox"><span>Выбрать</span><ul>{0}</ul></span>'
  return function (str) {
    var input, pos, cnd, ind, cnds = str.match(/{([^}]*)}/g) || [], cndsInd = cnds.length;
    while (cndsInd--) {
      var pos = -1,
          cnd = cnds[cndsInd],
          ind = cnd.replace(/[{}]+/g, ''),
          input = WORDINPUT.format('1', '');
      if (ind && ind.indexOf('|') !== -1) {
        input = COMBOBOX.format('<li>' + ind.split('|').join('</li><li>') + '</li>');
      }
      if (ind && ind.indexOf('|') === -1) {
        input = WORDINPUT.format(ind.length, ind);
      }
      str = str.split(cnd).join(input);
    }
    return str;
  };
})

.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
})

.run(function ($rootScope) {
  angular.extend($rootScope, {
    Array: function (ind) {
      return $.map(Array(ind), function (o, i) {
        return i;
      });
    },
    contains: function (list, value) {
      if (angular.isArray(list)) {
        for (i = list.length; i-- > 0;) {
          if (list[i] === value) {
            return true;
          }
        }
        return false;
      }
      return false;
    },
    normalizeTableCells: (function () {
      var cache = {};
      return function (cells, cols) {
        var key = angular.toJson({cells: cells, cols: cols});
        if (cache[key]) {
          return cache[key];
        }
        if (!cells || !cells.length) {
          cache[key] = [];
          return cache[key];
        }
        var row = [],
            rows = [row];
        for (var i = 0, n = cells.length; i < n; i++) {
          if (row.length === cols) {
            row = [];
            rows.push(row);
          }
          row.push(cells[i]);
        }
        cache[key] = rows;
        return cache[key];
      };
    })()
  });
})

.controller('TaskAppCtrl', function ($scope, $filter) {
  try {
    $scope.data = angular.fromJson(win['TASKDATA']) || {};
  } catch (err) {
    $scope.data = {};
  }

  var defaultList = angular.copy($scope.data.list || []);

  $scope.answer = {
    selectedIds: [],
    textfield: '',
    characteristics: {}
  };

  angular.element('.b-testcard.hidden').removeClass('hidden');

  function dragdropRelations () {
    $('.b-testcard__body-answers__columns:first').find('ul').each(setMinHeight).find('li').each(savePosition).each(setPosition);
    $('.b-testcard__body-answers__columns-left li').draggable({
      containment: '.b-testcard__container',
      cursor: 'pointer',
      revert: function (o) {
        return !o;
      },
      start: function (evt, ui) {
        $(evt.target).removeClass('ui-draggable-selecting').siblings().removeClass('ui-draggable-selecting');
      },
      stop: function (evt, ui) {
        $(evt.target).removeClass('ui-draggable-selecting').siblings().removeClass('ui-draggable-selecting');
      }
    });
    $('.b-testcard__body-answers__columns-right li').droppable({
      accept: '.b-testcard__body-answers__columns-left li',
      activeClass: 'ui-state-hover',
      hoverClass: 'ui-state-active',
      tolerance: 'pointer',
      drop: function (evt, ui) {
        updateDragDropItem(ui.draggable, $(this));
        resizeDragDropItems();
        $scope.hasAnswer = !$('.b-testcard__body-answers__columns-left li:not(.is-primary)').length || !$('.b-testcard__body-answers__columns-right li:not(.is-primary)').length;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      },
    });
  }

  function dragdropTable () {
    var currentDropable = null;
    $('.b-testcard__body-answers__columns:first').find('ul').each(setMinHeight).find('li').each(savePosition).each(setPosition);
    $('.b-testcard__body li').draggable({
      containment: '.b-testcard__container',
      cursor: 'pointer',
      //revert: true,
      snap: '.b-testcard__body td.is-empty',
      snapMode : 'inner',
      snapTolerance: 4,
      stop: function (evt, ui) {
        var originalPosition = ui.helper.data('originalPosition') || ui.originalPosition;
        ui.helper.animate(originalPosition);
      }
    });
    $('.b-testcard__body td.is-empty').droppable({
      accept: '.b-testcard__body li',
      activeClass: 'ui-state-hover',
      hoverClass: 'ui-state-active',
      tolerance: 'pointer',
      drop: function (evt, ui) {
        ui.draggable.css('opacity', 1);
        ui.draggable.addClass('hidden');
        $(this).data('uiDraggable', {
          draggable: ui.draggable,
          pos: {
            top: parseInt(ui.draggable.css('top')),
            left: parseInt(ui.draggable.css('left'))
          },
          cur: {
            x: evt.pageX,
            y: evt.pageY
          }
        }).droppable('disable').removeClass('is-empty').addClass('is-filled');
        $scope.hasAnswer = true;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      },
      over: function (evt, ui) {
        currentDropable = this;
        ui.draggable.css('opacity', 0);
        $(this).append('<span>' + ui.draggable.text() + '</span>');
      },
      out: function (evt, ui) {
        if (currentDropable === this) {
          ui.draggable.css('opacity', 1);
        }
        $(this).removeClass('is-filled').addClass('is-empty').find('span').remove();
      }
    }).each(function (i, o) {
      $(o).mousedown(function (evt) {
        var ui = $(this).data('uiDraggable');
        $(this).data('uiDraggable', null);
        if (!ui) {
          return undefined;
        }
        var uiDraggable = ui.draggable.data('uiDraggable'),
            position = uiDraggable ? uiDraggable._generatePosition(evt) || ui.pos : ui.pos;
            cur = {
              x: evt.pageX,
              y: evt.pageY
            };
        currentDropable = this;
        evt.type = 'mousedown.draggable';
        evt.target = ui.draggable[0];
        $(this).droppable('enable');
        ui.draggable.removeClass('hidden').css({
          'opacity': 0,
          top: position.top + 'px',
          left: position.left + 'px'
        });
        ui.draggable.trigger(evt);
      });
    });
  }

  function listSorting () {
    $('.b-testcard__body-answers__columns:first').find('ol').each(setMinHeight).sortable({
      containment: '.b-testcard__container',
      cursor: 'pointer',
      update: function (evt, ui) {
        var $items = $(this).find('li');
        for (var i = 0, n = $items.length; i < n; i++) {
          var text = $items.eq(i).find('span:first').text();
          for (var j = $scope.data.list.length; j-- > 0;) {
            if ($scope.data.list[j] === text) {
              if (i !== j) {
                var el = $scope.data.list.splice(j, 1)[0];
                $scope.data.list.splice(i < j ? i : i - 1, 0, el);
              }
              break;
            }
          }
        }
        $scope.hasAnswer = true;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    }).disableSelection();
  }

  function editorOnClick (evt, onlyHide) {
    if (onlyHide) {
      return $('.b-testcard__body-question:first span.editor-combobox').removeClass('is-open');
    }

    if ($scope.isMakeAnswer) {
      return undefined;
    }

    evt.stopPropagation();
    var $target = $(evt.target);
    if ($target.is('span')) {
      return $target.closest('span.editor-combobox').toggleClass('is-open').siblings('span.editor-combobox').removeClass('is-open');
    }
    var answer = $target.html(),
        index = $target.prevAll('li').length,
        $combobox = $target.parents('span.editor-combobox:first'),
        $comboboxes = $combobox.parent().find('span.editor-combobox');
    $combobox.data('selectedIndex', index).removeClass('is-open').addClass('is-selected').find('span:first').html(answer);

    $comboboxes.each(function (i, o) {
      $(o).find('li').show();
    }).each(function (i, o) {
      var ind = $(o).data('selectedIndex');
      if (typeof ind === 'number') {
        $comboboxes.each(function (i, o) {
          $(o).find('li').eq(ind).hide();
        });
      }
    });

    $scope.selectAnswer(answer, index);
    $scope.hasAnswer = true;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  }

  function editorOnKeyup (evt) {
    $scope.hasAnswer = true;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  }

  function onChangeCharacteristics (nv, ov) {
    if (nv === ov) {
      return undefined;
    }
    $scope.hasAnswer = true;
    for (var i = 0, n = $scope.data.answer.length; i < n; i++) {
      var a = $scope.data.answer[i];
      for (var j = 0, m = a.values.length; j < m; j++) {
        if (!$scope.answer.characteristics[i + '' + j]) {
          $scope.hasAnswer = false;
          break;
        }
      }
      if (!$scope.hasAnswer) {
        break;
      }
    }
  }

  function onBodyKeydown (evt) {
    if (evt.ctrlKey && evt.keyCode === 39) {
      $scope.nextQuestion();
    }
  }

  $scope.completeTest = function () {
    try {
      $scope.complete = angular.fromJson(win['COMPLETEDATA']) || {};
    } catch (err) {
      $scope.data = undefined;
      $scope.result = undefined;
      $scope.complete = undefined;
    }
  };

  $scope.repeatQuestion = function () {
    if ($scope.data.editor) {
      $('.b-testcard__body-question:first div:first').html($filter('editor')($scope.data.editor));
    }

    switch ($scope.data.type) {
      case 'input-characteristics':
        $scope.answer.characteristics = {};
        break;
      case 'relations':
        var $draggables = $('.b-testcard__body-answers__columns-left:first').find('li').draggable('enable'),
            $droppables = $('.b-testcard__body-answers__columns-right:first').find('li').droppable('enable'),
            css = {marginTop: '16px', position: 'relative', top: 'auto', left: 'auto'};
        for (var i = $draggables.length; i-- > 0;) {
          $draggables.eq(i).removeClass('is-primary').removeClass('is-success').removeClass('is-danger').css(css).find('span:first').text($scope.data.draggables[i]);
        }
        for (var i = $droppables.length; i-- > 0;) {
          $droppables.eq(i).removeClass('is-primary').removeClass('is-success').removeClass('is-danger').css(css).find('span:first').text($scope.data.droppables[i]);
        }
        $('.b-testcard__body-answers__columns:first').find('li').each(savePosition).each(setPosition);
        break;
      case 'drag-and-drop-table':
        $('.b-testcard__body-answers__columns:first').find('li').removeClass('hidden').draggable('enable');
        $('.b-testcard__body-question:first').find('td.is-editable').each(function (i, o) {
          $(o).droppable('enable').removeClass('is-filled').addClass('is-empty').removeClass('is-danger').removeClass('is-success').find('span').remove();
        });
        break;
      case 'list-sorting':
        $('.b-testcard__body-answers__columns:first').find('ol').sortable('enable');
        $scope.data.list = angular.copy(defaultList);
        break;
    }

    $scope.answer.selectedIds.splice(0, $scope.answer.selectedIds.length);
    $scope.answer.textfield = '';
    $scope.isCorrectAnswer = undefined;
    $scope.needShowAnswer = false;
    $scope.isMakeAnswer = false;
    $scope.hasAnswer = false;
  };

  $scope.nextQuestion = function () {
    if ($scope.data.next) {
      win.location.assign($scope.data.next);
    } else {
      try {
        $scope.result = angular.fromJson(win['RESULTDATA']) || {};
      } catch (err) {
        $scope.data = undefined;
        $scope.result = undefined;
      }
    }
  };

  $scope.firstskipQuestion = function () {
    if ($scope.result.first) {
      win.location.assign($scope.result.first);
    }
  };

  $scope.isSelectedAnswer = function (index) {
    for (var i = $scope.answer.selectedIds.length; i-- > 0;) {
      if ($scope.answer.selectedIds[i] === index) {
        return true;
      }
    }
    return false;
  };

  $scope.showAnswer = function () {
    switch ($scope.data.type) {
      case 'text-field':
        $scope.answer.textfield = $scope.data.answer;
        break;
      case 'input-words':
        var $inputs = $('.b-testcard__body-question:first').find('input.editor-input'),
            $comboboxes = $('.b-testcard__body-question:first').find('span.editor-combobox');
        if ($inputs.length) {
          verifyEditorIntuts($inputs, $scope.data.answer, true);
        }
        if ($comboboxes.length) {
          verifyEditorComboboxes($comboboxes, $scope.data.answer, true);
        }
        break;
      case 'input-characteristics':
        for (var i = 0, n = $scope.data.answer.length; i < n; i++) {
          var a = $scope.data.answer[i];
          for (var j = 0, m = a.values.length; j < m; j++) {
            $scope.answer.characteristics[i + '' + j] = a.values[j];
          }
        }
        break;
      case 'relations':
        var $draggables = $('.b-testcard__body-answers__columns-left:first').find('li').draggable('disable'),
            $droppables = $('.b-testcard__body-answers__columns-right:first').find('li').droppable('disable');
        verifyDragDropRelations($draggables, $droppables, $scope.data.answer, true);
        break;
      case 'drag-and-drop-table':
        $('.b-testcard__body-answers__columns:first').find('li').draggable('disable');
        var $items = $('.b-testcard__body-question:first').find('td.is-editable').droppable('disable');
        verifyTableCells($items, $scope.data.answer, true);
        break;
      case 'list-sorting':
        $('.b-testcard__body-answers__columns:first').find('ol').sortable('disable');
        break;
    }

    $scope.answer.selectedIds.splice(0, $scope.answer.selectedIds.length);
    $scope.needShowAnswer = true;
    $scope.isCorrectAnswer = false;
    $scope.isMakeAnswer = true;
  };

  $scope.selectAnswer = function (answer, index) {
    if ($scope.isMakeAnswer) {
      return undefined;
    }
    switch ($scope.data.type) {
      case 'single-answer':
      case 'single-answer-with-images':
        $scope.answer.selectedIds.splice(0, $scope.answer.selectedIds.length, index);
        $scope.hasAnswer = true;
        break;
      case 'several-answers':
        if ($scope.isSelectedAnswer(index)) {
          for (var i = $scope.answer.selectedIds.length; i-- > 0;) {
            if ($scope.answer.selectedIds[i] === index) {
              $scope.answer.selectedIds.splice(i, 1);
            }
          }
        } else {
          if ($scope.answer.selectedIds.length < MAXSEVERALANSWERS) {
            $scope.answer.selectedIds.push(index);
          }
        }
        $scope.hasAnswer = !!$scope.answer.selectedIds.length;
        break;
      case 'input-words':
        $scope.hasAnswer = true;
        break;
    }
  };

  $scope.makeAnswer = function (evt) {
    if (evt && angular.isFunction(evt.preventDefault)) {
      evt.preventDefault();
    }

    $scope.isMakeAnswer = true;
    switch ($scope.data.type) {
      case 'single-answer':
      case 'single-answer-with-images':
        $scope.isCorrectAnswer = !!$scope.data.answers[$scope.answer.selectedIds[0]].isCorrect;
        break;
      case 'several-answers':
        $scope.isCorrectAnswer = true;
        for (var i = $scope.answer.selectedIds.length; i-- > 0;) {
          if (!$scope.data.answers[$scope.answer.selectedIds[i]].isCorrect) {
            $scope.isCorrectAnswer = false;
            break;
          }
        }
        break;
      case 'text-field':
        $scope.isCorrectAnswer = isEqualWords($scope.answer.textfield, $scope.data.answer);
        break;
      case 'input-words':
        var $inputs = $('.b-testcard__body-question:first').find('input.editor-input'),
            $comboboxes = $('.b-testcard__body-question:first').find('span.editor-combobox');
        if ($inputs.length) {
          $scope.isCorrectAnswer = verifyEditorIntuts($inputs, $scope.data.answer);
        }
        if ($comboboxes.length) {
          $scope.isCorrectAnswer = verifyEditorComboboxes($comboboxes, $scope.data.answer);
        }
        break;
      case 'input-characteristics':
        $scope.isCorrectAnswer = true;
        for (var i = 0, n = $scope.data.answer.length; i < n; i++) {
          var a = $scope.data.answer[i];
          for (var j = 0, m = a.values.length; j < m; j++) {
            if (a.values[j] != $scope.answer.characteristics[i + '' + j]) {
              $scope.isCorrectAnswer = false;
              break;
            }
          }
          if (!$scope.isCorrectAnswer) {
            break;
          }
        }
        break;
      case 'relations':
        var $draggables = $('.b-testcard__body-answers__columns-left:first').find('li').draggable('disable'),
            $droppables = $('.b-testcard__body-answers__columns-right:first').find('li').droppable('disable');
        $scope.isCorrectAnswer = verifyDragDropRelations($draggables, $droppables, $scope.data.answer);
        break;
      case 'drag-and-drop-table':
        $('.b-testcard__body-answers__columns:first').find('li').draggable('disable');
        var $items = $('.b-testcard__body-question:first').find('td.is-editable');
        if ($items.length !== $scope.data.answer.length) {
          $scope.isCorrectAnswer = false;
        } else {
          $scope.isCorrectAnswer = verifyTableCells($items, $scope.data.answer);
        }
        break;
      case 'list-sorting':
        $scope.isCorrectAnswer = true;
        var $items = $('.b-testcard__body-answers__columns:first').find('ol').sortable('disable').find('li');
        for (var i = $items.length; i-- > 0;) {
          if ($items.eq(i).find('span:first').text() !== $scope.data.answer[i]) {
            $scope.isCorrectAnswer = false;
            break;
          }
        }
        break;
      default:
        $scope.isCorrectAnswer = false;
        break;
    }
  };

  $scope.selectDraggableItem = function (evt, o) {
    $(evt.currentTarget).addClass('ui-draggable-selecting').siblings().removeClass('ui-draggable-selecting');
  };

  $scope.selectDroppableItem = function (evt, o) {
    var $target = $(evt.currentTarget),
        $draggable = $target.parents('.b-testcard__body-answers:first').find('.ui-draggable-selecting:first'),
        uiDroppable = $target.data('uiDroppable');
    if (!$draggable.length || !uiDroppable) {
      return undefined;
    }
    uiDroppable.options.drop.call($target, {}, {draggable: $draggable.removeClass('ui-draggable-selecting')});
  };

  if ($scope.data.type === 'text-field') {
    $scope.$on('$destroy', $scope.$watch('answer.textfield', function (nv, ov) {
      if (nv === ov) {
        return undefined;
      }
      $scope.hasAnswer = !!nv;
    }));
  }

  if ($scope.data.type === 'input-characteristics') {
    for (var i = 0, n = $scope.data.answer.length; i < n; i++) {
      var a = $scope.data.answer[i];
      for (var j = 0, m = a.values.length; j < m; j++) {
        $scope.$on('$destroy', $scope.$watch('answer.characteristics[' + i + '' + j + ']', onChangeCharacteristics));
      }
    }
  }

  if ($scope.data.editor) {
    var fn = function (evt) {
      editorOnClick(evt, true);
    };
    $(document.body).on('click', fn);
    $(document.body).on('click', 'span.editor-combobox', editorOnClick);
    $(document.body).on('keyup', 'input.editor-input', editorOnKeyup);
    $scope.$on('$destroy', function () {
      $(document.body).off('click', fn);
      $(document.body).off('click', 'span.editor-combobox', editorOnClick);
      $(document.body).off('keyup', 'input.editor-input', editorOnKeyup);
    });
  }

  $(document.body).on('keydown', 'input[type=number]', onKeydownOnlyNumbers);
  $scope.$on('$destroy', function () {
    $(document.body).off('keydown', 'input[type=number]', onKeydownOnlyNumbers);
  });

  $(document.body).on('keydown', onBodyKeydown);
  $scope.$on('$destroy', function () {
    $(document.body).off('keydown', onKeydownOnlyNumbers);
  });

  if ($scope.data.type === 'relations') {
    setTimeout(dragdropRelations, 0);
  }

  if ($scope.data.type === 'drag-and-drop-table') {
    setTimeout(dragdropTable, 0);
  }

  if ($scope.data.type === 'list-sorting') {
    setTimeout(listSorting, 0);
  }
})

;

})(this, jQuery);
