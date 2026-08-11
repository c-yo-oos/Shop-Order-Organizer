const spreadsheetBody = document.getElementById("spreadsheet-body");
const sendSheetBtn = document.getElementById("send-sheet-btn");

// ==============================
// Product Names
// ==============================

const productNames = [
    "Rose Butiki",
    "Jasmine Butiki",
    "Lemon Butiki",
    "Wawang Rose",
    "Wawang Jasmine",
    "Wawang Lemon",
    "Wawang Katol",
    "S-0025",
    "S-608-M",
    "S-0010",
    "S-0050",
    "S-0013",
    "Baolilai",
    "Racumin",
    "Crosspoint Baby Wipes",
    "Penguin Steel Wool",
    "Black Vinyl Gloves",
    "Cotton Mop",
    "Hotplate",
    "Foot Bright",
    "Dino Scrub Pad",
    "Gree Live Thick Mouse",
    "Kamoi",
    "Thin Sticky Mouse Trap",
    "Large Metal Rat Cage",
    "Medium Metal Rat Cage",
    "Small Metal Rat Cage",
    "3 Days Candle",
    "7 Days Candle",
    "Jumbo Candle",
    "Candle #35",
    "Candle #26",
    "Candle #22",
    "Candle #25",
    "Candle #28",
    "Candle #40",
    "Candle #20",
    "Candle #50",
    "Candle #55 By Two"
];

function createSpreadsheetRow(order){
    const tr = document.createElement("tr");

    // Date

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(order.date);
    tr.appendChild(dateCell);

    // Order ID

    const orderIdCell = document.createElement("td");
    orderIdCell.textContent = order.orderId;
    tr.appendChild(orderIdCell);

    // Product

    const productCell = document.createElement("td");
    productCell.textContent = order.productName;
    tr.appendChild(productCell);

    // Quantity

    const quantityCell = document.createElement("td");
    quantityCell.textContent = order.quantity;
    tr.appendChild(quantityCell);

    // Unit Price

    const unitPriceCell = document.createElement("td");
    const unitPriceInput = document.createElement("input");

    unitPriceInput.type = "number";
    unitPriceInput.className = "price-input";
    unitPriceInput.placeholder = "₱0.00";
    unitPriceInput.min = "0";
    unitPriceInput.step = "0.01";

    unitPriceCell.appendChild(unitPriceInput);
    tr.appendChild(unitPriceCell);

    // Deduction

    const deductionCell = document.createElement("td");
    const deductionInput = document.createElement("input");

    deductionInput.type = "number";
    deductionInput.className = "price-input";
    deductionInput.placeholder = "₱0.00";
    deductionInput.min = "0";
    deductionInput.step = "0.01";

    deductionCell.appendChild(deductionInput);
    tr.appendChild(deductionCell);
    
    // Retail Price

    const retailCell = document.createElement("td");
    const retailInput = document.createElement("input");

    retailInput.type = "number";
    retailInput.className = "price-input";
    retailInput.placeholder = "₱0.00";
    retailInput.min = "0";
    retailInput.step = "0.01";

    retailCell.appendChild(retailInput);
    tr.appendChild(retailCell);

    // Profit

    const profitCell = document.createElement("td");
    profitCell.className = "profit-cell";
    profitCell.textContent = "₱0.00";
    tr.appendChild(profitCell);

    // Conclude / Status

    const concludeCell = document.createElement("td");
    const concludeSelect = document.createElement("select");
    concludeSelect.className = "conclude-select";
    const statuses = [
        "Done",
        "Processing",
        "Delivered",
        "Return/Refund"
    ];

    statuses.forEach(function(status){

        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;

        concludeSelect.appendChild(option);

    });

    concludeSelect.value = "Processing";

    concludeCell.appendChild(concludeSelect);

    tr.appendChild(concludeCell);


    // ==============================
    // Price Input Events
    // ==============================

    unitPriceInput.addEventListener("input", function(){
        updateProfit(tr);
    });

    deductionInput.addEventListener("input", function(){
        updateProfit(tr);
    });

    retailInput.addEventListener("input", function(){
        updateProfit(tr);
    });


    concludeSelect.addEventListener("change", function(){

        updateStatusStyle(concludeSelect);

        updateSummary();

    });


    updateStatusStyle(concludeSelect);


    return tr;
}

// ==============================
// Format Date
// ==============================

function formatDate(date){

    if(!date){
        return "";
    }

    const parts = date.split(" ");

    if(parts.length === 0){
        return date;
    }

    const datePart = parts[0];

    const dateNumbers = datePart.split("/");

    if(dateNumbers.length !== 3){
        return date;
    }

    const month = Number(dateNumbers[0]);
    const day = Number(dateNumbers[1]);

    return month + "/" + day;
}

// ==============================
// Update Profit
// ==============================

function updateProfit(row){

    const inputs = row.querySelectorAll(".price-input");

    const unitPrice = Number(inputs[0].value) || 0;
    const deduction = Number(inputs[1].value) || 0;
    const retailPrice = Number(inputs[2].value) || 0;

    const profit = retailPrice - unitPrice - deduction;

    const profitCell = row.querySelector(".profit-cell");

    profitCell.textContent = formatMoney(profit);

    updateSummary();
}

// ==============================
// Format Money
// ==============================

function formatMoney(value){

    return "₱" + value.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}

// ==============================
// Update Status Style
// ==============================

function updateStatusStyle(select){

    select.classList.remove(
        "status-done",
        "status-processing",
        "status-delivered",
        "status-return"
    );


    if(select.value === "Done"){
        select.classList.add("status-done");
    }

    if(select.value === "Processing"){
        select.classList.add("status-processing");
    }

    if(select.value === "Delivered"){
        select.classList.add("status-delivered");
    }

    if(select.value === "Return/Refund"){
        select.classList.add("status-return");
    }

}

// ==============================
// Send Orders to Spreadsheet
// ==============================

function sendOrdersToSpreadsheet(){

    const orderRows = document.querySelectorAll("#table-body tr");


    if(orderRows.length === 0){
        showToast("There are no orders to send.");
        return;
    }


    spreadsheetBody.innerHTML = "";


    orderRows.forEach(function(orderRow){

        const cells = orderRow.querySelectorAll("td");


        if(cells.length < 5){
            return;
        }


        const order = {

            date: cells[0].textContent.trim(),

            orderId: cells[1].textContent.trim(),

            productName: cells[2].textContent.trim(),

            quantity: cells[3].textContent.trim()

        };


        const spreadsheetRow =
            createSpreadsheetRow(order);


        spreadsheetBody.appendChild(
            spreadsheetRow
        );

    });


    updateSummary();


    sheetBtn.click();

    showToast("Orders sent to spreadsheet.");

}

// ==============================
// Update Summary
// ==============================

function updateSummary(){

    const rows =
        spreadsheetBody.querySelectorAll("tr");


    let done = 0;
    let processing = 0;
    let delivered = 0;
    let returned = 0;

    let totalUnit = 0;
    let totalDeduction = 0;
    let totalRetail = 0;
    let totalProfit = 0;


    rows.forEach(function(row){

        const inputs =
            row.querySelectorAll(".price-input");


        const unitPrice =
            Number(inputs[0].value) || 0;

        const deduction =
            Number(inputs[1].value) || 0;

        const retailPrice =
            Number(inputs[2].value) || 0;


        totalUnit += unitPrice;

        totalDeduction += deduction;

        totalRetail += retailPrice;

        totalProfit +=
            retailPrice -
            unitPrice -
            deduction;


        const status =
            row.querySelector(".conclude-select").value;


        if(status === "Done"){
            done++;
        }

        if(status === "Processing"){
            processing++;
        }

        if(status === "Delivered"){
            delivered++;
        }

        if(status === "Return/Refund"){
            returned++;
        }

    });


    document.getElementById("summary-done").textContent =
        done;

    document.getElementById("summary-processing").textContent =
        processing;

    document.getElementById("summary-delivered").textContent =
        delivered;

    document.getElementById("summary-return").textContent =
        returned;


    document.getElementById("summary-unit").textContent =
        formatMoney(totalUnit);

    document.getElementById("summary-deduction").textContent =
        formatMoney(totalDeduction);

    document.getElementById("summary-retail").textContent =
        formatMoney(totalRetail);

    document.getElementById("summary-profit").textContent =
        formatMoney(totalProfit);

    document.getElementById("summary-orders").textContent =
        rows.length;

}

// ==============================
// Spreadsheet Button
// ==============================

sendSheetBtn.addEventListener("click", function(){

    sendOrdersToSpreadsheet();

});