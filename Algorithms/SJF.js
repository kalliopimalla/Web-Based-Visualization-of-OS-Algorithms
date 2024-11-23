function runSJFCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const n = burstTime.length;
    const processes = Array.from({ length: n }, (_, i) => i + 1);

    const wt = new Array(n).fill(0); // Χρόνος αναμονής
    const tat = new Array(n).fill(0); // Χρόνος επιστροφής
    const completionTime = new Array(n).fill(0); // Χρόνος ολοκλήρωσης

    let currentTime = 0; // Χρονική στιγμή
    let completed = 0; // Μετρητής ολοκληρωμένων διεργασιών
    const isCompleted = new Array(n).fill(false); // Κατάσταση ολοκλήρωσης

    let queueOutput = ''; // Αναπαράσταση ουράς

    // Εκτέλεση SJF
    while (completed < n) {
        // Βρες τις διαθέσιμες διεργασίες
        const availableProcesses = [];
        for (let i = 0; i < n; i++) {
            if (!isCompleted[i] && arrivalTime[i] <= currentTime) {
                availableProcesses.push(i);
            }
        }

        // Αν καμία διεργασία δεν είναι διαθέσιμη
        if (availableProcesses.length === 0) {
            queueOutput += `
                <div class="step-box">
                    <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
                    <div>Καμία διεργασία διαθέσιμη. Αναμονή...</div>
                </div>
            `;
            currentTime++;
            continue;
        }

        // Βρες τη διεργασία με τον μικρότερο χρόνο εκτέλεσης
        const shortestJobIndex = availableProcesses.reduce((shortest, i) =>
            burstTime[i] < burstTime[shortest] ? i : shortest, availableProcesses[0]);

        // Εκτέλεση της διεργασίας
        const startTime = currentTime;
        currentTime += burstTime[shortestJobIndex];
        completionTime[shortestJobIndex] = currentTime;
        isCompleted[shortestJobIndex] = true;
        completed++;

        // Δημιουργία της ουράς εκτέλεσης
        const activeProcess = `<span class="queue-process active">P${processes[shortestJobIndex]}</span>`;
        const waitingQueue = availableProcesses
            .filter((i) => i !== shortestJobIndex)
            .map((i) => `<span class="queue-process">P${processes[i]}</span>`)
            .join(' -> ') || 'Καμία';

        queueOutput += `
            <div class="step-box">
                <div class="step-time">Χρονική στιγμή: ${startTime}</div>
                <div>Εκτελείται: ${activeProcess}</div>
                <div>Αναμονή: ${waitingQueue}</div>
            </div>
        `;
    }

    // Υπολογισμός χρόνων αναμονής και επιστροφής
    for (let i = 0; i < n; i++) {
        tat[i] = completionTime[i] - arrivalTime[i];
        wt[i] = tat[i] - burstTime[i];
    }

    // Υπολογισμός μέσου χρόνου αναμονής
    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

    // Εμφάνιση αποτελεσμάτων
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    document.getElementById('seek-count').innerHTML = output;

    // Εμφάνιση μέσου χρόνου αναμονής
    document.getElementById('stepHistory').innerHTML = `
        <p>Μέσος Χρόνος Αναμονής (AWT): ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
}




let stepIndex = 0;
let stepCurrentTime = 0;
let stepProcesses = [];
let stepBurstTime = [];
let stepArrivalTime = [];
let stepWaitingTime = [];
let stepTurnAroundTime = [];

// Ξεκινά η "Step by Step" διαδικασία
function startStepByStep() {
    // Αρχικοποίηση δεδομένων από τα πεδία εισόδου
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);
    const n = stepBurstTime.length;
    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);
    stepWaitingTime = new Array(n);
    stepTurnAroundTime = new Array(n);

    // Έλεγχος για είσοδο με σωστό μήκος
    if (stepBurstTime.length !== stepArrivalTime.length) {
        alert('Οι χρόνοι εκτέλεσης και άφιξης πρέπει να έχουν το ίδιο μήκος!');
        return;
    }

    // Υπολογισμός χρόνων αναμονής και επιστροφής
    findWaitingTime(stepProcesses, n, stepBurstTime, stepWaitingTime, stepArrivalTime);
    findTurnAroundTime(stepProcesses, n, stepBurstTime, stepWaitingTime, stepTurnAroundTime);

    // Επαναφορά για τη διαδικασία
    stepIndex = 0;
    stepCurrentTime = 0;
    document.getElementById('stepHistory').innerHTML = ''; // Καθαρισμός ιστορικού

    // Δημιουργία κουμπιού "Επόμενο"
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο';
    nextButton.onclick = stepByStepExecution;
    document.getElementById('stepHistory').appendChild(nextButton);

    // Εμφάνιση του πρώτου βήματος
    stepByStepExecution();
}

function stepByStepExecution() {
    if (stepIndex < stepProcesses.length) {
        // Υπολογισμός χρόνου εκκίνησης και λήξης για την τρέχουσα διεργασία
        const start = Math.max(stepCurrentTime, stepArrivalTime[stepIndex]);
        const end = start + stepBurstTime[stepIndex];

        // Δημιουργία του ενεργού κουτιού διεργασίας
        const activeProcess = `<span class="queue-process active">P${stepProcesses[stepIndex]}</span>`;
        const waitingQueue = stepProcesses
            .slice(stepIndex + 1)
            .map((p) => `<span class="queue-process">P${p}</span>`)
            .join(' -> ') || 'Καμία';

        // Δημιουργία κουτιού για το βήμα
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${start}</div>
            <div>Εκτελείται: ${activeProcess}</div>
            <div>Αναμονή: ${waitingQueue}</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);

        
        // Ενημέρωση χρόνου και δείκτη
        stepCurrentTime = end; // Ενημερώνουμε σωστά το stepCurrentTime
        stepIndex++; // Αυξάνουμε το index για να προχωρήσουμε στην επόμενη διεργασία

        // Όταν ολοκληρωθούν όλα τα βήματα
        if (stepIndex === stepProcesses.length) {
            alert('Η εκτέλεση ολοκληρώθηκε!');
            document.getElementById("resetButton").style.display = "inline-block";
        }
    } else {
        alert('Η εκτέλεση έχει ήδη ολοκληρωθεί!');
    }
}





function createThreeColumnTable() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    // Διαχωρισμός τιμών και μετατροπή σε αριθμητικούς πίνακες
    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const n = burstTime.length;

    // Δημιουργία πίνακα διεργασιών
    const processes = Array.from({ length: n }, (_, i) => i + 1);

    // Δημιουργία HTML για τον πίνακα
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος εκτέλεσης</th><th>Χρόνος άφιξης</th></tr>";
    
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td></tr>`;
    }
    output += "</table>";

    // Εμφάνιση του πίνακα στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById("runButton").style.display = "inline-block";
    document.getElementById("stepByStepBtn").style.display = "inline-block";
}

// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας
function generateRandomSequence(length = 6, max = 100) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    return sequence;
}

// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton1").addEventListener("click", function() {
    const randomSequence = generateRandomSequence(); // Δημιουργία τυχαίας ακολουθίας
    document.getElementById("burst-time").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου
    //document.getElementById("arrival-time").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου

});

// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    const randomSequence = generateRandomSequence(); // Δημιουργία τυχαίας ακολουθίας
   // document.getElementById("burst-time").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου
    document.getElementById("arrival-time").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου

});

function resetSJF() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';

    // Καθαρισμός του πίνακα αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = '';

    // Καθαρισμός του ιστορικού βημάτων
    document.getElementById('stepHistory').innerHTML = '';

  

    // Απόκρυψη κουμπιών που δεν χρειάζονται
    document.getElementById('runButton').style.display = 'none';
    document.getElementById('stepByStepBtn').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none';
}
