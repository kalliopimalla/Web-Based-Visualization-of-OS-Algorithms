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
    const headPosition = parseInt(document.getElementById("head-position").value);

    if (!inputQueue || isNaN(headPosition)) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    const requestQueue = inputQueue.split(",").map(item => Number(item.trim()));
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

    visualizeSeekSequence(seekSequence);
    

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

    // Σχεδιασμός αριθμών πάνω στην κλίμακα
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";

    for (let i = 0; i < numMarks; i++) {
        const mark = startScale + i * scaleStep; // Τρέχουσα τιμή κλίμακας
        const xPosition = 20 + (i / (numMarks - 1)) * lineLength; // Κατανομή τιμών ομοιόμορφα

        ctx.fillText(mark, xPosition - 10, blackLineY - 10); // Σχεδίαση αριθμών
        ctx.beginPath();
        ctx.moveTo(xPosition, blackLineY);
        ctx.lineTo(xPosition, blackLineY + 10); // Μικρή κάθετη γραμμή για το σημάδι της κλίμακας
        ctx.stroke();
    }

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
