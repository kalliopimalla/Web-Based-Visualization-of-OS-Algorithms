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
    resultText.innerHTML = `
        <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
        <span class="hits">Συνολικός αριθμός hits: ${hitCount}</span>
    `;
}

function runFIFO() {
    initializeSimulation();
    updateTable();
        // Ενεργοποίηση του κουμπιού επαναφοράς
        enableResetButton();
     

    
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
        
     
    
    } else {
   
        resultText.innerHTML = `
        <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
        <span class="hits">Συνολικός αριθμός hits: ${hitCount}</span>
    `;
    
    }



}
// Λειτουργία για την τυχαία δημιουργία ακολουθίας σελίδων
function generateSequence() {
    const lengthInput = document.getElementById("sequenceLength").value.trim();
    const length = parseInt(lengthInput, 10);

    if (isNaN(length) || length <= 0) {
        alert("Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας (θετικός αριθμός)!");
        return;
    }

    const maxPageNumber = 50; // Μέγιστη τιμή σελίδας
    const sequence = Array.from({ length }, () => Math.floor(Math.random() * maxPageNumber) + 1);

    document.getElementById("pages").value = sequence.join(',');

    // Καθαρισμός προηγούμενου περιεχομένου
    const sequenceBoxes = document.getElementById("seek-sequence-boxes");
    sequenceBoxes.innerHTML = ''; 

    // Ρύθμιση πλάτους καμβά
    adjustCanvasWidth(sequence.length);

    // Δημιουργία των στοιχείων της ακολουθίας
    sequence.forEach(page => {
        const box = document.createElement("div");
        box.classList.add("sequence-box");
        box.innerText = page;
        sequenceBoxes.appendChild(box);
    });
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
  
  function generateSequence() {
    const lengthInput = document.getElementById("sequenceLength").value.trim();
    const length = parseInt(lengthInput, 10);

    if (isNaN(length) || length <= 0) {
        alert("Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας (θετικός αριθμός)!");
        return;
    }

    const maxPageNumber = 50; // Μέγιστη τιμή σελίδας
    const sequence = Array.from({ length }, () => Math.floor(Math.random() * maxPageNumber) + 1);

    document.getElementById("pages").value = sequence.join(',');

    // Προσαρμογή πλάτους καμβά
    adjustCanvasWidth(sequence.length);
}


function adjustCanvasWidth(sequenceLength) {
    const canvasContainer = document.getElementById("seek-sequence");
    const minWidth = 800; // Ελάχιστο πλάτος
    const additionalWidth = (sequenceLength - 10) * 50; // Προσθήκη 50px για κάθε επιπλέον στοιχείο πέρα από τα 10
    const newWidth = Math.max(minWidth, minWidth + additionalWidth);

    canvasContainer.style.width = `${newWidth}px`; // Ενημέρωση του πλάτους
    canvasContainer.style.overflowX = "auto"; // Ενεργοποίηση οριζόντιας κύλισης
}
