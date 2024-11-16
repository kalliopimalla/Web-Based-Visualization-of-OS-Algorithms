let showNumbersOnArrows = true; // Αρχική κατάσταση για εμφάνιση αριθμών
const disk_size = 199; // Μέγεθος δίσκου

/**
 * Εκτελεί τον αλγόριθμο SCAN και σχεδιάζει την αναπαράσταση.
 */
function executeSCAN() {
    const tracksInput = document.getElementById("process-queue").value;
    const head = parseInt(document.getElementById("head-position").value);
    const direction = document.getElementById("direction").value;

    if (!tracksInput || isNaN(head) || (direction !== "left" && direction !== "right")) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    const tracks = tracksInput.split(",").map(Number).filter(num => !isNaN(num));
    if (!tracks.includes(0)) tracks.push(0);
    tracks.sort((a, b) => a - b);

    let left = [], right = [];
    let seekSequence = [];
    let seekCount = 0;

    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i] < head) left.push(tracks[i]);
        if (tracks[i] > head) right.push(tracks[i]);
    }

    if (direction === "left") {
        left.reverse();
        seekSequence = [...left, 0, ...right];
    } else {
        seekSequence = [...right, 0, ...left.reverse()];
    }

    let currentPos = head;
    for (let i = 0; i < seekSequence.length; i++) {
        seekCount += Math.abs(seekSequence[i] - currentPos);
        currentPos = seekSequence[i];
    }

    document.getElementById("seek-count-display").innerText = `Συνολικός αριθμός αναζητήσεων = ${seekCount}`;
    drawScan(seekSequence);
    document.getElementById("resetButton").style.display = "inline-block";
}

/**
 * Σχεδιάζει την αναπαράσταση του SCAN σε καμβά.
 */
function drawScan(sequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lineLength = canvas.width - 40;
    const trackHeight = canvas.height - 40;
    const padding = 20;

    const startX = padding;
    const trackWidth = lineLength / disk_size;
    const stepY = trackHeight / (sequence.length - 1);

    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;

    for (let i = 0; i <= disk_size; i += 20) {
        const xPosition = startX + i * trackWidth;
        ctx.beginPath();
        ctx.moveTo(xPosition, padding);
        ctx.lineTo(xPosition, canvas.height - padding);
        ctx.stroke();
        ctx.fillText(i, xPosition - 10, padding - 5);
    }

    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

    for (let i = 0; i < sequence.length - 1; i++) {
        const x1 = startX + sequence[i] * trackWidth;
        const y1 = padding + i * stepY;
        const x2 = startX + sequence[i + 1] * trackWidth;
        const y2 = padding + (i + 1) * stepY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        drawArrow(ctx, x1, y1, x2, y2, sequence[i + 1]);
    }
}

/**
 * Σχεδιάζει βέλος με δυνατότητα εμφάνισης αριθμών.
 */
function drawArrow(ctx, fromX, fromY, toX, toY, value) {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = "green";
    ctx.fill();

    if (showNumbersOnArrows) {
        ctx.fillStyle = "green";
        ctx.font = "12px Arial";
        ctx.fillText(value, (fromX + toX) / 2, (fromY + toY) / 2 - 10);
    }
}

/**
 * Δημιουργεί μια τυχαία ακολουθία αριθμών και την εισάγει στο πεδίο.
 */
function generateRandomSequence() {
    const sequenceLength = Math.floor(Math.random() * 10) + 5; // Μήκος 5-14
    const randomSequence = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * disk_size));
    document.getElementById("process-queue").value = randomSequence.join(", ");
}

// Συνδέσεις κουμπιών
document.getElementById("generateSequenceButton").addEventListener("click", generateRandomSequence);
document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);
document.getElementById("toggleNumbersButton").addEventListener("click", () => {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeSCAN();
});

/**
 * Συνάρτηση επαναφοράς.
 */
function resetCanvasAndInputs() {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "";
    document.getElementById("resetButton").style.display = "none";
}
