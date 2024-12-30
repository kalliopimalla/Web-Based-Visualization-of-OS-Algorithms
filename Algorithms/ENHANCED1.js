class EnhancedSecondChance {
    constructor(frames) {
      this.frames = frames; // Μέγιστος αριθμός πλαισίων
      this.pages = []; // Κυκλικός πίνακας για την αποθήκευση των σελίδων
      this.referenceBits = []; // Bits αναφοράς για κάθε σελίδα
      this.modifyBits = []; // Bits τροποποίησης για κάθε σελίδα
      this.pointer = 0; // Δείκτης που λειτουργεί ως δείκτης ρολογιού
    }
  
    findAndUpdate(page) {
      const pageIndex = this.pages.indexOf(page);
  
      if (pageIndex !== -1) {
        // Σελίδα υπάρχει στη μνήμη (hit): ενημέρωση reference bit
        this.referenceBits[pageIndex] = true;
        return true; // Hit
      }
  
      return false; // Miss
    }
  
    replaceAndUpdate(page) {
      while (true) {
        const refBit = this.referenceBits[this.pointer];
        const modBit = this.modifyBits[this.pointer];
  
        if (refBit === false && modBit === false) {
          // Αντικατάσταση σελίδας χαμηλότερης προτεραιότητας (0,0)
          this.pages[this.pointer] = page;
          this.referenceBits[this.pointer] = true; // Ορίζουμε reference bit της νέας σελίδας
          this.modifyBits[this.pointer] = false; // Αρχικοποίηση modify bit
          this.pointer = (this.pointer + 1) % this.frames;
          return;
        }
  
        // Αντίστοιχη ενημέρωση ανά προτεραιότητα
        if (refBit === false && modBit === true) {
          this.referenceBits[this.pointer] = false; // Υποβιβασμός προτεραιότητας
        } else if (refBit === true) {
          this.referenceBits[this.pointer] = false; // Μηδενισμός reference bit για δεύτερη ευκαιρία
        }
  
        this.pointer = (this.pointer + 1) % this.frames; // Κυκλική ενημέρωση δείκτη
      }
    }
  
    accessPage(page) {
      if (!this.findAndUpdate(page)) {
        // Σφάλμα σελίδας: αντικατάσταση
        this.replaceAndUpdate(page);
        return 'fault';
      }
  
      return 'hit';
    }
  
    run(sequence, frameInput) {
      const pageArray = sequence.split(',').map((num) => num.trim());
      for (let page of pageArray) {
        if (isNaN(page) || page === '' || page < 0 || page > 100) {
          throw new Error('Η ακολουθία σελίδων πρέπει να περιέχει μόνο αριθμούς από 0 έως 100, διαχωρισμένους με κόμμα.');
        }
      }
  
      if (pageArray.length > 100) {
        throw new Error('Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!');
      }
  
      if (isNaN(frameInput) || frameInput <= 0 || frameInput > 25) {
        throw new Error('Παρακαλώ εισάγετε έναν αριθμό πλαισίων από 1 έως 25.');
      }
  
      const results = [];
      let faultCount = 0;
      let hitCount = 0;
      this.pages = Array(this.frames).fill(null); // Αρχικοποίηση των πλαισίων
      this.referenceBits = Array(this.frames).fill(false); // Αρχικοποίηση των reference bits
      this.modifyBits = Array(this.frames).fill(false); // Αρχικοποίηση των modify bits
      this.pointer = 0; // Επαναφορά δείκτη
  
      for (const page of pageArray) {
        const result = this.accessPage(page); // Εκτέλεση για κάθε σελίδα στη σειρά
        if (result === 'fault') faultCount++;
        else hitCount++;
  
        results.push({
          page,
          result,
          memory: [...this.pages],
          referenceBits: [...this.referenceBits],
          modifyBits: [...this.modifyBits],
          pointer: this.pointer,
        });
      }
  
      return { results, faultCount, hitCount }; // Επιστροφή αποτελεσμάτων
    }
  }
  
  function runEnhancedSecondChance() {
    try {
      const sequenceInput = document.getElementById('pages').value; // Λήψη της ακολουθίας σελίδων
      const frameInput = parseInt(document.getElementById('frame-number').value, 10); // Λήψη του αριθμού πλαισίων
  
      const enhancedAlgorithm = new EnhancedSecondChance(frameInput); // Δημιουργία αντικειμένου
      const { results, faultCount, hitCount } = enhancedAlgorithm.run(sequenceInput, frameInput); // Εκτέλεση του αλγορίθμου
  
      // Ενημέρωση αποτελεσμάτων και οπτικοποίηση όπως στον Clock
      updateVisualization(results, faultCount, hitCount);
    } catch (error) {
      alert(error.message); // Εμφάνιση μηνύματος σφάλματος
    }
  }
  
  function updateVisualization(results, faultCount, hitCount) {
    const resultText = document.getElementById('resultText');
    resultText.innerHTML = `
      <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
      <span class="hits">Συνολικός αριθμός hits: ${hitCount}</span>
    `;
  
    // Ενημέρωση πίνακα
    createClockTable(results.length, results[0].memory.length);
    results.forEach((step, index) => {
      const frameCells = document.querySelectorAll(`.visual-table td[data-step='${index}']`);
      step.memory.forEach((frame, frameIndex) => {
        const cell = frameCells[frameIndex];
        if (cell) {
          cell.innerText = frame !== null ? frame : '-';
          cell.style.backgroundColor = step.result === 'fault' && step.memory[frameIndex] === step.page
            ? '#f8d7da'
            : step.result === 'hit' && step.memory[frameIndex] === step.page
            ? '#d4edda'
            : '';
        }
      });
    });
  }
  
  function createClockTable(sequenceLength, frames) {
    const seekSequence = document.getElementById('seek-sequence');
    seekSequence.innerHTML = ''; // Καθαρισμός του πίνακα
  
    const table = document.createElement('table');
    table.classList.add('visual-table');
  
    // Δημιουργία επικεφαλίδας
    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    emptyHeader.innerText = 'Χρονική στιγμή';
    headerRow.appendChild(emptyHeader);
  
    for (let i = 0; i < sequenceLength; i++) {
      const th = document.createElement('th');
      th.innerText = `T${i + 1}`;
      headerRow.appendChild(th);
    }
  
    table.appendChild(headerRow);
  
    // Δημιουργία σειρών για τα πλαίσια
    for (let i = 0; i < frames; i++) {
      const frameRow = document.createElement('tr');
      const frameHeader = document.createElement('th');
      frameHeader.innerText = `Πλαίσιο ${i + 1}`;
      frameRow.appendChild(frameHeader);
  
      for (let j = 0; j < sequenceLength; j++) {
        const td = document.createElement('td');
        td.setAttribute('data-frame', i);
        td.setAttribute('data-step', j);
        frameRow.appendChild(td);
      }
  
      table.appendChild(frameRow);
    }
  
    seekSequence.appendChild(table);
  }
  

  
  let currentStep = 0;
  let enhancedResults = [];
  
  function runEnhancedStepByStep() {
    const sequenceInput = document.getElementById('pages').value;
    const frameInput = parseInt(document.getElementById('frame-number').value, 10);
  
    if (currentStep === 0) {
      const enhancedAlgorithm = new EnhancedSecondChance(frameInput);
      const { results, faultCount, hitCount } = enhancedAlgorithm.run(sequenceInput, frameInput);
      enhancedResults = results;
  
      document.getElementById('resultText').innerHTML = `
        <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${faultCount}</span><br>
        <span class="hits">Συνολικός αριθμός hits: ${hitCount}</span>
      `;
  
      createClockTable(results.length, results[0].memory.length);
    }
  
    if (currentStep < enhancedResults.length) {
      updateStepVisualization(enhancedResults[currentStep]);
      currentStep++;
    } else {
      alert('Η οπτικοποίηση ολοκληρώθηκε!');
    }
  }
  
  function updateStepVisualization(step) {
    const frameCells = document.querySelectorAll(`.visual-table td[data-step='${currentStep}']`);
    step.memory.forEach((frame, frameIndex) => {
      const cell = frameCells[frameIndex];
      if (cell) {
        cell.innerText = frame !== null ? `${frame}` : '-';
        cell.style.backgroundColor = step.result === 'fault' && step.memory[frameIndex] === step.page
          ? '#f8d7da'
          : step.result === 'hit' && step.memory[frameIndex] === step.page
          ? '#d4edda'
          : '';
      }
    });
  }
  



resetButton.addEventListener('click', () => {
    document.getElementById('pages').value = ''; // Επαναφορά εισαγόμενων δεδομένων
    document.getElementById('frame-number').value = ''; // Επαναφορά αριθμού πλαισίων
    document.querySelector('.visual-table').innerHTML = ''; // Επαναφορά του πίνακα
    document.getElementById('resetButton').style.display = 'none'; // Απόκρυψη του κουμπιού επαναφοράς
    document.getElementById('maxPageNumber').value = ''; 
    document.getElementById('sequenceLength').value = ''; 
    const resultText = document.getElementById('resultText');
    resultText.innerHTML = ''; // Καθαρισμός αποτελεσμάτων
   // Επαναφορά πινάκων
   document.querySelector('.visual-table').innerHTML = ''; // Καθαρισμός πίνακα σταδιακής εκτέλεσης
   const finalTableContainer = document.getElementById('final-table-container');
   if (finalTableContainer) {
       finalTableContainer.querySelector('.final-table').innerHTML = ''; // Καθαρισμός τελικού πίνακα
   }

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
        displayError(lengthInput, "Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας ( 1 - 100 ).");
        return;
    }

    if (isNaN(maxPageNumber) || maxPageNumber < 0 || maxPageNumber >100) {
        displayError(maxPageInput, "Παρακαλώ εισάγετε έγκυρο μέγιστο αριθμό σελίδας( 0 - 100 ).");
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
