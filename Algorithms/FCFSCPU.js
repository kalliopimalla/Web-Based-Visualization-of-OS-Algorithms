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

    // Υπολογισμός μέσου χρόνου αναμονής
    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

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

    // Εμφάνιση της ουράς και του μέσου χρόνου αναμονής
    document.getElementById('stepHistory').innerHTML = `
        <p>Μέσος Χρόνος Αναμονής : ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;

    // Δημιουργία του πίνακα 5 στηλών
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";
    document.getElementById('seek-count').innerHTML = output;

   // Κλήση για τη σχεδίαση του Gantt Chart
   drawPartialGanttChart(processes, burstTime, arrivalTime);

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
}


function drawPartialGanttChart(processes, bt, at) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Βρες τον ελάχιστο χρόνο άφιξης
    const minArrivalTime = Math.min(...at);

    // Υπολογισμός συνολικού χρόνου (άθροισμα όλων των burst times)
    let totalTime = Math.max(...at) + bt.reduce((sum, time) => sum + time, 0);

    // Προσαρμογή πλάτους καμβά
    canvas.width = (totalTime - minArrivalTime) * 40; // Κάθε μονάδα χρόνου = 40 pixels

    // Καθαρισμός καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentTime = minArrivalTime; // Ξεκινάμε από την πρώτη χρονική στιγμή

    for (let i = 0; i < processes.length; i++) {
        const start = Math.max(currentTime, at[i]) - minArrivalTime; // Υπολογισμός με βάση τον ελάχιστο χρόνο άφιξης
        const end = start + bt[i];

        // Γέμισμα με διαφορετικό χρώμα για κάθε διεργασία
        ctx.fillStyle = `hsl(${(i * 60) % 360}, 70%, 70%)`;
        ctx.fillRect(start * 40, 50, (end - start) * 40, 40);

        // Ετικέτες για διεργασίες και χρόνους
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(`P${processes[i]}`, (start * 40) + ((end - start) * 20) - 10, 75); // Κέντρο μπάρας
        ctx.fillText(`${start + minArrivalTime}`, start * 40, 100); // Αρχή
        ctx.fillText(`${end + minArrivalTime}`, end * 40, 100); // Τέλος

        // Ενημέρωση τρέχουσας χρονικής στιγμής
        currentTime = Math.max(currentTime, at[i]) + bt[i];
    }
}








// Ξεκινά η "Step by Step" διαδικασία


let stepIndex = 0;
let stepCurrentTime = 0;
let stepProcesses = [];
let stepBurstTime = [];
let stepArrivalTime = [];
let stepWaitingTime = [];
let stepTurnAroundTime = [];

// Ξεκινά η "Step by Step" διαδικασία
let originalBurstTimes = []; // Αποθήκευση αρχικών burst times
let originalArrivalTimes = []; // Αποθήκευση αρχικών arrival times

function startStepByStep() {
    // Αρχικοποίηση δεδομένων από τα πεδία εισόδου
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);

    // Αποθήκευση των αρχικών δεδομένων για το Gantt Chart
    originalBurstTimes = [...stepBurstTime];
    originalArrivalTimes = [...stepArrivalTime];

    const n = stepBurstTime.length;
    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);
    stepWaitingTime = new Array(n).fill(0);
    stepTurnAroundTime = new Array(n).fill(0);

    if (stepBurstTime.length !== stepArrivalTime.length) {
        alert('Οι χρόνοι εκτέλεσης και άφιξης πρέπει να έχουν το ίδιο μήκος!');
        return;
    }

    stepIndex = 0;
    stepCurrentTime = 0;

    document.getElementById('stepHistory').innerHTML = ''; // Καθαρισμός ιστορικού
    document.getElementById('seek-count').innerHTML = ''; // Καθαρισμός πίνακα

    // Προσθήκη κουτιού έναρξης
    const startBox = document.createElement('div');
    startBox.classList.add('step-box');
    startBox.innerHTML = `
        <div class="step-time">Εκκίνηση διαδικασίας!</div>
        <div>Αριθμός διεργασιών: ${n}</div>
    `;
    document.getElementById('stepHistory').appendChild(startBox);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο βήμα';
    nextButton.id = 'nextStepButton';
    nextButton.onclick = stepByStepExecution;
    document.getElementById('stepHistory').appendChild(nextButton);

    // Εμφάνιση κουμπιού επαναφοράς
    document.getElementById("resetButton").style.display = "inline-block";
}


function stepByStepExecution() {
    // Έλεγχος αν υπάρχουν υπόλοιπα burst times για εκτέλεση
    if (stepBurstTime.some((bt) => bt > 0)) {
        // Εύρεση της διεργασίας που εκτελείται στην τρέχουσα χρονική στιγμή
        let executingProcessIndex = -1;
        for (let i = 0; i < stepProcesses.length; i++) {
            if (
                stepArrivalTime[i] <= stepCurrentTime &&
                stepBurstTime[i] > 0
            ) {
                executingProcessIndex = i;
                break;
            }
        }

        const stepHistoryContainer = document.getElementById('stepHistory');

        // Αν υπάρχει διεργασία που εκτελείται
        if (executingProcessIndex !== -1) {
            // Δημιουργία κουτιού για την τρέχουσα χρονική στιγμή
            const activeProcess = `<span class="queue-process active">P${stepProcesses[executingProcessIndex]}</span>`;
            const waitingQueue = stepProcesses
                .filter((_, i) => i !== executingProcessIndex && stepBurstTime[i] > 0)
                .map((p) => `<span class="queue-process">P${p}</span>`)
                .join(' -> ') || 'Καμία';

            const stepBox = document.createElement('div');
            stepBox.classList.add('step-box');
            stepBox.innerHTML = `
                <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
                <div>Εκτελείται: ${activeProcess}</div>
                <div>Αναμονή: ${waitingQueue}</div>
            `;
            stepHistoryContainer.appendChild(stepBox);

            // Μείωση του burst time της διεργασίας που εκτελείται
            stepBurstTime[executingProcessIndex]--;

            // Υπολογισμός χρόνου αναμονής για όλες τις υπόλοιπες διεργασίες
            for (let i = 0; i < stepProcesses.length; i++) {
                if (i !== executingProcessIndex && stepBurstTime[i] > 0 && stepArrivalTime[i] <= stepCurrentTime) {
                    stepWaitingTime[i]++;
                }
            }
        }

        // Αύξηση της χρονικής στιγμής
        stepCurrentTime++;

    } else {
        // Αν ολοκληρωθούν όλες οι διεργασίες
        const stepHistoryContainer = document.getElementById('stepHistory');

        // Υπολογισμός μέσου χρόνου αναμονής
        const totalWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0);
        const averageWaitingTime = totalWaitingTime / stepProcesses.length;

        // Προσθήκη μέσου χρόνου αναμονής στο πάνω μέρος της ουράς
        const avgWaitingContainer = document.getElementById('avg-waiting-container');
        if (!avgWaitingContainer) {
            const avgBox = document.createElement('div');
            avgBox.id = 'avg-waiting-container';
            avgBox.innerHTML = `
                <p><strong>Μέσος Χρόνος Αναμονής:</strong> ${averageWaitingTime.toFixed(2)}</p>
            `;
            stepHistoryContainer.insertAdjacentElement('afterbegin', avgBox);
        }

        // Δημιουργία του 5-στήλου πίνακα
        createFiveColumnTable(stepProcesses, originalBurstTimes, originalArrivalTimes, stepWaitingTime);

        // Δημιουργία Gantt Chart με τα αρχικά δεδομένα
        drawPartialGanttChart(stepProcesses, originalBurstTimes, originalArrivalTimes);

        // Προσθήκη κουτιού τέλους διαδικασίας
        const endBox = document.createElement('div');
        endBox.classList.add('step-box');
        endBox.innerHTML = `
            <div class="step-time">Τέλος Αλγορίθμου!</div>
            <div>Όλες οι διεργασίες έχουν εκτελεστεί επιτυχώς.</div>
        `;
        stepHistoryContainer.appendChild(endBox);

        // Αφαίρεση κουμπιού "Επόμενο Βήμα"
        const nextStepButton = document.getElementById('nextStepButton');
        if (nextStepButton) {
            nextStepButton.remove();
        }
    }
}

// Συνάρτηση δημιουργίας 5-στήλου πίνακα
function createFiveColumnTable(processes, bt, at, wt) {
    const tat = processes.map((_, i) => bt[i] + wt[i]); // Υπολογισμός Turnaround Time

    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";

    for (let i = 0; i < processes.length; i++) {
        output += `<tr>
            <td>${processes[i]}</td>
            <td>${bt[i]}</td>
            <td>${at[i]}</td>
            <td>${wt[i]}</td>
            <td>${tat[i]}</td>
        </tr>`;
    }

    output += "</table>";

    // Εμφάνιση του πίνακα στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
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




//Δημιουργεί τον αρχικό πίνακα 
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
function generateRandomSequence(length = 6, max = 50) {
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
    
      // Καθαρισμός του καμβά
      const canvas = document.getElementById('seekCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  

    // Απόκρυψη κουμπιών που δεν χρειάζονται
    document.getElementById('runButton').style.display = 'none';
    document.getElementById('stepByStepBtn').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none';
}

// script.js
document.addEventListener("DOMContentLoaded", () => {
    const openSidebar = document.getElementById("open-sidebar");
    const closeSidebar = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");
  
    openSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      sidebar.classList.add("open"); // Προσθέτουμε την κλάση για να εμφανιστεί το sidebar
    });
  
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open"); // Αφαιρούμε την κλάση για να κρυφτεί το sidebar
    });
  });
  
  document.querySelectorAll('.dropdown-submenu > div').forEach((menuTitle) => {
    menuTitle.addEventListener('click', () => {
      const parentLi = menuTitle.parentElement;
      parentLi.classList.toggle('open');
    });
  });
  
  document.querySelectorAll('.submenu-content li a').forEach((link) => {
    link.addEventListener('click', (e) => {
      document
        .querySelectorAll('.submenu-content li a')
        .forEach((el) => el.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  