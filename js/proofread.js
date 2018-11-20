/*
 * proofread.js
 *
 * Date: 2018-9-19
 */

// 设置异文提示信息
function setNotSameTips() {
    var current = $('.current-not-same');
    var notSameCount = $('.current-not-same').length;
    var idx, counts;

    if ($('#variants').hasClass('variants-highlight')) {
        idx = notSameCount === 0 ? 0 : $('.pfread .right .not-same').index(current) + 1;
        counts = $('.pfread .right .not-same').length;
        $('#not-same-info').text(idx + ' / ' + counts);
    } else {
        idx = notSameCount === 0 ? 0 : $('.pfread .right .diff').index(current) + 1;
        counts = $('.pfread .right .diff').length;
        $('#not-same-info').text(idx + ' / ' + counts);
    }
}

// 高亮一行中字组元素对应的字框
function highlightBox($span, first) {
    var $line = $span.parent(), $block = $line.parent();
    var block_no = parseInt($block.attr('id').replace(/^.+-/, ''));
    var line_no = parseInt($line.attr('id').replace(/^.+-/, ''));
    var offset0 = first ? 0 : getCursortPosition($span[0]);
    var offset = offset0 + parseInt($span.attr('offset'));
    var ocr = ($span.attr('ocr') || '')[offset0];
    var cmp = ($span.attr('cmp') || '')[offset0];

    // 根据文字的栏列号匹配到字框的列，然后根据文字精确匹配列中的字框
    var boxes = $.cut.findCharsByLine(block_no, line_no, function(ch) {
        return ch === ocr || ch === cmp;
    });
    // 行内多字能匹配时就取位置最接近，不亮显整列
    if (boxes.length > 1) {
        var minNo = 10;
        $.cut.findCharsByLine(block_no, line_no, function(ch, box) {
            if (ch === ocr || ch === cmp) {
                if (minNo > Math.abs(offset + 1 - box.char_no)) {
                    minNo = Math.abs(offset + 1 - box.char_no);
                    boxes[0] = box;
                }
            }
        });
    }

    $.cut.toggleBox(false);
    $.cut.removeBandNumber(0, true);

    var all = boxes = $.cut.findCharsByLine(block_no, line_no);
    if (!boxes.length) {
        // 无法精确匹配，就按字序号匹配，并显示整列字框
        boxes = offset < boxes.length ? boxes.slice(offset) : [];
        if (!boxes.length || boxes[0].ch !== ocr && boxes[0].ch !== cmp) {
            console.log('box: ' + (boxes.length && boxes[0].ch) + 'ocr: ' + ocr + 'cmp: ' + cmp);
            all.forEach(function(box) {
                $(box.shape.node).show();
            });
        }
    }
    all.forEach(function(box, i) {
        $.cut.showBandNumber(box, i + 1, box.ch);
    });
    $.cut.switchCurrentBox(boxes.length && boxes[0].shape);
}

// 获取当前光标位置
function getCursortPosition(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel, range, preCaretRange;

    if (typeof win.getSelection !== 'undefined') {      // 谷歌、火狐
        sel = win.getSelection();
        if (sel.rangeCount > 0) {                       // 选中的区域
            range = win.getSelection().getRangeAt(0);
            caretOffset = range.startOffset;
            // preCaretRange = range.cloneRange();         // 克隆一个选中区域
            // preCaretRange.selectNodeContents(element);  // 设置选中区域的节点内容为当前节点
            // preCaretRange.setEnd(range.endContainer, range.endOffset);  // 重置选中区域的结束位置
            // caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type !== 'Control') {    // IE
        range = sel.createRange();
        preCaretRange = doc.body.createTextRange();
        preCaretRange.moveToElementText(element);
        preCaretRange.setEndPoint('EndToEnd', range);
        caretOffset = preCaretRange.text.length;
    }
    return caretOffset;
}

$(document).ready(function () {
    // 根据json生成html
    var contentHtml = "";
    var diffCounts = 0, variantCounts = 0;
    var curBlockNo = 0, curLineNo = 0;
    var adjustLineNo = 0, offset = 0;

    function genHtmlByJson(item) {
        var cls;
        if (item.block_no !== curBlockNo) {
            if (item.block_no !== 1) {
                contentHtml += "</ul>";
            }
            contentHtml += "<ul class= 'block' id='block-" + item.block_no + "'>";
            curBlockNo = item.block_no;
            adjustLineNo = 0;
        }
        if (item.line_no !== curLineNo) {
            if (item.line_no !== 1) {
                contentHtml += "</li>";
            }
            cls = item.type === 'emptyline' ? 'line emptyline' : 'line';
            contentHtml += "<li class='" + cls + "' id='line-" + (item.line_no - adjustLineNo) + "'>";
            curLineNo = item.line_no;
            offset = 0;
        }
        if (item.type === 'same') {
            contentHtml += "<span contentEditable='false' class='same' ocr='" + item.ocr +
              "' cmp='" + item.ocr + "' offset=" + offset + ">" + item.ocr + "</span>";
        } else if (item.type === 'diff') {
            cls = item.ocr === '' ? 'not-same diff emptyplace' : 'not-same diff';
            contentHtml += "<span contentEditable='false' class='" + cls + "' ocr='" + item.ocr +
              "' cmp='" + item.cmp + "' offset=" + offset + ">" + item.ocr + "</span>";
            diffCounts++;
        } else if (item.type === 'variant') {
            contentHtml += "<span contentEditable='false' class='not-same variant' ocr='" + item.ocr +
              "' cmp='" + item.cmp + "' offset=" + offset + ">" + item.ocr + "</span>";
            variantCounts++;
        } else if (item.type === 'emptyline') {
            adjustLineNo++;
        }
        offset += item.ocr ? item.ocr.length : 0;
    }

    cmpdata.segments.forEach(genHtmlByJson);
    contentHtml += "</li></ul>";
    $('#sutra-text').html(contentHtml);
    
    // 设置异文提示信息
    $('#not-same-info').attr('title', '异文' + diffCounts + '，异体字' + variantCounts);
    setNotSameTips();
});

// 单击异文
$(document).on('click', '.not-same', function (e) {
    e.stopPropagation();
    highlightBox($(this), true);

    // 如果是异体字且当前异体字状态是隐藏，则直接返回
    if ($(this).hasClass('variant') && !$(this).hasClass('variant-highlight')) {
        return;
    }
    $("#pfread-dialog-cmp").text($(this).attr("cmp"));
    $("#pfread-dialog-ocr").text($(this).attr("ocr"));
    $("#pfread-dialog-slct").text("");
    $("#pfread-dialog").offset({ top: $(this).offset().top + 40, left: $(this).offset().left - 4 });
    $("#pfread-dialog").show();

    // 设置当前异文
    $('.not-same').removeClass('current-not-same');
    $(this).addClass('current-not-same');

    // 隐藏当前可编辑同文
    $(".current-span").attr("contentEditable", "false");
    $(".current-span").removeClass("current-span");

    // 设置异文提示信息
    setNotSameTips();
});

// 单击同文，显示当前span
$(document).on('click', '.same', function () {
    $(".same").removeClass("current-span");
    $(this).addClass("current-span");
    highlightBox($(this));
});

// 双击同文，设置可编辑
$(document).on('dblclick', '.same', function () {
    $(".same").attr("contentEditable", "false");
    $(this).attr("contentEditable", "true");
});


// 单击文本区的空白区域
$(document).on('click', '.pfread .right .bd', function (e) {
    // 隐藏对话框
    var _con1 = $('#pfread-dialog');
    if (!_con1.is(e.target) && _con1.has(e.target).length === 0) {
        $("#pfread-dialog").offset({ top: 0, left: 0 });
        $("#pfread-dialog").hide();
    }
    // 取消当前可编辑同文 
    var _con2 = $('.current-span');
    if (!_con2.is(e.target) && _con2.has(e.target).length === 0) {
        $(".current-span").attr("contentEditable", "false");
        $(".current-span").removeClass("current-span");
    }
});

// 滚动文本区滚动条
$('.pfread .right .bd').scroll(function () {
    $("#pfread-dialog").offset({ top: 0, left: 0 });
    $("#pfread-dialog").hide();
});

// -- 对话框 --
$(document).on('click', '#pfread-dialog-ocr, #pfread-dialog-cmp', function () {
    $('.current-not-same').text($(this).text());
    if ($(this).text() === '') {
        $('.current-not-same').addClass('emptyplace');
    } else {
        $('.current-not-same').removeClass('emptyplace');
    }
    $('#pfread-dialog-slct').text($(this).text());
});



// -- 导航条 --
// 上一条异文
$(document).on('click', '.btn-previous', function () {
    var current = $('.current-not-same');
    var idx;
    if ($('#variants').hasClass('variants-highlight')) {
        idx = $('.pfread .right .not-same').index(current);
        if (idx < 1) {
            return;
        }
        $('.pfread .right .not-same').eq(idx - 1).click();
    } else {
        idx = $('.pfread .right .diff').index(current);
        if (idx < 1) {
            return;
        }
        $('.pfread .right .diff').eq(idx - 1).click();
    }
    // 设置异文提示信息
    setNotSameTips();
});


// 下一条异文
$(document).on('click', '.btn-next', function () {
    var current = $('.current-not-same');
    var idx;
    if ($('#variants').hasClass('variants-highlight')) {
        idx = $('.pfread .right .not-same').index(current);
        $('.pfread .right .not-same').eq(idx + 1).click();
    } else {
        idx = $('.pfread .right .diff').index(current);
        $('.pfread .right .diff').eq(idx + 1).click();
    }
    // 设置异文提示信息
    setNotSameTips();
});

// 删除该行
$(document).on('click', '.btn-deleteline', function () {
    if ($('.current-span').length === 0) {
        return;
    }
    var $currentLine = $(".current-span").parent(".line");
    $currentLine.fadeOut(500).fadeIn(500);
    if ($currentLine.text().trim() === '') {
        setTimeout(function () { $currentLine.remove() }, 1100);
    } else {
        setTimeout(function () { $currentLine.addClass('delete') }, 1100);
    }
});

// 向上增行
$(document).on('click', '.btn-addupline', function (e) {
    e.stopPropagation();
    if ($('.current-span').length === 0) {
        return;
    }
    var $currentLine = $(".current-span").parent(".line");
    $(".current-span").removeClass("current-span");
    var newline = "<li class='line'><span contentEditable='true' class='same add current-span'>&nbsp;</span></lis>";
    $currentLine.before(newline);
});

// 向下增行
$(document).on('click', '.btn-adddownline', function (e) {
    e.stopPropagation();
    if ($('.current-span').length === 0) {
        return;
    }
    var $currentLine = $(".current-span").parent(".line");
    $(".current-span").removeClass("current-span");
    var newline = "<li class='line'><span contentEditable='true' class='same add current-span'>&nbsp;</span></lis>";
    $currentLine.after(newline);
});

// 隐藏异体字
$(document).on('click', '.btn-variants-highlight', function () {
    $('.variant').removeClass("variant-highlight");
    $(this).removeClass("btn-variants-highlight");
    $(this).addClass("btn-variants-normal");
    // 设置异文提示信息
    setNotSameTips();
});
// 显示异体字
$(document).on('click', '.btn-variants-normal', function () {
    $('.variant').addClass("variant-highlight");
    $(this).removeClass("btn-variants-normal");
    $(this).addClass("btn-variants-highlight");
    // 设置异文提示信息
    setNotSameTips();

});
// 隐藏空位符
$(document).on('click', '.btn-emptyplaces-show', function () {
    // 隐藏所有空位符
    $('.emptyplace').addClass("hidden");
    // 修改按钮状态
    $(this).removeClass("btn-emptyplaces-show");
    $(this).addClass("btn-emptyplaces-hidden");
});
// 显示空位符
$(document).on('click', '.btn-emptyplaces-hidden', function () {
    $('.emptyplace').removeClass("hidden");
    $(this).removeClass("btn-emptyplaces-hidden");
    $(this).addClass("btn-emptyplaces-show");
});
// 缩小画布
$(document).on('click', '.btn-reduce', function () {
  if ($.cut.data.ratio > 0.5) {
    $.cut.setRatio($.cut.data.ratio * 0.9);
  }
});
// 放大画布
$(document).on('click', '.btn-enlarge', function () {
  if ($.cut.data.ratio < 5) {
    $.cut.setRatio($.cut.data.ratio * 1.5);
  }
});
