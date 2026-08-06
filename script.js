const fileInput = document.getElementById("csv-file");
const fileText = document.getElementById("file-text");
const tableBody = document.getElementById("table-body");
const copyBtn = document.getElementById("copy-btn");
const dropZone = document.getElementById("drop-zone");
const loadingScreen = document.getElementById("loading-screen");
const toast = document.getElementById("toast");

let toastTimer;

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

    setTimeout(() => {
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