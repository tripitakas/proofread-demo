/*
 * proofread.js
 *
 * Date: 2018-9-19
 */

$(document).ready(function () {
    // 根据json生成html
    var contentHtml = "";
    var diffCounts = 0;
    var variantCounts = 0;
    function genHtmlByJson(item) {
        var editable = 'false';
        if (item.type == 'same') {
            contentHtml += "<span contenteditable='" + editable + "' class='same' ocr='" + item.ocr + "' cmp='" + item.ocr + "'>" + item.ocr + "</span>";
        } else if (item.type == 'diff') {
            contentHtml += "<span contenteditable='" + editable + "' class='not-same diff' ocr='" + item.ocr + "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
            diffCounts++;
        } else if (item.type == 'variant') {
            contentHtml += "<span contenteditable='" + editable + "' class='not-same variant variant-hidden' ocr='" + item.ocr + "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
            variantCounts++;
        } else if (item.type == 'newline') {
            contentHtml += "<span class='newline'> <br> </span>";
        }
    }
    cmpdata.txt.forEach(genHtmlByJson);
    $('#sutra-text').html(contentHtml);
    // console.log(diffCounts + '|' + variantCounts);
    $('#variants-info').attr('title', '异文' + diffCounts + '，异体字' + variantCounts);
    $('#variants-info').text('0 / ' + (diffCounts + variantCounts));
});

// 单击异文
$(document).on('click', '.not-same', function (e) {
    // 如果是异体字且当前异体字状态是隐藏，则直接返回
    if ($(this).hasClass('variant') && $(this).hasClass('variant-hidden'))
        return;
    $("#pfread-dialog-cmp").text($(this).attr("cmp"));
    $("#pfread-dialog-ocr").text($(this).attr("ocr"));
    $("#pfread-dialog-slct").text("");
    $("#pfread-dialog").offset({ top: $(this).offset().top + 40, left: $(this).offset().left });
    $("#pfread-dialog").show();
    e.stopPropagation();

    // 设置当前异文
    $('.not-same').removeClass('current-not-same');
    $(this).addClass('current-not-same');

    // 隐藏当前可编辑同文
    $(".current-span").attr("contenteditable", "false");
    $(".current-span").removeClass("current-span");
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

// 单击空白区域
$(document).click(function (e) {
    var _con1 = $('#pfread-dialog'); // 对话框
    if (!_con1.is(e.target) && _con1.has(e.target).length === 0) {
        // 清空对话框坐标并隐藏
        $("#pfread-dialog").offset({ top: 0, left: 0 });
        $("#pfread-dialog").hide();
    }
    var _con2 = $('.current-span'); // 当前可编辑同文  
    if (!_con2.is(e.target) && _con2.has(e.target).length === 0) {
        // 清空当前可编辑同文
        $(".current-span").attr("contenteditable", "false");
        $(".current-span").removeClass("current-span");
    }
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
    // Todo

});

// 下一条异文
$(document).on('click', '.next', function () {
    // Todo

});

// 删除该行
$(document).on('click', '.deleteline', function () {
    if ($('.current-span').length == 0) {
        return;
    }
    var current = $('.current-span').first();
    var cursor = current;
    while (!cursor.hasClass('newline')) {
        cursor.addClass('delete');
        cursor = cursor.prev();
    }
    cursor = current;
    while (!cursor.hasClass('newline')) {
        cursor.addClass('delete');
        cursor = cursor.next();
    }
    cursor.addClass('delete');

});

// 向上增行
$(document).on('click', '.addupline', function (e) {
    if ($('.current-span').length == 0) {
        return;
    }
    var cursor = $('.current-span').first();
    while (!cursor.hasClass('newline')) {
        cursor = cursor.prev();
    }
    $(".current-span").removeClass("current-span");
    var newline = "<span contenteditable='true' class='same current-span'>&nbsp;</span><span class='newline'><br></span>";
    cursor.after(newline);
    e.stopPropagation();
});

// 向下增行
$(document).on('click', '.adddownline', function (e) {
    if ($('.current-span').length == 0) {
        return;
    }
    var cursor = $('.current-span').first();
    while (!cursor.hasClass('newline')) {
        cursor = cursor.next();
    }
    $(".current-span").removeClass("current-span");
    var newline = "<span contenteditable='true' class='same current-span'>&nbsp;</span><span class='newline'><br></span>";
    cursor.after(newline);
    e.stopPropagation();
});

// 显隐异体字
$(document).on('click', '.variants-show', function () {
    $('.variant').addClass("variant-hidden");
    $(this).removeClass("variants-show");
    $(this).addClass("variants-hidden");
});
$(document).on('click', '.variants-hidden', function () {
    $('.variant').removeClass("variant-hidden");
    $(this).removeClass("variants-hidden");
    $(this).addClass("variants-show");
});
// 显隐空位符
$(document).on('click', '.emptyplaces-show', function () {
    $('.emptyplace').addClass("emptyplace-hidden");
    $(this).removeClass("emptyplaces-show");
    $(this).addClass("emptyplaces-hidden");
});
$(document).on('click', '.emptyplaces-hidden', function () {
    $('.emptyplace').removeClass("emptyplace-hidden");
    $(this).removeClass("emptyplaces-hidden");
    $(this).addClass("emptyplaces-show");
});