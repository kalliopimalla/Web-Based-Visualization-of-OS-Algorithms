/**
 * Εκτελεί τον αλγόριθμο Shortest Seek Time First (SSTF) για την εξυπηρέτηση αιτημάτων δίσκου.
 * 
 * Αυτή η συνάρτηση διαβάζει τα δεδομένα εισόδου από την ιστοσελίδα, 
 * ελέγχει την εγκυρότητά τους και υπολογίζει τη σειρά εξυπηρέτησης 
 * των αιτημάτων με βάση την πλησιέστερη θέση κεφαλής δίσκου.
 * 
 * Η διαδικασία περιλαμβάνει:
 * - Έλεγχο της εγκυρότητας των δεδομένων εισόδου
 * - Διαχωρισμό και μετατροπή των αιτημάτων σε αριθμούς
 * - Υπολογισμό του συνολικού αριθμού κινήσεων της κεφαλής
 * - Ενημέρωση της εμφάνισης με τα αποτελέσματα
 * 
 * @returns {void} Δεν επιστρέφει τιμή.
 */


function runSSTF() {
    const inputQueue = document.getElementById("process-queue").value.trim();
    const headPositionInput = document.getElementById("head-position");
    const headPosition = parseInt(headPositionInput.value);
    const headPositionElement = document.getElementById("head-position");
    const cylinderRangeInput = document.getElementById("cylinder-number");
    const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10);

   
   
      // Επικύρωση του αριθμού κυλίνδρων
      if (isNaN(cylinderRange) || cylinderRange <= 0 || cylinderRange > 1000) {
        displayError(cylinderRangeInput, "Παρακαλώ εισάγετε έγκυρο αριθμό κυλίνδρων (1-1000).");
        return;
    }
 clearErrorMessages();
 
/**Σφαλμα για το αν η θεση της κεφαλης ειναι αρνητικος  */    
if (isNaN(headPosition) || headPosition < 0) {
    displayError(headPositionElement, "Η θέση της κεφαλής πρέπει να είναι θετικός αριθμός ή μηδέν.");
    return;
}
clearErrorMessages()

/**Σφάλμα για το αν υπαρχει αρχη κεφαλης κι ακολουθια  */
if (!inputQueue || isNaN(headPosition)) {
    displayError(headPositionInput, "Παρακαλώ εισάγετε έγκυρα δεδομένα!");
    return;
}
clearErrorMessages()


/**Σφάλμα για το αν υπαρχουν κενά στην εισοδο ή αν υπαρχει χαρακτήρας αντι για αριθμός  */
const requestQueue = inputQueue.split(",").map(item => {
    const num = Number(item.trim());
    if (isNaN(num)) {
        displayError(document.getElementById("process-queue"), 
            "Παρακαλώ εισάγετε έγκυρους αριθμούς διαχωρισμένους με κόμματα στην ουρά διεργασιών!");
        throw new Error("Invalid input in process queue");
    }
    return num;
});
clearErrorMessages()

/**Σφάλμα για το αν η ακολουθια ειναι μεγαλυτερη απο 100 αριθμοι */
if (requestQueue.length > 100) {
    displayError(document.getElementById("process-queue"), 
        "Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!");
    return;
}
clearErrorMessages()

    let seekCount = 0;
    let seekSequence = [headPosition];
    let currentPosition = headPosition;
    let remainingRequests = [...requestQueue];

    while (remainingRequests.length > 0) {
        let closestRequest = remainingRequests.reduce((prev, curr) =>
            Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev
        );

        seekCount += Math.abs(currentPosition - closestRequest);
        currentPosition = closestRequest;
        seekSequence.push(currentPosition);
        remainingRequests = remainingRequests.filter(req => req !== closestRequest);
    }

    // Εμφάνιση του συνολικού αριθμού κινήσεων με σταδιακή αύξηση
    const seekCountDisplay = document.getElementById("seek-count-display");
    seekCountDisplay.innerHTML = ""; // Καθαρισμός παλαιού περιεχομένου
    let currentCount = 0;
    const incrementValue = Math.ceil(seekCount / 20); // Βήμα αύξησης
    const interval = setInterval(() => {
        if (currentCount + incrementValue >= seekCount) {
            currentCount = seekCount;
            seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
            clearInterval(interval);
        } else {
            currentCount += incrementValue;
            seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
        }
    }, 50);

    // Δημιουργία κουτιών για τη σειρά εξυπηρέτησης
    const seekSequenceBoxes = document.getElementById("seek-sequence-boxes");
    seekSequenceBoxes.innerHTML = ""; // Καθαρισμός παλαιού περιεχομένου
    seekSequence.forEach((position, index) => {
        const box = document.createElement("div");
        box.className = "sequence-box";
        box.textContent = position;

        seekSequenceBoxes.appendChild(box);
        if (index < seekSequence.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "arrow";
            arrow.textContent = "→";
            seekSequenceBoxes.appendChild(arrow);
        }
    });

    visualizeSeekSequence(seekSequence, cylinderRange);


    // Εμφάνιση του κουμπιού επαναφοράς
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter(); // Απόκρυψη του footer
}

// Συνάρτηση επαναφοράς
function resetCanvasAndInputs() {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
     // Επαναφορά του ύψους του καμβά στο αρχικό μέγεθος
     canvas.height = 600;
     document.getElementById("cylinder-number").value = ""; // Μηδενισμός του αριθμού κυλίνδρων
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "";
    document.getElementById("seek-sequence-boxes").innerHTML = "";
    document.getElementById("resetButton").style.display = "none";
    document.getElementById("sequence-length").value = ""; // Μηδενισμός του sequence length
    showFooter();// Εμφάνιση footer

}

// Σύνδεση κουμπιού επαναφοράς
document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);



let showNumbersOnArrows = true; // Αρχική κατάσταση για την εμφάνιση αριθμών

document.getElementById("toggleNumbersButton").addEventListener("click", function() {
    showNumbersOnArrows = !showNumbersOnArrows;
    runSSTF(); // Επανάληψη της οπτικοποίησης για να ανανεωθεί η προβολή των αριθμών
});


/**
 * Οπτικοποιεί τη σειρά εξυπηρέτησης των αιτημάτων δίσκου σε έναν καμβά.
 * 
 * Αυτή η συνάρτηση χρησιμοποιεί το στοιχείο καμβά (canvas) για να σχεδιάσει 
 * τη διαδρομή της κεφαλής του δίσκου καθώς εξυπηρετεί τα αιτήματα 
 * με βάση τη δοθείσα σειρά. Σχεδιάζει τις κινήσεις με γραμμές και βέλη
 * για να απεικονίσει την κατεύθυνση της κεφαλής.
 * 
 * @param {number[]} seekSequence - Μια λίστα αριθμών που αντιπροσωπεύει 
 *                                   τη σειρά των αιτημάτων που εξυπηρετούνται.
 *                                   Κάθε αριθμός αντιστοιχεί σε μια θέση
 *                                   στον δίσκο.
 * @returns {void} Δεν επιστρέφει τιμή.
 */
function visualizeSeekSequence(seekSequence, cylinderRange) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Καθαρισμός καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Δυναμική προσαρμογή ύψους καμβά
    adjustCanvasHeight(seekSequence.length);

    const margin = 20; // Περιθώριο
    const lineLength = canvas.width - 2 * margin; // Μήκος γραμμής
    const trackHeight = canvas.height - 2 * margin; // Ύψος grid
    const scaleStep = 20; // Βήμα κλίμακας
    const numMarks = Math.floor(cylinderRange / scaleStep) + 1; // Αριθμός ενδείξεων

    // Σχεδιασμός κάθετων γραμμών του grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    for (let i = 0; i < numMarks; i++) {
        const xPosition = margin + (i * scaleStep * lineLength) / cylinderRange;
        ctx.beginPath();
        ctx.moveTo(xPosition, margin);
        ctx.lineTo(xPosition, canvas.height - margin);
        ctx.stroke();

        // Προσθήκη αριθμών στην κορυφή
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(i * scaleStep, xPosition - 10, margin - 10);
    }

    // Σχεδιασμός πρώτης οριζόντιας γραμμής (πιο έντονη)
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2; // Πιο παχιά γραμμή
    ctx.beginPath();
    ctx.moveTo(margin, margin); // Ξεκινά από το αριστερό άκρο
    ctx.lineTo(canvas.width - margin, margin); // Μέχρι το δεξί άκρο
    ctx.stroke();

    // Σχεδιασμός υπόλοιπων οριζόντιων γραμμών
    const numHorizontalLines = seekSequence.length;
    for (let i = 1; i < numHorizontalLines; i++) {
        const yPosition = margin + (i * trackHeight) / (numHorizontalLines - 1);
        ctx.beginPath();
        ctx.moveTo(margin, yPosition);
        ctx.lineTo(canvas.width - margin, yPosition);
        ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Σχεδιασμός σειράς εξυπηρέτησης
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = margin + (seekSequence[i] * lineLength) / cylinderRange;
        const y1 = margin + (i * trackHeight) / (seekSequence.length - 1);
        const x2 = margin + (seekSequence[i + 1] * lineLength) / cylinderRange;
        const y2 = margin + ((i + 1) * trackHeight) / (seekSequence.length - 1);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Σχεδιασμός αριθμών στις γραμμές
        if (showNumbersOnArrows) {
            ctx.fillStyle = "green";
            ctx.font = "12px Arial";
            ctx.fillText(seekSequence[i + 1], x2 - 10, y2 - 10);
        }
    }
}


document.getElementById("generateSequenceButton").addEventListener("click", function() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Λήψη του αριθμού κυλίνδρων
    const cylinderRangeInput = document.getElementById("cylinder-number");
    const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10);

  

    // Λήψη του μήκους της ακολουθίας
    const sequenceLengthInput = document.getElementById("sequence-length");
    const sequenceLength = parseInt(sequenceLengthInput.value.trim(), 10);

    // Επικύρωση του μήκους της ακολουθίας
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        displayError(sequenceLengthInput, "Παρακαλώ εισάγετε έγκυρο μήκος ακολουθίας!");
        return;
    }

    // Δημιουργία τυχαίας ακολουθίας
    const randomSequence = generateRandomSequence(sequenceLength, cylinderRange);

    // Ενημέρωση του πεδίου εισόδου με την τυχαία ακολουθία
    document.getElementById("process-queue").value = randomSequence.join(",");
});

function generateRandomSequence(length, max) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * (max + 1)); // Εντός του εύρους
        sequence.push(randomNum);
    }
    return sequence;
}





// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    const randomSequence = generateRandomSequence(sequenceLength, cylinderRange);

    document.getElementById("process-queue").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου

});



  
  document.querySelectorAll('.submenu-content li a').forEach((link) => {
    link.addEventListener('click', (e) => {
      document
        .querySelectorAll('.submenu-content li a')
        .forEach((el) => el.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  function adjustCanvasHeight(sequenceLength) {
    const canvas = document.getElementById("seekCanvas");

    // Ορισμός δυναμικού ύψους με βάση το μήκος της ακολουθίας
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20; // Προσθήκη επιπλέον ύψους για κάθε στοιχείο μετά το 30
    } else {
        canvas.height = 600; // Επαναφορά στο αρχικό ύψος
    }
}



  function adjustCanvasSpacing() {
    const canvas = document.getElementById("seekCanvas");
    const sequenceContainer = document.getElementById("seek-sequence");

    // Λήψη του ύψους του καμβά
    const canvasHeight = canvas.height;

    // Ρύθμιση του κάτω περιθωρίου για τη "Σειρά Εξυπηρέτησης"
    sequenceContainer.style.marginBottom = canvasHeight > 600 ? "40px" : "20px";
}



function showFooter() {
    const footer = document.querySelector("footer");
    footer.style.visibility = "visible"; // Εμφανίζεται
    footer.style.display = "block"; // Παίρνει χώρο στη διάταξη
}

function hideFooter() {
    const footer = document.querySelector("footer");
    footer.style.visibility = "hidden"; // Κρύβεται
    footer.style.display = "none"; // Δεν καταλαμβάνει χώρο
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
  seekSequence.forEach((position, index) => {
    const box = document.createElement("div");
    box.className = "sequence-box";
    box.textContent = position;

    seekSequenceBoxes.appendChild(box);

    // Προσθέστε ένα βέλος, αν δεν είναι το τελευταίο στοιχείο
    if (index < seekSequence.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = "→";
        seekSequenceBoxes.appendChild(arrow);
    }
});

seekSequence.forEach((position, index) => {
    const box = document.createElement("div");
    box.className = "sequence-box";
    box.textContent = position;

    seekSequenceBoxes.appendChild(box);

    // Προσθέστε ένα βέλος αν δεν είναι το τελευταίο στοιχείο
    if (index < seekSequence.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = "→";
        seekSequenceBoxes.appendChild(arrow);
    }

    // Δημιουργήστε νέα σειρά κάθε 10 κουτιά
    if ((index + 1) % 10 === 0 && index !== seekSequence.length - 1) {
        const lineBreak = document.createElement("div");
        lineBreak.style.flexBasis = "100%"; // Νέα γραμμή
        seekSequenceBoxes.appendChild(lineBreak);
    }
});



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