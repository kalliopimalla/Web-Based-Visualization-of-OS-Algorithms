// Ορισμός του μεγέθους του δίσκου
let disk_size = 199;

// Συνάρτηση εκτέλεσης του C-SCAN
function executeCSCAN() {
    let tracksInput = document.getElementById("process-queue").value;
    let head = parseInt(document.getElementById("head-position").value);
    let direction = document.getElementById("direction").value;

    // Μετατροπή των εισαγόμενων κομματιών (tracks) σε πίνακα αριθμών
    let tracks = tracksInput.split(',').map(Number).filter(num => !isNaN(num));

    // Προσθέτουμε το 0 αν δεν υπάρχει
    if (!tracks.includes(0)) {
        tracks.push(0); 
    }
    
    // Ταξινόμηση των κομματιών
    tracks.sort((a, b) => a - b);
    let left = [], right = [];
    let seekSequence = [];
    let seekCount = 0;

    // Διαχωρισμός των κομματιών σε δύο ομάδες (αριστερά και δεξιά από την κεφαλή)
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i] < head) left.push(tracks[i]);
        if (tracks[i] > head) right.push(tracks[i]);
    }

    // Υπολογισμός της ακολουθίας αναζήτησης
    right.push(disk_size); // Προσθέτουμε το μέγιστο κομμάτι
    seekSequence = [...right, 0, ...left]; // Δεξιά πρώτα, μετά 0, μετά αριστερά

    // Υπολογισμός του συνολικού κόστους αναζήτησης
    let currentPos = head;
    for (let i = 0; i < seekSequence.length; i++) {
        seekCount += Math.abs(seekSequence[i] - currentPos);
        currentPos = seekSequence[i];
    }

    // Εμφάνιση αποτελεσμάτων
    document.getElementById("seek-count").innerText = `Συνολικός αριθμός αναζητήσεων = ${seekCount}`;
    document.getElementById("seek-sequence").innerText = `Ακολουθία αναζήτησης: ${seekSequence.join(', ')}`;
    
    drawCSCAN(seekSequence); // Σχεδίαση της ακολουθίας C-SCAN
}

// Συνάρτηση που απεικονίζει την ακολουθία του C-SCAN σε καμβά
function drawCSCAN(sequence) {
    let canvas = document.getElementById("seekCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startX = 50; // Αρχική οριζόντια θέση
    let startY = 50; // Αρχική κατακόρυφη θέση
    let lineHeight = 40; // Αυξημένη απόσταση μεταξύ γραμμών

    ctx.beginPath();
    ctx.moveTo(startX, startY); // Ξεκινάμε από την αρχή του καμβά

    for (let i = 0; i < sequence.length; i++) {
        let x = startX + (sequence[i] / disk_size) * (canvas.width - 100); // Υπολογισμός x
        let y = startY + (i * lineHeight); // Κατακόρυφη μεταβολή με βάση τη σειρά της ακολουθίας

        ctx.lineTo(x, y); // Δημιουργούμε τη γραμμή

        // Σχεδιάζουμε βέλος
        if (i > 0) {
            drawArrow(ctx, startX + ((sequence[i-1] / disk_size) * (canvas.width - 100)), startY + ((i - 1) * lineHeight), x, y);
        }
    }

    ctx.strokeStyle = "blue"; // Χρώμα γραμμής
    ctx.lineWidth = 2; // Πάχος γραμμής
    ctx.stroke(); // Σχεδιάζουμε τη γραμμή
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
