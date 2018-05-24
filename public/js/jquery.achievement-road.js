;(function (win, $) {
  var defaultOptions = {
    strokeStyle: '#49bb6c',
    disableStrokeStyle: '#e5e5e5'
  };

  function getpos ($o) {
    var pos = $o.position(),
        width = $o.outerWidth();
    return {
      x: pos.left + (width >> 1),
      y: pos.top + (width >> 1),
      isDisabled: $o.hasClass('disabled')
    };
  }

  function Plugin (el, options) {
    this.options = options || {};
    this.$el = $(el);
    this.$canvas = this.$el.find('canvas:first');
    this.canvas = this.$canvas.length ? this.$canvas[0] : undefined;
    this.context = this.canvas ? this.canvas.getContext('2d') : undefined;
    this.$steps = this.$el.find('[data-achievement-road-step]');
    this.$steps.sort(function (a, b) {
      var ai = +a.getAttribute('data-achievement-road-step'),
          bi = +b.getAttribute('data-achievement-road-step');
      if (!isFinite(ai) || !isFinite(bi)) {
        return 0;
      }
      return ai === bi ? 0 : ai > bi ? 1 : -1;
    });
    if (this.context) {
      this.render();
    }
  }

  Plugin.prototype.render = function () {
    if (!this.context) {
      return undefined;
    }
    this.canvas.width = this.$canvas.width();
    this.canvas.height = this.$canvas.height();
    for (var i = 0, n = this.$steps.length - 1; i < n; i++) {
      var p1 = getpos(this.$steps.eq(i)),
          p2 = getpos(this.$steps.eq(i + 1));
      this.context.beginPath();
      this.context.moveTo(p1.x + .5, p1.y + .5);
      this.context.lineTo(p2.x + .5, p2.y + .5);
      this.context.lineWidth = 2;
      this.context.strokeStyle = p1.isDisabled || p2.isDisabled ? this.options.disableStrokeStyle : this.options.strokeStyle;
      this.context.stroke();
      this.context.closePath();
    }
  };

  $.fn.achievementRoad = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data('achievement-road');

      if (!data) {
        data = new Plugin(this, $.extend({}, defaultOptions, $.isPlainObject(options) ? options : {}));
        $this.data('achievement-road', data);
      }
      if (typeof options == 'string') {
        data[options].call($this);
      }
    })
  }

  $.fn.achievementRoad.Constructor = Plugin;
})(this, jQuery);
