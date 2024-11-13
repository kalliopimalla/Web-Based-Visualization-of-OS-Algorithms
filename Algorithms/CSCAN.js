// Ορισμός του μεγέθους του δίσκου
let disk_size = 199;
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
        right.push(disk_size); // Προσθέτουμε το μέγιστο κομμάτι αν πάμε δεξιά
        seekSequence = [...right, 0, ...left]; // Δεξιά πρώτα, μετά 0, μετά αριστερά
    } else {
        left.unshift(0); // Προσθέτουμε το 0 αν πάμε αριστερά
        seekSequence = [...left.reverse(), disk_size, ...right.reverse()]; // Αριστερά πρώτα, μετά max, μετά δεξιά
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
    
    drawCSCAN(seekSequence); // Σχεδίαση της ακολουθίας C-SCAN
}


let showNumbersOnArrows = true; // Μεταβλητή για εναλλαγή εμφάνισης αριθμών

function toggleShowNumbersOnArrows() {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeCSCAN(); // Επανασχεδίαση για να γίνει εναλλαγή στην εμφάνιση αριθμών
}

function drawCSCAN(sequence) {
    let canvas = document.getElementById("seekCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const disk_size = 199;
    const lineLength = canvas.width - 100;
    const trackHeight = canvas.height - 40;
    const startX = 50;
    const startY = 50;
    const lineHeight = 40;

    // Draw grid lines
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let mark = 0; mark <= disk_size; mark += 20) {
        const xPosition = startX + ((mark / disk_size) * lineLength);
        ctx.beginPath();
        ctx.moveTo(xPosition, 0);
        ctx.lineTo(xPosition, canvas.height);
        ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i < sequence.length; i++) {
        const yPosition = startY + (i * lineHeight);
        ctx.beginPath();
        ctx.moveTo(0, yPosition);
        ctx.lineTo(canvas.width, yPosition);
        ctx.stroke();
    }

    // Draw top gray line with scale numbers
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, 20);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.stroke();

    // Scale numbers on the top line
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";
    for (let mark = 0; mark <= disk_size; mark += 20) {
        const xPosition = startX + ((mark / disk_size) * lineLength);
        ctx.fillText(mark, xPosition - 10, 10);
    }

    // Draw vertical scale line on the left
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20, canvas.height - 20);
    ctx.stroke();

    // Draw C-SCAN path with arrows and optional sequence numbers
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let currentX = startX;
    let currentY = startY;

    for (let i = 0; i < sequence.length; i++) {
        let x = startX + (sequence[i] / disk_size) * lineLength;
        let y = startY + (i * lineHeight);

        ctx.lineTo(x, y);

        // Draw arrow between points
        if (i > 0) {
            drawArrow(ctx, currentX, currentY, x, y);
        }

        // Display numbers on arrows if enabled
        if (showNumbersOnArrows) {
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.fillText(sequence[i], x - 5, y - 10);
        }

        currentX = x;
        currentY = y;
    }

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
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
