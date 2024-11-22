// Εκτέλεση SJF Scheduling
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

        // Δημιουργία αναπαράστασης ουράς πριν την επιλογή
        const waitingQueue = availableProcesses
            .map((i) => `<span class="queue-process">P${processes[i]}</span>`)
            .join(' -> ') || 'Καμία';

        queueOutput += `
            <div class="step-box">
                <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
                <div>Ουρά αναμονής: ${waitingQueue}</div>
            </div>
        `;

        // Βρες τη διεργασία με τον μικρότερο χρόνο εκτέλεσης
        if (availableProcesses.length > 0) {
            const shortestJobIndex = availableProcesses.reduce((shortest, i) => 
                burstTime[i] < burstTime[shortest] ? i : shortest, availableProcesses[0]);

            // Εκτέλεση της διεργασίας
            const startTime = currentTime;
            currentTime += burstTime[shortestJobIndex];
            completionTime[shortestJobIndex] = currentTime;
            isCompleted[shortestJobIndex] = true;
            completed++;

            // Ενημέρωση ουράς εκτέλεσης
            queueOutput += `
                <div class="step-box">
                    <div class="step-time">Χρονική στιγμή: ${startTime}</div>
                    <div>Εκτελείται: <span class="queue-process active">P${processes[shortestJobIndex]}</span></div>
                </div>
            `;
        } else {
            // Αν δεν υπάρχουν διαθέσιμες διεργασίες, προχωράμε τον χρόνο
            currentTime++;
        }
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
let stepCompleted = 0;
let stepIsCompleted = [];
let stepQueueOutput = '';

// Ξεκινά η "Step by Step" διαδικασία
function startStepByStep() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);
    const n = stepBurstTime.length;
    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);
    stepWaitingTime = new Array(n).fill(0);
    stepTurnAroundTime = new Array(n).fill(0);
    stepIsCompleted = new Array(n).fill(false);
    stepCurrentTime = 0;
    stepCompleted = 0;
    stepQueueOutput = '';

    // Καθαρισμός προηγούμενης ιστορίας και αφαίρεση υπάρχοντος κουμπιού
    document.getElementById('stepHistory').innerHTML = '';
    const existingButton = document.getElementById('nextStepButton');
    if (existingButton) {
        existingButton.remove();
    }

    // Δημιουργία του κουμπιού "Επόμενο"
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο';
    nextButton.id = 'nextStepButton';
    nextButton.onclick = stepByStepExecution;
    document.getElementById('stepHistory').appendChild(nextButton);

    // Εμφάνιση του πρώτου βήματος
    stepByStepExecution();
}

function stepByStepExecution() {
    const n = stepProcesses.length;

    if (stepCompleted < n) {
        // Βρες τις διαθέσιμες διεργασίες
        const availableProcesses = [];
        for (let i = 0; i < n; i++) {
            if (!stepIsCompleted[i] && stepArrivalTime[i] <= stepCurrentTime) {
                availableProcesses.push(i);
            }
        }

        // Δημιουργία αναπαράστασης ουράς πριν την επιλογή
        const waitingQueue = availableProcesses
            .map((i) => `<span class="queue-process">P${stepProcesses[i]}</span>`)
            .join(' -> ') || 'Καμία';

        stepQueueOutput += `
            <div class="step-box">
                <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
                <div>Ουρά αναμονής: ${waitingQueue}</div>
            </div>
        `;

        // Επιλογή της διεργασίας με το μικρότερο χρόνο εκτέλεσης
        if (availableProcesses.length > 0) {
            const shortestJobIndex = availableProcesses.reduce((shortest, i) =>
                stepBurstTime[i] < stepBurstTime[shortest] ? i : shortest, availableProcesses[0]);

            // Εκτέλεση της διεργασίας
            const startTime = stepCurrentTime;
            stepCurrentTime += stepBurstTime[shortestJobIndex];
            stepTurnAroundTime[shortestJobIndex] = stepCurrentTime - stepArrivalTime[shortestJobIndex];
            stepWaitingTime[shortestJobIndex] = stepTurnAroundTime[shortestJobIndex] - stepBurstTime[shortestJobIndex];
            stepIsCompleted[shortestJobIndex] = true;
            stepCompleted++;

            // Ενημέρωση εκτελούμενης διεργασίας
            stepQueueOutput += `
                <div class="step-box">
                    <div class="step-time">Χρονική στιγμή: ${startTime}</div>
                    <div>Εκτελείται: <span class="queue-process active">P${stepProcesses[shortestJobIndex]}</span></div>
                </div>
            `;
        } else {
            // Αν δεν υπάρχουν διαθέσιμες διεργασίες, προχωράμε τον χρόνο
            stepCurrentTime++;
        }

        document.getElementById('stepHistory').innerHTML = stepQueueOutput;

        // Όταν ολοκληρωθούν όλες οι διεργασίες
        if (stepCompleted === n) {
            alert('Η εκτέλεση ολοκληρώθηκε!');
            document.getElementById("resetButton").style.display = "inline-block";

            // Υπολογισμός μέσου χρόνου αναμονής
            const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
            stepQueueOutput += `<p>Μέσος Χρόνος Αναμονής (AWT): ${averageWaitingTime.toFixed(2)}</p>`;
            document.getElementById('stepHistory').innerHTML = stepQueueOutput;

            // Απόκρυψη του κουμπιού "Επόμενο"
            const nextButton = document.getElementById('nextStepButton');
            if (nextButton) {
                nextButton.style.display = 'none';
            }
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
