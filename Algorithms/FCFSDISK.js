/**
 * Υλοποιεί τον αλγόριθμο FCFS (First Come, First Serve) για την εξυπηρέτηση αιτημάτων σε σκληρό δίσκο.
 * Διαβάζει τα δεδομένα εισόδου από πεδία HTML, υπολογίζει τις συνολικές κινήσεις και 
 * τη σειρά εξυπηρέτησης, και εμφανίζει τα αποτελέσματα στον χρήστη.
 * 
 * Διαδικασία:
 * - Λαμβάνει την ουρά αιτημάτων και τη θέση κεφαλής από στοιχεία HTML.
 * - Ελέγχει αν οι είσοδοι είναι έγκυρες και ειδοποιεί τον χρήστη σε περίπτωση μη έγκυρων δεδομένων.
 * - Υπολογίζει τη συνολική απόσταση (κινήσεις κεφαλής) και τη σειρά εξυπηρέτησης των αιτημάτων.
 * - Προβάλλει τα αποτελέσματα και καλεί μια συνάρτηση για την οπτικοποίηση της σειράς εξυπηρέτησης.
 * 
 * @function
 * @throws {Error} Εμφανίζει ειδοποίηση αν οι είσοδοι δεν είναι έγκυρες.
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
    let seekCount = 0; // Μετρητής κινήσεων
    let seekSequence = [headPosition]; // Σειρά εξυπηρέτησης
    let currentPosition = headPosition; // Τρέχουσα θέση κεφαλής

    for (let i = 0; i < requestQueue.length; i++) {
        // Υπολογισμός της απόστασης από την τρέχουσα θέση στο επόμενο αίτημα
        let distance = Math.abs(currentPosition - requestQueue[i]);
        seekCount += distance; // Ενημέρωση του μετρητή κινήσεων
        currentPosition = requestQueue[i]; // Ενημέρωση της τρέχουσας θέσης
        seekSequence.push(currentPosition); // Προσθήκη στη σειρά εξυπηρέτησης
    }

    // Εμφάνιση των αποτελεσμάτων
    document.getElementById("seek-count").innerText = `Σύνολο κινήσεων: ${seekCount}`;
    document.getElementById("seek-sequence").innerText = `Σειρά εξυπηρέτησης: ${seekSequence.join(" -> ")}`;

    // Οπτικοποίηση της σειράς κινήσεων
    visualizeSeekSequence(seekSequence);
}


/**
 * Οπτικοποιεί μια ακολουθία κινήσεων κεφαλής (seek sequence) σε έναν καμβά,
 * σχεδιάζοντας γραμμές και βέλη που αναπαριστούν κάθε κίνηση.
 * Κάθε σημείο στην ακολουθία χαρτογραφείται σε μια x-συντεταγμένη στον καμβά,
 * ενώ τα βέλη δείχνουν την κατεύθυνση κάθε κίνησης.
 *
 * @param {number[]} seekSequence - Πίνακας με αριθμούς τροχιών (tracks) που
 * αναπαριστούν την ακολουθία κινήσεων. Οι τροχιές κυμαίνονται από 0 έως 199,
 * αντιστοιχώντας σε θέσεις πάνω στον καμβά.
 */
function visualizeSeekSequence(seekSequence) {
    // Λάβετε το στοιχείο καμβά
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    // Καθαρίστε την προηγούμενη οπτικοποίηση
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ρύθμιση ιδιοτήτων καμβά
    const trackHeight = canvas.height - 40; // Χώρος για περιθώρια
    const trackWidth = canvas.width / (199 - 0); // Υποθέτοντας μέγεθος δίσκου 199
    const margin = 20; // Περιθώριο
    const startY = margin; // Αρχικό Y

    // Σχεδίαση της ευθείας γραμμής με τους αριθμούς
    ctx.strokeStyle = "black"; // Χρώμα γραμμής
    ctx.lineWidth = 1; // Πάχος γραμμής
    const blackLineY = startY; // Τοποθέτηση της γκρι γραμμής στην αρχή του καμβά
    ctx.beginPath();
    ctx.moveTo(margin, blackLineY); // Αρχή της ευθείας γραμμής
    ctx.lineTo(canvas.width - margin, blackLineY); // Τέλος της ευθείας γραμμής
    ctx.stroke();

// Σχεδίαση των αριθμών πάνω στη γραμμή
ctx.fillStyle = "green"; // Χρώμα πλήρωσης
ctx.font = "12px Arial"; // Γραμματοσειρά
for (let i = 0; i < seekSequence.length; i++) {
    const x = seekSequence[i] * trackWidth + margin;
    ctx.fillText(seekSequence[i], x, blackLineY - 10); // Το -5 μετατοπίζει το κείμενο λίγο πάνω από τη γραμμή
}



    // Σχεδίαση της σειράς κινήσεων ως βέλη
    ctx.lineWidth = 2; // Πάχος γραμμής
    ctx.strokeStyle = "green"; // Χρώμα γραμμής
    ctx.fillStyle = "green"; // Χρώμα πλήρωσης

    for (let i = 0; i < seekSequence.length - 1; i++) {
        // Υπολογισμός θέσεων για το τρέχον και το επόμενο αίτημα
        const x1 = seekSequence[i] * trackWidth + margin;
        const y1 = startY + (i * (trackHeight / (seekSequence.length - 1)));
        const x2 = seekSequence[i + 1] * trackWidth + margin;
        const y2 = startY + ((i + 1) * (trackHeight / (seekSequence.length - 1)));

        // Σχεδίαση γραμμής
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Σχεδίαση κεφαλής βέλους
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 10; // Μήκος βέλους
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowLength * Math.cos(angle - Math.PI / 6), y2 - arrowLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI / 6), y2 - arrowLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }
}





