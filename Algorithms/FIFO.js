let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table ;

let resultText = document.getElementById('resultText');
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
}

function isValidInput(pageInput, maxFrames) {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    const pageArray = pageInput.split(',').map(num => num.trim());
    for (let page of pageArray) {
        if (isNaN(page) || page === "" || page < 0 || page > 100) {
            const pageInputElement = document.getElementById("pages");
            displayError(pageInputElement, "Η ακολουθία σελίδων πρέπει να περιέχει μόνο αριθμούς από 0 έως 100, διαχωρισμένους με κόμμα.");
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
    const seekSequence = document.getElementById("seek-sequence");
    seekSequence.innerHTML = ''; // Καθαρισμός του πίνακα
    table = document.createElement("table");
    table.classList.add("visual-table");

    // Δημιουργία της επικεφαλίδας με T1, T2, ...
    const headerRow = document.createElement("tr");
    const emptyHeader = document.createElement("th");
    headerRow.appendChild(emptyHeader);

    for (let i = 0; i < pages.length; i++) {
        const th = document.createElement("th");
        th.innerText = `T${i + 1}`; // Προσθήκη του T πριν από τον αριθμό
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Δημιουργία σειρών για τα πλαίσια με "Πλαίσιο 1", "Πλαίσιο 2", ...
    for (let i = 0; i < maxFrames; i++) {
        const frameRow = document.createElement("tr");
        const frameHeader = document.createElement("th");
        frameHeader.innerText = `Πλαίσιο ${i + 1}`; // Εμφάνιση με την ελληνική λέξη "Πλαίσιο"
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




function updateTable() {
    faultCount = 0;
    hitCount = 0;
    const pageTable = Array.from(table.getElementsByTagName("td"));
    pageFrames = Array(maxFrames).fill(null); // Επαναφορά frames για νέα εκτέλεση
    let frameIndex = 0;

    pages.forEach((page, i) => {
        const isPageFault = !pageFrames.includes(page);

        if (isPageFault) {
            faultCount++;
            pageFrames[frameIndex] = page; // Αντικατάσταση σελίδας FIFO
            frameIndex = (frameIndex + 1) % maxFrames; // Κυκλική αύξηση δείκτη
        } else {
            hitCount++;
        }

        // Ενημέρωση του πίνακα
        pageTable.forEach(cell => {
            if (cell.getAttribute("data-step") == i) {
                const frameValue = pageFrames[cell.getAttribute("data-frame")];
                cell.innerText = frameValue ?? '';
                cell.style.backgroundColor = frameValue === page
                    ? (isPageFault ? '#f8d7da' : '#d4edda') // Κόκκινο για fault, Πράσινο για hit
                    : '';
            }
        });

        // Debugging: Εκτύπωση κατάστασης
        console.log(`Step ${i + 1}: Page ${page}`);
        console.log(`Frames: ${pageFrames}`);
        console.log(`Faults: ${faultCount}, Hits: ${hitCount}`);
    });

    // Ενημέρωση αποτελεσμάτων
    resultText.innerHTML = `
        <span class="faults" style="color: red;">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
        <span class="hits" style="color: green;">Συνολικός αριθμός hits: ${hitCount}</span>
    `;
}


function runFIFO() {
    initializeSimulation();
    updateTable();
        // Ενεργοποίηση του κουμπιού επαναφοράς
        enableResetButton();
     
   // Εμφάνιση του πίνακα οπτικοποίησης
   document.getElementById("sequence-container").style.display = "block";
    
}

function nextStep() {
    if (step === 0 && table) {
        initializeSimulation(); // Ξεκινά νέα προσομοίωση και αδειάζει τον πίνακα
        pageFrames = Array(maxFrames).fill(null); // Επαναφορά frames για τη νέα προσομοίωση
        frameIndex = 0; // Χρησιμοποιείται για την αντικατάσταση FIFO
    }

    if (step < pages.length) {
        let page = pages[step];
        const pageTable = Array.from(table.getElementsByTagName("td"));

        if (!pageFrames.includes(page)) { // Page Fault
            faultCount++;

            // Αντικατάσταση σελίδας FIFO
            pageFrames[frameIndex] = page;
            frameIndex = (frameIndex + 1) % maxFrames; // Κυκλική μετακίνηση για FIFO

            // Ενημέρωση του πίνακα
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == step) {
                    const frame = cell.getAttribute("data-frame");
                    cell.innerText = pageFrames[frame] ?? '';
                    cell.style.backgroundColor = pageFrames[frame] == page ? '#f8d7da' : ''; // Κόκκινο για fault
                }
            });
        } else { // Page Hit
            hitCount++;

            // Ενημέρωση του πίνακα
            pageTable.forEach(cell => {
                if (cell.getAttribute("data-step") == step) {
                    const frame = cell.getAttribute("data-frame");
                    cell.innerText = pageFrames[frame] ?? '';
                    cell.style.backgroundColor = pageFrames[frame] == page ? '#d4edda' : ''; // Πράσινο για hit
                }
            });
        }

        step++;
    } else {
        // Ενημέρωση αποτελεσμάτων
        resultText.innerHTML = `
            <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
            <span class="hits">Συνολικός αριθμός hits: ${hitCount}</span>
        `;
        enableResetButton();
    }
       // Εμφάνιση του πίνακα οπτικοποίησης
       document.getElementById("sequence-container").style.display = "block";
}


function generateSequence() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Παίρνουμε τις τιμές από τα πεδία
    const lengthInputElement = document.getElementById("sequenceLength");
    const maxPageInputElement = document.getElementById("maxPageNumber");
    const lengthInput = lengthInputElement.value.trim();
    const maxPageInput = maxPageInputElement.value.trim();

    const length = parseInt(lengthInput, 10); // Μήκος ακολουθίας
    const maxPageNumber = parseInt(maxPageInput, 10); // Μέγιστος αριθμός σελίδας

    // Έλεγχος εγκυρότητας για το μήκος ακολουθίας
    if (isNaN(length) || length <= 0) {
        displayError(lengthInputElement, "Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας (θετικός αριθμός)!");
        return;
    }
    

    // Έλεγχος εγκυρότητας για τον μέγιστο αριθμό σελίδας
    if (isNaN(maxPageNumber) || maxPageNumber <= 0) {
        displayError(maxPageInputElement, "Παρακαλώ εισάγετε έγκυρο μέγιστο αριθμό σελίδας (θετικός αριθμός)!");
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
}


// Κώδικας για το resetButton
const resetButton = document.getElementById('resetButton');

// Προσθέτουμε λειτουργικότητα επαναφοράς
resetButton.addEventListener('click', () => {
    // Επαναφορά των πεδίων εισόδου
    document.getElementById('pages').value = '';
    document.getElementById('frame-number').value = '';

    // Επαναφορά των αποτελεσμάτων
    document.getElementById('seek-count').innerText = '';
    document.getElementById('seek-sequence').innerHTML = '';
    resultText.innerHTML = ''; // Καθαρισμός αποτελεσμάτων
   document.getElementById("sequenceLength").value = ""; // Μηδενισμός του sequence length
   document.getElementById('maxPageNumber').value = ''; // Μηδενισμός του μέγιστου αριθμού σελίδας
      // Απόκρυψη του πίνακα οπτικοποίησης
      document.getElementById("sequence-container").style.display = "none";
    // Μηδενισμός μεταβλητών
    pages = [];
    frames = [];
    maxFrames = 0;
    step = 0;
    faultCount = 0;
    hitCount = 0;
    pageFrames = [];

    // Απόκρυψη του κουμπιού επαναφοράς
    resetButton.style.display = 'none';

    // Καταγραφή στο console για επαλήθευση
    console.log('Η εφαρμογή επαναφέρθηκε στην αρχική κατάσταση.');
});

// Ενεργοποίηση του κουμπιού όταν χρειάζεται
function enableResetButton() {
    resetButton.style.display = 'block';
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
    const canvasContainer = document.getElementById("seek-sequence");
    const minWidth = 800; // Ελάχιστο πλάτος
    const additionalWidth = (sequenceLength - 10) * 50; // Προσθήκη 50px για κάθε επιπλέον στοιχείο πέρα από τα 10
    const newWidth = Math.max(minWidth, minWidth + additionalWidth);

    canvasContainer.style.width = `${newWidth}px`; // Ενημέρωση του πλάτους
    canvasContainer.style.overflowX = "auto"; // Ενεργοποίηση οριζόντιας κύλισης
}


// Συνάρτηση για εμφάνιση μηνύματος σφάλματος
function displayError(inputElement, errorMessage) {
    // Βεβαιωθείτε ότι το στοιχείο εισαγωγής υπάρχει
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

    // Προσθήκη του μηνύματος κάτω από το πεδίο εισαγωγής
    inputElement.parentElement.appendChild(errorBox);
}


// Συνάρτηση για εκκαθάριση μηνυμάτων σφάλματος
function clearErrorMessages() {
    document.querySelectorAll(".error-message").forEach(el => el.remove());
    document.querySelectorAll("input").forEach(input => (input.style.borderColor = ""));
}