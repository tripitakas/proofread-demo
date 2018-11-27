/* global $ */
(function() {
  'use strict';

  $.extend($.cut, {
    bindMatchingKeys: function() {
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

      // 响应字框的变化，记下当前字框的关联信息
      self.onBoxChanged(function(info, box) {
        oldChar[0] = box && info.shape.data('order');
        oldChar[1] = box && (info.shape.data('text') || info.shape.data('char')) || '';
        oldChar[2] = info;
        $('#order').val(oldChar[0] || '');
        $('#char').val(oldChar[1]);
      });

      // 改变字框的行内字序号和文字
      $('#change-order').on('submit', function (event) {
        var order = parseInt($('#order').val());
        var char = $('#char').val();
        var info = oldChar[2];

        event.preventDefault();

        if (order && char && info && info.shape) {
          if (order === oldChar[0]) {
            if (oldChar[1] !== char) {    // 只改了字
              self.removeBandNumber(info);
              self.showBandNumber(info, order, char);
              applyChars();
            }
          } else {
            // 改变了字序号，就将新序号相应的字框对应到原序号上
            var last = self.findCharByData('order', order);
            var oldText = last && self.removeBandNumber(last);
            if (oldText) {
              self.showBandNumber(last, oldChar[0], oldText);
            }

            // 更新当前字框的关联信息
            self.removeBandNumber(info);
            self.showBandNumber(info, order, char);
            oldChar[0] = order;
            applyChars();
          }
          oldChar[1] = char;
        }
      });

      // 将图文匹配校对结果应用到当前行
      function applyChars() {
        var chars = self.data.chars.filter(function (c) {
          return c.shape && c.shape.data('order');
        });
        chars.sort(function(a, b) {
          return a.shape.data('order') - b.shape.data('order');
        });
        chars = chars.map(function (c) {
          return c.shape.data('text');
        }).join('');
        console.log(chars); // TODO: 去改变当前行的文字
      }
    }
  });
}());
