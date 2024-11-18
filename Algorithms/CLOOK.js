// Ορισμός του μεγέθους του δίσκου
let disk_size = 200;
let showNumbersOnArrows = true; // Μεταβλητή για εναλλαγή εμφάνισης αριθμών

/**
 * Εκτελεί τον αλγόριθμο C-LOOK για χρονοπρογραμματισμό δίσκου.
 * Διαχειρίζεται τις εισόδους από τον χρήστη και υπολογίζει τη σειρά αναζήτησης,
 * καθώς και το συνολικό κόστος αναζήτησης.
 *
 * @function
 * @returns {void} Δεν επιστρέφει καμία τιμή. Ενημερώνει το DOM με τα αποτελέσματα.
 * @throws {Error} Αν οι είσοδοι είναι κενές ή περιέχουν μη έγκυρους αριθμούς.
 */
function executeCLOOK() {
    let tracksInput = document.getElementById("process-queue").value;
    let head = parseInt(document.getElementById("head-position").value);
    let direction = document.getElementById("direction").value;

    // Έλεγχος εγκυρότητας των εισαγωγών
    if (!tracksInput) {
        alert("Παρακαλώ εισάγετε αιτήματα.");
        return;
    }

    // Μετατροπή των εισαγόμενων κομματιών (tracks) σε πίνακα αριθμών
    let tracks = tracksInput.split(',').map(item => item.trim()).filter(num => num !== "" && !isNaN(Number(num)));

    // Έλεγχος αν υπάρχουν έγκυρα αιτήματα
    if (tracks.length === 0) {
        alert("Παρακαλώ εισάγετε έγκυρους αριθμούς χωρισμένους με κόμματα.");
        return;
    }

    // Μετατροπή των αιτημάτων σε αριθμούς
    tracks = tracks.map(Number);

    // Διαχωρισμός των κομματιών σε δύο ομάδες (αριστερά και δεξιά από την κεφαλή)
    let left = [], right = [];
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i] < head) left.push(tracks[i]);
        if (tracks[i] >= head) right.push(tracks[i]);
    }

    // Ταξινόμηση των κομματιών
    left.sort((a, b) => a - b);
    right.sort((a, b) => a - b);

    // Δημιουργία ακολουθίας αναζήτησης ανάλογα με την κατεύθυνση
    let seekSequence = direction === "right" ? [...right, ...left] : [...left.reverse(), ...right.reverse()];
    let seekCount = 0;
    let currentPos = head;

    // Υπολογισμός του συνολικού κόστους αναζήτησης
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

      drawCLOOK(seekSequence);
      document.getElementById("resetButton").style.display = "inline-block";

}

// Συνάρτηση που απεικονίζει την ακολουθία του C-LOOK σε καμβά
function drawCLOOK(sequence) {
    let canvas = document.getElementById("seekCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startX = 50;
    let startY = 50;
    let lineHeight = 40;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    for (let i = 0; i < sequence.length; i++) {
        let x = startX + (sequence[i] / disk_size) * (canvas.width - 100);
        let y = startY + (i * lineHeight);

        ctx.lineTo(x, y);

        // Ελέγξτε την κατάσταση του showNumbersOnArrows εδώ
        if (showNumbersOnArrows) {
            ctx.fillStyle = "green";
            ctx.font = "12px Arial";
            ctx.fillText(sequence[i], x + 5, y - 10); // Αριθμός πάνω από κάθε βέλος
        }

        if (i > 0) {
            drawArrow(ctx, startX + ((sequence[i - 1] / disk_size) * (canvas.width - 100)), startY + ((i - 1) * lineHeight), x, y);
        }
    }

    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
}



// Συνάρτηση σχεδίασης βέλους
function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLength = 10; // Μήκος κεφαλής του βέλους
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.lineWidth = 1; // Πάχος γραμμής για το βέλος
    ctx.strokeStyle = "green"; // Χρώμα βέλους
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Σχεδιάζουμε την κεφαλή του βέλους
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = "green"; // Χρώμα κεφαλής βέλους
    ctx.fill();
}


/**
 * Δημιουργεί μια τυχαία ακολουθία αριθμών και την εισάγει στο πεδίο.
 */
function generateRandomSequence() {
    const sequenceLength = Math.floor(Math.random() * 10) + 5; // Μήκος 5-14
    const randomSequence = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * disk_size));
    document.getElementById("process-queue").value = randomSequence.join(", ");
}

document.getElementById("generateSequenceButton").addEventListener("click", generateRandomSequence);

function toggleShowNumbersOnArrows() {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeCLOOK(); // Επανασχεδίαση για να αντικατοπτρίζεται η αλλαγή
}




/**
 * Συνάρτηση επαναφοράς.
 */
function resetCanvasAndInputs() {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "";
    document.getElementById("seek-sequence-boxes").innerHTML = "";
    document.getElementById("resetButton").style.display = "none";
}

// Συνδέσεις κουμπιών
document.getElementById("generateSequenceButton").addEventListener("click", generateRandomSequence);
document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);
document.getElementById("toggleNumbersButton").addEventListener("click", () => {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeCLOOK();
});

