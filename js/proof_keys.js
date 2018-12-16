/* global $ */
(function() {
  'use strict';

  var highlightBox;

  $.extend($.cut, {
    bindMatchingKeys: function() {
      var self = this;
      var data = self.data;
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
      self.onBoxChanged(function(info, box, reason) {
        oldChar[0] = box && info.shape.data('order');
        oldChar[1] = box && (info.shape.data('text') || info.shape.data('char')) || '';
        oldChar[2] = info;
        $('#order').val(oldChar[0] || '');

        if (reason === 'navigate') {
          var curId = info && info.shape && info.shape.data('cid') || '?';
          for (var cid in data.texts) {
            if (data.texts.hasOwnProperty(cid)) {
              var rect = data.texts[cid][0];
              rect.attr({
                stroke: cid !== curId ? 'rgba(0,0,0,.1)'
                  : self.rgb_a(data.changedColor, data.boxOpacity),
                fill: cid !== curId ? 'none' : self.rgb_a(data.hoverFill, 0.2)
              });
            }
          }
        }
      });

      // 改变字框的行内字序号
      $('#order').change(function(event) {
        var order = parseInt($('#order').val());
        var info = oldChar[2];

        event.preventDefault();

        if (order && info && info.shape) {
          if (order !== oldChar[0]) {
            // 清除原来字框的关联信息
            var last = self.findCharByData('order', order);
            if (last) {
              self.removeBandNumber(last);
              last.char_no = oldChar[0] || 0;
              if (!last.char_no) {
                last.line_no = 0;
              }
            }
            // 更新当前字框的关联信息
            self.removeBandNumber(info);
            oldChar[0] = order;
            info.char_no = order;
            info.block_no = $.cut.data.block_no;
            info.line_no = $.cut.data.line_no;
            if (highlightBox) {
              highlightBox();
              $.cut.switchCurrentBox(info.shape);
            }
          }
        }
      });
    },

    // 显示当前列字框的浮动文字面板
    showFloatingPanel: function(chars, content, refresh) {
      var box, offset;
      var self = this;
      var data = self.data;
      var s = data.ratio;
      highlightBox = refresh;

      // 计算字框的并集框、平移距离
      chars.forEach(function(c) {
        var p = c.shape && c.shape.getBBox();
        if (p) {
          if (!box) {
            box = $.extend({}, p);
          } else {
            box.x = Math.min(box.x, p.x);
            box.y = Math.min(box.y, p.y);
            box.x2 = Math.max(box.x2, p.x2);
            box.y2 = Math.max(box.y2, p.y2);
          }
        }
      });
      if (box) {
        box.width = box.x2 - box.x;
        offset = box.width + 15;
        box.x += offset;
      }

      // 显示浮动面板
      if (chars.length) {
        data.bandNumberBox = data.paper.rect(box.x - 5, box.y - 5, box.width + 10, box.y2 - box.y + 10)
          .attr({fill: '#fff', stroke: 'rgba(0,0,0,.1)'});
      }
      // 显示每个字框的浮动序号框
      chars.forEach(function(c, i) {
        var el = c.shape;
        var p = el && el.getBBox();
        var text = content(c, i);
        if (p) {
          el.data('order', c.char_no);
          el.data('text', text);
          data.texts = data.texts || {};
          data.texts[el.data('cid')] = data.texts[el.data('cid')] || [
              data.paper.rect(p.x + offset, p.y, p.width, p.height)
                .attr({stroke: 'rgba(0,0,0,.1)'}),
              data.paper.text(p.x + p.width / 2 + offset, p.y + p.height / 2, '' + text)
                .attr({'font-size': 11 * s, 'text-align': 'center'}),
              data.paper.rect(p.x, p.y, p.width, p.height)
                .attr({stroke: 'rgba(0,0,0,.2)'})
            ]
        }
      });
    },

    removeBandNumber: function (char, all) {
      var data = this.data;
      if (!char) {
        if (all && data.bandNumberBox) {
          data.bandNumberBox.remove();
          delete data.bandNumberBox;
        }
        return all && data.chars.forEach(function (c) {
            if (c.shape) {
              $.cut.removeBandNumber(c);
            }
          });
      }
      var el = char.shape;
      var arr = el && (data.texts || {})[el.data('cid')];
      if (arr) {
        delete data.texts[char.shape.data('cid')];
        arr.forEach(function (p) {
          p.remove();
        });
        var text = el.data('text');
        el.removeData('order');
        el.removeData('text');
        return text;
      }
    }
  });
}());
