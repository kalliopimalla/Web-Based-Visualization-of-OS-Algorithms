// Ορισμός του μεγέθους του δίσκου
let disk_size = 199;
/**
 * Εκτελεί τον αλγόριθμο SCAN για την αναζήτηση κομματιών σε μια μονάδα δίσκου.
 * Ο αλγόριθμος SCAN κινείται σε μια κατεύθυνση (αριστερά ή δεξιά) και εξυπηρετεί
 * τα αιτήματα σε αυτήν την κατεύθυνση, αναστρέφει την κατεύθυνση όταν φτάσει 
 * στο τέλος των κομματιών.
 *
 * @function
 * @returns {void} Δεν επιστρέφει τίποτα. Ενημερώνει το DOM με τα αποτελέσματα
 *                και σχεδιάζει την ακολουθία SCAN.
 *
 * @throws {Alert} Εμφανίζει μηνύματα προειδοποίησης αν η είσοδος δεν είναι
 *                 έγκυρη ή αν δεν πληρούνται οι προϋποθέσεις εισόδου.
 *
 * @example
 * // Χρήση της συνάρτησης για την εκτέλεση του SCAN
 * executeSCAN();
 */
function executeSCAN() {
    let tracksInput = document.getElementById("process-queue").value;
    let head = parseInt(document.getElementById("head-position").value);
    let direction = document.getElementById("direction").value;

    // Έλεγχος εγκυρότητας εισόδου για την σειρά αιτήσεων
    let tracks = tracksInput.split(',').map(Number).filter(num => !isNaN(num));
    
    if (tracks.length === 0) {
        alert("Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό για τη σειρά αιτήσεων.");
        return;
    }

    // Έλεγχος εγκυρότητας για τη θέση της κεφαλής
    if (isNaN(head) || head < 0) {
        alert("Η θέση της κεφαλής πρέπει να είναι ένας θετικός αριθμός.");
        return;
    }

    // Έλεγχος για επιλεγμένη κατεύθυνση
    if (direction !== "left" && direction !== "right") {
        alert("Παρακαλώ επιλέξτε έγκυρη κατεύθυνση: Left ή Right.");
        return;
    }

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

    // Υπολογισμός της ακολουθίας αναζήτησης με βάση την κατεύθυνση
    if (direction === "left") {
        left.reverse(); // Αν η κατεύθυνση είναι αριστερά, αναστρέφουμε τα αριστερά κομμάτια
        seekSequence = [...left, 0, ...right]; // Πρώτα τα αριστερά, μετά το 0, μετά τα δεξιά
    } else {
        seekSequence = [...right, 0, ...left.reverse()]; // Δεξιά πρώτα, μετά το 0, μετά τα αριστερά
    }

    // Υπολογισμός του συνολικού κόστους αναζήτησης
    let currentPos = head;
    for (let i = 0; i < seekSequence.length; i++) {
        seekCount += Math.abs(seekSequence[i] - currentPos);
        currentPos = seekSequence[i];
    }

    // Εμφάνιση αποτελεσμάτων
    document.getElementById("seek-count").innerText = `Συνολικός αριθμός αναζητήσεων = ${seekCount}`;
    document.getElementById("seek-sequence").innerText = `Ακολουθία αναζήτησης: ${seekSequence.join(', ')}`;
    
    drawScan(seekSequence, direction); // Σχεδίαση της ακολουθίας SCAN
}


// Συνάρτηση που απεικονίζει την ακολουθία του SCAN σε καμβά
function drawScan(sequence, direction) {
    let canvas = document.getElementById("seekCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startX = direction === "left" ? 50 : canvas.width - 50; // Αρχική οριζόντια θέση
    let startY = 50; // Αρχική κατακόρυφη θέση
    let lineHeight = 40; // Αυξημένη απόσταση μεταξύ γραμμών

    ctx.beginPath();
    ctx.moveTo(startX, startY); // Ξεκινάμε από την αρχή του καμβά

    for (let i = 0; i < sequence.length; i++) {
        let x;
        if (direction === "left") {
            x = startX + (sequence[i] / disk_size) * (canvas.width - 100); // Υπολογισμός x για αριστερή κατεύθυνση
        } else {
            x = startX - (sequence[i] / disk_size) * (canvas.width - 100); // Υπολογισμός x για δεξιά κατεύθυνση
        }
        let y = startY + (i * lineHeight); // Κατακόρυφη μεταβολή με βάση τη σειρά της ακολουθίας

        ctx.lineTo(x, y); // Δημιουργούμε τη γραμμή

        // Σχεδιάζουμε βέλος
        if (i > 0) {
            drawArrow(ctx, startX + (direction === "left" ? (sequence[i-1] / disk_size) * (canvas.width - 100) : - (sequence[i-1] / disk_size) * (canvas.width - 100)), startY + ((i - 1) * lineHeight), x, y);
        }
    }

    ctx.strokeStyle = "green"; // Χρώμα γραμμής
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