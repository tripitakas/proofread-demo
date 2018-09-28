/*
 * proofread.js
 *
 * Date: 2018-9-19
 */

// 设置异文提示信息
function setNotSameTips() {
    if ($('#variants').hasClass('variants-highlight')) {
        var current = $('.current-not-same');
        var idx = $('.current-not-same').length == 0 ? 0 : $('.pfread .right .not-same').index(current) + 1;
        var counts = $('.pfread .right .not-same').length;
        $('#not-same-info').text(idx + ' / ' + counts);
    } else {
        var current = $('.current-not-same');
        var idx = $('.current-not-same').length == 0 ? 0 : $('.pfread .right .diff').index(current) + 1;
        var counts = $('.pfread .right .diff').length;
        $('#not-same-info').text(idx + ' / ' + counts);
    }
}

// 高亮一行中字组元素对应的字框
function highlightBox($span) {
    var $line = $span.parent(), $block = $line.parent();
    var block_no = parseInt($block.attr('id').replace(/^.+-/, ''));
    var line_no = parseInt($line.attr('id').replace(/^.+-/, ''));
    var char_no;
    var boxes = $.cut.findCharsByLine(block_no, line_no, char_no);

    $.cut.toggleBox(false);
    $.cut.switchCurrentBox(boxes.length && boxes[0].shape);
}

$(document).ready(function () {
    // 根据json生成html
    var contentHtml = "";
    var diffCounts = 0, variantCounts = 0;
    var curBlockNo = 0, curLineNo = 0;
    function genHtmlByJson(item) {
        var cls;
        if (item.block_no != curBlockNo) {
            if (item.block_no != 1) {
                contentHtml += "</ul>";
            }
            contentHtml += "<ul class= 'block' id='block-" + item.block_no + "'>";
            curBlockNo = item.block_no;
        }
        if (item.line_no != curLineNo) {
            if (item.line_no != 1) {
                contentHtml += "</li>";
            }
            cls = item.type == 'emptyline' ? 'line emptyline' : 'line';
            contentHtml += "<li class='" + cls + "' id='line-" + item.line_no + "'>";
            curLineNo = item.line_no;
        }
        if (item.type == 'same') {
            contentHtml += "<span contenteditable='false' class='same' ocr='" + item.ocr +
              "' cmp='" + item.ocr + "'>" + item.ocr + "</span>";
        } else if (item.type == 'diff') {
            cls = item.ocr == '' ? 'not-same diff emptyplace' : 'not-same diff';
            contentHtml += "<span contenteditable='false' class='" + cls + "' ocr='" + item.ocr +
              "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
            diffCounts++;
        } else if (item.type == 'variant') {
            contentHtml += "<span contenteditable='false' class='not-same variant' ocr='" + item.ocr +
              "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
            variantCounts++;
        } else if (item.type == 'emptyline') {
            //contentHtml += "</li>";
        }
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
    // 如果是异体字且当前异体字状态是隐藏，则直接返回
    if ($(this).hasClass('variant') && !$(this).hasClass('variant-highlight'))
        return;
    $("#pfread-dialog-cmp").text($(this).attr("cmp"));
    $("#pfread-dialog-ocr").text($(this).attr("ocr"));
    $("#pfread-dialog-slct").text("");
    $("#pfread-dialog").offset({ top: $(this).offset().top + 40, left: $(this).offset().left - 4 });
    $("#pfread-dialog").show();
    e.stopPropagation();

    // 设置当前异文
    $('.not-same').removeClass('current-not-same');
    $(this).addClass('current-not-same');

    // 隐藏当前可编辑同文
    $(".current-span").attr("contenteditable", "false");
    $(".current-span").removeClass("current-span");

    // 设置异文提示信息
    setNotSameTips();
    highlightBox($(this));
});

// 单击同文，显示当前span
$(document).on('click', '.same', function () {
    $(".same").removeClass("current-span");
    $(this).addClass("current-span");
    highlightBox($(this));
});

// 双击同文，设置可编辑
$(document).on('dblclick', '.same', function () {
    $(".same").attr("contenteditable", "false");
    $(this).attr("contenteditable", "true");
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
        $(".current-span").attr("contenteditable", "false");
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
    if ($('#variants').hasClass('variants-highlight')) {
        var current = $('.current-not-same');
        var idx = $('.pfread .right .not-same').index(current);
        if (idx < 1) return;
        $('.pfread .right .not-same').eq(idx - 1).click();
    } else {
        var current = $('.current-not-same');
        var idx = $('.pfread .right .diff').index(current);
        if (idx < 1) return;
        $('.pfread .right .diff').eq(idx - 1).click();
    }
    // 设置异文提示信息
    setNotSameTips();
});


// 下一条异文
$(document).on('click', '.btn-next', function () {
    if ($('#variants').hasClass('variants-highlight')) {
        var current = $('.current-not-same');
        var idx = $('.pfread .right .not-same').index(current);
        $('.pfread .right .not-same').eq(idx + 1).click();
    } else {
        var current = $('.current-not-same');
        var idx = $('.pfread .right .diff').index(current);
        $('.pfread .right .diff').eq(idx + 1).click();
    }
    // 设置异文提示信息
    setNotSameTips();
});

// 删除该行
$(document).on('click', '.btn-deleteline', function () {
    if ($('.current-span').length == 0) {
        return;
    }
    $currentLine = $(".current-span").parent(".line");
    $currentLine.fadeOut(500).fadeIn(500);
    if ($currentLine.text().trim() == '') {
        setTimeout(function () { $currentLine.remove() }, 1100);
    } else {
        setTimeout(function () { $currentLine.addClass('delete') }, 1100);
    }
});

// 向上增行
$(document).on('click', '.btn-addupline', function (e) {
    if ($('.current-span').length == 0) {
        return;
    }
    $currentLine = $(".current-span").parent(".line");
    $(".current-span").removeClass("current-span");
    var newline = "<li class='line'><span contenteditable='true' class='same add current-span'>&nbsp;</span></lis>";
    $currentLine.before(newline);
    e.stopPropagation();
});

// 向下增行
$(document).on('click', '.btn-adddownline', function (e) {
    if ($('.current-span').length == 0) {
        return;
    }
    $currentLine = $(".current-span").parent(".line");
    $(".current-span").removeClass("current-span");
    var newline = "<li class='line'><span contenteditable='true' class='same add current-span'>&nbsp;</span></lis>";
    $currentLine.after(newline);
    e.stopPropagation();
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
