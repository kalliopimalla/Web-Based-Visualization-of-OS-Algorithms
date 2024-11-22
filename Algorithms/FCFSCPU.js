// Εκτέλεση FCFS Scheduling
function runFCFSCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    burstTime = btInput.split(',').map(Number);
    arrivalTime = atInput.split(',').map(Number);
    const n = burstTime.length;
    processes = Array.from({ length: n }, (_, i) => i + 1);
    wt = new Array(n);
    tat = new Array(n);

    // Υπολογισμός χρόνων
    findWaitingTime(processes, n, burstTime, wt, arrivalTime);
    findTurnAroundTime(processes, n, burstTime, wt, tat);

    // Δημιουργία της ουράς εκτέλεσης
    let queueOutput = '';
    let currentTime = 0;

    for (let i = 0; i < n; i++) {
        const start = Math.max(currentTime, arrivalTime[i]);
        const end = start + burstTime[i];

        queueOutput += `
            <div class="step-box">
                <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
                <div>Εκτελείται: <span class="queue-process active">P${processes[i]}</span></div>
                <div>Αναμονή: ${
                    processes.slice(i + 1).map((p) => `<span class="queue-process">P${p}</span>`).join(' -> ') || 'Καμία'
                }</div>
            </div>
        `;

        currentTime = end;
    }

    document.getElementById('stepHistory').innerHTML = queueOutput;

    // Δημιουργία του πίνακα 5 στηλών
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";
    document.getElementById('seek-count').innerHTML = output;

    // Δημιουργία του Gantt Chart
    drawGanttChart(processes, burstTime, arrivalTime, wt);
       // Εμφάνιση του κουμπιού "Επαναφορά"
       document.getElementById("resetButton").style.display = "inline-block";
}

// Step-by-Step FCFS
let stepIndex = 0;
let stepCurrentTime = 0;

function startStepByStep() {
    // Επαναφορά για step-by-step εκτέλεση
    stepIndex = 0;
    stepCurrentTime = 0;
    document.getElementById('stepHistory').innerHTML = ''; // Καθαρισμός ιστορικού

    // Δημιουργία κουμπιού "Επόμενο"
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο';
    nextButton.onclick = stepByStepExecution;
    document.getElementById('stepHistory').appendChild(nextButton);

    // Εμφάνιση πρώτου βήματος
    stepByStepExecution();
}

function stepByStepExecution() {
    if (stepIndex < processes.length) {
        const activeProcess = `<span class="queue-process active">P${processes[stepIndex]}</span>`;
        const waitingQueue = processes
            .slice(stepIndex + 1)
            .map((p) => `<span class="queue-process">P${p}</span>`)
            .join(' -> ');

        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Εκτελείται: ${activeProcess}</div>
            <div>Αναμονή: ${waitingQueue}</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);

        // Ενημέρωση Gantt Chart
        const start = Math.max(stepCurrentTime, arrivalTime[stepIndex]);
        const end = start + burstTime[stepIndex];
        drawGanttChart(processes.slice(0, stepIndex + 1), burstTime, arrivalTime, wt);

        // Προχωράμε στο επόμενο βήμα
        stepCurrentTime = end;
        stepIndex++;

        if (stepIndex === processes.length) {
            // Όταν ολοκληρωθούν όλα τα βήματα, εμφανίζεται ο πλήρης πίνακας και το Gantt Chart
            runFCFSCPU();
               // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
        }
    }
}

// Βοηθητικές συναρτήσεις για FCFS
function findWaitingTime(processes, n, bt, wt, at) {
    wt[0] = 0;

    for (let i = 1; i < n; i++) {
        wt[i] = bt[i - 1] + wt[i - 1] + at[i - 1] - at[i];
        if (wt[i] < 0) wt[i] = 0;
    }
}

function findTurnAroundTime(processes, n, bt, wt, tat) {
    for (let i = 0; i < n; i++) {
        tat[i] = bt[i] + wt[i];
    }
}

// Gantt Chart
function drawGanttChart(processes, bt, at, wt) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentTime = 0;
    for (let i = 0; i < processes.length; i++) {
        const start = Math.max(currentTime, at[i]);
        const end = start + bt[i];
        ctx.fillStyle = `hsl(${(i * 60) % 360}, 70%, 70%)`;
        ctx.fillRect(start * 20, 50, (end - start) * 20, 40);

        ctx.fillStyle = '#000';
        ctx.fillText(`P${processes[i]}`, (start + end) / 2 * 20 - 10, 75);

        currentTime = end;
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

function resetFCFS() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';

    // Καθαρισμός του πίνακα αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = '';

    // Καθαρισμός του ιστορικού βημάτων
    document.getElementById('stepHistory').innerHTML = '';

    // Καθαρισμός του Gantt Chart
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Απόκρυψη κουμπιών που δεν χρειάζονται
    document.getElementById('runButton').style.display = 'none';
    document.getElementById('stepByStepBtn').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none';
}
