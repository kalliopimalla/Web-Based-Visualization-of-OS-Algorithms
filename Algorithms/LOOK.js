/**
 * Εκτελεί τον αλγόριθμο LOOK για χρονοπρογραμματισμό δίσκου.
 */
function LOOK(arr, head, direction) {
    if (!Array.isArray(arr) || arr.length === 0 || arr.some(num => typeof num !== 'number' || isNaN(num))) {
        alert("Παρακαλώ εισάγετε έγκυρους αριθμούς για τα αιτήματα.");
        return;
    }

    let seek_count = 0;
    let distance, cur_track;
    let left = [];
    let right = [];
    let seek_sequence = [];

    // Διαχωρισμός αριστερών και δεξιών κομματιών
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < head) left.push(arr[i]);
        if (arr[i] > head) right.push(arr[i]);
    }

    left.sort((a, b) => a - b);
    right.sort((a, b) => a - b);

    // Εκτέλεση του αλγορίθμου LOOK
    let run = 2;
    while (run-- > 0) {
        if (direction === "left") {
            for (let i = left.length - 1; i >= 0; i--) {
                cur_track = left[i];
                seek_sequence.push(cur_track);
                distance = Math.abs(cur_track - head);
                seek_count += distance;
                head = cur_track;
            }
            direction = "right";
        } else if (direction === "right") {
            for (let i = 0; i < right.length; i++) {
                cur_track = right[i];
                seek_sequence.push(cur_track);
                distance = Math.abs(cur_track - head);
                seek_count += distance;
                head = cur_track;
            }
            direction = "left";
        }
    }

    // Εμφάνιση του συνολικού αριθμού κινήσεων
    const seekCountDisplay = document.getElementById("seek-count-display");
    seekCountDisplay.innerHTML = `Συνολική μετακίνηση κεφαλής: ${seek_count}`;

    // Δημιουργία κουτιών για τη σειρά εξυπηρέτησης
    const seekSequenceBoxes = document.getElementById("seek-sequence-boxes");
    seekSequenceBoxes.innerHTML = "";
    seek_sequence.forEach((position, index) => {
        const box = document.createElement("div");
        box.className = "sequence-box";
        box.textContent = position;

        seekSequenceBoxes.appendChild(box);
        if (index < seek_sequence.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "arrow";
            arrow.textContent = "→";
            seekSequenceBoxes.appendChild(arrow);
        }
    });

    // Κλήση της συνάρτησης για την οπτικοποίηση
    drawLook(seek_sequence);
}

/**
 * Οπτικοποιεί την ακολουθία του LOOK σε καμβά με grid, βέλη και αριθμούς.
 */
function drawLook(sequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const minInput = Math.min(...sequence);
    const maxInput = Math.max(...sequence);
    const startScale = Math.floor(minInput / 20) * 20;
    const endScale = Math.ceil(maxInput / 20) * 20;

    const padding = 30;
    const lineLength = canvas.width - padding * 2;
    const trackWidth = lineLength / (endScale - startScale);
    const trackHeight = canvas.height - padding * 2;

    // Σχεδιασμός grid
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = padding + (mark - startScale) * trackWidth;
        ctx.beginPath();
        ctx.moveTo(xPosition, padding);
        ctx.lineTo(xPosition, canvas.height - padding);
        ctx.stroke();
    }
    const numHorizontalLines = sequence.length;
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = padding + (i * (trackHeight / (numHorizontalLines - 1)));
        ctx.beginPath();
        ctx.moveTo(padding, yPosition);
        ctx.lineTo(canvas.width - padding, yPosition);
        ctx.stroke();
    }

    // Αριθμοί κλίμακας
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";
    for (let mark = startScale; mark <= endScale; mark += 20) {
        const xPosition = padding + (mark - startScale) * trackWidth;
        ctx.fillText(mark, xPosition - 10, padding - 10);
    }

    // Σχεδιασμός διαδρομής με βέλη
    const startY = padding + 30;
    for (let i = 0; i < sequence.length - 1; i++) {
        const x1 = padding + (sequence[i] - startScale) * trackWidth;
        const y1 = padding + (i * (trackHeight / (sequence.length - 1)));
        const x2 = padding + (sequence[i + 1] - startScale) * trackWidth;
        const y2 = padding + ((i + 1) * (trackHeight / (sequence.length - 1)));

        // Χρήση της drawArrow για κάθε διαδοχικό ζεύγος
        drawArrow(ctx, x1, y1, x2, y2);

        // Εμφάνιση αριθμών αν ενεργοποιηθεί η επιλογή
        if (showNumbersOnArrows) {
            ctx.fillStyle = "green";
            ctx.font = "12px Arial";
            ctx.fillText(sequence[i + 1], x2, y2 - 10);
        }
    }
}
/**
 * Σχεδιάζει ένα βέλος από ένα σημείο σε άλλο.
 */
function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLength = 10; // Μήκος κεφαλής του βέλους
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    // Γραμμή βέλους
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Κεφαλή βέλους
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = "green";
    ctx.fill();
}

// Συνάρτηση εκτέλεσης του LOOK
function executeLOOK() {
    const tracksInput = document.getElementById("process-queue").value;
    const head = parseInt(document.getElementById("head-position").value);
    const direction = document.getElementById("direction").value;

    const tracks = tracksInput.split(',').map(Number).filter(num => !isNaN(num));
    LOOK(tracks, head, direction);
}

/**
 * Δημιουργεί μια τυχαία ακολουθία αριθμών και την εισάγει στο πεδίο.
 */
function generateRandomSequence() {
    const sequenceLength = Math.floor(Math.random() * 10) + 5; // Μήκος 5-14
    const randomSequence = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * disk_size));
    document.getElementById("process-queue").value = randomSequence.join(", ");
}

document.getElementById("generateSequenceButton").addEventListener("click", generateRandomSequence);

