/*
 * proofread.js
 *
 * Date: 2018-9-19
 */
$(document).ready(function () {
    // 根据json生成html
    var contentHtml = "";
    function genHtmlByJson(item) {
        var editable = 'false';
        if (item.type == 'same') {
            contentHtml += "<span contenteditable='" + editable + "' class='same' ocr='" + item.ocr + "' cmp='" + item.ocr + "'>" + item.ocr + "</span>";
        } else if (item.type == 'diff') {
            contentHtml += "<span contenteditable='" + editable + "' class='diff' ocr='" + item.ocr + "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
        } else if (item.type == 'variant') {
            contentHtml += "<span contenteditable='" + editable + "' class='variant' ocr='" + item.ocr + "' cmp='" + item.cmp + "'>" + item.ocr + "</span>";
        } else if (item.type == 'newline') {
            contentHtml += "<span class='newline'> <br> </span>";
        }
    }
    cmpdata.txt.forEach(genHtmlByJson);
    $('#sutra-text').html(contentHtml);
});

// click diff
$(document).on('click', '.diff, .variant', function (e) {
    e.stopPropagation();
    $("#pfread-dialog-cmp").text($(this).attr("cmp"));
    $("#pfread-dialog-ocr").text($(this).attr("ocr"));
    $("#pfread-dialog").offset({ top: $(this).offset().top + 40, left: $(this).offset().left });
    $("#pfread-dialog").show();
});

// click same
$(document).on('dblclick', '.same', function () {
    $(".same").removeClass("current");
    $(this).addClass("current");
    $(this).attr("contenteditable", "true");
});

// click empty
$(document).click(function (e) {
    var _con = $('#pfread-dialog'); // 设置目标区域  
    if (!_con.is(e.target) && _con.has(e.target).length === 0) {
        $("#pfread-dialog").hide();
        $(".current").attr("contenteditable", "false");
    }
});

// show/hide
$(document).on('click', '.variants', function () {
    $('.variant').css("color", "black");
    $('.variant').addClass("varianthidden");
    $(this).removeClass("variants");
    $(this).addClass("variantshidden");
});
$(document).on('click', '.variantshidden', function () {
    $('.variant').css("color", "blue");
    $(this).removeClass("variantshidden");
    $(this).addClass("variants");
});
$(document).on('click', '.emptyplace', function () {
    $(this).removeClass("emptyplace");
    $(this).addClass("emptyplacehidden");
});
$(document).on('click', '.emptyplacehidden', function () {
    $(this).removeClass("emptyplacehidden");
    $(this).addClass("emptyplace");
});