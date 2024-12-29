let pages = [];
let frames = [];
let secondChance = [];
let maxFrames;
let step = 0;
let table;
let pointer = 0;

let resultText = document.getElementById('resultText');
let faultCount = 0;
let hitCount = 0;

function initializeSimulation() {
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    if (!isValidInput(pageInput, maxFrames)) {
        return;
    }

    // Επαναφορά όλων των μετρητών
    faultCount = 0;
    hitCount = 0;

    pages = pageInput.split(',').map(Number);
    frames = Array(maxFrames).fill(null);
    secondChance = Array(maxFrames).fill(false);
    step = 0;
    pointer = 0;

    createTable();
    enableResetButton();
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

function nextStep() {
    if (pages.length === 0 || frames.length === 0) {
        initializeSimulation();
    }

    if (step >= pages.length) {
        const completionMessage = document.getElementById("completionMessage");
        if (!completionMessage) {
            const message = document.createElement("div");
            message.id = "completionMessage";
            message.textContent = "Η προσομοίωση ολοκληρώθηκε!";
            message.style.color = "blue";
            message.style.marginTop = "10px";
            document.getElementById("seek-sequence").appendChild(message);
        }
        return;
    }

    const page = pages[step]; // Τρέχουσα σελίδα
    let hit = false;

    // Ελέγχουμε αν υπάρχει ήδη η σελίδα
    const frameIndex = frames.indexOf(page);
    if (frameIndex !== -1) {
        hit = true;
        secondChance[frameIndex] = true; // Ενημέρωση bit αναφοράς
        console.log(`Hit: Page ${page} found in frame ${frameIndex}`);
        hitCount++;
    } else {
        faultCount++;
        console.log(`Fault: Page ${page} not found. Searching for replacement...`);
        
        while (true) {
            console.log(
                `Checking frame ${pointer}: Page ${frames[pointer]} with reference bit = ${secondChance[pointer]}`
            );

            if (!secondChance[pointer]) {
                console.log(`Replacing page ${frames[pointer]} with page ${page} in frame ${pointer}`);
                frames[pointer] = page; // Αντικατάσταση σελίδας
                secondChance[pointer] = true; // Θέτουμε το reference bit σε 1
                pointer = (pointer + 1) % maxFrames; // Κυκλική κίνηση δείκτη
                break;
            } else {
                console.log(`Skipping frame ${pointer}: Reference bit = 1. Setting to 0.`);
                secondChance[pointer] = false;
                pointer = (pointer + 1) % maxFrames; // Κυκλική κίνηση δείκτη
            }
        }
    }

    updateTable(step, page, hit); // Ενημέρωση πίνακα
    step++;
}

function runCLOCK() {
    initializeSimulation(); // Αρχικοποίηση της προσομοίωσης

    while (step < pages.length) {
        nextStep();
    }
}



function generateSequence() {
    clearErrorMessages();

    const lengthInput = document.getElementById("sequenceLength");
    const maxPageInput = document.getElementById("maxPageNumber");

    const length = parseInt(lengthInput.value.trim(), 10);
    const maxPageNumber = parseInt(maxPageInput.value.trim(), 10);

    if (isNaN(length) || length <= 0) {
        displayError(lengthInput, "Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας.");
        return;
    }

    if (isNaN(maxPageNumber) || maxPageNumber <= 0) {
        displayError(maxPageInput, "Παρακαλώ εισάγετε έγκυρο μέγιστο αριθμό σελίδας.");
        return;
    }

    const sequence = [];
    for (let i = 0; i < length; i++) {
        const randomPage = Math.floor(Math.random() * maxPageNumber) + 1;
        sequence.push(randomPage);
    }

    document.getElementById("pages").value = sequence.join(',');
}

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', () => {
    document.getElementById('pages').value = '';
    document.getElementById('frame-number').value = '';
    document.getElementById('seek-sequence').innerHTML = '';
    document.getElementById('resultText').innerText = '';
    pages = [];
    frames = [];
    secondChance = [];
    step = 0;
    pointer = 0;
    resetButton.style.display = 'none';
});

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
