/* global $ */
(function() {
  'use strict';

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
        $('#char').val(oldChar[1]);

        if (reason === 'navigate') {
          for (var cid in data.texts) {
            if (data.texts.hasOwnProperty(cid)) {
              var rect = data.texts[cid][0];
              rect.attr({
                stroke: cid !== info.shape.data('cid') ? 'rgba(0,0,0,.1)'
                  : self.rgb_a(data.changedColor, data.boxOpacity)
              });
            }
          }
        }
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
              self.unionBandNumbers();
              applyChar(order, char);
            }
          } else {
            // 改变了字序号，就将新序号相应的字框对应到原序号上
            var last = self.findCharByData('order', order);
            var oldText = last && self.removeBandNumber(last);
            if (oldText) {
              last.char_no = oldChar[0] || 0;
              if (last.char_no) {
                applyChar(last.char_no, oldText);
              } else {
                last.line_no = 0;
              }
              self.showBandNumber(last, oldChar[0], oldText);
            }

            // 更新当前字框的关联信息
            self.removeBandNumber(info);
            self.showBandNumber(info, order, char);
            self.unionBandNumbers();
            oldChar[0] = order;
            info.char_no = order;
            info.block_no = $.cut.data.block_no;
            info.line_no = $.cut.data.line_no;
            applyChar(order, char);
          }
          oldChar[1] = char;
        }
      });

      // 将图文匹配校对结果应用到当前行
      function applyChar(order, char) {
        var $block = $('#block-' + $.cut.data.block_no);
        var $line = $block.find('#line-' + $.cut.data.line_no);

        $line.find('span[offset]').each(function(i, el) {
          var $span = $(this);
          var text = $span.text().replace(/\s/g, '');
          var offset = parseInt($span.attr('offset'));
          if (order > offset && order <= offset + text.length) {
            text = text.split('');
            text[order - offset - 1] = char;
            $span.text(text.join(''));
            // TODO: 如果span原来有空格，会丢失空格，可能需要重新填充空格
          }
        });
      }
    },

    // 显示当前列字框的浮动文字面板
    showFloatingPanel: function(chars, content) {
      var box, offset;
      var self = this;
      var data = self.data;
      var s = data.ratio;

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
      box.width = box.x2 - box.x;
      offset = box.width + 15;

      // 显示浮动面板
      box.x += offset;
      data.bandNumberBox = data.paper.rect(box.x - 5, box.y - 5, box.width + 10, box.y2 - box.y + 10)
        .attr({fill: '#fff', stroke: 'rgba(0,0,0,.05)', 'stroke-width': 0.5});
      // 显示每个字框的浮动序号框
      chars.forEach(function(c, i) {
        var el = c.shape;
        var p = el && el.getBBox();
        var text = content(c, i);
        if (p) {
          el.data('text', text);
          data.texts = data.texts || {};
          data.texts[el.data('cid')] = data.texts[el.data('cid')] || [
              data.paper.rect(p.x + offset, p.y, p.width, p.height)
                .attr({stroke: 'rgba(0,0,0,.1)'}),
              data.paper.text(p.x + p.width / 2 + offset, p.y + p.height / 2, '' + text)
                .attr({'font-size': 11 * s, 'text-align': 'center'})]
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
