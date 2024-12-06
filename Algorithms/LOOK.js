let disk_size = 200;
let showNumbersOnArrows = true; // Εναλλαγή εμφάνισης αριθμών



/**
 * Εκτελεί τον αλγόριθμο LOOK για χρονοπρογραμματισμό δίσκου.
 */
function executeLOOK() {
    let tracksInput = document.getElementById("process-queue").value;
    let head = parseInt(document.getElementById("head-position").value);
    let direction = document.getElementById("direction").value;

    if (!tracksInput || isNaN(head)) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    // Μετατροπή των αιτημάτων σε πίνακα αριθμών
    let tracks = tracksInput.split(',').map(item => Number(item.trim())).filter(num => !isNaN(num));

   // Έλεγχος αν υπάρχουν έγκυροι αριθμοί
if (tracks.length === 0 || tracks.length > 100) {
    alert("Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό και όχι περισσότερους από 100!");
    return;
}

    // Κλήση της συνάρτησης LOOK
    LOOK(tracks, head, direction);
      // Εμφάνιση κουμπιού επαναφοράς
      document.getElementById("resetButton").style.display = "inline-block";
      hideFooter(); // Απόκρυψη του footer
}

/**
 * Υλοποιεί τον αλγόριθμο LOOK.
 */
function LOOK(arr, head, direction) {
    if (!Array.isArray(arr) || arr.length === 0 || arr.some(num => typeof num !== 'number' || isNaN(num))) {
        alert("Παρακαλώ εισάγετε έγκυρους αριθμούς για τα αιτήματα.");
        return;
    }

    let seek_count = 0;
    let distance, cur_track;
    let left = [];
    let right = [];
    let seek_sequence = [head];

    // Διαχωρισμός αιτημάτων σε αριστερά και δεξιά
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
    visualizeSeekSequence(seek_sequence);
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
function visualizeSeekSequence(seekSequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 30;
    const lineLength = canvas.width - padding * 2;
    const trackWidth = lineLength / disk_size;
    const trackHeight = canvas.height - padding * 2;

    const minInput = Math.min(...seekSequence);
    const maxInput = Math.max(...seekSequence);
    const startScale = Math.floor(minInput / 20) * 20;
    const endScale = Math.ceil(maxInput / 20) * 20;

    // Σχεδιασμός grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    for (let mark = startScale; mark <= endScale; mark += 20) {
        const x = padding + (mark - startScale) * trackWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }

    const numHorizontalLines = seekSequence.length;
    const horizontalStep = trackHeight / (numHorizontalLines - 1);

    for (let i = 0; i < numHorizontalLines; i++) {
        const y = padding + i * horizontalStep;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }

    // Σχεδιασμός της κλίμακας
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    const scaleY = padding;
    ctx.beginPath();
    ctx.moveTo(padding, scaleY);
    ctx.lineTo(canvas.width - padding, scaleY);
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const x = padding + (mark - startScale) * trackWidth;
        ctx.fillText(mark, x - 10, scaleY - 10);
    }

    // Σχεδιασμός βελών για τη σειρά εξυπηρέτησης
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.lineWidth = 2;

    let x1 = padding + (seekSequence[0] - startScale) * trackWidth;
    let y1 = padding; // Ξεκινά από την κορυφή του καμβά
    
    for (let i = 1; i < seekSequence.length; i++) {
        const x2 = padding + (seekSequence[i] - startScale) * trackWidth;
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

    document.getElementById("resetButton").style.display = "none";
          // Καθαρισμός του πεδίου για το μήκος ακολουθίας
          document.getElementById("sequence-length").value = ""; // Μηδενισμός του sequence length

          // Εμφάνιση του footer
          showFooter();
      
}




// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας
function generateRandomSequence(length = sequenceLength, max = 200) {

    if (length > 100) {
        alert("Το μήκος της ακολουθίας δεν μπορεί να υπερβαίνει τους 100 αριθμούς!");
        return [];
    }

    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    return sequence;
}


// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    // Λήψη του μήκους από το πεδίο εισαγωγής
    const sequenceLengthInput = document.getElementById("sequence-length").value.trim();
    const sequenceLength = parseInt(sequenceLengthInput, 10);

    // Έλεγχος αν το μήκος είναι αριθμός και θετικό
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        alert("Παρακαλώ εισάγετε έγκυρο μήκος για την ακολουθία (θετικός ακέραιος)!");
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
    const sequenceLengthInput = document.getElementById("sequence-length").value.trim();
    const sequenceLength = parseInt(sequenceLengthInput, 10);

    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        alert("Παρακαλώ εισάγετε έγκυρο μήκος για την ακολουθία (θετικός ακέραιος)!");
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