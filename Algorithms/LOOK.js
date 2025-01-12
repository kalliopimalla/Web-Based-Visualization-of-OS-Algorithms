let showNumbersOnArrows = true; // Εναλλαγή εμφάνισης αριθμών

/**
 * Εκτελεί τον αλγόριθμο LOOK για χρονοπρογραμματισμό δίσκου.
 */
function executeLOOK() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Λήψη δεδομένων εισόδου
    const tracksInputElement = document.getElementById("process-queue");
    const tracksInput = tracksInputElement.value.trim();
    const headPositionElement = document.getElementById("head-position");
    const headPosition = parseInt(headPositionElement.value, 10);
    const directionElement = document.getElementById("direction");
    const direction = directionElement ? directionElement.value.trim().toLowerCase() : null;
    const cylinderRangeInput = document.getElementById("cylinder-number");
    const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10)-1;



// Μετατροπή της ακολουθίας σε πίνακα αριθμών
const requestQueue = tracksInput.split(",").map(Number).filter(num => !isNaN(num));

// Έλεγχος ότι υπάρχουν έγκυρα αιτήματα
if (requestQueue.length === 0) {
    displayError(tracksInputElement, "Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό!");
    return;
}

// Έλεγχος ότι τα αιτήματα βρίσκονται εντός του εύρους κυλίνδρων
for (const request of requestQueue) {
    if (request < 0 || request > cylinderRange) {
        displayError(tracksInputElement, 
            `Όλα τα αιτήματα πρέπει να βρίσκονται εντός του εύρους κυλίνδρων 0 έως ${cylinderRange}.`);
        return;
    }
}

// Καθαρισμός παλαιών μηνυμάτων σφάλματος αν όλα είναι εντάξει
clearErrorMessages();


    // Επικύρωση του εύρους κυλίνδρων
    if (isNaN(cylinderRange) || cylinderRange <= 0 || cylinderRange > 1000) {
        displayError(cylinderRangeInput, "Παρακαλώ εισάγετε έγκυρο αριθμό κυλίνδρων (1-1000).");
        return;
    }

    // Επικύρωση της θέσης της κεφαλής
    if (isNaN(headPosition) || headPosition < 0 || headPosition > cylinderRange) {
        displayError(
            headPositionElement,
            `Η θέση της κεφαλής πρέπει να είναι μεταξύ 0 και ${cylinderRange}.`
        );
        return;
    }

    // Επικύρωση του μήκους της ακολουθίας
    if (!tracksInput) {
        displayError(tracksInputElement, "Παρακαλώ εισάγετε έγκυρη ακολουθία αριθμών!");
        return;
    }

    // Μετατροπή αιτημάτων σε πίνακα αριθμών
    const tracks = tracksInput
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((num) => !isNaN(num));

    // Έλεγχος μήκους ακολουθίας
    if (tracks.length === 0 || tracks.length > 100) {
        if (tracks.length === 0) {
            displayError(tracksInputElement, "Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό!");
        } else {
            displayError(tracksInputElement, "Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!");
        }
        return;
    }

    // Επικύρωση της κατεύθυνσης
    if (!direction || (direction !== "left" && direction !== "right")) {
        displayError(directionElement, "Παρακαλώ επιλέξτε κατεύθυνση (left ή right)!");
        return;
    }
 // Εμφάνιση των στοιχείων αν όλα τα δεδομένα είναι έγκυρα
 document.getElementById("gantt-wrapperDisk").style.display = "block";
 document.getElementById("seek-sequence").style.display = "block";
 document.getElementById("seek-sequence-boxes").style.display = "block";
 document.getElementById("seek-count-display").style.display = "block";
 document.getElementById("toggleNumbersButton").style.display = "inline-block"; // Εμφάνιση κουμπιού
    // Κλήση της συνάρτησης LOOK
    LOOK(tracks, headPosition, direction, cylinderRange);

    // Εμφάνιση κουμπιού επαναφοράς
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter(); // Απόκρυψη του footer
}


function adjustCanvasHeight(sequenceLength) {
    const canvas = document.getElementById("seekCanvas");

    // Ρύθμιση ύψους ανάλογα με το μήκος της ακολουθίας
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20; // Προσθήκη επιπλέον ύψους για κάθε στοιχείο
    } else {
        canvas.height = 600; // Επαναφορά στο αρχικό ύψος
    }
}


/**
 * Υλοποιεί τον αλγόριθμο LOOK.
 */
function LOOK(arr, head, direction, cylinderRange) {
    clearErrorMessages();

    let seek_count = 0;
    let distance, cur_track;
    let left = [];
    let right = [];
    let seek_sequence = [head];

    // Διαχωρισμός αιτημάτων σε αριστερά και δεξιά της κεφαλής
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < head) left.push(arr[i]);
        if (arr[i] > head) right.push(arr[i]);
    }

    left.sort((a, b) => a - b);
    right.sort((a, b) => a - b);

    // Εκτέλεση του αλγορίθμου LOOK
    let run = 2;
    while (run-- > 0) {
        if (direction === "left") {
            for (let i = left.length - 1; i >= 0; i--) {
                cur_track = left[i];
                seek_sequence.push(cur_track);
                distance = Math.abs(cur_track - head);
                seek_count += distance;
                head = cur_track;
            }
            direction = "right";
        } else if (direction === "right") {
            for (let i = 0; i < right.length; i++) {
                cur_track = right[i];
                seek_sequence.push(cur_track);
                distance = Math.abs(cur_track - head);
                seek_count += distance;
                head = cur_track;
            }
            direction = "left";
        }
    }

    // Εμφάνιση του συνολικού αριθμού κινήσεων
    animateSeekCount(seek_count);

    // Δημιουργία κουτιών για τη σειρά εξυπηρέτησης
    createSeekSequenceBoxes(seek_sequence);

    // Κλήση της συνάρτησης για την οπτικοποίηση
    visualizeSeekSequence(seek_sequence, cylinderRange);
}


// Οι υπόλοιπες συναρτήσεις παραμένουν ίδιες.


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
function visualizeSeekSequence(seekSequence, cylinderRange) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Προσαρμογή ύψους καμβά
    adjustCanvasHeight(seekSequence.length);

    // Καθαρισμός καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 30; // Περιθώριο από τις άκρες
    const lineLength = canvas.width - padding * 2;
    const trackHeight = canvas.height - padding * 2;

    const startScale = 0; // Η κλίμακα ξεκινά από το 0
    const endScale = cylinderRange; // Μέγιστη τιμή της κλίμακας
    const scaleStep = 20; // Βήμα της κλίμακας
    const numMarks = Math.floor((endScale - startScale) / scaleStep) + 1;

    // Σχεδιασμός κάθετων γραμμών του grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    for (let i = 0; i < numMarks; i++) {
        const x = padding + (i / (numMarks - 1)) * lineLength;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }

    // Σχεδιασμός οριζόντιων γραμμών του grid
    const numHorizontalLines = seekSequence.length;
    const horizontalStep = trackHeight / (numHorizontalLines - 1); // Υπολογισμός δυναμικού βήματος

    for (let i = 0; i < numHorizontalLines; i++) {
        const y = padding + i * horizontalStep;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }

    // Σχεδιασμός κλίμακας στην πρώτη οριζόντια γραμμή
ctx.strokeStyle = "gray";
ctx.lineWidth = 1;
const scaleY = padding;

// Σχεδίαση της γραμμής κλίμακας
ctx.beginPath();
ctx.moveTo(padding, scaleY);
ctx.lineTo(canvas.width - padding, scaleY);
ctx.stroke();

// Σχεδιασμός σημείων κλίμακας
ctx.fillStyle = "green";
ctx.font = "12px Arial";

const scaleX = (value) => padding + (value / cylinderRange) * lineLength; // Υπολογισμός θέσης κάθε τιμής

// Σχεδίαση σημείων ανά scaleStep
for (let i = 0; i <= cylinderRange; i += scaleStep) {
    const xPosition = scaleX(i);
    ctx.beginPath();
    ctx.moveTo(xPosition, scaleY - 5); // Μικρή γραμμή πάνω από την κύρια γραμμή
    ctx.lineTo(xPosition, scaleY + 5); // Μικρή γραμμή κάτω από την κύρια γραμμή
    ctx.stroke();

    // Σχεδίαση αριθμών πάνω από την κλίμακα
    ctx.fillText(i, xPosition - 10, scaleY - 10);
}

// Προσθήκη του cylinderRange αν δεν είναι πολλαπλάσιο του scaleStep
if (cylinderRange % scaleStep !== 0) {
    const xPosition = scaleX(cylinderRange);
    ctx.beginPath();
    ctx.moveTo(xPosition, scaleY - 5);
    ctx.lineTo(xPosition, scaleY + 5);
    ctx.stroke();

    ctx.fillText(cylinderRange, xPosition - 10, scaleY - 10);
}



    // Σχεδιασμός βελών για τη σειρά εξυπηρέτησης
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.lineWidth = 2;

    let x1 = padding + (seekSequence[0] - startScale) * (lineLength / (endScale - startScale));
    let y1 = padding; // Αρχική θέση στο πάνω μέρος του καμβά

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

document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);
document.getElementById("toggleNumbersButton").addEventListener("click", () => {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeLOOK();
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

    document.getElementById("gantt-wrapperDisk").style.display = "none";
    document.getElementById("seek-sequence").style.display = "none";
    document.getElementById("seek-sequence-boxes").style.display = "none";
    document.getElementById("seek-count-display").style.display = "none";
    document.getElementById("toggleNumbersButton").style.display = "none"; // Απόκρυψη κουμπιού

    document.getElementById("resetButton").style.display = "none";
          // Καθαρισμός του πεδίου για το μήκος ακολουθίας
          document.getElementById("sequence-length").value = ""; // Μηδενισμός του sequence length

          // Εμφάνιση του footer
          showFooter();
      
}




// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας
function generateRandomSequence(length, maxCylinder) {
    if (isNaN(length) || length <= 0 || length > 100) {
        throw new Error("Το μήκος της ακολουθίας πρέπει να είναι ένας θετικός ακέραιος έως 100.");
    }
    if (isNaN(maxCylinder) || maxCylinder <= 0) {
        throw new Error("Το μέγιστο εύρος κυλίνδρων πρέπει να είναι ένας θετικός αριθμός.");
    }

    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * maxCylinder); // Τυχαίος αριθμός από 0 έως maxCylinder-1
        sequence.push(randomNum);
    }
    return sequence;
}


// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function () {
    clearErrorMessages();

    const sequenceLengthInput = document.getElementById("sequence-length");
    const cylinderRangeInput = document.getElementById("cylinder-number");

    const sequenceLength = parseInt(sequenceLengthInput.value.trim(), 10);
    const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10)-1;

    
  
      // Έλεγχος αν το πεδίο εύρους κυλίνδρων έχει συμπληρωθεί
      if (isNaN(cylinderRange) || cylinderRange <= 0) {
          displayError(cylinderRangeInput, "Παρακαλώ συμπληρώστε το εύρος κυλίνδρων και προσπαθήστε ξανά.");
          return;
      }

    if (isNaN(sequenceLength) || sequenceLength <= 0 || sequenceLength > 100) {
        displayError(sequenceLengthInput, "Παρακαλώ εισάγετε έγκυρο μήκος (1-100).");
        return;
    }

 

    try {
        const randomSequence = generateRandomSequence(sequenceLength, cylinderRange);
        document.getElementById("process-queue").value = randomSequence.join(","); // Ενημέρωση πεδίου εισόδου
    } catch (error) {
        alert(error.message);
    }
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