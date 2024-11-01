// JavaScript για την οπτικοποίηση του αλγορίθμου FIFO Page Replacement
let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table, resultText;

function initializeSimulation() {
    // Πάρε τις εισόδους του χρήστη
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    // Έλεγχος εγκυρότητας των εισόδων
    if (!isValidInput(pageInput, maxFrames)) {
        return; // Σταματά τη λειτουργία αν οι είσοδοι δεν είναι έγκυρες
    }

    // Διέγραψε προηγούμενα δεδομένα
    pages = pageInput.split(',').map(Number);
    frames = Array(maxFrames).fill(null);
    step = 0;

    // Δημιούργησε τον πίνακα οπτικοποίησης
    createTable();
    updateTable();
}

function isValidInput(pageInput, maxFrames) {
    // Έλεγχος αν η ακολουθία σελίδων είναι κενή ή περιέχει μη έγκυρους αριθμούς
    const pageArray = pageInput.split(',').map(num => num.trim());
    for (let page of pageArray) {
        if (isNaN(page) || page === "") {
            alert("Η ακολουθία σελίδων πρέπει να περιέχει μόνο έγκυρους αριθμούς διαχωρισμένους με κόμμα.");
            return false;
        }
    }

    // Έλεγχος αν ο αριθμός πλαισίων είναι έγκυρος
    if (isNaN(maxFrames) || maxFrames <= 0) {
        alert("Παρακαλώ εισάγετε έναν έγκυρο αριθμό πλαισίων.");
        return false;
    }

    return true; // Αν όλα είναι σωστά
}

function createTable() {
    const seekSequence = document.getElementById("seek-sequence");
    seekSequence.innerHTML = ''; // Καθαρισμός του πίνακα
    table = document.createElement("table");
    table.classList.add("visual-table");

    // Δημιουργία κεφαλίδας
    const headerRow = document.createElement("tr");
    const emptyHeader = document.createElement("th");
    headerRow.appendChild(emptyHeader);

    for (let i = 0; i < pages.length; i++) {
        const th = document.createElement("th");
        th.innerText = `T${i + 1}`;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Δημιουργία σειρών για τα πλαίσια
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

    // Προσθήκη του πίνακα στην οθόνη
    seekSequence.appendChild(table);

    // Προσθήκη μηνύματος αποτελεσμάτων
    resultText = document.createElement("p");
    resultText.classList.add("result-text");
    seekSequence.appendChild(resultText);
}

function updateTable() {
    let faultCount = 0;
    const pageFrames = Array(maxFrames).fill(null);
    const pageTable = Array.from(table.getElementsByTagName("td"));

    // Εξακρίβωση των faults/hits
    pages.forEach((page, i) => {
        if (!pageFrames.includes(page)) { // page fault
            faultCount++;
            pageFrames.shift();
            pageFrames.push(page);

            // Ενημέρωση μόνο του συγκεκριμένου κελιού με fault
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i && pageFrames[cell.getAttribute("data-frame")] == page) {
                    cell.innerText = page;
                    cell.style.backgroundColor = '#f8d7da'; // Κόκκινο για fault
                } else if (cell.getAttribute("data-step") == i) {
                    cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                }
            });
        } else {
            // Ενημέρωση μόνο του συγκεκριμένου κελιού με hit
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
    resultText.innerText = `Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}`;
}

// Συνάρτηση για την έναρξη της προσομοίωσης
function runFIFO() {
    initializeSimulation();
    updateTable();
}
