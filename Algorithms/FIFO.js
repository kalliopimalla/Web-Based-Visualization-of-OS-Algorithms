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

    // Διέρχεται την ακολουθία σελίδων και ζωγραφίζει το στάδιο κάθε βήματος
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Έλεγχος για hit ή fault
        let isHit = frames.includes(page);
        if (isHit) {
            hits++;
        } else {
            if (frames.length < frameNumber) {
                frames.push(page);
            } else {
                frames.shift(); // Αφαιρεί την παλαιότερη σελίδα
                frames.push(page);
            }
            pageFaults++;
        }

        // Ρυθμίσεις χρώματος για hit ή fault
        const fillColor = isHit ? "#b3ffb3" : "#ff9999"; // Πράσινο για hit, κόκκινο για fault
        ctx.fillStyle = fillColor;

        // Ζωγραφίζει τα πλαίσια
        for (let j = 0; j < frameNumber; j++) {
            if (frames[j] !== undefined) {
                // Σχεδιασμός κελιού για κάθε σελίδα
                ctx.fillRect(startX + i * cellWidth, startY + j * cellHeight, cellWidth, cellHeight);
                ctx.strokeRect(startX + i * cellWidth, startY + j * cellHeight, cellWidth, cellHeight);

                // Εμφάνιση αριθμού της σελίδας στο κελί
                ctx.fillStyle = "black";
                ctx.fillText(frames[j], startX + i * cellWidth + 15, startY + j * cellHeight + 30);
            } else {
                // Κελί κενό αν δεν υπάρχει σελίδα
                ctx.clearRect(startX + i * cellWidth, startY + j * cellHeight, cellWidth, cellHeight);
            }
        }

        // Προβολή hit/fault δίπλα σε κάθε βήμα
        ctx.fillStyle = fillColor;
        ctx.fillText(isHit ? "H" : "F", startX + i * cellWidth + 15, startY + frameNumber * cellHeight + 20);
    }

    // Υπολογίζει και εμφανίζει το hit rate
    const hitRate = (hits / pages.length) * 100;
    document.getElementById("seek-count").innerHTML = `
        <p>Number of Hits: <span style="color: green;">${hits}</span></p>
        <p>Page Faults: <span style="color: red;">${pageFaults}</span></p>
        <p>Hit Rate: ${hitRate.toFixed(2)}%</p>
    `;
}
