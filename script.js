/* =========================
   Elements
========================= */

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
const noResults = document.getElementById("no-results");

const themeBtn = document.getElementById("theme-btn");

const shopBtn = document.getElementById("shop-btn");
const sheetBtn = document.getElementById("sheet-btn");

const shopPage = document.getElementById("shop-page");
const sheetPage = document.getElementById("sheet-page");

const tableHeaders = document.querySelectorAll("#output-table th");
const filterButtons = document.querySelectorAll(".filter-btn");


/* =========================
   Variables
========================= */

let toastTimer;

let sortColumn = -1;
let sortAscending = true;

let currentFilter = "all";

/* =========================
   Navigation
========================= */

shopBtn.addEventListener("click", function(){

    shopPage.style.display = "block";
    sheetPage.style.display = "none";

    shopBtn.classList.add("active");
    sheetBtn.classList.remove("active");

});


sheetBtn.addEventListener("click", function(){

    shopPage.style.display = "none";
    sheetPage.style.display = "block";

    sheetBtn.classList.add("active");
    shopBtn.classList.remove("active");

});

/* =========================
   CSV Upload
========================= */

function loadCSV(file){

    if(!file){
        return;
    }

    showLoading();

    fileText.textContent = "✓ " + file.name;

    dropZone.classList.add("success");

    const reader = new FileReader();

    reader.onload = function(e){

        processCSV(e.target.result);

        setTimeout(function(){

            hideLoading();

            showToast("Orders imported successfully.");

        }, 300);

    };

    reader.readAsText(file);

}


fileInput.addEventListener("change", function(e){

    loadCSV(e.target.files[0]);

});


/* =========================
   Drag & Drop
========================= */

dropZone.addEventListener("dragover", function(e){

    e.preventDefault();

});


dropZone.addEventListener("dragenter", function(){

    dropZone.classList.add("dragging");

});


dropZone.addEventListener("dragleave", function(){

    dropZone.classList.remove("dragging");

});


dropZone.addEventListener("drop", function(e){

    e.preventDefault();

    dropZone.classList.remove("dragging");

    loadCSV(e.dataTransfer.files[0]);

});


/* =========================
   Product Names
========================= */

function shortenProductName(productName){

    const products = {

        "Rose Butiki": "Rose Butiki",
        "Jasmine Butiki": "Jasmine Butiki",
        "Lemon Butiki": "Lemon Butiki",

        "Wawang Rose": "Wawang Rose",
        "Wawang Jasmine": "Wawang Jasmine",
        "Wawang Lemon": "Wawang Lemon",
        "Wawang Katol": "Wawang Katol",

        "S-0025": "S-0025",
        "S-608-M": "S-608-M",
        "S-0010": "S-0010",
        "S-0050": "S-0050",
        "S-0013": "S-0013",

        "Kingtab Floor Wax": "Kingtab Floor Wax",
        "TripleX Floor Wax": "TripleX Floor Wax",
        "Liwanag Floor Wax": "Liwanag Floor Wax",

        "Baolilai": "Baolilai",
        "Racumin": "Racumin",

        "Crosspoint Baby Wipes": "Crosspoint Baby Wipes",

        "Penguin Giant Steel Wool": "Penguin Steel Wool",
        "Black Vinyl/Nitrile Blend Gloves": "Black Vinyl Gloves",
        "Heavy Duty Cotton Mop": "Cotton Mop",
        "Hot Plate Portable Electric Stove": "Hotplate",
        "Dinosaurs Heavy Duty Floor Polishing Scrub": "Foot Bright",
        "Dinosaurs Heavy Duty Scrubbing Pad": "Dino Scrub Pad",

        "Green Live Thick Mouse": "Gree Live Thick Mouse",
        "Kamoi Fly Paper Adhesive": "Kamoi",
        "Think Stick Mouse & Rat Trap": "Thin Sticky Mouse Trap",
        "[Large] Heavey Duty Metal Rat Cage": "Large Metal Rat Cage",
        "[Medium] Heavey Duty Metal Rat Cage": "Medium Metal Rat Cage",
        "[Small] Heavey Duty Metal Rat Cage": "Small Metal Rat Cage",

        "3 Days Altar Candle": "3 Days Candle",
        "7 Days Altar Candle": "7 Days Candle",
        "Jumbo Altar Candle": "Jumbo Candle",
        "Bukang Liwayway Candle #35": "Candle #35",
        "Bukang Liwayway Candle #26": "Candle #26",
        "Bukang Liwayway Candle #22": "Candle #22",
        "Bukang Liwayway Candle #25": "Candle #25",
        "Bukang Liwayway Candle #28": "Candle #28",
        "Bukang Liwayway Candle #40": "Candle #40",
        "Bukang Liwayway Candle #20": "Candle #20",
        "Bukang Liwayway Candle #50": "Candle #50",
        "Bukang Liwayway Candle #55": "Candle #55 By Two"

    };


    for(const key in products){

        if(productName.includes(key)){

            return products[key];

        }

    }


    return productName;

}


/* =========================
   Search
========================= */

searchInput.addEventListener("input", function(){

    searchOrders();

});


function searchOrders(){

    const searchText = searchInput.value.toLowerCase();

    const rows = document.querySelectorAll("#table-body tr");

    let visibleRows = 0;


    rows.forEach(function(row){

        const rowText = row.textContent.toLowerCase();

        const option = row.cells[4].textContent.trim();


        const matchesSearch =
            rowText.includes(searchText);


        const matchesFilter =
            currentFilter === "all" ||
            option === currentFilter;


        if(matchesSearch && matchesFilter){

            row.style.display = "";

            visibleRows++;

        }
        else{

            row.style.display = "none";

        }

    });


    if(visibleRows === 0){

        noResults.classList.add("show");

    }
    else{

        noResults.classList.remove("show");

    }

}


/* =========================
   Filters
========================= */

filterButtons.forEach(function(button){

    button.addEventListener("click", function(){

        filterButtons.forEach(function(btn){

            btn.classList.remove("active");

        });


        button.classList.add("active");

        currentFilter = button.dataset.filter;

        searchOrders();

    });

});


/* =========================
   Sorting
========================= */

tableHeaders.forEach(function(header){

    header.addEventListener("click", function(){

        const column = Number(header.dataset.column);

        sortTable(column);

    });

});


function sortTable(column){

    const rows = Array.from(
        tableBody.querySelectorAll("tr")
    );


    rows.sort(function(a, b){

        const textA =
            a.cells[column].textContent.trim().toLowerCase();

        const textB =
            b.cells[column].textContent.trim().toLowerCase();


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


    rows.forEach(function(row){

        tableBody.appendChild(row);

    });


    updateSortIcons();

    searchOrders();

}


function updateSortIcons(){

    tableHeaders.forEach(function(header){

        const column = Number(header.dataset.column);

        header.classList.remove("active-sort");


        let title = header.textContent
            .replace(" ▲", "")
            .replace(" ▼", "");


        if(column === sortColumn){

            header.classList.add("active-sort");


            if(sortAscending){

                header.textContent = title + " ▲";

            }
            else{

                header.textContent = title + " ▼";

            }

        }
        else{

            header.textContent = title;

        }

    });

}


/* =========================
   Process CSV
========================= */

function processCSV(text){

    const lines = text.split(/\r?\n/);


    if(lines.length < 2){

        showToast("The file appears to be empty.");

        return;

    }


    const headers = parseCSVLine(lines[0]);


    const orderDateIndex = headers.findIndex(function(header){

        return header
            .toLowerCase()
            .includes("created time");

    });


    const orderIdIndex = headers.findIndex(function(header){

        return header
            .toLowerCase()
            .includes("order id");

    });


    const productNameIndex = headers.findIndex(function(header){

        return header
            .toLowerCase()
            .includes("product name");

    });


    const quantityIndex = headers.findIndex(function(header){

        return header
            .toLowerCase()
            .includes("quantity");

    });


    const variationIndex = headers.findIndex(function(header){

        return header
            .toLowerCase() === "variation";

    });


    if(orderIdIndex === -1 || productNameIndex === -1){

        showToast("Invalid TikTok Shop CSV.");

        return;

    }


    let rows = "";

    let totalOrders = 0;
    let totalItems = 0;

    let uniqueProducts = [];


    for(let i = 1; i < lines.length; i++){

        if(!lines[i].trim()){

            continue;

        }


        const columns = parseCSVLine(lines[i]);


        if(
            columns.length <=
            Math.max(
                orderDateIndex,
                orderIdIndex,
                productNameIndex
            )
        ){

            continue;

        }


        const orderId = columns[orderIdIndex]
            .replace(/['"=]/g, "")
            .trim();


        const productName = shortenProductName(
            columns[productNameIndex].trim()
        );


        const orderDate =
            orderDateIndex !== -1
            ? columns[orderDateIndex].trim()
            : "N/A";


        const quantity =
            quantityIndex !== -1
            ? columns[quantityIndex].trim()
            : "1";


        const variation =
            variationIndex !== -1
            ? columns[variationIndex].trim()
            : "N/A";


        totalOrders++;

        totalItems += Number(quantity);


        if(!uniqueProducts.includes(productName)){

            uniqueProducts.push(productName);

        }


        rows += `
            <tr>
                <td>${orderDate}</td>
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

    productCount.textContent =
        uniqueProducts.length;

    itemCount.textContent =
        totalItems;


    copyBtn.classList.add("show");
    sendSheetBtn.classList.add("show");

}


/* =========================
   CSV Parser
========================= */

function parseCSVLine(text){

    let value = "";

    let columns = [];

    let insideQuotes = false;


    for(let i = 0; i < text.length; i++){

        const character = text[i];


        if(character === '"'){

            insideQuotes = !insideQuotes;

        }
        else if(
            character === "," &&
            !insideQuotes
        ){

            columns.push(value);

            value = "";

        }
        else{

            value += character;

        }

    }


    columns.push(value);


    return columns;

}


/* =========================
   Copy Table
========================= */

function copyTableToClipboard(){

    const rows =
        document.querySelectorAll("#table-body tr");


    let clipboardText = "";


    rows.forEach(function(row){

        const cells =
            row.querySelectorAll("td");


        if(cells.length < 2){

            return;

        }


        const rowText =
            Array.from(cells)
                .map(function(cell){

                    return cell.textContent.trim();

                })
                .join("\t");


        clipboardText += rowText + "\n";

    });


    navigator.clipboard.writeText(clipboardText)

        .then(function(){

            showToast("Data copied to clipboard.");

        })

        .catch(function(){

            showToast("Failed to copy the data.");

        });

}


/* =========================
   Loading
========================= */

function showLoading(){

    loadingScreen.classList.add("show");

}


function hideLoading(){

    loadingScreen.classList.remove("show");

}


/* =========================
   Toast
========================= */

function showToast(message){

    clearTimeout(toastTimer);


    toast.textContent = message;

    toast.classList.add("show");


    toastTimer = setTimeout(function(){

        toast.classList.remove("show");

    }, 2500);

}


/* =========================
   Dark Mode
========================= */

themeBtn.addEventListener("click", toggleTheme);


function toggleTheme(){

    document.body.classList.toggle("dark");


    if(document.body.classList.contains("dark")){

        themeBtn.textContent = "☀ Light Mode";

    }
    else{

        themeBtn.textContent = "🌙 Dark Mode";

    }


    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
    );

}


if(localStorage.getItem("theme") === "true"){

    document.body.classList.add("dark");

    themeBtn.textContent = "☀ Light Mode";

}