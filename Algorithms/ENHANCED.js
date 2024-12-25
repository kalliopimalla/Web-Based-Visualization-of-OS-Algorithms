let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table;
let referenceBits = [];
let modifiedBits = [];
let pointer = 0;
let resultText = document.getElementById('resultText');
let faultCount = 0;
let hitCount = 0;
let pageFrames = [];

function initializeSimulation() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    const pageInput = document.getElementById("pages").value.trim();
    const frameNumberInput = document.getElementById("frame-number").value;
    const maxFrames = parseInt(frameNumberInput, 10);

    if (!isValidInput(pageInput, maxFrames)) {
        return;
    }

    pages = pageInput.split(',').map(Number);
    frames = Array(maxFrames).fill(null);
    referenceBits = Array(maxFrames).fill(0);
    modifiedBits = Array(maxFrames).fill(0);
    step = 0; // Μηδενισμός του step
    pointer = 0;

    createTable();
    enableResetButton(); // Ενεργοποίηση κουμπιού επαναφοράς
}

function isValidInput(pageInput, maxFrames) {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    const pageArray = pageInput.split(',').map(num => num.trim());
    for (let page of pageArray) {
        if (isNaN(page) || page === "" || page < 1 || page > 100) {
            const pageInputElement = document.getElementById("pages");
            displayError(pageInputElement, "Η ακολουθία σελίδων πρέπει να περιέχει μόνο αριθμούς από 1 έως 100, διαχωρισμένους με κόμμα.");
            return false;
        }
    }

    // Έλεγχος αν η ακολουθία περιέχει περισσότερους από 100 αριθμούς
    if (pageArray.length > 100) {
        const pageInputElement = document.getElementById("pages");
        displayError(pageInputElement, "Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!");
        return false;
    }

    if (isNaN(maxFrames) || maxFrames <= 0 || maxFrames > 25) {
        const frameInputElement = document.getElementById("frame-number");
        displayError(frameInputElement, "Παρακαλώ εισάγετε έναν αριθμό πλαισίων από 1 έως 25.");
        return false;
    }

    return true;
}


function createTable() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

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
        frameHeader.innerText = `Πλαίσιο ${i + 1}`;
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

    // Προσαρμογή πλάτους καμβά
    adjustCanvasWidth(pages.length);
}

function nextStep() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Αν η προσομοίωση δεν έχει ξεκινήσει, αρχικοποίησε την
    if (pages.length === 0 || frames.length === 0) {
        initializeSimulation(); // Αυτόματη εκκίνηση
    }

    if (step >= pages.length) {
        alert("Η προσομοίωση ολοκληρώθηκε!");
        return;
    }

    const page = pages[step]; // Τρέχουσα σελίδα
    const pageTable = Array.from(table.getElementsByTagName("td"));
    let hit = false;

    // Έλεγχος για hit ή page fault
    const frameIndex = frames.indexOf(page);
    if (frameIndex !== -1) {
        hit = true;
        referenceBits[frameIndex] = 1; // Αναφορά στη σελίδα
    } else {
        while (true) {
            if (referenceBits[pointer] === 0) {
                frames[pointer] = page;
                referenceBits[pointer] = 1;
                modifiedBits[pointer] = Math.round(Math.random()); // Τυχαίο modified bit
                pointer = (pointer + 1) % maxFrames;
                break;
            } else {
                referenceBits[pointer] = 0;
                pointer = (pointer + 1) % maxFrames;
            }
        }
    }

    // Ενημέρωση του πίνακα
    pageTable.forEach(cell => {
        if (cell.getAttribute("data-step") == step) {
            const frameIndex = cell.getAttribute("data-frame");
            cell.innerText = frames[frameIndex] ?? '';
            cell.style.backgroundColor =
                frames[frameIndex] === page ? (hit ? '#d4edda' : '#f8d7da') : '';
        }
    });

    // Ενημέρωση αποτελεσμάτων
    const faultCount = frames.filter(frame => frame !== null && !pages.includes(frame)).length;
    const hitCount = step + 1 - faultCount;
    
    resultText.innerHTML = `
    <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
    <span class="hits">Συνολικός αριθμός hits: ${hitCount}</span>
`;

    step++;
}

function updateTable() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    let faultCount = 0;
    let hitCount = 0;
    const pageTable = Array.from(table.getElementsByTagName("td"));

    pages.forEach((page, i) => {
        let hit = false;
        const frameIndex = frames.indexOf(page);

        if (frameIndex !== -1) {
            // Page hit
            hitCount++;
            referenceBits[frameIndex] = 1; // Μαρκάρισμα ως χρησιμοποιημένο
            hit = true;
        } else {
            // Page fault
            faultCount++;
            while (true) {
                if (referenceBits[pointer] === 0) {
                    // Αντικατάσταση της σελίδας
                    frames[pointer] = page;
                    referenceBits[pointer] = 1; // Reference bit σε 1
                    modifiedBits[pointer] = Math.round(Math.random()); // Τυχαίο modified bit
                    pointer = (pointer + 1) % maxFrames; // Μετακίνηση δείκτη
                    break;
                } else {
                    // Επαναφορά του reference bit σε 0 και μετακίνηση δείκτη
                    referenceBits[pointer] = 0;
                    pointer = (pointer + 1) % maxFrames;
                }
            }
        }

        // Ενημέρωση του πίνακα
        pageTable.forEach(cell => {
            const cellFrameIndex = cell.getAttribute("data-frame");
            if (cell.getAttribute("data-step") == i) {
                cell.innerText = frames[cellFrameIndex] ?? '';

                if (frames[cellFrameIndex] === page) {
                    // Χρωματισμός για hit ή fault
                    cell.style.backgroundColor = hit ? '#d4edda' : '#f8d7da';
                } else {
                    // Επαναφορά χρώματος για άλλα κελιά
                    cell.style.backgroundColor = '';
                }
            }
        });
    });

    // Ενημέρωση αποτελεσμάτων
    resultText.innerHTML = `
        <span class="faults" style="color: red;">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
        <span class="hits" style="color: green;">Συνολικός αριθμός hits: ${hitCount}</span>
    `;
}

function runENHANCED() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    initializeSimulation(); // Αρχικοποίηση
    while (step < pages.length) {
        nextStep(); // Εκτέλεση όλων των βημάτων
    }
}

function generateSequence() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    const lengthInput = document.getElementById("sequenceLength").value.trim();
    const maxPageInput = document.getElementById("maxPageNumber").value.trim();

    const length = parseInt(lengthInput, 10); // Μήκος ακολουθίας
    const maxPageNumber = parseInt(maxPageInput, 10); // Μέγιστος αριθμός σελίδας

    const lengthElement = document.getElementById("sequenceLength");
    const maxPageElement = document.getElementById("maxPageNumber");

    // Έλεγχος εγκυρότητας για το μήκος ακολουθίας
    if (isNaN(length) || length <= 0) {
        displayError(lengthElement, "Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας (θετικός αριθμός)!");
        return;
    }

    // Έλεγχος εγκυρότητας για τον μέγιστο αριθμό σελίδας
    if (isNaN(maxPageNumber) || maxPageNumber <= 0) {
        displayError(maxPageElement, "Παρακαλώ εισάγετε έγκυρο μέγιστο αριθμό σελίδας (θετικός αριθμός)!");
        return;
    }

    // Δημιουργία τυχαίας ακολουθίας σελίδων από 1 έως maxPageNumber
    const sequence = [];
    for (let i = 0; i < length; i++) {
        const randomPage = Math.floor(Math.random() * maxPageNumber) + 1;
        sequence.push(randomPage);
    }

    // Ενημέρωση του πεδίου "pages" με την τυχαία ακολουθία
    document.getElementById("pages").value = sequence.join(',');

    // Οπτικοποίηση της ακολουθίας
    const sequenceBoxes = document.getElementById("seek-sequence-boxes");
    if (sequenceBoxes) {
        sequenceBoxes.innerHTML = '';
        sequence.forEach(page => {
            const box = document.createElement("div");
            box.classList.add("sequence-box");
            box.innerText = page;
            sequenceBoxes.appendChild(box);
        });
    }
}

const resetButton = document.getElementById('resetButton');

resetButton.addEventListener('click', () => {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Επαναφορά όλων των δεδομένων
    document.getElementById('pages').value = '';
    document.getElementById('frame-number').value = '';
    document.getElementById('seek-sequence').innerHTML = '';
    document.getElementById('resultText').innerText = '';
    document.getElementById('seek-count').innerText = '';
    document.getElementById("sequenceLength").value = ""; // Μηδενισμός του sequence length
    document.getElementById('maxPageNumber').value = ''; // Μηδενισμός του μέγιστου αριθμού σελίδας
    pages = [];
    frames = [];
    referenceBits = [];
    modifiedBits = [];
    step = 0;
    pointer = 0;

    // Απόκρυψη του κουμπιού επαναφοράς
    resetButton.style.display = 'none';
});

function enableResetButton() {
    resetButton.style.display = 'block';
}

// Συνάρτηση για εμφάνιση μηνύματος σφάλματος
function displayError(inputElement, errorMessage) {
    if (!inputElement) return;

    // Κοκκίνισμα του πλαισίου
    inputElement.style.borderColor = "red";

    // Δημιουργία στοιχείου για το μήνυμα σφάλματος
    const errorBox = document.createElement("div");
    errorBox.className = "error-message";
    errorBox.textContent = errorMessage;
    errorBox.style.color = "red";
    errorBox.style.fontSize = "14px";
    errorBox.style.marginTop = "5px";

    // Προσθήκη του μηνύματος κάτω από το πεδίο εισόδου
    inputElement.parentElement.appendChild(errorBox);
}

// Συνάρτηση για εκκαθάριση μηνυμάτων σφάλματος
function clearErrorMessages() {
    document.querySelectorAll(".error-message").forEach(el => el.remove());
    document.querySelectorAll("input").forEach(input => (input.style.borderColor = ""));
}



// script.js
document.addEventListener("DOMContentLoaded", () => {
    const openSidebar = document.getElementById("open-sidebar");
    const closeSidebar = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");
  
    openSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      sidebar.classList.add("open"); // Προσθέτουμε την κλάση για να εμφανιστεί το sidebar
    });
  
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open"); // Αφαιρούμε την κλάση για να κρυφτεί το sidebar
    });
  });
  
  document.querySelectorAll('.dropdown-submenu > div').forEach((menuTitle) => {
    menuTitle.addEventListener('click', () => {
      const parentLi = menuTitle.parentElement;
      parentLi.classList.toggle('open');
    });
  });
  
  document.querySelectorAll('.submenu-content li a').forEach((link) => {
    link.addEventListener('click', (e) => {
      document
        .querySelectorAll('.submenu-content li a')
        .forEach((el) => el.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  

  function adjustCanvasWidth(sequenceLength) {
    const seekSequence = document.getElementById("seek-sequence");
    const minWidth = 800; // Ελάχιστο πλάτος
    const additionalWidth = (sequenceLength - 10) * 50; // Προσθήκη 50px για κάθε επιπλέον στοιχείο πέρα από τα 10
    const newWidth = Math.max(minWidth, minWidth + additionalWidth);

    seekSequence.style.width = `${newWidth}px`; // Ενημέρωση του πλάτους
    seekSequence.style.overflowX = "auto"; // Ενεργοποίηση οριζόντιας κύλισης
}
