let showNumbersOnArrows = true; // Αρχική κατάσταση για εμφάνιση αριθμών


/**
 * Εκτελεί τον αλγόριθμο SCAN και σχεδιάζει την αναπαράσταση.
 */
function executeSCAN() {

    
      // Ανάκτηση στοιχείων εισόδου
    const tracksInputElement = document.getElementById("process-queue");
    const tracksInput = tracksInputElement.value.trim();
    const headElement = document.getElementById("head-position");
    const head = parseInt(headElement.value, 10);
    const directionElement = document.getElementById("direction");
    const direction = directionElement ? directionElement.value.trim().toLowerCase() : null; 
    const headPositionInput = document.getElementById("head-position");
    const headPosition = parseInt(headPositionInput.value);
    const headPositionElement = document.getElementById("head-position");
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

 

 
  // Επικύρωση της θέσης της κεφαλής
  if (isNaN(headPosition) || headPosition < 0 || headPosition > cylinderRange) {
    displayError(headPositionInput, `Η θέση της κεφαλής πρέπει να είναι μεταξύ 0 και ${cylinderRange}.`);
    return;
}
clearErrorMessages()
   
  
 
    
    // Έλεγχος έγκυρων δεδομένων
    if (!tracksInput || isNaN(head) || (direction !== "left" && direction !== "right")) {
        if (!tracksInput) {
            displayError(tracksInputElement, "Παρακαλώ εισάγετε έγκυρη ακολουθία αριθμών!");
        }
        if (isNaN(head)) {
            displayError(headElement, "Παρακαλώ εισάγετε έγκυρη θέση κεφαλής!");
        }
        if (direction !== "left" && direction !== "right") {
            displayError(directionElement, "Παρακαλώ επιλέξτε κατεύθυνση (left ή right)!");
        }
        return;
    }
    
    // Μετατροπή εισόδου σε πίνακα αριθμών
    const tracks = tracksInput.split(",").map(Number).filter(num => !isNaN(num));
    
    // Έλεγχος πλήθους αριθμών
    if (tracks.length === 0 || tracks.length > 100) {
        if (tracks.length === 0) {
            displayError(tracksInputElement, "Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό!");
        } else {
            displayError(tracksInputElement, "Η ακολουθία δεν μπορεί να περιέχει περισσότερους από 100 αριθμούς!");
        }
        return;
    }
    
     // Εμφάνιση των στοιχείων αν όλα τα δεδομένα είναι έγκυρα
   document.getElementById("gantt-wrapperDisk").style.display = "block";
   document.getElementById("seek-sequence").style.display = "block";
   document.getElementById("seek-sequence-boxes").style.display = "block";
   document.getElementById("seek-count-display").style.display = "block";
   document.getElementById("toggleNumbersButton").style.display = "inline-block"; // Εμφάνιση κουμπιού

    // Προσθήκη της κεφαλής στη λίστα για ταξινόμηση
    tracks.push(head);

    // Προσθήκη ακραίων τιμών μόνο αν χρειάζεται
    if (direction === "left" && !tracks.includes(0)) {
        tracks.push(0);
    }
    if (direction === "right" && !tracks.includes(cylinderRange)) {
        tracks.push(cylinderRange);
    }
    
    tracks.sort((a, b) => a - b);

    let left = [];
    let right = [];
    let seekSequence = [];
    let seekCount = 0;

    // Χωρισμός αιτημάτων σε αριστερά και δεξιά της κεφαλής
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i] < head) left.push(tracks[i]);
        else if (tracks[i] > head) right.push(tracks[i]);
    }

    // Διαχείριση κατεύθυνσης
    if (direction === "left") {
        left.reverse(); // Αντιστρέφουμε την αριστερή λίστα
        seekSequence = [...left, ...right]; // Κίνηση προς τα αριστερά και μετά προς τα δεξιά
    } else {
        seekSequence = [...right, ...left.reverse()]; // Κίνηση προς τα δεξιά και μετά προς τα αριστερά
    }

    // Αφαίρεση της κεφαλής (προστέθηκε μόνο για ταξινόμηση)
    seekSequence = [head, ...seekSequence];


// Υπολογισμός των συνολικών κινήσεων κεφαλής με σταδιακή αύξηση
let currentPos = head;
for (let i = 0; i < seekSequence.length; i++) {
    seekCount += Math.abs(seekSequence[i] - currentPos);
    currentPos = seekSequence[i];
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
        clearInterval(interval); // Τερματισμός του interval
    } else {
        currentCount += incrementValue;
        seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
    }
}, 50); // Χρονικό διάστημα ενημέρωσης (50ms)


    // Δημιουργία κουτιών για τη σειρά εξυπηρέτησης
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

    // Σχεδίαση της πορείας στον καμβά
    drawScan(seekSequence, cylinderRange);
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter(); // Απόκρυψη του footer
}






/**
 * Σχεδιάζει την αναπαράσταση του SCAN σε καμβά.
 */
function drawScan(seekSequence, cylinderRange) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    adjustCanvasHeight(seekSequence.length);

    const padding = 20;
    const lineLength = canvas.width - 2 * padding;
    const trackHeight = canvas.height - 2 * padding;

    const startScale = 0;
    const endScale = cylinderRange;
    const scaleStep = 20;
    const numMarks = Math.floor((endScale - startScale) / scaleStep) + 1; // Υπολογισμός σημείων κλίμακας
    const lastMark = startScale + (numMarks - 1) * scaleStep;
    
    
   // Σχεδιασμός αριθμών πάνω στην κλίμακα
ctx.fillStyle = "green";
ctx.font = "12px Arial";
    for (let i = 0; i < numMarks; i++) {
        const mark = startScale + i * scaleStep; // Υπολογισμός της τιμής κλίμακας
        const xPosition = 20 + (mark / endScale) * lineLength; // Θέση στον καμβά
    
        ctx.fillText(mark, xPosition - 10, 10);
        ctx.beginPath();
        ctx.moveTo(xPosition, 20);
        ctx.lineTo(xPosition, 30);
        ctx.stroke();
    }
    
    // Εξασφάλιση ότι το cylinderRange περιλαμβάνεται πάντα
    if (lastMark < cylinderRange) {
        const xPosition = 20 + (cylinderRange / endScale) * lineLength; // Υπολογισμός θέσης
        ctx.fillText(cylinderRange, xPosition - 10, 10); // Σχεδίαση αριθμού
        ctx.beginPath();
        ctx.moveTo(xPosition, 20);
        ctx.lineTo(xPosition, 30);
        ctx.stroke();
    }
    
    const trackWidth = lineLength / (endScale - startScale);

    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    // Κάθετες γραμμές
    for (let i = 0; i < numMarks; i++) {
        const xPosition = padding + (i / (numMarks - 1)) * lineLength;
        ctx.beginPath();
        ctx.moveTo(xPosition, padding);
        ctx.lineTo(xPosition, canvas.height - padding);
        ctx.stroke();
    }

    // Οριζόντιες γραμμές
    const numHorizontalLines = seekSequence.length;
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = padding + (i / (numHorizontalLines - 1)) * trackHeight;
        ctx.beginPath();
        ctx.moveTo(padding, yPosition);
        ctx.lineTo(canvas.width - padding, yPosition);
        ctx.stroke();
    }

    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(canvas.width - padding, padding);
    ctx.stroke();



    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = padding + (seekSequence[i] - startScale) * trackWidth;
        const y1 = padding + (i * trackHeight) / (seekSequence.length - 1);
        const x2 = padding + (seekSequence[i + 1] - startScale) * trackWidth;
        const y2 = padding + ((i + 1) * trackHeight) / (seekSequence.length - 1);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        drawArrow(ctx, x1, y1, x2, y2, seekSequence[i + 1]);
    }
}



 
/**
 * Σχεδιάζει βέλος με δυνατότητα εμφάνισης αριθμών στην άκρη του βέλους (πάνω από το σημείο του).
 */
function drawArrow(ctx, fromX, fromY, toX, toY, value) {
    const headLength = 10; // Μήκος της κεφαλής του βέλους
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    // Σχεδίαση του βέλους
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = "green";
    ctx.fill();

    // Εμφάνιση αριθμών πάνω από την άκρη του βέλους
    if (showNumbersOnArrows) {
        const textOffset = 15; // Πόσο μακριά πάνω από την άκρη του βέλους (σε pixels)

        // Υπολογισμός θέσης αριθμών
        const textX = toX + textOffset * Math.cos(angle - Math.PI / 2); // Θέση X πάνω από το τέλος του βέλους
        const textY = toY + textOffset * Math.sin(angle - Math.PI / 2); // Θέση Y πάνω από το τέλος του βέλους

        ctx.fillStyle = "green";
        ctx.font = "12px Arial";
        ctx.textAlign = "center"; // Ευθυγράμμιση στο κέντρο του αριθμού
        ctx.fillText(value, textX, textY);
    }
}







// Συνδέσεις κουμπιών

document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);
document.getElementById("toggleNumbersButton").addEventListener("click", () => {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeSCAN();
});

/**
 * Συνάρτηση επαναφοράς.
 */
function resetCanvasAndInputs() {
    // Καθαρισμός του καμβά
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("example-btn").style.display = "inline-block";
     // Επαναφορά του ύψους του καμβά στο αρχικό μέγεθος
     canvas.height = 600;

    // Καθαρισμός των πεδίων εισόδου και των αποτελεσμάτων
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "";
    document.getElementById("seek-sequence-boxes").innerHTML = "";
    
    document.getElementById("cylinder-number").value = ""; // Μηδενισμός του αριθμού κυλίνδρων
    showFooter();
    document.getElementById("gantt-wrapperDisk").style.display = "none";
    document.getElementById("seek-sequence").style.display = "none";
    document.getElementById("seek-sequence-boxes").style.display = "none";
    document.getElementById("seek-count-display").style.display = "none";
    document.getElementById("toggleNumbersButton").style.display = "none"; // Απόκρυψη κουμπιού

    // Μηδενισμός μεταβλητών
    pages = [];
    frames = [];
    referenceBits = [];
    pointer = 0;
    faultCount = 0;
    hitCount = 0;
    step = 0;

    // Μηδενισμός του currentCount
    if (typeof currentCount !== "undefined") {
        currentCount = 0; // Μηδενισμός της μεταβλητής currentCount
    }

    // Απόκρυψη του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "none";
}







function visualizeSeekSequence(seekSequence, cylinderRange) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Καθαρίστε την προηγούμενη οπτικοποίηση
    ctx.clearRect(0, 0, canvas.width, canvas.height);
     

    // Προσαρμογή ύψους καμβά με βάση το μήκος της ακολουθίας
    adjustCanvasHeight(seekSequence.length);

    // Υπολογισμός τιμών για την κλίμακα και τις συντεταγμένες
    const startScale = 0; // Η κλίμακα ξεκινά πάντα από το 0
    const endScale = cylinderRange; // Μέγιστη τιμή από το εύρος κυλίνδρων

    const lineLength = canvas.width - 40; // Μήκος της οριζόντιας γραμμής
    const trackHeight = canvas.height - 40; // Ύψος του καμβά
    const scaleStep = 20; // Βήμα της κλίμακας
    const numMarks = Math.floor((endScale - startScale) / scaleStep) + 1; // Αριθμός σημείων στην κλίμακα

    // Σχεδιασμός Grid (Κάθετες και Οριζόντιες γραμμές)
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"; // Απαλό γκρι για το grid
    ctx.lineWidth = 1;

    // Σχεδιασμός κάθετων γραμμών του grid
    for (let i = 0; i < numMarks; i++) {
        const xPosition = 20 + (i / (numMarks - 1)) * lineLength;
        ctx.beginPath();
        ctx.moveTo(xPosition, 0);
        ctx.lineTo(xPosition, canvas.height);
        ctx.stroke();
    }

    // Σχεδιασμός οριζόντιων γραμμών του grid
    const numHorizontalLines = seekSequence.length; // Ένας αριθμός γραμμών για κάθε αίτημα
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = 20 + (i / (numHorizontalLines - 1)) * trackHeight;
        ctx.beginPath();
        ctx.moveTo(0, yPosition);
        ctx.lineTo(canvas.width, yPosition);
        ctx.stroke();
    }

    // Σχεδιασμός ευθείας γκρι γραμμής για την κλίμακα
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    const blackLineY = 20;
    ctx.beginPath();
    ctx.moveTo(20, blackLineY);
    ctx.lineTo(canvas.width - 20, blackLineY);
    ctx.stroke();


    // Σχεδιασμός της σειράς κινήσεων ως βέλη
    const margin = 20;
    const startY = margin;
    const trackWidth = lineLength / (endScale - startScale);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = 20 + (seekSequence[i] - startScale) * trackWidth;
        const y1 = startY + (i * (trackHeight / (seekSequence.length - 1)));
        const x2 = 20 + (seekSequence[i + 1] - startScale) * trackWidth;
        const y2 = startY + ((i + 1) * (trackHeight / (seekSequence.length - 1)));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

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
            ctx.fillText(seekSequence[i + 1], x2, y2 - 10);
        }
    }
}
/** 
document.getElementById("generateSequenceButton").addEventListener("click", function () {
    clearErrorMessages(); // Καθαρισμός προηγούμενων μηνυμάτων σφάλματος

  // Λήψη του αριθμού κυλίνδρων
  const cylinderRangeInput = document.getElementById("cylinder-number");
  const cylinderRange = parseInt(cylinderRangeInput.value.trim(), 10)-1;

  // Έλεγχος αν το πεδίο εύρους κυλίνδρων έχει συμπληρωθεί
  if (isNaN(cylinderRange) || cylinderRange <= 0) {
      displayError(cylinderRangeInput, "Παρακαλώ συμπληρώστε το εύρος κυλίνδρων και προσπαθήστε ξανά.");
      return;
  }

    // Ανάκτηση του μήκους της ακολουθίας
    const sequenceLengthInputElement = document.getElementById("sequence-length");
    const sequenceLength = parseInt(sequenceLengthInputElement.value.trim(), 10);

    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        displayError(sequenceLengthInputElement, "Παρακαλώ εισάγετε έγκυρο μήκος για την ακολουθία!");
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
*/

function example(){
    document.getElementById("process-queue").value = [176, 79, 34, 60, 92, 11, 41, 114].join(",");
    document.getElementById("head-position").value=50;
    document.getElementById("cylinder-number").value=200;
    document.getElementById("example-btn").style.display = "none";
}

function adjustCanvasHeight(sequenceLength) {
    const canvas = document.getElementById("seekCanvas");

    // Ορισμός δυναμικού ύψους με βάση το μήκος της ακολουθίας
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20;
    } else {
        canvas.height = 600;
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



// Συνάρτηση για εμφάνιση μηνύματος σφάλματος
function displayError(inputElement, errorMessage) {
    // Βεβαιωθείτε ότι το στοιχείο εισαγωγής υπάρχει
    if (!inputElement) {
        console.error("Το στοιχείο εισαγωγής δεν βρέθηκε.");
        return;
    }

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