/**
 * Υλοποιεί τον αλγόριθμο FCFS (First Come, First Serve) για την εξυπηρέτηση αιτημάτων σε σκληρό δίσκο.
 * Διαβάζει τα δεδομένα εισόδου από πεδία HTML, υπολογίζει τις συνολικές κινήσεις και 
 * τη σειρά εξυπηρέτησης, και εμφανίζει τα αποτελέσματα στον χρήστη.
 */
function runFCFS() {
    const inputQueue = document.getElementById("process-queue").value.trim();
    const headPositionInput = document.getElementById("head-position");
    const headPosition = parseInt(headPositionInput.value);


    clearErrorMessages();

    if (!inputQueue || isNaN(headPosition)) {
        displayError(headPositionInput, "Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    const requestQueue = inputQueue.split(",").map(item => {
        const num = Number(item.trim());
        if (isNaN(num)) {
            displayError(document.getElementById("process-queue"), 
                "Παρακαλώ εισάγετε έγκυρους αριθμούς διαχωρισμένους με κόμματα στην ουρά διεργασιών!");
            throw new Error("Invalid input in process queue");
        }
        return num;
    });

    if (requestQueue.length > 100) {
        displayError(document.getElementById("process-queue"), 
            "Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!");
        return;
    }
    let seekCount = 0;
    let seekSequence = [headPosition];
    let currentPosition = headPosition;
    

    for (let i = 0; i < requestQueue.length; i++) {
        let distance = Math.abs(currentPosition - requestQueue[i]);
        seekCount += distance;
        currentPosition = requestQueue[i];
        seekSequence.push(currentPosition);
    }

    // Απεικόνιση του συνολικού αριθμού κινήσεων με σταδιακή αύξηση του αριθμού
    const seekCountDisplay = document.getElementById("seek-count-display");
    seekCountDisplay.innerHTML = ""; // Καθαρισμός του περιεχομένου
    let currentCount = 0;
    const incrementSpeed = 50; // ταχύτητα αύξησης του αριθμού
    const incrementValue = Math.ceil(seekCount / 20); // τιμή αύξησης ανά βήμα

   

    const interval = setInterval(() => {
        if (currentCount + incrementValue >= seekCount) {
            currentCount = seekCount; // Θέτει ακριβώς την τιμή στο seekCount όταν πλησιάζει
            seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
            clearInterval(interval); // Σταματά την αύξηση
        } else {
            currentCount += incrementValue;
            seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
        }
    }, incrementSpeed);

    // Δημιουργία κουτιών με βελάκια για τη σειρά εξυπηρέτησης
    const seekSequenceBoxes = document.getElementById("seek-sequence-boxes");
    seekSequenceBoxes.innerHTML = ""; // Καθαρισμός παλαιού περιεχομένου

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
    });

    // Οπτικοποίηση της σειράς
    visualizeSeekSequence(seekSequence);

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter(); // Απόκρυψη του footer
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



/**
 * Οπτικοποιεί μια ακολουθία κινήσεων κεφαλής σε έναν καμβά,
 * σχεδιάζοντας γραμμές και βέλη που αναπαριστούν κάθε κίνηση και προσθέτει σήμανση αριθμών ανά 20 μονάδες.
 *
 * @param {number[]} seekSequence - Πίνακας με αριθμούς τροχιών (tracks).
 */
function visualizeSeekSequence(seekSequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Καθαρίστε την προηγούμενη οπτικοποίηση
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Υπολογισμός τιμών για την κλίμακα και τις συντεταγμένες
    const minInput = Math.min(...seekSequence);
    const maxInput = Math.max(...seekSequence);
    const startScale = Math.floor(minInput / 20) * 20;
    const endScale = Math.ceil(maxInput / 20) * 20;

    const padding = 30; // Εσωτερικό περιθώριο για να μην κόβονται τα στοιχεία
    const lineLength = canvas.width - padding * 2;
    const trackWidth = lineLength / (endScale - startScale);
    const trackHeight = canvas.height - padding * 2;

    // Σχεδιάστε κάθετες γραμμές του grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = padding + (mark - startScale) * trackWidth;
        ctx.beginPath();
        ctx.moveTo(xPosition, padding);
        ctx.lineTo(xPosition, canvas.height - padding);
        ctx.stroke();
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

    // Σχεδιάστε αριθμούς ανά 20 μονάδες στην πρώτη γραμμή του grid
    ctx.fillStyle = "gray";
    ctx.font = "12px Arial";
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = padding + (mark - startScale) * trackWidth;
        ctx.fillText(mark, xPosition - 10, padding - 10);
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




function generateRandomSequence(length = sequenceLength, max = 200) {
    clearErrorMessages(); // Καθαρίζει προηγούμενα μηνύματα σφάλματος

 

    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    return sequence;
}


// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

    // Λήψη του μήκους από το πεδίο εισαγωγής
    const sequenceLengthInput = document.getElementById("sequence-length");
    const sequenceLengthValue = sequenceLengthInput.value.trim();
    const sequenceLength = parseInt(sequenceLengthValue, 10);

    // Έλεγχος αν το μήκος είναι αριθμός και θετικό
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        displayError(sequenceLengthInput, "Παρακαλώ εισάγετε έγκυρο μήκος για την ακολουθία (θετικός ακέραιος)!");
        return;
    }
   
     // Έλεγχος αν το μήκος υπερβαίνει το 100
     if (sequenceLength > 100) {
        displayError(sequenceLengthInput, "Το μήκος της ακολουθίας δεν μπορεί να υπερβαίνει τους 100 αριθμούς!");
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

// Κάλεσε τη συνάρτηση μετά την προσαρμογή του καμβά
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    clearErrorMessages(); // Καθαρίζει προηγούμενα μηνύματα σφάλματος

    const sequenceLengthInput = document.getElementById("sequence-length");
    const sequenceLengthValue = sequenceLengthInput.value.trim();
    const sequenceLength = parseInt(sequenceLengthValue, 10);

    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        // Εμφάνιση μηνύματος σφάλματος με χρήση της displayError
        displayError(sequenceLengthInput, "Παρακαλώ εισάγετε έγκυρο μήκος για την ακολουθία (θετικός ακέραιος)!");
        return;
    }

    // Ενημέρωση του καμβά αν το μήκος είναι μεγαλύτερο από 30
    const canvas = document.getElementById("seekCanvas");
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20; // Δυναμικό ύψος καμβά
    } else {
        canvas.height = 600; // Επαναφορά στο αρχικό ύψος
    }

    // Ρύθμιση του container για να μετακινηθεί σωστά
    const canvasContainer = document.querySelector(".canvas-container");
    canvasContainer.style.marginTop = "20px"; // Διασφαλίζει περιθώριο πάνω
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