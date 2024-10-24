// JavaScript program to demonstrate 
// LOOK Disk Scheduling algorithm 

let size = 8; 

function LOOK(arr, head, direction) { 
    let seek_count = 0; 
    let distance, cur_track; 

    let left = []; 
    let right = []; 
    let seek_sequence = []; 

    // Διαχωρισμός αριστερών και δεξιών κομματιών 
    for(let i = 0; i < size; i++) { 
        if (arr[i] < head) 
            left.push(arr[i]); 
        if (arr[i] > head) 
            right.push(arr[i]); 
    } 

    left.sort(function(a, b){return a - b}); 
    right.sort(function(a, b){return a - b}); 

    // Εκτέλεση του αλγορίθμου LOOK
    let run = 2; 
    while (run-- > 0) { 
        if (direction == "left") { 
            for(let i = left.length - 1; i >= 0; i--) { 
                cur_track = left[i]; 
                seek_sequence.push(cur_track); 
                distance = Math.abs(cur_track - head); 
                seek_count += distance; 
                head = cur_track; 
            } 
            direction = "right"; 
        } else if (direction == "right") { 
            for(let i = 0; i < right.length; i++) { 
                cur_track = right[i]; 
                seek_sequence.push(cur_track); 
                distance = Math.abs(cur_track - head); 
                seek_count += distance; 
                head = cur_track; 
            } 
            direction = "left"; 
        } 
    } 

    // Αποτελέσματα
    document.getElementById("seek-count").innerText = `Συνολικός αριθμός αναζητήσεων = ${seek_count}`;
    document.getElementById("seek-sequence").innerText = `Ακολουθία αναζήτησης: ${seek_sequence.join(', ')}`; 

    // Κλήση της συνάρτησης drawLook για να απεικονίσει την ακολουθία
    drawLook(seek_sequence, direction);
}

// Συνάρτηση που απεικονίζει την ακολουθία του LOOK σε καμβά
// Συνάρτηση που απεικονίζει την ακολουθία του LOOK σε καμβά
function drawLook(sequence, direction) {
    let canvas = document.getElementById("seekCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startY = 50; // Αρχική κατακόρυφη θέση
    let lineHeight = 40; // Αυξημένη απόσταση μεταξύ γραμμών

    ctx.beginPath();

    for (let i = 0; i < sequence.length; i++) {
        let x = 50 + ((sequence[i] / 199) * (canvas.width - 100)); // Υπολογισμός x
        let y = startY + (i * lineHeight); // Κατακόρυφη μεταβολή με βάση τη σειρά της ακολουθίας

        ctx.lineTo(x, y); // Δημιουργούμε τη γραμμή

        // Σχεδιάζουμε βέλος
        if (i > 0) {
            drawArrow(ctx, 50 + ((sequence[i-1] / 199) * (canvas.width - 100)), startY + ((i - 1) * lineHeight), x, y);
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

// Συνάρτηση εκτέλεσης του LOOK
function executeLOOK() {
    let tracksInput = document.getElementById("process-queue").value;
    let head = parseInt(document.getElementById("head-position").value);
    let direction = document.getElementById("direction").value;

    // Μετατροπή των εισαγόμενων κομματιών (tracks) σε πίνακα αριθμών
    let tracks = tracksInput.split(',').map(Number).filter(num => !isNaN(num));

    LOOK(tracks, head, direction);
}

// Δοκιμαστική κλήση για να διασφαλίσουμε ότι οι κώδικες λειτουργούν σωστά
let arr = [176, 79, 34, 60, 92, 11, 41, 114]; 
let head = 50; 
let direction = "right"; 

document.getElementById("head-position").value = head; // Ρύθμιση της αρχικής θέσης κεφαλής
document.getElementById("direction").value = direction; // Ρύθμιση της κατεύθυνσης
