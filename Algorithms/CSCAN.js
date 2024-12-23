let seekSequence = []; // Ακολουθία αναζήτησης

function executeCSCAN() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    const tracksInputElement = document.getElementById("process-queue");
    const headPositionElement = document.getElementById("head-position");
    const directionElement = document.getElementById("direction");
    const cylinderRangeInput = document.getElementById("cylinder-number");
    const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10);

    // Επικύρωση εισόδων
    if (isNaN(cylinderRange) || cylinderRange <= 0 || cylinderRange > 1000) {
        displayError(cylinderRangeInput, "Παρακαλώ εισάγετε έγκυρο αριθμό κυλίνδρων (1-1000).");
        return;
    }
    const tracksInput = tracksInputElement.value.trim();
    const headPosition = parseInt(headPositionElement.value, 10);
    const direction = directionElement ? directionElement.value.trim().toLowerCase() : null;

    if (!tracksInput || isNaN(headPosition) || headPosition < 0 || !direction || (direction !== "left" && direction !== "right")) {
        if (!tracksInput) displayError(tracksInputElement, "Παρακαλώ εισάγετε έγκυρη ακολουθία αριθμών!");
        if (isNaN(headPosition) || headPosition < 0) displayError(headPositionElement, "Η θέση της κεφαλής πρέπει να είναι θετικός αριθμός ή μηδέν.");
        if (!direction || (direction !== "left" && direction !== "right")) displayError(directionElement, "Παρακαλώ επιλέξτε κατεύθυνση (left ή right)!");
        return;
    }

    // Μετατροπή εισόδου σε πίνακα αριθμών
    const tracks = tracksInput.split(",").map(Number).filter(num => !isNaN(num));
    if (tracks.length === 0) {
        displayError(tracksInputElement, "Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό!");
        return;
    }

    // Έλεγχος μήκους ακολουθίας
    if (tracks.length > 100) {
        displayError(tracksInputElement, "Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!");
        return;
    }

    if (!tracks.includes(0)) tracks.push(0); // Προσθήκη 0 αν δεν υπάρχει
    if (!tracks.includes(cylinderRange - 1)) tracks.push(cylinderRange - 1); // Προσθήκη μέγιστου κυλίνδρου αν δεν υπάρχει

    tracks.sort((a, b) => a - b);

    const left = tracks.filter(track => track < headPosition);
    const right = tracks.filter(track => track >= headPosition);

    let seekSequence = []; // Αρχικοποίηση ακολουθίας

    // Δημιουργία ακολουθίας αναζήτησης
    if (direction === "right") {
        seekSequence = [headPosition, ...right, cylinderRange - 1, 0, ...left];
    } else {
        seekSequence = [headPosition, ...left.reverse(), 0, cylinderRange - 1, ...right];
    }

    // Υπολογισμός του συνολικού κόστους αναζήτησης
    let seekCount = 0;
    let currentPos = headPosition;
    seekSequence.forEach(pos => {
        seekCount += Math.abs(pos - currentPos);
        currentPos = pos;
    });

    // Ενημέρωση DOM με τα αποτελέσματα
    const seekCountDisplay = document.getElementById("seek-count-display");
    seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${seekCount}`;

    const seekSequenceBoxes = document.getElementById("seek-sequence-boxes");
    seekSequenceBoxes.innerHTML = "";
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

    drawCScan(seekSequence, cylinderRange);
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter();
}




let showNumbersOnArrows = true; // Μεταβλητή για εναλλαγή εμφάνισης αριθμών

function toggleShowNumbersOnArrows() {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeCSCAN(); // Επανασχεδίαση για να γίνει εναλλαγή στην εμφάνιση αριθμών
}

function drawCScan(seekSequence, cylinderRange) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Καθαρισμός του καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    adjustCanvasHeight(seekSequence.length);

    const margin = 20;
    const lineLength = canvas.width - 2 * margin;
    const trackHeight = canvas.height - 2 * margin;

    const trackWidth = lineLength / cylinderRange;

    // Σχεδιασμός κάθετων γραμμών του grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= cylinderRange; i += 20) {
        const xPosition = margin + (i / cylinderRange) * lineLength; // Υπολογισμός θέσης κάθε γραμμής
        ctx.beginPath();
        ctx.moveTo(xPosition, margin); // Από την κορυφή του grid
        ctx.lineTo(xPosition, canvas.height - margin); // Μέχρι το τέλος του grid
        ctx.stroke();

        // Σχεδιασμός αριθμών πάνω από τις κάθετες γραμμές
        ctx.fillStyle = "green";
        ctx.font = "12px Arial";
        ctx.fillText(i, xPosition - 10, margin - 5); // Τοποθέτηση αριθμών
    }

    // Σχεδιασμός οριζόντιων γραμμών του grid
    const numHorizontalLines = seekSequence.length;
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = margin + (i / (numHorizontalLines - 1)) * trackHeight;
        ctx.beginPath();
        ctx.moveTo(margin, yPosition); // Από την αρχή του grid
        ctx.lineTo(canvas.width - margin, yPosition); // Μέχρι το τέλος του grid
        ctx.stroke();
    }

    // Σχεδιασμός της σειράς κινήσεων (διαδρομής C-SCAN)
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = margin + (seekSequence[i] / cylinderRange) * lineLength;
        const y1 = margin + (i / (seekSequence.length - 1)) * trackHeight;
        const x2 = margin + (seekSequence[i + 1] / cylinderRange) * lineLength;
        const y2 = margin + ((i + 1) / (seekSequence.length - 1)) * trackHeight;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Σχεδίαση αριθμών στις γραμμές
        if (showNumbersOnArrows) {
            ctx.fillStyle = "green";
            ctx.font = "12px Arial";
            ctx.fillText(seekSequence[i + 1], x2 - 5, y2 - 10);
        }
    }
}





// Συνάρτηση σχεδίασης βέλους
function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLength = 10; // Μήκος κεφαλής του βέλους
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Σχεδιασμός της κεφαλής του βέλους
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = "green";
    ctx.fill();
}


// Συνδέσεις κουμπιών

document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);

document.getElementById("toggleNumbersButton").addEventListener("click", () => {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeCSCAN();
});

/**
 * Συνάρτηση επαναφοράς.
 */
function resetCanvasAndInputs() {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
     // Επαναφορά του ύψους του καμβά στο αρχικό μέγεθος
     canvas.height = 600;
    
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "";
    document.getElementById("seek-sequence-boxes").innerHTML = "";
    document.getElementById("resetButton").style.display = "none";
    document.getElementById("cylinder-number").value = ""; // Μηδενισμός του αριθμού κυλίνδρων
      // Καθαρισμός του πεδίου για το μήκος ακολουθίας
      document.getElementById("sequence-length").value = ""; // Μηδενισμός του sequence length

      // Εμφάνιση του footer
      showFooter();
  
}








function generateRandomSequence(length, max = 200) {

  

    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max);
        sequence.push(randomNum);
    }
    return sequence;
}




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

    if (!sequenceContainer) return; // Έλεγχος αν το στοιχείο υπάρχει

    const canvasHeight = canvas.height;
    sequenceContainer.style.marginBottom = canvasHeight > 600 ? "40px" : "20px";
}





// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function () {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Λήψη του μήκους από το πεδίο εισαγωγής
    const sequenceLengthInputElement = document.getElementById("sequence-length");
    const sequenceLengthInput = sequenceLengthInputElement.value.trim();
    const sequenceLength = parseInt(sequenceLengthInput, 10);

    // Έλεγχος αν το μήκος είναι αριθμός και θετικό
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        displayError(sequenceLengthInputElement, "Παρακαλώ εισάγετε έγκυρο μήκος για την ακολουθία (θετικός ακέραιος)!");
        return;
    }

    // Ενημέρωση του καμβά αν το μήκος είναι μεγαλύτερο από 30
    const canvas = document.getElementById("seekCanvas");
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20; // Δυναμικό ύψος καμβά
    } else {
        canvas.height = 600; // Επαναφορά στο αρχικό ύψος
    }

    // Δημιουργία τυχαίας ακολουθίας
    const randomSequence = generateRandomSequence(sequenceLength);
    document.getElementById("process-queue").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου
});





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
    if (index < seekSequence.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = "→";
        seekSequenceBoxes.appendChild(arrow);
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