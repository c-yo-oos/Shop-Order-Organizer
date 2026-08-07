const fileInput = document.getElementById("csv-file");
const fileText = document.getElementById("file-text");
const tableBody = document.getElementById("table-body");
const copyBtn = document.getElementById("copy-btn");
const dropZone = document.getElementById("drop-zone");
const loadingScreen = document.getElementById("loading-screen");
const toast = document.getElementById("toast");
const orderCount = document.getElementById("order-count");
const productCount = document.getElementById("product-count");
const itemCount = document.getElementById("item-count");
const searchInput = document.getElementById("search-input");

const tableHeaders = document.querySelectorAll("#output-table th");
const filterButtons = document.querySelectorAll(".filter-btn");

let toastTimer;
let sortColumn = -1;
let sortAscending = true;
let currentFilter = "all";

fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    showLoading();

    fileText.textContent = "✓ " + file.name;
    dropZone.classList.add("success");

    const reader = new FileReader();

    reader.onload = function (e) {
        processCSV(e.target.result);
        setTimeout(() => {
            hideLoading();
            showToast("Orders imported successfully.");
        }, 300);
    };

    reader.readAsText(file);
});

function shortenProductName(productName) {
    const products = {
        "Rose Butiki": "Rose Butiki",
        "Jasmine Butiki": "Jasmine Butiki",
        "Lemon Butiki": "Lemon Butiki",
        "Wawang Rose": "Wawang Rose",
        "Wawang Jasmine": "Wawang Jasmine",
        "Wawang Lemon": "Wawang Lemon",
        "Wawang Katol": "Wawang Katol",
        "Baolilai": "Baolilai",
        "Racumin": "Racumin",
        "Crosspoint Baby Wipes": "Crosspoint Baby Wipes",
        "Penguin Giant Steel Wool": "Penguin Steel Wool"
    };

    for (const key in products) {

        if (productName.includes(key)) {
            return products[key];
        }

    }
    return productName;
}

searchInput.addEventListener("input", function () {
    searchOrders();
});

filterButtons.forEach(function(button){
    button.addEventListener("click", function(){
        filterButtons.forEach(function(btn){
            btn.classList.remove("active");
        })
        button.classList.add("active");
        currentFilter = button.dataset.filter;
        searchOrders();
    });
});

tableHeaders.forEach(function (header) {

    header.addEventListener("click", function () {

        const column = Number(header.dataset.column);

        sortTable(column);

    });

});

function searchOrders(){
    const searchText = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#table-body tr");

    rows.forEach(function(row){
        const rowText = row.textContent.toLowerCase();
        const option = row.cells[3].textContent.trim();

        let matchesSearch = rowText.includes(searchText);

        let matchesFilter =
            currentFilter === "all" ||
            option === currentFilter;

        if(matchesSearch && matchesFilter){
            row.style.display = "";
        }
        else{
            row.style.display = "none";
        }
    });
}

function sortTable(column){
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.sort(function (a, b){
        const textA = a.cells[column].textContent.trim().toLowerCase();
        const textB = b.cells[column].textContent.trim().toLowerCase();

        if(!isNaN(textA) && !isNaN(textB)){
            return Number(textA) - Number(textB);
        }
        return textA.localeCompare(textB);
    });

    if(sortColumn === column){
        sortAscending = !sortAscending;
    }
    else{
        sortAscending = true;
    }

    sortColumn = column;

    if(!sortAscending){
        rows.reverse();
    }
    tableBody.innerHTML = "";
    rows.forEach(function (row){
        tableBody.appendChild(row);
    });
    updateSortIcons();
}

function updateSortIcons() {
    tableHeaders.forEach(function (header) {
        const column = Number(header.dataset.column);
        header.classList.remove("active-sort");

        let title = header.textContent
            .replace(" ▲", "")
            .replace(" ▼", "");

        if (column === sortColumn) {
            header.classList.add("active-sort");

            if (sortAscending) {
                header.textContent = title + " ▲";
            }
            else {
                header.textContent = title + " ▼";
            }

        }
        else {
            header.textContent = title;
        }

    });

}

function showLoading(){
    loadingScreen.classList.add("show");
}

function hideLoading(){
    loadingScreen.classList.remove("show");
}

function showToast(message){
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function processCSV(text) {

    const lines = text.split(/\r?\n/);

    if (lines.length < 2) {
        showToast("The file appears to be empty.");
        return;
    }

    const headers = parseCSVLine(lines[0]);

    const orderIdIndex = headers.findIndex(header =>
        header.toLowerCase().includes("order id")
    );

    const productNameIndex = headers.findIndex(header =>
        header.toLowerCase().includes("product name")
    );

    const quantityIndex = headers.findIndex(header =>
        header.toLowerCase().includes("quantity")
    );

    const variationIndex = headers.findIndex(header =>
        header.toLowerCase() === "variation"
    );

    if (orderIdIndex === -1 || productNameIndex === -1) {
        showToast("Invalid TikTok Shop CSV.");
        return;
    }

    let rows = "";
    let totalOrders = 0;
    let totalItems = 0;
    let uniqueProducts = [];

    for (let i = 1; i < lines.length; i++) {

        if (!lines[i].trim()) {
            continue;
        }

        const columns = parseCSVLine(lines[i]);

        if (columns.length <= Math.max(orderIdIndex, productNameIndex)) {
            continue;
        }

        const orderId = columns[orderIdIndex]
            .replace(/['"=]/g, "")
            .trim();

        const productName = shortenProductName(
        columns[productNameIndex].trim()
        );

        const quantity = quantityIndex !== -1
            ? columns[quantityIndex].trim()
            : "1";

        const variation = variationIndex !== -1
            ? columns[variationIndex].trim()
            : "N/A";

        totalOrders++;
        totalItems += Number(quantity);

        if (!uniqueProducts.includes(productName)){
            uniqueProducts.push(productName);
        }
        
            
        rows += `
            <tr>
                <td><strong>${orderId}</strong></td>
                <td>${productName}</td>
                <td>${quantity}</td>
                <td>${variation}</td>
            </tr>
        `;
    }

    tableBody.innerHTML = rows;

    searchOrders();

    orderCount.textContent = totalOrders;
    productCount.textContent = uniqueProducts.length;
    itemCount.textContent = totalItems;

    copyBtn.classList.add("show");
}

function parseCSVLine(text) {

    let value = "";
    let columns = [];
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const character = text[i];

        if (character === '"') {
            insideQuotes = !insideQuotes;
        }
        else if (character === "," && !insideQuotes) {
            columns.push(value);
            value = "";
        }
        else {
            value += character;
        }
    }

    columns.push(value);

    return columns;
}

function copyTableToClipboard() {

    const rows = document.querySelectorAll("#table-body tr");

    let clipboardText = "";

    rows.forEach(function (row) {

        const cells = row.querySelectorAll("td");

        if (cells.length < 2) {
            return;
        }

        const rowText = Array.from(cells)
            .map(cell => cell.textContent.trim())
            .join("\t");

        clipboardText += rowText + "\n";
    });

    navigator.clipboard.writeText(clipboardText)
        .then(function () {
            showToast("Data copied to clipboard.");
        })
        .catch(function () {
            showToast("Failed to copy the data.");
        });
}