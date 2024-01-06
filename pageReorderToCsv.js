// ==UserScript==
// @name         pageReorderToCsv
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  单页种子体积升序排序后导出
// @author       https://github.com/yqhapi
// @match        https://*/torrents.php
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
let tableHeaders = [
    "标题",
    "评论",
    "发布时间",
    "体积",
    "做种",
    "下载",
    "完成",
    "发布者",
];
const button = document.createElement("button");
button.innerHTML = "打印";
button.style.position = "fixed";
button.style.right = "10px";
button.style.top = "50%";
button.style.transform = "translateY(-50%)";
button.addEventListener("click", function () {
    let csvContent = arrayToCSV(getTorrentsInfo(), tableHeaders);
    let blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pageTorrentsSizeAsc.csv");
    link.click();
});
document.body.appendChild(button);

function arrayToCSV(data, headers) {
    let csvContent = "";
    if (headers) {
        csvContent += headers.join(",") + "\r\n";
    }
    data.forEach(function (rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
    return csvContent;
}

function getTorrentsInfo() {
    let tds = document
        .querySelector(".torrents")
        .querySelectorAll("td.rowfollow");
    let infoArray = Array.from({
            length: 100,
        },
        () => Array(8)
    );
    let infoIndex = 0;
    for (let i = 0; i < tds.length; i++) {
        if (tds[i].innerText === "") {
            continue;
        }
        infoArray[Math.floor(infoIndex / 8)][infoIndex % 8] =
            tds[i].textContent.trim();
        infoIndex++;
    }
    infoArray.sort((a,b)=>{
        let sizeA = convertToKB(a[3]);
        let sizeB = convertToKB(b[3]);

        return sizeA - sizeB;
    })
    return infoArray;
}

function convertToKB(size) {
    let parts = size.split(/([0-9.]+)/);
    let number = parseFloat(parts[1]);
    let unit = parts[2].trim();

    switch(unit) {
        case 'TB':
            return number * 1024 * 1024 * 1024;
        case 'GB':
            return number * 1024 * 1024;
        case 'MB':
            return number * 1024;
        case 'KB':
            return number;
        default:
            return number;
    }
}