// JavaScript για την οπτικοποίηση του αλγορίθμου FIFO Page Replacement
let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table, resultText;

function initializeSimulation() {
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    if (!isValidInput(pageInput, maxFrames)) {
        return;
    }

    pages = pageInput.split(',').map(Number);
    frames = Array(maxFrames).fill(null);
    step = 0;

    createTable();
    updateTable();
}

function isValidInput(pageInput, maxFrames) {
    const pageArray = pageInput.split(',').map(num => num.trim());
    for (let page of pageArray) {
        if (isNaN(page) || page === "") {
            alert("Η ακολουθία σελίδων πρέπει να περιέχει μόνο έγκυρους αριθμούς διαχωρισμένους με κόμμα.");
            return false;
        }
    }

    if (isNaN(maxFrames) || maxFrames <= 0) {
        alert("Παρακαλώ εισάγετε έναν έγκυρο αριθμό πλαισίων.");
        return false;
    }

    return true;
}

function createTable() {
    const seekSequence = document.getElementById("seek-sequence");
    seekSequence.innerHTML = '';
    table = document.createElement("table");
    table.classList.add("visual-table");

    const headerRow = document.createElement("tr");
    const emptyHeader = document.createElement("th");
    headerRow.appendChild(emptyHeader);

    for (let i = 0; i < pages.length; i++) {
        const th = document.createElement("th");
        th.innerText = `T${i + 1}`;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    for (let i = 0; i < maxFrames; i++) {
        const frameRow = document.createElement("tr");
        const frameHeader = document.createElement("th");
        frameHeader.innerText = `Frame ${i + 1}`;
        frameRow.appendChild(frameHeader);

        for (let j = 0; j < pages.length; j++) {
            const td = document.createElement("td");
            td.setAttribute("data-frame", i);
            td.setAttribute("data-step", j);
            frameRow.appendChild(td);
        }
        table.appendChild(frameRow);
    }

    seekSequence.appendChild(table);

    resultText = document.createElement("p");
    resultText.classList.add("result-text");
    seekSequence.appendChild(resultText);
}

function updateTable() {
    let faultCount = 0;
    let hitCount = 0; // Μεταβλητή για τα hits
    const pageFrames = Array(maxFrames).fill(null);
    const pageTable = Array.from(table.getElementsByTagName("td"));

    pages.forEach((page, i) => {
        if (!pageFrames.includes(page)) { // page fault
            faultCount++;
            pageFrames.shift();
            pageFrames.push(page);

            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i && pageFrames[cell.getAttribute("data-frame")] == page) {
                    cell.innerText = page;
                    cell.style.backgroundColor = '#f8d7da'; // Κόκκινο για fault
                } else if (cell.getAttribute("data-step") == i) {
                    cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                }
            });
        } else {
            hitCount++; // Αύξηση των hits
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i && pageFrames[cell.getAttribute("data-frame")] == page) {
                    cell.innerText = page;
                    cell.style.backgroundColor = '#d4edda'; // Πράσινο για hit
                } else if (cell.getAttribute("data-step") == i) {
                    cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                }
            });
        }
    });

    // Ενημέρωση του κειμένου αποτελεσμάτων
    resultText.innerText = `Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}\nΣυνολικός αριθμός hits: ${hitCount}`;
}

// Συνάρτηση για την έναρξη της προσομοίωσης
function runFIFO() {
    initializeSimulation();
    updateTable();
}
