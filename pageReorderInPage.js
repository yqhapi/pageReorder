// ==UserScript==
// @name         pageReorderInPage
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  将当前页面的种子按照体积大小升序排序后重新显示
// @author       https://github.com/yqhapi
// @match        https://*/torrents.php*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
var torrentsTable = document.querySelector(".torrents");
var rows = Array.from(torrentsTable.rows);
var header = rows.shift();
const rowNumber = rows.length;
const colNumber = rows[0].cells.length;
const button = document.createElement("button");
button.innerHTML = "排序";
button.style.position = "fixed";
button.style.right = "10px";
button.style.top = "50%";
button.style.transform = "translateY(-50%)";
button.addEventListener("click", function () {
    sortTableBySize(getTorrentsInfo());
});
document.body.appendChild(button);


function getTorrentsInfo() {
    let infoArray = Array.from({
            length: rowNumber,
        },
        () => Array(colNumber)
    );
    for (let i = 0; i < (rowNumber*colNumber); i++) {
        infoArray[Math.floor(i / colNumber)][i % colNumber] =
            rows[Math.floor(i / colNumber)].cells[i % colNumber].textContent.trim();
    }
    infoArray.sort((a,b)=>{
        let sizeA = convertToKB(a[4]);
        let sizeB = convertToKB(b[4]);

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

function sortTableBySize(torrentsInfoArray) {
    var rowMap = {};
    rows.forEach(function(row) {
        var titleInHtml = row.cells[1].textContent.trim();
        rowMap[titleInHtml] = row;
    });

    torrentsInfoArray.forEach(function(item){
        var sizeInArray = item[1];
        var row = rowMap[sizeInArray];
        if(row){
            torrentsTable.appendChild(row);
        }
    });
}
