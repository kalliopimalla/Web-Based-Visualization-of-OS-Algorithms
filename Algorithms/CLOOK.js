
let showNumbersOnArrows = true; // Εναλλαγή εμφάνισης αριθμών

/**
 * Εκτελεί τον αλγόριθμο C-LOOK για χρονοπρογραμματισμό δίσκου.
 */
function executeCLOOK() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Λήψη δεδομένων εισόδου
    const tracksInputElement = document.getElementById("process-queue");
    const tracksInput = tracksInputElement.value.trim();
    const headPositionElement = document.getElementById("head-position");
    const headPosition = parseInt(headPositionElement.value, 10);
    const directionElement = document.getElementById("direction");
    const direction = directionElement ? directionElement.value.trim().toLowerCase() : null;
    const cylinderRangeInput = document.getElementById("cylinder-number");
    const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10);

    // Επικύρωση εισόδων
    if (isNaN(cylinderRange) || cylinderRange <= 0 || cylinderRange > 1000) {
        displayError(cylinderRangeInput, "Παρακαλώ εισάγετε έγκυρο αριθμό κυλίνδρων (1-1000).");
        return;
    }

    if (!tracksInput || isNaN(headPosition)) {
        if (!tracksInput) {
            displayError(tracksInputElement, "Παρακαλώ εισάγετε έγκυρη ακολουθία αριθμών!");
        }
        if (isNaN(headPosition)) {
            displayError(headPositionElement, "Παρακαλώ εισάγετε έγκυρη θέση κεφαλής!");
        }
        return;
    }

    // Μετατροπή αιτημάτων σε πίνακα αριθμών
    const tracks = tracksInput.split(",").map(item => Number(item.trim())).filter(num => !isNaN(num));

    if (tracks.length === 0 || tracks.length > 100) {
        if (tracks.length === 0) {
            displayError(tracksInputElement, "Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό!");
        }
        if (tracks.length > 100) {
            displayError(tracksInputElement, "Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!");
        }
        return;
    }

    // Ρύθμιση δυναμικού ύψους καμβά
    adjustCanvasHeight(tracks.length);
     
 // Έλεγχος αν η κεφαλή είναι μη αρνητικός αριθμός
 if (headPosition < 0) {
    displayError(headPositionElement, "Παρακαλώ εισάγετε έγκυρη θέση κεφαλής (μη αρνητικός αριθμός).");
    return;
}

    // Διαχωρισμός αιτημάτων
    const left = tracks.filter(track => track < headPosition).sort((a, b) => a - b);
    const right = tracks.filter(track => track >= headPosition).sort((a, b) => a - b);

    // Δημιουργία ακολουθίας αναζήτησης
    const seekSequence =
        direction === "right"
            ? [headPosition, ...right, ...left]
            : [headPosition, ...left.reverse(), ...right.reverse()];

    let seekCount = 0;
    let currentPos = headPosition;

    // Υπολογισμός του συνολικού κόστους αναζήτησης
    seekSequence.forEach(track => {
        seekCount += Math.abs(currentPos - track);
        currentPos = track;
    });

    // Εμφάνιση του συνολικού αριθμού κινήσεων
    animateSeekCount(seekCount);

    // Δημιουργία κουτιών για τη σειρά εξυπηρέτησης
    createSeekSequenceBoxes(seekSequence);

    // Οπτικοποίηση της σειράς αναζήτησης
    visualizeSeekSequence(seekSequence);

    // Εμφάνιση κουμπιού επαναφοράς
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter(); // Απόκρυψη του footer
}

function adjustCanvasHeight(sequenceLength) {
    const canvas = document.getElementById("seekCanvas");

    // Δυναμική προσαρμογή ύψους
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20; // Προσθήκη επιπλέον ύψους για κάθε στοιχείο
    } else {
        canvas.height = 600; // Επαναφορά στο αρχικό ύψος
    }
}


/**
 * Δημιουργεί κουτιά για τη σειρά εξυπηρέτησης και τα βέλη μεταξύ τους.
 */
function createSeekSequenceBoxes(seekSequence) {
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
}

/**
 * Σταδιακή εμφάνιση του συνολικού αριθμού κινήσεων.
 */
function animateSeekCount(seekCount) {
    const seekCountDisplay = document.getElementById("seek-count-display");
    seekCountDisplay.innerHTML = "";
    let currentCount = 0;
    const incrementValue = Math.ceil(seekCount / 20);

    const interval = setInterval(() => {
        if (currentCount + incrementValue >= seekCount) {
            currentCount = seekCount;
            clearInterval(interval);
        } else {
            currentCount += incrementValue;
        }
        seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
    }, 50);
}

/**
 * Οπτικοποιεί την ακολουθία αναζήτησης με grid, βέλη και ευθυγραμμισμένη κλίμακα.
 */
function visualizeSeekSequence(seekSequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Προσαρμογή ύψους καμβά
    adjustCanvasHeight(seekSequence.length);

    // Καθαρισμός καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 30; // Περιθώριο από τις άκρες
    const lineLength = canvas.width - padding * 2;
    const trackHeight = canvas.height - padding * 2;

    const minInput = Math.min(...seekSequence);
    const maxInput = Math.max(...seekSequence);
    const startScale = Math.floor(minInput / 20) * 20;
    const endScale = Math.ceil(maxInput / 20) * 20;

    // Σχεδιασμός κάθετων γραμμών του grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    for (let mark = startScale; mark <= endScale; mark += 20) {
        const x = padding + (mark - startScale) * (lineLength / (endScale - startScale));
        ctx.beginPath();
        ctx.moveTo(x, padding); // Ξεκινά από την κορυφή
        ctx.lineTo(x, canvas.height - padding); // Μέχρι το κάτω μέρος
        ctx.stroke();

        // Σχεδιασμός αριθμών κλίμακας πάνω από την πρώτη γραμμή
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(mark, x - 10, padding - 10); // Οι αριθμοί πάνω από την πρώτη γραμμή
    }

    // Σχεδιασμός οριζόντιων γραμμών του grid
    const numHorizontalLines = seekSequence.length;
    const horizontalStep = trackHeight / (numHorizontalLines - 1);

    for (let i = 0; i < numHorizontalLines; i++) {
        const y = padding + i * horizontalStep;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);

        // Ειδικό styling για την πρώτη οριζόντια γραμμή
        if (i === 0) {
            ctx.strokeStyle = "gray"; // Εντονότερο γκρι για την πρώτη γραμμή
            ctx.lineWidth = 1.5; // Πιο παχιά γραμμή
        } else {
            ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"; // Απαλό γκρι για τις υπόλοιπες γραμμές
            ctx.lineWidth = 1; // Κανονικό πάχος γραμμής
        }

        ctx.stroke();
    }

    // Σχεδιασμός βελών για τη σειρά εξυπηρέτησης
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.lineWidth = 2;

    let x1 = padding + (seekSequence[0] - startScale) * (lineLength / (endScale - startScale));
    let y1 = padding;

    for (let i = 1; i < seekSequence.length; i++) {
        const x2 = padding + (seekSequence[i] - startScale) * (lineLength / (endScale - startScale));
        const y2 = padding + i * horizontalStep;

        // Σχεδιασμός γραμμών
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Σχεδίαση κεφαλών στα βέλη
        drawArrow(ctx, x1, y1, x2, y2);

        if (showNumbersOnArrows) {
            ctx.fillStyle = "green";
            ctx.font = "12px Arial";
            ctx.fillText(seekSequence[i], x2 - 10, y2 - 10);
        }

        x1 = x2;
        y1 = y2;
    }
}






/**
 * Σχεδίαση βέλους.
 */
function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

// Συνδέσεις κουμπιών
document.getElementById("generateSequenceButton").addEventListener("click", () => {
    const randomSequence = Array.from({ length: 10 }, () => Math.floor(Math.random() * disk_size));
    document.getElementById("process-queue").value = randomSequence.join(", ");
});
document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);
document.getElementById("toggleNumbersButton").addEventListener("click", () => {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeCLOOK();
});

/**
 * Επαναφορά καμβά και πεδίων εισόδου.
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
    document.getElementById("cylinder-number").value = ""; // Μηδενισμός του αριθμού κυλίνδρων

    document.getElementById("resetButton").style.display = "none";
     // Καθαρισμός του πεδίου για το μήκος ακολουθίας
     document.getElementById("sequence-length").value = ""; // Μηδενισμός του sequence length

     // Εμφάνιση του footer
     showFooter();
 
}


// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας
function generateRandomSequence(length = sequenceLength, max = 200) {



    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    return sequence;
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



// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    const randomSequence = generateRandomSequence(); // Δημιουργία τυχαίας ακολουθίας
    document.getElementById("process-queue").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου

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