/* global $ */
(function() {
  'use strict';

  $.extend($.cut, {
    bindKeys: function() {
      var self = this;
      var on = function(key, func) {
        $.mapKey(key, func, {direction: 'down'});
      };

      // 方向键：在字框间导航
      on('left', function() {
        self.navigate('left');
      });
      on('right', function() {
        self.navigate('right');
      });
      on('up', function() {
        self.navigate('up');
      });
      on('down', function() {
        self.navigate('down');
      });

      var oldChar = [0, '', 0];

      self.onBoxChanged(function(info, box) {
        oldChar[0] = box && info.shape.data('order');
        oldChar[1] = box && (info.shape.data('text') || info.shape.data('char')) || '';
        oldChar[2] = info;
        $('#order').val(oldChar[0] || '');
        $('#char').val(oldChar[1]);
      });

      $('#change-order').click(function () {
        var order = parseInt($('#order').val());
        var char = $('#char').val();
        var info = oldChar[2];

        if (order && char && info) {
          if (order === oldChar[0]) {
            if (oldChar[1] !== char) {
              self.removeBandNumber(info);
              self.showBandNumber(info, order, char);
            }
          } else {
            var last = self.findCharByData('order', order);
            var oldText = last && self.removeBandNumber(last);
            if (oldText) {
              self.showBandNumber(last, oldChar[0], oldText);
            }

            self.removeBandNumber(info);
            self.showBandNumber(info, order, char);
          }
        }
      });
    }
  });
}());
