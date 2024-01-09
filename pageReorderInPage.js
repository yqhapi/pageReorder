// ==UserScript==
// @name         单页种子体积升序排序
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
    let tds = document
        .querySelector(".torrents")
        .querySelectorAll("td.rowfollow");
    let infoArray = Array.from({
            length: rowNumber,
        },
        () => Array((colNumber-1))
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

function sortTableBySize(torrentsInfoArray) {
    var rowMap = {};
    rows.forEach(function(row) {
        var titleInHtml = row.cells[1].textContent.trim();
        rowMap[titleInHtml] = row;
    });

    torrentsInfoArray.forEach(function(item){
        var sizeInArray = item[0];
        var row = rowMap[sizeInArray];
        if(row){
            torrentsTable.appendChild(row);
        }
    });
}
