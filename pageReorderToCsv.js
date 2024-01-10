// ==UserScript==
// @name         pageReorderToCsv
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  单页种子体积升序排序后导出
// @author       https://github.com/yqhapi
// @match        https://*/torrents.php*
// @match        https://*/browse.php*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
const domain = document.location.hostname;
if(document.location.hostname.includes("im")){
    var torrentsTable = document.querySelector("#torrent_table");
}else{
    var torrentsTable = document.querySelector(".torrents");
}
var rows = Array.from(torrentsTable.rows);
var header = rows.shift();
const rowNumber = rows.length;
const colNumber = rows[0].cells.length;
if(domain.includes("52")){
    var colSaveNumber = 9;
    var tableHeaders = [
        "标题",
        "评论",
        "发布时间",
        "体积",
        "做种",
        "下载",
        "完成",
        "未完成数",
        "发布者",
    ];
}else if(domain.includes("im")){
    var colSaveNumber = 9;
    var tableHeaders = [
        "标题",
        "文件数",
        "评论",
        "发布时间",
        "存活时间",
        "体积",
        "完成次数",
        "做种/下载",
        "上传者",
    ];
}else{
    var colSaveNumber = 8;
    var tableHeaders = [
        "标题",
        "评论",
        "发布时间",
        "体积",
        "做种",
        "下载",
        "完成",
        "发布者",
    ];
}
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
    let infoArray = Array.from({
            length: rowNumber,
        },
        () => Array(colSaveNumber)
    );
    let infoIndex = 0;
    for (let i = 0; i < (rowNumber*colNumber); i++) {
        if(rows[Math.floor(i / colNumber)].cells[i % colNumber].innerText === '' || rows[Math.floor(i / colNumber)].cells[i % colNumber].innerText === '-'){
            continue;
        }
        infoArray[Math.floor(infoIndex / colSaveNumber)][infoIndex % colSaveNumber] =
            rows[Math.floor(i / colNumber)].cells[i % colNumber].textContent.trim();
        infoIndex++;
    }
    if(domain.includes("im")){
        infoArray.sort((a,b)=>{
            let sizeA = convertToKB(a[6]);
            let sizeB = convertToKB(b[6]);
    
            return sizeA - sizeB;
        })
    }else{
        infoArray.sort((a,b)=>{
            let sizeA = convertToKB(a[4]);
            let sizeB = convertToKB(b[4]);
    
            return sizeA - sizeB;
        })
    }
    return infoArray;
}

function convertToKB(size) {
    let parts = size.split(/([0-9.]+)/);
    let number = parseFloat(parts[1]);
    let unit = parts[2].trim();

    switch(unit) {
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