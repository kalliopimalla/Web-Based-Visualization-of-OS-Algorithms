let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table, resultText;
let faultCount = 0;
let hitCount = 0;
let pageFrames = [];

// Αρχικοποίηση της προσομοίωσης
function initializeSimulation() {
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    if (!isValidInput(pageInput, maxFrames)) {
        return;
    }

    pages = pageInput.split(',').map(Number);
    frames = Array(maxFrames).fill(null);
    step = 0;
    faultCount = 0;
    hitCount = 0;
    pageFrames = Array(maxFrames).fill(null); // Επαναφορά frames για νέα εκτέλεση

    createTable();
    resultText.innerText = ''; // Επαναφορά του κειμένου αποτελεσμάτων
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
    seekSequence.innerHTML = ''; // Καθαρισμός πίνακα

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

// Πλήρης εκτέλεση της προσομοίωσης
function updateTable() {
    faultCount = 0;
    hitCount = 0;
    const pageTable = Array.from(table.getElementsByTagName("td"));
    pageFrames = Array(maxFrames).fill(null); // Επαναφορά frames για νέα εκτέλεση
    let frameIndex = 0;

    pages.forEach((page, i) => {
        if (!pageFrames.includes(page)) { // page fault
            faultCount++;
            pageFrames[frameIndex] = page;
            frameIndex = (frameIndex + 1) % maxFrames;

            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i && pageFrames[cell.getAttribute("data-frame")] == page) {
                    cell.innerText = page;
                    cell.style.backgroundColor = '#f8d7da'; // Κόκκινο για fault
                } else if (cell.getAttribute("data-step") == i) {
                    cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                }
            });
        } else {
            hitCount++;
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

    resultText.innerText = `Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}\nΣυνολικός αριθμός hits: ${hitCount}`;
}

function runFIFO() {
    initializeSimulation();
    updateTable();
}

// Προβολή ενός βήματος της προσομοίωσης
function nextStep() {
    if (step === 0 && table) {
        initializeSimulation(); // Ξεκινά νέα προσομοίωση και αδειάζει τον πίνακα
    }

    if (step < pages.length) {
        let page = pages[step];
        const pageTable = Array.from(table.getElementsByTagName("td"));
        let frameIndex = step % maxFrames;

        if (!pageFrames.includes(page)) { // page fault
            faultCount++;
            pageFrames[frameIndex] = page;

            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == step && pageFrames[cell.getAttribute("data-frame")] == page) {
                    cell.innerText = page;
                    cell.style.backgroundColor = '#f8d7da'; // Κόκκινο για fault
                } else if (cell.getAttribute("data-step") == step) {
                    cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                }
            });
        } else {
            hitCount++;
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == step && pageFrames[cell.getAttribute("data-frame")] == page) {
                    cell.innerText = page;
                    cell.style.backgroundColor = '#d4edda'; // Πράσινο για hit
                } else if (cell.getAttribute("data-step") == step) {
                    cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                }
            });
        }

        step++;
        resultText.innerText = `Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}\nΣυνολικός αριθμός hits: ${hitCount}`;
    } else {
        alert("Η προσομοίωση ολοκληρώθηκε!");
    }
}

// Λειτουργία για την τυχαία δημιουργία ακολουθίας σελίδων
function generateSequence() {
    const length = 10; // Μήκος της ακολουθίας
    const maxPageNumber = 100; // Μέγιστη τιμή σελίδας
    const sequence = Array.from({ length }, () => Math.floor(Math.random() * maxPageNumber) + 1);
    document.getElementById("pages").value = sequence.join(',');
}