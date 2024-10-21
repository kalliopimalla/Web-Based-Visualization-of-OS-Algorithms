function runFCFS() {
    // Λάβετε τις τιμές εισόδου
    const inputQueue = document.getElementById("process-queue").value.trim();
    const headPosition = parseInt(document.getElementById("head-position").value);
    
    // Έλεγχος αν οι είσοδοι είναι έγκυροι
    if (!inputQueue || isNaN(headPosition)) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    // Ανάλυση της ουράς εισόδου σε πίνακα αιτημάτων
    const requestQueue = inputQueue.split(",").map(Number);
    
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

    // Σχεδίαση της σειράς κινήσεων ως βέλη
    ctx.lineWidth = 2; // Πάχος γραμμής
    ctx.strokeStyle = "green"; // Χρώμα γραμμής
    ctx.fillStyle = "green"; // Χρώμα πλήρωσης
    ctx.font = "12px Arial"; // Γραμματοσειρά

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