/**
 * Υλοποιεί τον αλγόριθμο FCFS (First Come, First Serve) για την εξυπηρέτηση αιτημάτων σε σκληρό δίσκο.
 * Διαβάζει τα δεδομένα εισόδου από πεδία HTML, υπολογίζει τις συνολικές κινήσεις και 
 * τη σειρά εξυπηρέτησης, και εμφανίζει τα αποτελέσματα στον χρήστη.
 */
function runFCFS() {
    // Λήψη δεδομένων εισόδου
    const inputQueue = document.getElementById("process-queue").value.trim();
    const headPositionInput = document.getElementById("head-position");
    const headPosition = parseInt(headPositionInput.value, 10);
    const cylinderRangeInput = document.getElementById("cylinder-number");
    const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10);

   
   
      // Επικύρωση του αριθμού κυλίνδρων
      if (isNaN(cylinderRange) || cylinderRange <= 0 || cylinderRange > 1000) {
        displayError(cylinderRangeInput, "Παρακαλώ εισάγετε έγκυρο αριθμό κυλίνδρων (1-1000).");
        return;
    }
 clearErrorMessages();
    // Επικύρωση της θέσης της κεφαλής
    if (isNaN(headPosition) || headPosition < 0) {
        displayError(headPositionInput, "Η θέση της κεφαλής πρέπει να είναι θετικός αριθμός ή μηδέν.");
        return;
    }
    clearErrorMessages();

    // Επικύρωση της εισόδου της ουράς διεργασιών
    if (!inputQueue) {
        displayError(document.getElementById("process-queue"), "Παρακαλώ εισάγετε έγκυρα δεδομένα στην ουρά διεργασιών!");
        return;
    }

    // Μετατροπή του inputQueue σε πίνακα αριθμών
    const requestQueue = inputQueue.split(",").map(item => {
        const num = Number(item.trim());
        if (isNaN(num)) {
            displayError(document.getElementById("process-queue"), "Παρακαλώ εισάγετε μόνο έγκυρους αριθμούς, διαχωρισμένους με κόμματα.");
            throw new Error("Invalid input in process queue");
        }
        return num;
    });
    clearErrorMessages();

    // Έλεγχος ότι τα αιτήματα βρίσκονται εντός του εύρους κυλίνδρων
    for (const request of requestQueue) {
        if (request < 0 || request > cylinderRange) {
            displayError(document.getElementById("process-queue"), 
                `Όλα τα αιτήματα πρέπει να βρίσκονται εντός του εύρους κυλίνδρων 0 έως ${cylinderRange}.`);
            return;
        }
    }
    clearErrorMessages();

    // Έλεγχος για τον αριθμό αιτημάτων
    if (requestQueue.length > 100) {
        displayError(document.getElementById("process-queue"), "Η ουρά διεργασιών δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς.");
        return;
    }
    clearErrorMessages();

    // Υπολογισμός κινήσεων κεφαλής
    let seekCount = 0;
    let seekSequence = [headPosition];
    let currentPosition = headPosition;

    for (const request of requestQueue) {
        const distance = Math.abs(currentPosition - request);
        seekCount += distance;
        currentPosition = request;
        seekSequence.push(currentPosition);
    }

    // Εμφάνιση του συνολικού αριθμού κινήσεων κεφαλής με σταδιακή αύξηση
    const seekCountDisplay = document.getElementById("seek-count-display");
    seekCountDisplay.innerHTML = ""; 
    let currentCount = 0;
    const incrementSpeed = 50;
    const incrementValue = Math.ceil(seekCount / 20);

    const interval = setInterval(() => {
        if (currentCount + incrementValue >= seekCount) {
            currentCount = seekCount;
            seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
            clearInterval(interval);
        } else {
            currentCount += incrementValue;
            seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
        }
    }, incrementSpeed);

    // Δημιουργία κουτιών με βέλη για τη σειρά εξυπηρέτησης
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

    // Οπτικοποίηση της σειράς
    visualizeSeekSequence(seekSequence, cylinderRange);

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter();
}


// Συνάρτηση για την επαναφορά του καμβά και των πεδίων εισόδου
function resetCanvasAndInputs() {
    // Καθαρισμός του καμβά
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Επαναφορά του ύψους του καμβά στο αρχικό μέγεθος
    canvas.height = 600;

    // Καθαρισμός των πεδίων εισόδου και των αποτελεσμάτων
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "Συνολική μετακίνηση κεφαλής: 0"; // Μηδενισμός του πεδίου
    document.getElementById("seek-sequence-boxes").innerHTML = "";
    document.getElementById("cylinder-number").value = ""; // Μηδενισμός του αριθμού κυλίνδρων
    // Καθαρισμός του πεδίου για το μήκος ακολουθίας
    document.getElementById("sequence-length").value = ""; // Μηδενισμός του sequence length

    // Εμφάνιση του footer
    showFooter();

    // Απόκρυψη του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "none";
}
// Σύνδεση της λειτουργίας με το κουμπί "Επαναφορά"
document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);


let showNumbersOnArrows = true; // Αρχική κατάσταση για την εμφάνιση αριθμών

document.getElementById("toggleNumbersButton").addEventListener("click", function() {
    showNumbersOnArrows = !showNumbersOnArrows;
    runFCFS(); // Επανάληψη της οπτικοποίησης για να ανανεωθεί η προβολή των αριθμών
});

function adjustCanvasHeight(sequenceLength) {
    const canvas = document.getElementById("seekCanvas");

    // Ορισμός δυναμικού ύψους με βάση το μήκος της ακολουθίας
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20; // Προσθήκη επιπλέον ύψους
    } else {
        canvas.height = 600; // Επαναφορά στο αρχικό ύψος
    }
}

/**
 * Οπτικοποιεί μια ακολουθία κινήσεων κεφαλής σε έναν καμβά,
 * σχεδιάζοντας γραμμές και βέλη που αναπαριστούν κάθε κίνηση και προσθέτει σήμανση αριθμών ανά 20 μονάδες.
 *
 * @param {number[]} seekSequence - Πίνακας με αριθμούς τροχιών (tracks).
 */
function visualizeSeekSequence(seekSequence, cylinderRange) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Καθαρίστε την προηγούμενη οπτικοποίηση
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Προσαρμογή ύψους καμβά με βάση το μήκος της ακολουθίας
    adjustCanvasHeight(seekSequence.length);

    const startScale = 0; // Αρχική τιμή πάντα το 0
    const endScale = cylinderRange; // Μέγιστη τιμή το εύρος κυλίνδρων
    

    const padding = 30; // Εσωτερικό περιθώριο για να μην κόβονται τα στοιχεία
    const lineLength = canvas.width - padding * 2;
    const trackWidth = lineLength / (endScale - startScale);
    const trackHeight = canvas.height - padding * 2;

// Σχεδιάστε κάθετες γραμμές του grid
// Ρύθμιση του χρώματος για τις γραμμές
ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"; // Απαλό γκρι

// Σχεδιάστε κάθετες γραμμές του grid
for (let mark = startScale; mark <= endScale; mark += 20) {
    const xPosition = padding + (mark - startScale) * trackWidth;
    ctx.beginPath();
    ctx.moveTo(xPosition, padding);
    ctx.lineTo(xPosition, canvas.height - padding);
    ctx.stroke();
}

// Σχεδιάστε αριθμούς ανά 20 μονάδες στην πρώτη γραμμή του grid
for (let mark = startScale; mark <= endScale; mark += 20) {
    const xPosition = padding + (mark - startScale) * trackWidth;
    ctx.fillText(mark, xPosition - 10, padding - 10);
}

    // Σχεδιάστε οριζόντιες γραμμές του grid
    const numHorizontalLines = seekSequence.length;
    const verticalSpacing = trackHeight / (numHorizontalLines - 1); // Απόσταση ανάμεσα στις γραμμές
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = padding + i * verticalSpacing;
        ctx.beginPath();
        ctx.moveTo(padding, yPosition);
        ctx.lineTo(canvas.width - padding, yPosition);

        // Χρώμα της πρώτης οριζόντιας γραμμής (εντονότερο γκρι)
        if (i === 0) {
            ctx.strokeStyle = "gray"; // Εντονότερο γκρι για την πρώτη γραμμή
        } else {
            ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"; // Απαλό γκρι για τις υπόλοιπες
        }

        ctx.stroke();
    }

    // Σχεδιασμός της σειράς κινήσεων ως βέλη
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = padding + (seekSequence[i] - startScale) * trackWidth;
        const y1 = padding + i * verticalSpacing; // Ξεκινά από την πρώτη οριζόντια γραμμή
        const x2 = padding + (seekSequence[i + 1] - startScale) * trackWidth;
        const y2 = padding + (i + 1) * verticalSpacing; // Επόμενη γραμμή

        // Σχεδίαση βελών
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Σχεδίαση κεφαλών στα βέλη
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowLength * Math.cos(angle - Math.PI / 6), y2 - arrowLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI / 6), y2 - arrowLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // Εμφάνιση αριθμών στα βέλη, αν το επιτρέπει η ρύθμιση
        if (showNumbersOnArrows) {
            ctx.fillStyle = "green";
            ctx.font = "12px Arial";
            ctx.fillText(seekSequence[i + 1], x2 + 5, y2 - 5);
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

