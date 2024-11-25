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


    enableResetButton();

}

// Προβολή ενός βήματος της προσομοίωσης
function nextStep() {
    if (step === 0 && table) {
        initializeSimulation(); // Ξεκινά νέα προσομοίωση αν δεν έχει ξεκινήσει
    }

    if (step < pages.length) {
        const page = pages[step];
        const pageTable = Array.from(table.getElementsByTagName("td"));

        if (!pageFrames.includes(page)) { // Page fault
            pageFaults++;
            if (pageFrames.includes(null)) {
                const index = pageFrames.indexOf(null); // Βρες την πρώτη κενή θέση
                pageFrames[index] = page; // Προσθήκη στη θέση
            } else {
                const replaceIndex = predict(pages, pageFrames, pages.length, step + 1);
                pageFrames[replaceIndex] = page; // Αντικατάσταση
            }
        } else {
            hits++; // Αύξηση hits
        }

        // Ενημέρωση πίνακα
        pageTable.forEach(cell => {
            if (cell.getAttribute("data-step") == step) {
                const frameIndex = cell.getAttribute("data-frame");
                cell.innerText = pageFrames[frameIndex] ?? ''; // Ενημέρωση κελιού
                cell.style.backgroundColor =
                    pageFrames[frameIndex] === page ? '#d4edda' : '#f8d7da'; // Πράσινο για hit, Κόκκινο για fault
            }
        });

        step++;
    } else {
        alert("Η προσομοίωση ολοκληρώθηκε!");
    }

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



// Λειτουργία για την τυχαία δημιουργία ακολουθίας σελίδων
function generateSequence() {
    const length = 10; // Μήκος της ακολουθίας
    const maxPageNumber = 100; // Μέγιστη τιμή σελίδας
    const sequence = Array.from({ length }, () => Math.floor(Math.random() * maxPageNumber) + 1);
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
  
  