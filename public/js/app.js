;(function (win, $) {
  $.extend(Chart.defaults.global, {
    animation: false,
    showTooltips: false,
  });
  $.extend(Chart.defaults.Line, {
    bezierCurve: false,
    scaleShowVerticalLines: false
  });

  var defaultChartLine = {
    fillColor: 'rgba(140, 180, 154, .2)',
    strokeColor: '#49bb6c',
    pointColor: '#fff',
    pointStrokeColor: '#49bb6c',
    pointHighlightFill: '#49bb6c',
    pointHighlightStroke: '#49bb6c'
  };

  function jqData ($o, dataname) {
    var data = $o.data(dataname);
    data = typeof data === 'string' ? data.replace(/\s/g, '').replace(/\'/g, '"') : data;
    if (typeof data === 'string') {
      try {
        data = $.parseJSON(data);
      } catch (err) {
        data = {};
      }
    }
    return data;
  }

  $(function () {
    if (win.Waves) {
      Waves.init();
      $('[data-waves]').each(function (i, o) {
        var effects = o.getAttribute('data-waves');
        effects = effects ? effects.split(' ') : [];
        if (effects.length) {
          Waves.attach(o, effects);
        }
      });
    }

    $('[data-chart]').each(function (i, o) {
      var $o = $(o),
          data = jqData($o, 'chart'),
          options = jqData($o, 'chart-options');

      for (var key in data.datasets) {
        if (data.datasets.hasOwnProperty(key)) {
          $.extend(data.datasets[key], defaultChartLine);
        }
      }

      switch (data.type) {
        case 'line':
          return new Chart(o.getContext('2d')).Line(data, options);
      }
    });

    $('[data-achievement-road]').each(function (i, o) {
      var deferreds = [];
      $(o).find('img').each(function (i, o) {
        var deferred = $.Deferred();
        deferreds.push(deferred);
        var img = new Image();
        img.onload = function () {
          deferred.resolve(o);
        };
        img.onerror = function () {
          deferred.resolve(o);
        };
        img.src = o.src;
      });
      $.when.apply($, deferreds).done(function () {
        $(o).achievementRoad();
      });
    });

    $(document.body).on('click', '[data-toggle-block]', function (evt) {
      evt.preventDefault();
      var self = this,
          selector = $(self).data('toggle-block');
      if (selector) {
        var $o = $(selector);
        if (!$o.length) {
          return undefined;
        }
        var callback = function () {
          $(self).toggleClass('is-collapse', !$o.is(':visible'));
        };
        switch ($o.data('toggle-block-style')) {
          case 'slide-toggle':
            promise = $o.slideToggle(200, callback);
            callback = undefined;
            break;
          default:
            promise = $o.toggle();
        }
        if (callback) {
          callback();
        }
      }
    });

    $(document.body).on('click', '[data-dropdown]', (function () {
      $(document).on('click', function () {
        $('[data-dropdown]').removeClass('is-open');
      });

      return function (evt) {
        evt.stopPropagation();
        $('[data-dropdown]').not(this).removeClass('is-open');
        if ($(evt.target).closest('.b-dropdown__toggle').length) {
          evt.preventDefault();
          $(this).toggleClass('is-open');
        }
      };
    })());

    $(document.body).on('click', '[data-toggle-parent]', function (evt) {
      var $target = $(evt.target),
          toggle = $target.data('toggle-parent');
      if (toggle) {
        $target.parent().toggleClass(toggle);
      }
    });

    $(document.body).on('click', '[data-toggle-parent-delay]', function (evt) {
      var $target = $(evt.target),
          toggle = $target.data('toggle-parent-delay');
      if (toggle) {
        setTimeout(function () {
          $target.parent().toggleClass(toggle);
        }, 3000);
      }
    });

    $(document.body).on('click', '[data-toggle-tab]', function (evt) {
      evt.preventDefault();
      var self = this,
          selector = $(self).data('toggle-tab');
      $(self).addClass('active').siblings().removeClass('active');
      if (selector) {
        $(selector).each(function (i, o) {
          $(o).addClass('active').siblings().removeClass('active');
        });
      }
    });
  });
})(this, jQuery);
