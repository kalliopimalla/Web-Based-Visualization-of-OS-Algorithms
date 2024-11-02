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
    let hitCount = 0;
    const pageFrames = Array(maxFrames).fill(null);
    const pageTable = Array.from(table.getElementsByTagName("td"));

    pages.forEach((page, i) => {
        if (!search(page, pageFrames)) { // page fault
            faultCount++;
            if (pageFrames.includes(null)) {
                const emptyIndex = pageFrames.indexOf(null);
                pageFrames[emptyIndex] = page;
            } else {
                const replaceIndex = predict(pages, pageFrames, pages.length, i + 1);
                pageFrames[replaceIndex] = page;
            }

            // Χρωματισμός του κελιού για page fault
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i) {
                    const frameIndex = cell.getAttribute("data-frame");
                    cell.innerText = pageFrames[frameIndex] ?? '';
                    cell.style.backgroundColor = pageFrames[frameIndex] === page ? '#f8d7da' : '';
                }
            });
        } else { // hit
            hitCount++;
            // Χρωματισμός του κελιού για hit
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i) {
                    const frameIndex = cell.getAttribute("data-frame");
                    cell.innerText = pageFrames[frameIndex] ?? '';
                    cell.style.backgroundColor = pageFrames[frameIndex] === page ? '#d4edda' : '';
                }
            });
        }
    });

    // Ενημέρωση του κειμένου αποτελεσμάτων
    resultText.innerText = `Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}\nΣυνολικός αριθμός hits: ${hitCount}`;
}


// Συνάρτηση για την έναρξη της προσομοίωσης
function runOPTIMAL() {
    initializeSimulation();
    updateTable();
}

// Function to check whether a page exists in a frame or not
function search(key, fr) {
    return fr.includes(key);
}

// Function to find the frame that will not be used recently in future
function predict(pg, fr, pn, index) {
    let farthest = -1;
    let replaceIndex = -1;
    for (let i = 0; i < fr.length; i++) {
        let j;
        for (j = index; j < pn; j++) {
            if (fr[i] === pg[j]) {
                if (j > farthest) {
                    farthest = j;
                    replaceIndex = i;
                }
                break;
            }
        }
        if (j === pn) { // Σελίδα δεν ξαναχρησιμοποιείται στο μέλλον
            return i;
        }
    }
    return replaceIndex === -1 ? 0 : replaceIndex; // Σε περίπτωση που όλες οι σελίδες χρησιμοποιούνται
}

