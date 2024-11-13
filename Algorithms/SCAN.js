// Ορισμός του μεγέθους του δίσκου
let disk_size = 199;

/**
 * Εκτελεί τον αλγόριθμο SCAN για την αναζήτηση κομματιών σε μια μονάδα δίσκου.
 * Ο αλγόριθμος SCAN κινείται σε μια κατεύθυνση (αριστερά ή δεξιά) και εξυπηρετεί
 * τα αιτήματα σε αυτήν την κατεύθυνση, αναστρέφει την κατεύθυνση όταν φτάσει 
 * στο τέλος των κομματιών.
 */
function executeSCAN() {
    let tracksInput = document.getElementById("process-queue").value;
    let head = parseInt(document.getElementById("head-position").value);
    let direction = document.getElementById("direction").value;

    // Επεξεργασία εισόδου του χρήστη και μετατροπή σε αριθμούς
    let tracks = tracksInput.split(',').map(Number).filter(num => !isNaN(num));
    
    if (tracks.length === 0) {
        alert("Παρακαλώ εισάγετε τουλάχιστον έναν έγκυρο αριθμό για τη σειρά αιτήσεων.");
        return;
    }

    if (isNaN(head) || head < 0) {
        alert("Η θέση της κεφαλής πρέπει να είναι ένας θετικός αριθμός.");
        return;
    }

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
        seekSequence = [...left, 0, ...right];
    } else {
        seekSequence = [...right, 0, ...left.reverse()];
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
    
    // Σχεδίαση της ακολουθίας SCAN με τα δεδομένα εισόδου του χρήστη
    drawScan(seekSequence, direction, tracks);
}

// Συνάρτηση που απεικονίζει την ακολουθία του SCAN σε καμβά
function drawScan(sequence, direction, inputTracks) {
    let canvas = document.getElementById("seekCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const disk_size = 199;
    const lineLength = canvas.width - 40;
    const trackHeight = canvas.height - 40;
    const startX = direction === "left" ? 50 : canvas.width - 50;
    const startY = 50;
    const lineHeight = 40;

    // Draw the light grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"; // Light gray for grid
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let mark = 0; mark <= disk_size; mark += 20) {
        const xPosition = 20 + ((mark / disk_size) * lineLength);
        ctx.beginPath();
        ctx.moveTo(xPosition, 0);
        ctx.lineTo(xPosition, canvas.height);
        ctx.stroke();
    }

    // Horizontal grid lines based on the sequence length
    for (let i = 0; i < sequence.length; i++) {
        const yPosition = startY + (i * (trackHeight / (sequence.length - 1)));
        ctx.beginPath();
        ctx.moveTo(0, yPosition);
        ctx.lineTo(canvas.width, yPosition);
        ctx.stroke();
    }

    // Draw the top gray line with scale numbers
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.stroke();

    // Scale numbers on the top line
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";
    for (let mark = 0; mark <= disk_size; mark += 20) {
        const xPosition = 20 + ((mark / disk_size) * lineLength);
        ctx.fillText(mark, xPosition - 10, 10); // Position numbers above the line
    }

    // Draw vertical scale line on the left
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20, canvas.height - 20);
    ctx.stroke();

    // Original scan path drawing code
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let currentX = startX;
    let currentY = startY;

    for (let i = 0; i < sequence.length; i++) {
        let x = direction === "left" 
            ? startX + (sequence[i] / disk_size) * (canvas.width - 100)
            : startX - (sequence[i] / disk_size) * (canvas.width - 100);
        let y = startY + (i * lineHeight);
        
        ctx.lineTo(x, y);

        // Draw arrow with optional numbers
        let value = inputTracks.includes(sequence[i]) ? sequence[i] : "";
        drawArrow(ctx, currentX, currentY, x, y, value, i > 0);
        currentX = x;
        currentY = y;
    }

    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
}


// Μεταβλητή για εναλλαγή εμφάνισης αριθμών στα βέλη
let showNumbersOnArrows = true;

function toggleShowNumbersOnArrows() {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeSCAN();
}

// Συνάρτηση σχεδίασης βέλους με την δυνατότητα εμφάνισης αριθμών
function drawArrow(ctx, fromX, fromY, toX, toY, value, showArrow) {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    if (showArrow) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(toX, toY);
        ctx.fillStyle = "green";
        ctx.fill();
    }

    // Εμφάνιση αριθμού μόνο αν το κουμπί είναι ενεργοποιημένο
    if (showNumbersOnArrows && value !== "") {
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(value, (fromX + toX) / 2, (fromY + toY) / 2 - 10);
    }
}
