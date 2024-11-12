/**
 * Υλοποιεί τον αλγόριθμο FCFS (First Come, First Serve) για την εξυπηρέτηση αιτημάτων σε σκληρό δίσκο.
 * Διαβάζει τα δεδομένα εισόδου από πεδία HTML, υπολογίζει τις συνολικές κινήσεις και 
 * τη σειρά εξυπηρέτησης, και εμφανίζει τα αποτελέσματα στον χρήστη.
 */
function runFCFS() {
    // Λάβετε τις τιμές εισόδου
    const inputQueue = document.getElementById("process-queue").value.trim();
    const headPosition = parseInt(document.getElementById("head-position").value);

    // Έλεγχος αν οι είσοδοι είναι έγκυροι
    if (!inputQueue || isNaN(headPosition)) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    // Ανάλυση της ουράς εισόδου σε πίνακα αιτημάτων με επιπλέον έλεγχο
    const requestQueue = inputQueue.split(",").map(item => {
        const num = Number(item.trim());
        if (isNaN(num)) {
            alert("Παρακαλώ εισάγετε έγκυρους αριθμούς διαχωρισμένους με κόμματα στην ουρά διεργασιών!");
            throw new Error("Invalid input in process queue");
        }
        return num;
    });

    // Υλοποίηση του αλγορίθμου FCFS
    let seekCount = 0;
    let seekSequence = [headPosition];
    let currentPosition = headPosition;

    for (let i = 0; i < requestQueue.length; i++) {
        let distance = Math.abs(currentPosition - requestQueue[i]);
        seekCount += distance;
        currentPosition = requestQueue[i];
        seekSequence.push(currentPosition);
    }

    // Εμφάνιση των αποτελεσμάτων
    document.getElementById("seek-count").innerText = `Σύνολο κινήσεων: ${seekCount}`;
    document.getElementById("seek-sequence").innerText = `Σειρά εξυπηρέτησης: ${seekSequence.join(" -> ")}`;

    // Οπτικοποίηση της σειράς κινήσεων
    visualizeSeekSequence(seekSequence);
}

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

    // Σχεδιασμός του grid (πλέγμα) με απαλό χρώμα
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";  // Χρώμα grid (απαλό γκρι)
    ctx.lineWidth = 1;

    // Σχεδιάστε κάθε κάθετη γραμμή του grid
    const lineLength = canvas.width - 40;
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = 20 + ((mark - startScale) / (endScale - startScale)) * lineLength;
        ctx.beginPath();
        ctx.moveTo(xPosition, 0);
        ctx.lineTo(xPosition, canvas.height);
        ctx.stroke();
    }

    // Σχεδιάστε κάθε οριζόντια γραμμή του grid
    const trackHeight = canvas.height - 40;
    const trackWidth = canvas.width / (199 - 0);
    for (let i = 0; i < seekSequence.length - 1; i++) {
        const yPosition = i * (trackHeight / (seekSequence.length - 1));
        ctx.beginPath();
        ctx.moveTo(0, yPosition);
        ctx.lineTo(canvas.width, yPosition);
        ctx.stroke();
    }

    // Σχεδιασμός ευθείας γκρι γραμμής
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    const blackLineY = 20;
    ctx.beginPath();
    ctx.moveTo(20, blackLineY);
    ctx.lineTo(canvas.width - 20, blackLineY);
    ctx.stroke();

    // Σχεδιασμός των αριθμών πάνω στη γραμμή ανά 20
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = 20 + ((mark - startScale) / (endScale - startScale)) * lineLength;
        ctx.fillText(mark, xPosition - 10, blackLineY - 10);
    }

    // Σχεδιασμός της κάθετης γραμμής που ξεκινά από το τέλος της οριζόντιας γραμμής
    const verticalLineX = 20;
    const verticalLineYStart = blackLineY;
    const verticalLineYEnd = canvas.height - 20;

    // Σχεδιάστε την κάθετη γραμμή
    ctx.beginPath();
    ctx.moveTo(verticalLineX, verticalLineYStart);
    ctx.lineTo(verticalLineX, verticalLineYEnd);
    ctx.stroke();

  

    // Σχεδιασμός της σειράς κινήσεων ως βέλη
    const margin = 20;
    const startY = margin;
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = seekSequence[i] * trackWidth + margin;
        const y1 = startY + (i * (trackHeight / (seekSequence.length - 1)));
        const x2 = seekSequence[i + 1] * trackWidth + margin;
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


