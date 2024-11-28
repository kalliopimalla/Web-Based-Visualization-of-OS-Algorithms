// Ορισμός του μεγέθους του δίσκου
let disk_size = 199;
let seekSequence = []; // Global μεταβλητή
/**
 * Εκτελεί τον αλγόριθμο C-SCAN για την αναζήτηση δίσκου.
 * Λαμβάνει τις εισροές από τον χρήστη, επεξεργάζεται τις θέσεις των κομματιών,
 * υπολογίζει την ακολουθία αναζήτησης και εμφανίζει τα αποτελέσματα.
 *
 * @function executeCSCAN
 * @returns {void} Δεν επιστρέφει καμία τιμή. Ενημερώνει το DOM με τα αποτελέσματα.
 *
 * @throws {Error} Αν δεν υπάρχουν έγκυρες εισροές, εμφανίζει μήνυμα σφάλματος.
 */
function executeCSCAN() {
    // Λήψη και επεξεργασία των εισροών
    let tracksInput = document.getElementById("process-queue").value.trim();
    let head = parseInt(document.getElementById("head-position").value);
    let direction = document.getElementById("direction").value;  // Αποθήκευση της κατεύθυνσης
    
    // Έλεγχος για έγκυρη είσοδο
    if (!tracksInput) {
        alert("Παρακαλώ εισάγετε μια λίστα αριθμών, χωρισμένων με κόμματα!");
        return;
    }
    
    let tracks = tracksInput.split(',').map(item => item.trim()).map(Number).filter(num => !isNaN(num));

    // Έλεγχος αν υπάρχουν έγκυροι αριθμοί
    if (tracks.length === 0) {
        alert("Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό!");
        return;
    }

    // Εξασφάλιση ότι το 0 περιλαμβάνεται
    if (!tracks.includes(0)) {
        tracks.push(0);
    }

    tracks.sort((a, b) => a - b);
    let left = [], right = [];
    let seekSequence = [];
    let seekCount = 0;

    // Διαχωρισμός των κομματιών σε δύο ομάδες (αριστερά και δεξιά από την κεφαλή)
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i] < head) left.push(tracks[i]);
        if (tracks[i] > head) right.push(tracks[i]);
    }
    if (direction === "right") {
        right.push(disk_size); // Προσθέτουμε το μέγιστο κομμάτι στο τέλος των δεξιών
        seekSequence = [head, ...right, 0, ...left]; // Προσθέτουμε την κεφαλή στην αρχή
    } else {
        left.unshift(0); // Προσθέτουμε το 0 στην αρχή των αριστερών
        seekSequence = [head, ...left.reverse(), disk_size, ...right.reverse()]; // Προσθέτουμε την κεφαλή στην αρχή
    }
    
    
    // Αφαίρεση τυχόν διπλοεμφανίσεων του 0
    seekSequence = seekSequence.filter((value, index, self) => value !== 0 || self.indexOf(0) === index);
    

    // Υπολογισμός του συνολικού κόστους αναζήτησης
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


    
    drawCSCAN(seekSequence); // Σχεδίαση της ακολουθίας C-SCAN
    document.getElementById("resetButton").style.display = "inline-block";
    hideFooter(); // Απόκρυψη του footer
}


let showNumbersOnArrows = true; // Μεταβλητή για εναλλαγή εμφάνισης αριθμών

function toggleShowNumbersOnArrows() {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeCSCAN(); // Επανασχεδίαση για να γίνει εναλλαγή στην εμφάνιση αριθμών
}

function drawCSCAN(sequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Καθαρισμός του καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Υπολογισμός τιμών για την κλίμακα
    const maxInput = Math.max(...sequence);
    const disk_size = Math.max(199, maxInput + 20); // Επεκτείνουμε την κλίμακα αν χρειαστεί
    const scaleStep = 20; // Βήμα κλίμακας
    const numMarks = Math.ceil(disk_size / scaleStep) + 1;

    const margin = 20; // Περιθώριο από τις άκρες του καμβά
    const lineLength = canvas.width - 2 * margin; // Μήκος της κλίμακας
    const trackHeight = canvas.height - 2 * margin; // Ύψος του grid
    const trackWidth = lineLength / disk_size; // Πλάτος κάθε κομματιού
    const startX = margin; // Αρχή του grid στον οριζόντιο άξονα
    const startY = margin; // Αρχή του grid στον κάθετο άξονα

    // Σχεδιασμός κάθετων γραμμών του grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    for (let i = 0; i < numMarks; i++) {
        const xPosition = startX + (i * scaleStep / disk_size) * lineLength;
        ctx.beginPath();
        ctx.moveTo(xPosition, startY); // Ξεκινά από την πρώτη οριζόντια γραμμή
        ctx.lineTo(xPosition, startY + trackHeight); // Μέχρι το τέλος του grid
        ctx.stroke();
    }

    // Σχεδιασμός οριζόντιων γραμμών του grid
    const numHorizontalLines = sequence.length;
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = startY + (i / (numHorizontalLines - 1)) * trackHeight;
        ctx.beginPath();
        ctx.moveTo(startX, yPosition);
        ctx.lineTo(startX + lineLength, yPosition);
        ctx.stroke();
    }

    // Σχεδιασμός της πάνω γραμμής με την κλίμακα (στην πρώτη οριζόντια γραμμή)
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    const scaleY = startY; // Ύψος της πάνω γραμμής
    ctx.beginPath();
    ctx.moveTo(startX, scaleY);
    ctx.lineTo(startX + lineLength, scaleY);
    ctx.stroke();

    // Σχεδιασμός αριθμών της κλίμακας
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";

    for (let i = 0; i < numMarks; i++) {
        const mark = i * scaleStep;
        const xPosition = startX + (i * scaleStep / disk_size) * lineLength;

        ctx.fillText(mark, xPosition - 10, scaleY - 5); // Τοποθέτηση αριθμών
        ctx.beginPath();
        ctx.moveTo(xPosition, scaleY);
        ctx.lineTo(xPosition, scaleY + 10); // Μικρή κάθετη γραμμή για την κλίμακα
        ctx.stroke();
    }

    // Σχεδιασμός της διαδρομής C-SCAN
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";

    for (let i = 0; i < sequence.length - 1; i++) {
        const x1 = startX + (sequence[i] / disk_size) * lineLength;
        const y1 = startY + (i * (trackHeight / (sequence.length - 1)));
        const x2 = startX + (sequence[i + 1] / disk_size) * lineLength;
        const y2 = startY + ((i + 1) * (trackHeight / (sequence.length - 1)));

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

        if (showNumbersOnArrows) {
            ctx.fillStyle = "green";
            ctx.font = "12px Arial";
            ctx.fillText(sequence[i + 1], x2 - 5, y2 - 10);
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
      // Καθαρισμός του πεδίου για το μήκος ακολουθίας
      document.getElementById("sequenceLength").value = ""; // Μηδενισμός του sequence length

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






  
function adjustCanvasSpacing() {
    const canvas = document.getElementById("seekCanvas");
    const sequenceContainer = document.getElementById("seek-sequence");

    if (!sequenceContainer) return; // Έλεγχος αν το στοιχείο υπάρχει

    const canvasHeight = canvas.height;
    sequenceContainer.style.marginBottom = canvasHeight > 600 ? "40px" : "20px";
}







document.getElementById("generateSequenceButton").addEventListener("click", function () {
    const sequenceLengthInput = document.getElementById("sequenceLength").value.trim();
    const sequenceLength = parseInt(sequenceLengthInput, 10);

    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        alert("Παρακαλώ εισάγετε έγκυρο μήκος για την ακολουθία (θετικός ακέραιος)!");
        return;
    }

    const randomSequence = generateRandomSequence(sequenceLength, 200); // Παροχή μήκους και μέγιστου ορίου
    document.getElementById("process-queue").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου

    // Ενημέρωση καμβά αν η ακολουθία είναι μεγάλη
    const canvas = document.getElementById("seekCanvas");
    if (sequenceLength > 30) {
        canvas.height = 600 + (sequenceLength - 30) * 20; // Δυναμικό ύψος καμβά
    } else {
        canvas.height = 600; // Επαναφορά στο αρχικό ύψος
    }
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
