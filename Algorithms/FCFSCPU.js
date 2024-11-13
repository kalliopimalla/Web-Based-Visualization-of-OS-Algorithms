// Function to find the waiting time for all processes
function findWaitingTime(processes, n, bt, wt, at) {
    wt[0] = 0;

    for (let i = 1; i < n; i++) {
        wt[i] = bt[i - 1] + wt[i - 1] + at[i - 1] - at[i];
        if (wt[i] < 0) {
            wt[i] = 0;
        }
    }
}

function findTurnAroundTime(processes, n, bt, wt, tat) {
    for (let i = 0; i < n; i++) {
        tat[i] = bt[i] + wt[i];
    }
}

let currentTime = 0;
let currentProcessIndex = 0;
let processes = [];
let burstTime = [];
let arrivalTime = [];
let wt = [];
let tat = [];

// Main function to execute FCFS
function runFCFSCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    burstTime = btInput.split(',').map(Number);
    arrivalTime = atInput.split(',').map(Number);
    const n = burstTime.length;
    processes = Array.from({ length: n }, (_, i) => i + 1);
    wt = new Array(n);
    tat = new Array(n);

    findWaitingTime(processes, n, burstTime, wt, arrivalTime);
    findTurnAroundTime(processes, n, burstTime, wt, tat);

    const totalWt = wt.reduce((a, b) => a + b, 0);
    const averageWt = totalWt / n;

    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος εκτέλεσης</th><th>Χρόνος άφιξης</th><th>Χρόνος αναμονής</th><th>Χρόνος επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += `</table><br>Μέσος χρόνος αναμονής = ${averageWt.toFixed(2)}`;
    document.getElementById('seek-count').innerHTML = output;

    drawGanttChart(processes, burstTime, arrivalTime, wt);

    // Εμφάνιση του κουμπιού Step by Step μετά την Εκτέλεση
    document.getElementById('stepByStepBtn').style.display = 'inline-block';
}

// Function to draw Gantt Chart
function drawGanttChart(processes, bt, at, wt) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentTime = 0;
    for (let i = 0; i < processes.length; i++) {
        const start = Math.max(currentTime, at[i]);
        const end = start + bt[i];

        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(start * 20, 50, (end - start) * 20, 40);

        ctx.fillStyle = '#000';
        ctx.fillText(`P${processes[i]}`, (start + end) / 2 * 20 - 10, 75);

        currentTime = end;
    }
}

// Step-by-Step Execution with Initialization
function startStepByStep() {
    // Επαναφορά των μεταβλητών για εκτέλεση βήμα προς βήμα
    currentTime = 0;
    currentProcessIndex = 0;
    document.getElementById('stepHistory').innerHTML = ''; // Καθαρισμός ιστορικού βημάτων

    // Ξεκινά η εκτέλεση βήμα προς βήμα
    nextStep();
}

function nextStep() {
    if (currentProcessIndex < processes.length) {
        const start = Math.max(currentTime, arrivalTime[currentProcessIndex]);
        const end = start + burstTime[currentProcessIndex];

        // Δημιουργία HTML για την απεικόνιση του βήματος
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');

        // Τρέχουσα ενεργή διεργασία
        const activeProcess = `<span class="queue-process active">P${processes[currentProcessIndex]}</span>`;
        
        // Οι υπόλοιπες διεργασίες στην ουρά
        const waitingQueue = processes.slice(currentProcessIndex + 1)
            .map(p => `<span class="queue-process">P${p}</span>`).join(' ');

            stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή ${currentTime}</div>
            <div style="padding-bottom: 10px;">Εκτελείται: ${activeProcess}</div>
            <div class="queue-state" style="margin-top: 10px;">Αναμονή: ${waitingQueue}</div>
        `;
        
        
        document.getElementById('stepHistory').appendChild(stepBox);

        currentTime = end;
        currentProcessIndex++;

        drawGanttChart(processes.slice(0, currentProcessIndex), burstTime, arrivalTime, wt);

        // Επανάκληση της nextStep για το επόμενο βήμα
        setTimeout(nextStep, 1000); // Περιμένει 1 δευτερόλεπτο πριν προχωρήσει
    }
}

