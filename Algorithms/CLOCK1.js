// Υλοποίηση του αλγορίθμου αντικατάστασης σελίδων Clock

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
 
class ClockPageReplacement {
  constructor(frames) {
    this.frames = frames; // Μέγιστος αριθμός πλαισίων
    this.pages = []; // Κυκλικός πίνακας για την αποθήκευση των σελίδων
    this.referenceBits = []; // Bits αναφοράς για κάθε σελίδα
    this.clockPointer = 0; // Δείκτης που λειτουργεί ως χρονοδείκτης (ρολόι)
  }

  accessPage(page) {
    // Ελέγχει αν η σελίδα είναι ήδη στη μνήμη
    const pageIndex = this.pages.indexOf(page);

    if (pageIndex !== -1) {
      // Σελίδα υπάρχει στη μνήμη (hit): θέτει το bit αναφοράς σε 1
      this.referenceBits[pageIndex] = 1;
      return 'hit';
    }

    // Σφάλμα σελίδας (fault): Αν υπάρχουν κενά πλαίσια, γεμίζουμε πρώτα
    const emptyIndex = this.pages.indexOf(null);
    if (emptyIndex !== -1) {
      this.pages[emptyIndex] = page;
      this.referenceBits[emptyIndex] = 0; // Θέτουμε το bit αναφοράς σε 0
      return 'fault';
    }

    // Όλα τα πλαίσια είναι γεμάτα, εξετάζουμε κυκλικά για αντικατάσταση
    let startPointer = this.clockPointer;
    let oldestIndex = null;

    while (true) {
      if (this.referenceBits[this.clockPointer] === 0) {
        // Εντοπισμός υποψηφίου για αντικατάσταση
        if (oldestIndex === null) {
          oldestIndex = this.clockPointer;
        }
      } else {
        // Αν το bit αναφοράς είναι 1, το μηδενίζουμε και προχωράμε
        this.referenceBits[this.clockPointer] = 0;
      }

      this.clockPointer = (this.clockPointer + 1) % this.frames;

      // Αν ολοκληρώσουμε τον κύκλο και υπάρχει υποψήφιος για αντικατάσταση
      if (this.clockPointer === startPointer) {
        if (oldestIndex !== null) {
          this.pages[oldestIndex] = page;
          this.referenceBits[oldestIndex] = 0; // Θέτουμε το bit αναφοράς της νέας σελίδας σε 0
          this.clockPointer = (oldestIndex + 1) % this.frames;
          return 'fault';
        }
      }
    }
  }

  run(sequence) {
    const results = [];
    this.pages = Array(this.frames).fill(null); // Αρχικοποίηση των πλαισίων
    this.referenceBits = Array(this.frames).fill(0); // Αρχικοποίηση των bits αναφοράς με 0
    this.clockPointer = 0; // Επαναφορά του δείκτη ρολογιού

    for (const page of sequence) {
      const result = this.accessPage(page); // Εκτέλεση για κάθε σελίδα στη σειρά
      results.push({
        page,
        result,
        memory: [...this.pages],
        referenceBits: [...this.referenceBits],
      });
    }

    return results; // Επιστροφή των αποτελεσμάτων
  }
}

// Παράδειγμα χρήσης
function runCLOCK() {
  const sequenceInput = document.getElementById('pages').value.split(',').map(Number); // Λήψη της ακολουθίας σελίδων
  const frameInput = parseInt(document.getElementById('frame-number').value, 10); // Λήψη του αριθμού πλαισίων

  if (isNaN(frameInput) || frameInput <= 0) {
    alert('Παρακαλώ εισάγετε έγκυρο αριθμό πλαισίων.');
    return;
  }

  const clockAlgorithm = new ClockPageReplacement(frameInput); // Δημιουργία αντικειμένου για τον αλγόριθμο Clock
  const results = clockAlgorithm.run(sequenceInput); // Εκτέλεση του αλγορίθμου

  const table = document.querySelector('.visual-table');
  table.innerHTML = '<tr><th>Σελίδα</th><th>Αποτέλεσμα</th><th>Πλαίσια</th><th>Bits Αναφοράς</th></tr>';

  results.forEach((step) => {
    const row = document.createElement('tr');
    const memoryState = step.memory.map((frame) => (frame === null ? '-' : frame)).join(', ');
    const referenceState = step.referenceBits.join(', ');

    row.innerHTML = `
      <td>${step.page}</td>
      <td style="color: ${step.result === 'hit' ? 'green' : 'red'}">${step.result}</td>
      <td>${memoryState}</td>
      <td>${referenceState}</td>
    `;

    table.appendChild(row); // Προσθήκη της γραμμής στον πίνακα
  });

  document.getElementById('resetButton').style.display = 'block'; // Εμφάνιση του κουμπιού επαναφοράς
}


const resetButton = document.getElementById('resetButton');

resetButton.addEventListener('click', () => {
    document.getElementById('pages').value = ''; // Επαναφορά εισαγόμενων δεδομένων
    document.getElementById('frame-number').value = ''; // Επαναφορά αριθμού πλαισίων
    document.querySelector('.visual-table').innerHTML = ''; // Επαναφορά του πίνακα
    document.getElementById('resetButton').style.display = 'none'; // Απόκρυψη του κουμπιού επαναφοράς
    document.getElementById('maxPageNumber').value = ''; 
    document.getElementById('sequenceLength').value = ''; 
    frames = [];
    secondChance = [];
    step = 0;
    pointer = 0;

   

    resetButton.style.display = 'none';
});


function enableResetButton() {
    resetButton.style.display = 'block';
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
