/**
 * Υλοποιεί τον αλγόριθμο FCFS (First Come, First Serve) για την εξυπηρέτηση αιτημάτων σε σκληρό δίσκο.
 * Διαβάζει τα δεδομένα εισόδου από πεδία HTML, υπολογίζει τις συνολικές κινήσεις και 
 * τη σειρά εξυπηρέτησης, και εμφανίζει τα αποτελέσματα στον χρήστη.
 */
function runFCFS() {
    const inputQueue = document.getElementById("process-queue").value.trim();
    const headPosition = parseInt(document.getElementById("head-position").value);

    if (!inputQueue || isNaN(headPosition)) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    const requestQueue = inputQueue.split(",").map(item => {
        const num = Number(item.trim());
        if (isNaN(num)) {
            alert("Παρακαλώ εισάγετε έγκυρους αριθμούς διαχωρισμένους με κόμματα στην ουρά διεργασιών!");
            throw new Error("Invalid input in process queue");
        }
        return num;
    });

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

    seekCountDisplay.style.color = "teal";

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
}

// Συνάρτηση για την επαναφορά του καμβά και των πεδίων εισόδου
function resetCanvasAndInputs() {
    // Καθαρισμός του καμβά
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Καθαρισμός των πεδίων εισόδου και των αποτελεσμάτων
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "";
    document.getElementById("seek-sequence-boxes").innerHTML = "";

    // Απόκρυψη του κουμπιού "Επαναφορά" ξανά
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

    // Υπολογισμός του trackWidth και trackHeight για ευθυγράμμιση και μέγεθος καμβά
    const padding = 30; // Εσωτερικό περιθώριο για να μην κόβονται τα στοιχεία
    const lineLength = canvas.width - padding * 2;
    const trackWidth = lineLength / (endScale - startScale);
    const trackHeight = canvas.height - padding * 2;

    // Σχεδιασμός του κάθετου grid με απαλό γκρι χρώμα
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    // Σχεδιάστε κάθε κάθετη γραμμή του grid
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = padding + (mark - startScale) * trackWidth;
        ctx.beginPath();
        ctx.moveTo(xPosition, padding);
        ctx.lineTo(xPosition, canvas.height - padding);
        ctx.stroke();
    }

    // Σχεδιάστε κάθε οριζόντια γραμμή του grid
    const numHorizontalLines = seekSequence.length;
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = padding + (i * (trackHeight / (numHorizontalLines - 1)));
        ctx.beginPath();
        ctx.moveTo(padding, yPosition);
        ctx.lineTo(canvas.width - padding, yPosition);
        ctx.stroke();
    }

    // Σχεδιασμός ευθείας γκρι γραμμής για τους αριθμούς
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    const blackLineY = padding;
    ctx.beginPath();
    ctx.moveTo(padding, blackLineY);
    ctx.lineTo(canvas.width - padding, blackLineY);
    ctx.stroke();

    // Σχεδιασμός των αριθμών πάνω στη γραμμή ανά 20 μονάδες
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = padding + (mark - startScale) * trackWidth;
        ctx.fillText(mark, xPosition - 10, blackLineY - 10);
    }

    // Σχεδιασμός της σειράς κινήσεων ως βέλη
    const startY = blackLineY + 30;
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = padding + (seekSequence[i] - startScale) * trackWidth;
        const y1 = startY + (i * (trackHeight / (seekSequence.length - 1)));
        const x2 = padding + (seekSequence[i + 1] - startScale) * trackWidth;
        const y2 = startY + ((i + 1) * (trackHeight / (seekSequence.length - 1)));

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
            ctx.fillText(seekSequence[i + 1], x2, y2 - 10);
        }
    }
}



// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας
function generateRandomSequence(length = 10, max = 200) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    return sequence;
}

// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    const randomSequence = generateRandomSequence(); // Δημιουργία τυχαίας ακολουθίας
    document.getElementById("process-queue").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου

});


