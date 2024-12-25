let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table;
let resultText = document.getElementById('resultText');

let pageFrames = [];
let pageFaults = 0;
let hits = 0; // Μετατροπή σε καθολικές μεταβλητές


function initializeSimulation() {
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    if (!isValidInput(pageInput, maxFrames)) {
        return;
    }

    pages = pageInput.split(',').map(Number);
    pageFrames = Array(maxFrames).fill(null); // Επαναφορά frames
    pageFaults = 0;
    hits = 0;
    step = 0;

    createTable();

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

    // Ρύθμιση δυναμικού πλάτους καμβά
    adjustCanvasWidth(pages.length);
    enableResetButton();
}


// Προβολή ενός βήματος της προσομοίωσης
function nextStep() {
    if (step === 0 && table) {
        initializeSimulation(); // Ξεκινά νέα προσομοίωση αν δεν έχει ξεκινήσει
    }

    if (step >= pages.length) {
        // Δημιουργία δυναμικού μηνύματος ολοκλήρωσης
        const completionMessage = document.getElementById("completionMessage");
        if (!completionMessage) {
            const message = document.createElement("div");
            message.id = "completionMessage";
            message.textContent = "Η προσομοίωση ολοκληρώθηκε!";
            message.style.color = "blue";
            message.style.marginTop = "10px";
            document.getElementById("seek-sequence").appendChild(message);
        }
        return; // Επιστροφή αν η προσομοίωση ολοκληρώθηκε
    }

    const page = pages[step];
    const pageTable = Array.from(table.getElementsByTagName("td"));
    let isFault = false;

    if (!pageFrames.includes(page)) { // Page fault
        pageFaults++;
        isFault = true;
        if (pageFrames.includes(null)) {
            const index = pageFrames.indexOf(null); // Βρες την πρώτη κενή θέση
            pageFrames[index] = page; // Προσθήκη στη θέση
        } else {
            const replaceIndex = predict(pages, pageFrames, pages.length, step + 1); // Βρες τη θέση αντικατάστασης
            pageFrames[replaceIndex] = page; // Αντικατάσταση
        }
    } else {
        hits++; // Αύξηση hits
    }

    // Ενημέρωση πίνακα: Χρωματίζεται μόνο το κελί που αντιστοιχεί σε fault ή hit
    pageTable.forEach(cell => {
        const frameIndex = cell.getAttribute("data-frame");
        if (cell.getAttribute("data-step") == step) {
            if (pageFrames[frameIndex] === page) {
                cell.innerText = page;
                cell.style.backgroundColor = isFault ? '#f8d7da' : '#d4edda'; // Κόκκινο για fault, πράσινο για hit
            } else {
                cell.innerText = pageFrames[frameIndex] ?? '';
                cell.style.backgroundColor = ''; // Επαναφορά για μη σχετιζόμενα κελιά
            }
        }
    });

    step++;

    // Ενημέρωση αποτελεσμάτων
    resultText.innerHTML = `
        <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${pageFaults}</span><br>
        <span class="hits">Συνολικός αριθμός hits: ${hits}</span>
    `;
}





function updateTable() {
    const pageTable = Array.from(table.getElementsByTagName("td"));
    pages.forEach((page, i) => {
        if (!pageFrames.includes(page)) { // Page fault
            pageFaults++;
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
        } else { // Hit
            hits++;
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

    // Ενημέρωση αποτελεσμάτων
    resultText.innerHTML = `
        <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${pageFaults}</span><br>
        <span class="hits">Συνολικός αριθμός hits: ${hits}</span>
    `;
}




// Συνάρτηση για την έναρξη της προσομοίωσης
function runOPTIMAL() {
    initializeSimulation();
    updateTable();
    enableResetButton();
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


function generateSequence() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    const lengthInputElement = document.getElementById("sequenceLength");
    const maxPageInputElement = document.getElementById("maxPageNumber");
    const lengthInput = lengthInputElement.value.trim();
    const maxPageInput = maxPageInputElement.value.trim();

    const length = parseInt(lengthInput, 10);
    const maxPageNumber = parseInt(maxPageInput, 10);

    if (isNaN(length) || length <= 0) {
        displayError(lengthInputElement, "Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας (θετικός αριθμός)!");
        return;
    }

    if (isNaN(maxPageNumber) || maxPageNumber <= 0) {
        displayError(maxPageInputElement, "Παρακαλώ εισάγετε έγκυρο μέγιστο αριθμό σελίδας (θετικός αριθμός)!");
        return;
    }

    const sequence = [];
    for (let i = 0; i < length; i++) {
        const randomPage = Math.floor(Math.random() * maxPageNumber) + 1;
        sequence.push(randomPage);
    }

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
    const seekSequence = document.getElementById("seek-sequence");
    const minWidth = 800; // Ελάχιστο πλάτος
    const additionalWidth = (sequenceLength - 10) * 50; // Προσθήκη 50px για κάθε επιπλέον στοιχείο πέρα από τα 10
    const newWidth = Math.max(minWidth, minWidth + additionalWidth);

    seekSequence.style.width = `${newWidth}px`; // Ενημέρωση του πλάτους
    seekSequence.style.overflowX = "auto"; // Ενεργοποίηση οριζόντιας κύλισης
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

