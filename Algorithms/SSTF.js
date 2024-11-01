/**
 * Εκτελεί τον αλγόριθμο Shortest Seek Time First (SSTF) για την εξυπηρέτηση αιτημάτων δίσκου.
 * 
 * Αυτή η συνάρτηση διαβάζει τα δεδομένα εισόδου από την ιστοσελίδα, 
 * ελέγχει την εγκυρότητά τους και υπολογίζει τη σειρά εξυπηρέτησης 
 * των αιτημάτων με βάση την πλησιέστερη θέση κεφαλής δίσκου.
 * 
 * Η διαδικασία περιλαμβάνει:
 * - Έλεγχο της εγκυρότητας των δεδομένων εισόδου
 * - Διαχωρισμό και μετατροπή των αιτημάτων σε αριθμούς
 * - Υπολογισμό του συνολικού αριθμού κινήσεων της κεφαλής
 * - Ενημέρωση της εμφάνισης με τα αποτελέσματα
 * 
 * @returns {void} Δεν επιστρέφει τιμή.
 */
function runSSTF() {
    const inputQueue = document.getElementById("process-queue").value.trim();
    const headPosition = parseInt(document.getElementById("head-position").value);
    
    // Έλεγχος για κενό input ή μη έγκυρη θέση κεφαλής
    if (!inputQueue || isNaN(headPosition)) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }
    
    // Διαχωρισμός της εισόδου και έλεγχος για μη αριθμητικά στοιχεία
    const requestQueue = inputQueue.split(",").map(item => item.trim()); // Καθαρισμός των κενών διαστημάτων
    if (requestQueue.some(item => isNaN(Number(item)))) {
        alert("Παρακαλώ εισάγετε μια λίστα αριθμών, χωρισμένων με κόμματα!");
        return;
    }
    
    // Μετατροπή των στοιχείων σε αριθμούς
    const numericRequestQueue = requestQueue.map(Number);

    let seekCount = 0; 
    let seekSequence = [headPosition]; 
    let currentPosition = headPosition; 
    let remainingRequests = [...numericRequestQueue]; // Αντιγραφή της αριθμητικής ουράς αιτημάτων
    // Αντιγραφή της ουράς αιτημάτων

    while (remainingRequests.length > 0) {
        // Εύρεση του πλησιέστερου αιτήματος
        let closestRequest = remainingRequests[0];
        let closestDistance = Math.abs(currentPosition - closestRequest);
        
        for (let i = 1; i < remainingRequests.length; i++) {
            const distance = Math.abs(currentPosition - remainingRequests[i]);
            if (distance < closestDistance) {
                closestRequest = remainingRequests[i];
                closestDistance = distance;
            }
        }

        // Ενημέρωση των μετρητών
        seekCount += closestDistance; 
        currentPosition = closestRequest; 
        seekSequence.push(currentPosition); 

        // Αφαίρεση του επιλεγμένου αιτήματος από τη λίστα
        remainingRequests = remainingRequests.filter(req => req !== closestRequest);
    }

    document.getElementById("seek-count").innerText = `Σύνολο κινήσεων: ${seekCount}`;
    document.getElementById("seek-sequence").innerText = `Σειρά εξυπηρέτησης: ${seekSequence.join(" -> ")}`;

    visualizeSeekSequence(seekSequence);
}

/**
 * Οπτικοποιεί τη σειρά εξυπηρέτησης των αιτημάτων δίσκου σε έναν καμβά.
 * 
 * Αυτή η συνάρτηση χρησιμοποιεί το στοιχείο καμβά (canvas) για να σχεδιάσει 
 * τη διαδρομή της κεφαλής του δίσκου καθώς εξυπηρετεί τα αιτήματα 
 * με βάση τη δοθείσα σειρά. Σχεδιάζει τις κινήσεις με γραμμές και βέλη
 * για να απεικονίσει την κατεύθυνση της κεφαλής.
 * 
 * @param {number[]} seekSequence - Μια λίστα αριθμών που αντιπροσωπεύει 
 *                                   τη σειρά των αιτημάτων που εξυπηρετούνται.
 *                                   Κάθε αριθμός αντιστοιχεί σε μια θέση
 *                                   στον δίσκο.
 * @returns {void} Δεν επιστρέφει τιμή.
 */
function visualizeSeekSequence(seekSequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trackHeight = canvas.height - 40; 
    const trackWidth = canvas.width / (199 - 0); 
    const margin = 20; 
    const startY = margin; 

    ctx.lineWidth = 2; 
    ctx.strokeStyle = "green"; 
    ctx.fillStyle = "green"; 
    ctx.font = "12px Arial"; 

    for (let i = 0; i < seekSequence.length - 1; i++) {
        const x1 = seekSequence[i] * trackWidth + margin;
        const y1 = startY + (i * (trackHeight / (seekSequence.length - 1)));
        const x2 = seekSequence[i + 1] * trackWidth + margin;
        const y2 = startY + ((i + 1) * (trackHeight / (seekSequence.length - 1)));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 10; 
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowLength * Math.cos(angle - Math.PI / 6), y2 - arrowLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI / 6), y2 - arrowLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }
}
