// ==UserScript==
// @name         pageReorderInPage
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  将torrents.php，userdetails.php中当前做种，getusertorrentlist.php的种子，按体积大小重排序后显示在页面
// @author       https://github.com/yqhapi
// @match        https://*/torrents.php*
// @match        https://*/browse.php*
// @match        https://*/getusertorrentlist.php*
// @match        https://*/userdetails.php*
// @match        https://*/movie.php*
// @match        https://*/music.php*
// @match        https://*/adult.php*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
var url = new URL(document.location.href);
var pathname = url.pathname;
var size_location; // 体积列
var sortOrder = "asc"; // 初始排序顺序为升序
var sjtu_show_flag = false; // 葡萄个人信息页面做种信息需要加载
if (pathname.includes("userdetails.php")) {
    if (url.hostname.includes(".im")) {
        var a = document.querySelector("a[href*='klappe']");
        a.click();
    } else if (url.hostname.includes("sjtu")) {
        sjtu_show_flag = true;
    } else {
        var a = document.querySelector("a[href*='seeding']");
        a.click(); // 显示当前做种
    }
}

const button = document.createElement("button");
button.innerHTML = "升序";
button.style.position = "fixed";
button.style.right = "10px";
button.style.top = "50%";
button.style.transform = "translateY(-50%)";
button.addEventListener("click", function () {
    if (sjtu_show_flag) {
        var a = document.querySelector("a[href*='klappe']");
        a.click();
        sjtu_show_flag = false;
    }
    sortOrder = (sortOrder === "asc") ? "desc" : "asc";
    button.innerHTML = (sortOrder === "asc") ? "升序" : "降序";
    getTorrentsInfo();
});
document.body.appendChild(button);

function getTorrentsInfo() {
    if (pathname.includes("getusertorrentlist.php")) { // 做种信息页面
        var torrentsTable = document.querySelector('table[border="1"]');
        if (url.hostname.includes("pter")) {
            size_location = 3;
        } else if (url.hostname.includes("school") || url.hostname.includes("52pt")) {
            size_location = 2;
        }
    } else if (pathname.includes("userdetails.php")) { // 个人信息页面
        if (url.hostname.includes(".im")) {
            var torrentsTable = document.querySelector('#ka2 table[border="1"]')
            size_location = 3;
        } else {
            var torrentsTable = document.querySelector('#ka1 table[border="1"]'); //#ka1 > table
            if (url.hostname.includes("pter") || url.hostname.includes("hdfans") || url.hostname.includes("soul") || url.hostname.includes("hdtime")) {
                size_location = 3;
            } else {
                size_location = 2;
            }
        }
    } else { // 种子页面
        if (url.hostname.includes(".im")) {
            var torrentsTable = document.querySelector("#torrent_table");
            size_location = 6;
        } else {
            var torrentsTable = document.querySelector(".torrents");
            size_location = 4;
        }
    }
    var rows = Array.from(torrentsTable.rows);
    var header = rows.shift();
    const rowNumber = rows.length;
    const colNumber = rows[0].cells.length;
    let infoArray = Array.from({
            length: rowNumber,
        },
        () => Array(colNumber)
    );
    for (let i = 0; i < (rowNumber * colNumber); i++) {
        infoArray[Math.floor(i / colNumber)][i % colNumber] =
            rows[Math.floor(i / colNumber)].cells[i % colNumber].textContent.trim();
    }
    infoArray.sort((a, b) => {
        let sizeA = convertToKB(a[size_location]);
        let sizeB = convertToKB(b[size_location]);

        return sortOrder === "asc" ? sizeB - sizeA : sizeA - sizeB;
    })
    var rowMap = {};
    rows.forEach(function (row) {
        var titleInHtml = row.cells[1].textContent.trim();
        rowMap[titleInHtml] = row;
    });

    infoArray.forEach(function (item) {
        var sizeInArray = item[1];
        var row = rowMap[sizeInArray];
        if (row) {
            torrentsTable.appendChild(row);
        }
    });
}

function convertToKB(size) {
    let parts = size.split(/([0-9.]+)/);
    let number = parseFloat(parts[1]);
    let unit = parts[2].trim();

    switch (unit) {
        case 'TB':
        case 'TiB':
            return number * 1024 * 1024 * 1024;
        case 'GB':
        case 'GiB':
            return number * 1024 * 1024;
        case 'MB':
        case 'MiB':
            return number * 1024;
        case 'KB':
        case 'KiB':
            return number;
        default:
            return number;
    }
}