let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table, resultText;
let referenceBits = [];
let pointer = 0;

function initializeSimulation() {
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    if (!isValidInput(pageInput, maxFrames)) {
        return;
    }

    pages = pageInput.split(',').map(Number);
    frames = Array(maxFrames).fill(null);
    referenceBits = Array(maxFrames).fill(0);
    step = 0;
    pointer = 0;

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
    let hitCount = 0;
    const pageTable = Array.from(table.getElementsByTagName("td"));

    pages.forEach((page, i) => {
        const frameIndex = frames.indexOf(page);
        let hit = false;

        if (frameIndex !== -1) {
            hitCount++;
            referenceBits[frameIndex] = 1;
            hit = true;
        } else {
            while (true) {
                if (referenceBits[pointer] === 0) {
                    frames[pointer] = page;
                    referenceBits[pointer] = 1;
                    pointer = (pointer + 1) % maxFrames;
                    faultCount++;
                    break;
                } else {
                    referenceBits[pointer] = 0; // Μηδενίζουμε το bit αναφοράς και προχωράμε στον επόμενο δείκτη
                    pointer = (pointer + 1) % maxFrames;
                }
            }
        }

        pageTable.forEach(cell => {
            if (cell.getAttribute("data-step") == i) {
                const frameIndex = cell.getAttribute("data-frame");
                cell.innerText = frames[frameIndex] ?? '';

                if (frames[frameIndex] === page) {
                    cell.style.backgroundColor = hit ? '#d4edda' : '#f8d7da';
                } else {
                    cell.style.backgroundColor = '';
                }
            }
        });
    });

    resultText.innerText = `Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}\nΣυνολικός αριθμός hits: ${hitCount}`;
}

function runCLOCK() {
    initializeSimulation();
    updateTable();
}

// Λειτουργία για την τυχαία δημιουργία ακολουθίας σελίδων
function generateSequence() {
    const length = 10; // Μήκος της ακολουθίας
    const maxPageNumber = 100; // Μέγιστη τιμή σελίδας
    const sequence = Array.from({ length }, () => Math.floor(Math.random() * maxPageNumber) + 1);
    const pagesInput = document.getElementById("pages");

    if (pagesInput) {
        pagesInput.value = sequence.join(',');
    } else {
        console.error("Το πεδίο 'pages' δεν βρέθηκε στο DOM.");
    }
}

