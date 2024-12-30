class ClockPageReplacement {
  constructor(frames) {
    this.frames = frames; // Μέγιστος αριθμός πλαισίων
    this.pages = []; // Κυκλικός πίνακας για την αποθήκευση των σελίδων
    this.referenceBits = []; // Bits αναφοράς για κάθε σελίδα
    this.clockPointer = 0; // Δείκτης που λειτουργεί ως χρονοδείκτης (ρολόι)
  }

  findAndUpdate(page) {
    // Ελέγχει αν η σελίδα είναι ήδη στη μνήμη
    const pageIndex = this.pages.indexOf(page);

    if (pageIndex !== -1) {
      // Σελίδα υπάρχει στη μνήμη (hit): θέτει το bit αναφοράς σε true
      this.referenceBits[pageIndex] = true;
      return true; // Hit
    }

    return false; // Miss
  }

  replaceAndUpdate(page) {
    while (true) {
      // Ελέγχει αν το bit αναφοράς είναι false
      if (!this.referenceBits[this.clockPointer]) {
        // Αντικαθιστά τη σελίδα
        this.pages[this.clockPointer] = page;
        this.referenceBits[this.clockPointer] = false; // Θέτουμε το bit αναφοράς της νέας σελίδας σε false

        // Ενημερώνουμε τον δείκτη κυκλικά
        this.clockPointer = (this.clockPointer + 1) % this.frames;
        return;
      }

      // Ενημερώνουμε το bit αναφοράς σε false και προχωράμε στον επόμενο δείκτη
      this.referenceBits[this.clockPointer] = false;
      this.clockPointer = (this.clockPointer + 1) % this.frames;
    }
  }

  accessPage(page) {
    if (!this.findAndUpdate(page)) {
      // Αν υπάρχει σφάλμα σελίδας
      this.replaceAndUpdate(page);
      return 'fault';
    }

    return 'hit';
  }

  run(sequence, frameInput) {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Έλεγχος δεδομένων εισόδου
    const pageArray = sequence.split(',').map((num) => num.trim());
    for (let page of pageArray) {
      if (isNaN(page) || page === '' || page < 0 || page > 100) {
        const pageInputElement = document.getElementById('pages');
        displayError(
          pageInputElement,
          'Η ακολουθία σελίδων πρέπει να περιέχει μόνο αριθμούς από 0 έως 100, διαχωρισμένους με κόμμα.'
        );
        return;
      }
    }

    if (pageArray.length > 100) {
      const pageInputElement = document.getElementById('pages');
      displayError(pageInputElement, 'Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!');
      return;
    }

    if (isNaN(frameInput) || frameInput <= 0 || frameInput > 25) {
      const frameInputElement = document.getElementById('frame-number');
      displayError(frameInputElement, 'Παρακαλώ εισάγετε έναν αριθμό πλαισίων από 1 έως 25.');
      return;
    }

    const results = [];
    let faultCount = 0;
    let hitCount = 0;
    this.pages = Array(this.frames).fill(null); // Αρχικοποίηση των πλαισίων
    this.referenceBits = Array(this.frames).fill(false); // Αρχικοποίηση των bits αναφοράς με false
    this.clockPointer = 0; // Επαναφορά του δείκτη ρολογιού

    for (const page of pageArray) {
      const result = this.accessPage(page); // Εκτέλεση για κάθε σελίδα στη σειρά
      if (result === 'fault') faultCount++;
      else hitCount++;

      results.push({
        page,
        result,
        memory: [...this.pages],
        referenceBits: [...this.referenceBits],
        pointer: this.clockPointer,
      });
    }

    return { results, faultCount, hitCount }; // Επιστροφή των αποτελεσμάτων
  }
}

// Παράδειγμα χρήσης
function runCLOCK() {
  const sequenceInput = document.getElementById('pages').value; // Λήψη της ακολουθίας σελίδων
  const frameInput = parseInt(document.getElementById('frame-number').value, 10); // Λήψη του αριθμού πλαισίων

  const clockAlgorithm = new ClockPageReplacement(frameInput); // Δημιουργία αντικειμένου για τον αλγόριθμο Clock
  const { results, faultCount, hitCount } = clockAlgorithm.run(sequenceInput, frameInput); // Εκτέλεση του αλγορίθμου

  const table = document.querySelector('.visual-table');
  table.innerHTML = '<tr><th>Σελίδα</th><th>Αποτέλεσμα</th><th>Πλαίσια</th><th>Bits Αναφοράς</th><th>Δείκτης</th></tr>';

  results.forEach((step) => {
    const row = document.createElement('tr');
    const memoryState = step.memory.map((frame) => (frame === null ? '-' : frame)).join(', ');
    const referenceState = step.referenceBits.map((bit) => (bit ? '1' : '0')).join(', ');

    row.innerHTML = `
      <td>${step.page}</td>
      <td style="color: ${step.result === 'hit' ? 'green' : 'red'}">${step.result}</td>
      <td>${memoryState}</td>
      <td>${referenceState}</td>
      <td>${step.pointer}</td>
    `;

    table.appendChild(row); // Προσθήκη της γραμμής στον πίνακα
  });

  const resultText = document.getElementById('resultText');
  resultText.innerHTML = `
        <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
        <span class="hits">Συνολικός αριθμός hits: ${hitCount}</span>
    `;

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
    const resultText = document.getElementById('resultText');
    resultText.innerHTML = ''; // Καθαρισμός αποτελεσμάτων

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

    if (isNaN(length) || length <= 0 || length > 100) {
        displayError(lengthInput, "Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας.");
        return;
    }

    if (isNaN(maxPageNumber) || maxPageNumber <= 0 || maxPageNumber >100) {
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


  function displayError(inputElement, errorMessage) {
    if (!inputElement) return;

    // Καθαρισμός υπάρχοντος μηνύματος σφάλματος
    const existingError = inputElement.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();

    // Δημιουργία στοιχείου για το μήνυμα σφάλματος
    const errorBox = document.createElement('div');
    errorBox.className = 'error-message';
    errorBox.textContent = errorMessage;
    errorBox.style.color = 'red';
    errorBox.style.fontSize = '14px';
    errorBox.style.marginTop = '5px';

    // Προσθήκη μηνύματος σφάλματος στο DOM
    inputElement.parentElement.appendChild(errorBox);
  }

  function clearErrorMessages() {
    document.querySelectorAll('.error-message').forEach((el) => el.remove());
    document.querySelectorAll('input').forEach((input) => (input.style.borderColor = ''));
  }
