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

$(document).ready(function () {
    // 根据json生成html
    var contentHtml = "<ul><li class='line'>";
    var diffCounts = 0;
    var variantCounts = 0;
    function genHtmlByJson(item) {
        var editable = 'false';
        if (item.type == 'same') {
            contentHtml += "<span contenteditable='" + editable + "' class='same' ocr='" + item.ocr + "' cmp='" + item.ocr + "'>" + item.ocr + "</span>";
        } else if (item.type == 'diff') {
            var cls = item.ocr == '' ? 'not-same diff emptyplace' : 'not-same diff';
            contentHtml += "<span contenteditable='" + editable + "' class='" + cls + "' ocr='" + item.ocr + "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
            diffCounts++;
        } else if (item.type == 'variant') {
            contentHtml += "<span contenteditable='" + editable + "' class='not-same variant' ocr='" + item.ocr + "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
            variantCounts++;
        } else if (item.type == 'newline') {
            contentHtml += "</li><li class='line'>";
        }
    }
    cmpdata.txt.forEach(genHtmlByJson);
    contentHtml += "</li></ul>"
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
});

// 单击同文，显示当前span
$(document).on('click', '.same', function () {
    $(".same").removeClass("current-span");
    $(this).addClass("current-span");
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
$(document).on('click', '.previous', function () {
    if ($('#variants').hasClass('variants-highlight')) {
        var current = $('.current-not-same');
        var idx = $('.pfread .right .not-same').index(current);
        $('.pfread .right .not-same').eq(idx - 1).click();
    } else {
        var current = $('.current-not-same');
        var idx = $('.pfread .right .diff').index(current);
        $('.pfread .right .diff').eq(idx - 1).click();
    }
    // 设置异文提示信息
    setNotSameTips();
});


// 下一条异文
$(document).on('click', '.next', function () {
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
$(document).on('click', '.deleteline', function () {
    if ($('.current-span').length == 0) {
        return;
    }
    $currentLine = $(".current-span").parent(".line");
    $currentLine.fadeOut(500).fadeIn(500);
    setTimeout(function () { $currentLine.addClass('delete') }, 1100);
});

// 向上增行
$(document).on('click', '.addupline', function (e) {
    if ($('.current-span').length == 0) {
        return;
    }
    $currentLine = $(".current-span").parent(".line");
    $(".current-span").removeClass("current-span");
    var newline = "<li><span contenteditable='true' class='same add current-span'>&nbsp;</span></lis>";
    $currentLine.before(newline);
    e.stopPropagation();
});

// 向下增行
$(document).on('click', '.adddownline', function (e) {
    if ($('.current-span').length == 0) {
        return;
    }
    $currentLine = $(".current-span").parent(".line");
    $(".current-span").removeClass("current-span");
    var newline = "<li><span contenteditable='true' class='same add current-span'>&nbsp;</span></lis>";
    $currentLine.after(newline);
    e.stopPropagation();
});



// 隐藏异体字
$(document).on('click', '.variants-highlight', function () {
    $('.variant').removeClass("variant-highlight");
    $(this).removeClass("variants-highlight");
    $(this).addClass("variants-normal");
    // 设置异文提示信息
    setNotSameTips();
});
// 显示异体字
$(document).on('click', '.variants-normal', function () {
    $('.variant').addClass("variant-highlight");
    $(this).removeClass("variants-normal");
    $(this).addClass("variants-highlight");
    // 设置异文提示信息
    setNotSameTips();

});
// 隐藏空位符
$(document).on('click', '.emptyplaces-show', function () {
    // 隐藏所有空位符
    $('.emptyplace').addClass("hidden");
    // 修改按钮状态
    $(this).removeClass("emptyplaces-show");
    $(this).addClass("emptyplaces-hidden");
});
// 显示空位符
$(document).on('click', '.emptyplaces-hidden', function () {
    $('.emptyplace').removeClass("hidden");
    $(this).removeClass("emptyplaces-hidden");
    $(this).addClass("emptyplaces-show");
});

