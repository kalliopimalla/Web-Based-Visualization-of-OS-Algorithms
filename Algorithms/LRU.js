// JavaScript υλοποίηση του αλγορίθμου LRU

let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table, resultText;

function initializeSimulation() {
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    if (!isValidInput(pageInput, maxFrames)) {
        return; // Σταματά τη λειτουργία αν οι είσοδοι δεν είναι έγκυρες
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
    return true; // Αν όλα είναι σωστά
}

function createTable() {
    const seekSequence = document.getElementById("seek-sequence");
    seekSequence.innerHTML = ''; // Καθαρισμός του πίνακα
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
    let pageFaults = 0;
    let hits = 0; // Μεταβλητή για τα hits
    const pageFrames = Array(maxFrames).fill(null);
    const pageTable = Array.from(table.getElementsByTagName("td"));
    const lastUsed = new Map(); // Χάρτης για την παρακολούθηση της τελευταίας χρήσης

    pages.forEach((page, i) => {
        lastUsed.set(page, i); // Καταγραφή της τελευταίας χρήσης

        if (!pageFrames.includes(page)) { // page fault
            pageFaults++;
            if (pageFrames.includes(null)) {
                const index = pageFrames.indexOf(null);
                pageFrames[index] = page; // Προσθήκη νέας σελίδας
            } else {
                const lruPage = getLRUPage(pageFrames, lastUsed);
                const index = pageFrames.indexOf(lruPage);
                pageFrames[index] = page; // Αντικατάσταση της LRU σελίδας
            }

            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i) {
                    if (pageFrames[cell.getAttribute("data-frame")] == page) {
                        cell.innerText = page;
                        cell.style.backgroundColor = '#f8d7da'; // Κόκκινο για fault
                    } else {
                        cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                    }
                }
            });
        } else {
            hits++; // Αύξηση των hits
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == i) {
                    cell.innerText = pageFrames[cell.getAttribute("data-frame")] ?? '';
                    // Πράσινο χρώμα για hits
                    if (pageFrames[cell.getAttribute("data-frame")] == page) {
                        cell.style.backgroundColor = '#d4edda'; // Πράσινο για hit
                    }
                }
            });
        }
    });

    // Εμφάνιση των αποτελεσμάτων
    resultText.innerText = `Συνολικός αριθμός σφαλμάτων σελίδας: ${pageFaults}\nΣυνολικός αριθμός hits: ${hits}`;
}



// Συνάρτηση για την εύρεση της σελίδας που έχει χρησιμοποιηθεί λιγότερο πρόσφατα
function getLRUPage(pageFrames, lastUsed) {
    let lruPage = pageFrames[0];
    let lruTime = lastUsed.get(lruPage);
    
    pageFrames.forEach(page => {
        if (lastUsed.get(page) < lruTime) {
            lruTime = lastUsed.get(page);
            lruPage = page;
        }
    });
    
    return lruPage;
}

// Συνάρτηση για την έναρξη της προσομοίωσης
function runLRU() {
    initializeSimulation();
    updateTable();
}
