class EnhancedSecondChance {
    constructor(frames) {
        this.frames = frames; // Μέγιστος αριθμός πλαισίων
        this.pages = []; // Πίνακας για αποθήκευση σελίδων
        this.referenceBits = []; // Bits αναφοράς για κάθε σελίδα
        this.clockPointer = 0; // Δείκτης για τον αλγόριθμο
    }

    accessPage(page) {
        // Ελέγχει αν η σελίδα είναι ήδη στη μνήμη
        const pageIndex = this.pages.indexOf(page);

        if (pageIndex !== -1) {
            // Αν η σελίδα υπάρχει, ενημερώνουμε το bit αναφοράς
            this.referenceBits[pageIndex] = 1;
            return 'hit';
        }

        // Σφάλμα σελίδας: Αν υπάρχουν κενά πλαίσια
        if (this.pages.length < this.frames) {
            this.pages.push(page);
            this.referenceBits.push(1); // Θέτουμε το bit αναφοράς της νέας σελίδας σε 1
            return 'fault';
        }

        // Όλα τα πλαίσια είναι γεμάτα, εφαρμόζουμε τον αλγόριθμο αντικατάστασης
        while (true) {
            const refBit = this.referenceBits[this.clockPointer];

            if (refBit === 0) {
                // Αν το bit αναφοράς είναι 0, αντικαθιστούμε τη σελίδα
                this.pages[this.clockPointer] = page;
                this.referenceBits[this.clockPointer] = 1; // Θέτουμε το bit αναφοράς της νέας σελίδας σε 1
                this.clockPointer = (this.clockPointer + 1) % this.frames; // Προχωράμε τον δείκτη
                return 'fault';
            } else {
                // Αν το bit αναφοράς είναι 1, το μηδενίζουμε και προχωράμε στον επόμενο δείκτη
                this.referenceBits[this.clockPointer] = 0;
                this.clockPointer = (this.clockPointer + 1) % this.frames;
            }
        }
    }

    run(sequence) {
        const results = [];
        this.pages = []; // Αρχικοποίηση του πίνακα πλαισίων
        this.referenceBits = []; // Αρχικοποίηση των bits αναφοράς
        this.clockPointer = 0; // Επαναφορά του δείκτη ρολογιού

        for (const page of sequence) {
            const result = this.accessPage(page);
            results.push({
                page,
                result,
                memory: [...this.pages],
                referenceBits: [...this.referenceBits]
            });
        }

        return results; // Επιστροφή αποτελεσμάτων
    }
}

// Παράδειγμα χρήσης
function runEnhancedSecondChance() {
    const sequenceInput = document.getElementById('pages').value.split(',').map(Number); // Λήψη της ακολουθίας σελίδων
    const frameInput = parseInt(document.getElementById('frame-number').value, 10); // Λήψη του αριθμού πλαισίων

    if (isNaN(frameInput) || frameInput <= 0) {
        displayError(document.getElementById('frame-number'), 'Παρακαλώ εισάγετε έγκυρο αριθμό πλαισίων.');
        return;
    }

    const algo = new EnhancedSecondChance(frameInput); // Δημιουργία αντικειμένου για τον αλγόριθμο Enhanced Second Chance
    const results = algo.run(sequenceInput); // Εκτέλεση του αλγορίθμου

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


// Συνάρτηση για επαναφορά
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', () => {
    document.getElementById('pages').value = '';
    document.getElementById('frame-number').value = '';
    document.querySelector('.visual-table').innerHTML = '';
    document.getElementById('maxPageNumber').value = ''; 
    document.getElementById('sequenceLength').value = ''; 
    resetButton.style.display = 'none';
});


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
