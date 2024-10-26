function runFIFO() {
    // Λήψη τιμών από τα input
    const sequenceInput = document.getElementById("pages").value;
    const frameNumber = parseInt(document.getElementById("frame-number").value);

    // Ελέγχει αν οι είσοδοι είναι έγκυρες
    if (!sequenceInput || isNaN(frameNumber) || frameNumber <= 0) {
        alert("Παρακαλώ εισάγετε μια έγκυρη ακολουθία και αριθμό πλαισίων.");
        return;
    }

    // Μετατρέπει την ακολουθία σε πίνακα ακεραίων
    const pages = sequenceInput.split(",").map(Number);
    const frames = [];
    let pageFaults = 0;
    let hits = 0;

    // Ρυθμίσεις καμβά
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Καθαρίζει τον καμβά

    const cellWidth = 50;  // Πλάτος κελιού
    const cellHeight = 50; // Ύψος κελιού
    const startX = 50;     // Αρχικό X
    const startY = 50;     // Αρχικό Y

    // Διέρχεται την ακολουθία σελίδων και ζωγραφίζει μόνο τα γεμάτα πλαίσια
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Ελέγχει αν η σελίδα είναι ήδη στα πλαίσια (hit)
        if (frames.includes(page)) {
            hits++;
            ctx.fillStyle = "#b3ffb3"; // Πράσινο για hit
        } else {
            // Αν όχι, προσθέτει τη σελίδα και αυξάνει τα page faults
            if (frames.length < frameNumber) {
                frames.push(page);
            } else {
                frames.shift(); // Αφαιρεί την παλαιότερη σελίδα
                frames.push(page);
            }
            pageFaults++;
            ctx.fillStyle = "#ff9999"; // Κόκκινο για page fault
        }

        // Ζωγραφίζει τα γεμάτα πλαίσια
        for (let j = 0; j < frames.length; j++) {
            if (frames[j] !== undefined) {
                ctx.fillRect(startX + i * cellWidth, startY + j * cellHeight, cellWidth, cellHeight);
                ctx.strokeRect(startX + i * cellWidth, startY + j * cellHeight, cellWidth, cellHeight);
                ctx.fillStyle = "black";
                ctx.fillText(frames[j], startX + i * cellWidth + 15, startY + j * cellHeight + 30);
            }
        }
    }

    // Υπολογίζει το hit rate
    const hitRate = (hits / pages.length) * 100;

    // Εμφανίζει τα αποτελέσματα κειμένου
    document.getElementById("seek-count").innerHTML = `
        <p>Number of Hits: <span style="color: green;">${hits}</span></p>
        <p>Page Faults: <span style="color: red;">${pageFaults}</span></p>
        <p>Hit Rate: ${hitRate.toFixed(2)}%</p>
    `;
}
