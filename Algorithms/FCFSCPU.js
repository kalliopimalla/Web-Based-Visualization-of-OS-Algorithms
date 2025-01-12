
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

const sortedData = sortByArrival(processes, burstTime, arrivalTime);
processes = sortedData.sortedProcesses;
burstTime = sortedData.sortedBurstTime;
arrivalTime = sortedData.sortedArrivalTime;

    // Υπολογισμός χρόνων
    findWaitingTime(processes, n, burstTime, wt, arrivalTime);
    findTurnAroundTime(processes, n, burstTime, wt, tat);

    // Υπολογισμός μέσου χρόνου αναμονής
    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

    // Βρες τον ελάχιστο χρόνο άφιξης
    let currentTime = Math.min(...arrivalTime);

    // Δημιουργία της ουράς εκτέλεσης
    let queueOutput = '';

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

    // Προσθήκη του τελικού κουτιού για τη χρονική στιγμή ολοκλήρωσης
    queueOutput += `
        <div class="step-box">
            <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
            <div>Όλες οι διεργασίες έχουν ολοκληρωθεί!</div>
            <div>Αναμονή: Καμία</div>
        </div>
    `;

    // Εμφάνιση της ουράς και του μέσου χρόνου αναμονής
    document.getElementById('stepHistory').innerHTML = `
        <p><strong>Μέσος Χρόνος Αναμονής:</strong> ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;

    // Δημιουργία του πίνακα 5 στηλών
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>P${processes[i]}</td>
<td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";
    document.getElementById('seek-count').innerHTML = output;

    // Κλήση για τη σχεδίαση του Gantt Chart
    drawPartialGanttChart(processes, burstTime, arrivalTime);

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
    document.getElementById('runButton').style.display = 'none';
}



function drawPartialGanttChart(processes, bt, at) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    const minArrivalTime = Math.min(...at);
    let currentTime = minArrivalTime;

    const canvasBaseWidth = 800;
    const scaleFactor = Math.max(canvasBaseWidth / bt.reduce((sum, time) => sum + time, 0), 5);
    const minBarWidth = 50; // Ελάχιστο πλάτος για κάθε μπάρα

    // Υπολογισμός προσαρμοσμένων μηκών μπαρών
    const adjustedBarLengths = bt.map((time) => Math.max(time * scaleFactor, minBarWidth));

    // Προσαρμογή του πλάτους του canvas
    canvas.width = adjustedBarLengths.reduce((sum, length) => sum + length, 0) + 150;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colorStep = 360 / processes.length;



    let currentX = 0;

    for (let i = 0; i < processes.length; i++) {
        const startTime = Math.max(currentTime, at[i]);

        const label = `P${processes[i]}`;
        const barWidth = adjustedBarLengths[i];

        // Διαφορετικό χρώμα για κάθε διεργασία
        function getRandomColor() {
            const hue = Math.floor(Math.random() * 360); // Απόχρωση
            const saturation = Math.floor(Math.random() * 40) + 60; // Κορεσμός 60-100%
            const lightness = Math.floor(Math.random() * 40) + 40; // Φωτεινότητα 40-80%
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
        
        ctx.fillStyle = getRandomColor();
        
        ctx.strokeStyle = '#000'; // Μαύρο περίγραμμα
        ctx.lineWidth = 2;
        ctx.strokeRect(currentX, 50, barWidth, 40);

        ctx.fillRect(currentX, 50, barWidth, 40);
    
        

        // Ζωγραφική της ετικέτας διεργασίας
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(label, currentX + barWidth / 2 - ctx.measureText(label).width / 2, 75);

        // Ζωγραφική χρόνων έναρξης και λήξης
        ctx.fillText(startTime, currentX, 45);
        currentX += barWidth;
        currentTime = startTime + bt[i];
        ctx.fillText(currentTime, currentX, 45);
    }
}






// Συνάρτηση για ταξινόμηση με βάση το χρόνο άφιξης
function sortByArrival(processes, bt, at) {
    const combined = processes.map((_, i) => ({
        process: processes[i],
        burstTime: bt[i],
        arrivalTime: at[i],
    }));

    combined.sort((a, b) => a.arrivalTime - b.arrivalTime);

    const sortedProcesses = combined.map((item) => item.process);
    const sortedBurstTime = combined.map((item) => item.burstTime);
    const sortedArrivalTime = combined.map((item) => item.arrivalTime);

    return { sortedProcesses, sortedBurstTime, sortedArrivalTime };
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
    const n = stepBurstTime.length;
    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);

    // Ταξινόμηση δεδομένων
    const sortedStepData = sortByArrival(stepProcesses, stepBurstTime, stepArrivalTime);
    stepProcesses = sortedStepData.sortedProcesses;
    stepBurstTime = sortedStepData.sortedBurstTime;
    stepArrivalTime = sortedStepData.sortedArrivalTime;

    // Αποθήκευση των αρχικών δεδομένων
    originalBurstTimes = [...stepBurstTime];
    originalArrivalTimes = [...stepArrivalTime];

    stepWaitingTime = new Array(n).fill(0);
    stepTurnAroundTime = new Array(n).fill(0);
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
    document.getElementById('stepByStepBtn').style.display = 'none';
}



function stepByStepExecution() {
    // Έλεγχος αν υπάρχουν υπόλοιπα burst times για εκτέλεση ή αν υπάρχει διεργασία σε αναμονή
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
    } else if (stepBurstTime.every((bt) => bt === 0)) {
        // Αν όλες οι διεργασίες έχουν εκτελεστεί
        const stepHistoryContainer = document.getElementById('stepHistory');

        // Δημιουργία κουτιού για την τελευταία χρονική στιγμή
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
            <div>Αναμονή: Καμία</div>
        `;
        stepHistoryContainer.appendChild(stepBox);

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
    const tat = processes.map((_, i) => bt[i] + wt[i]);

    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";

    for (let i = 0; i < processes.length; i++) {
        output += `<tr>
           <td>P${processes[i]}</td>

            <td>${bt[i]}</td>
            <td>${at[i]}</td>
            <td>${wt[i]}</td>
            <td>${tat[i]}</td>
        </tr>`;
    }

    output += "</table>";
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
    const btInput = document.getElementById('burst-time');
    const atInput = document.getElementById('arrival-time');
    const errorContainer = document.getElementById('error-container');

    const btValue = btInput.value.trim();
    const atValue = atInput.value.trim();

    // Κανονική έκφραση για έλεγχο αριθμών χωρισμένων με κόμμα χωρίς κενά
    const validFormat = /^(\d+)(,\d+)*$/;

    // Έλεγχος αν τα inputs είναι κενά
    if (!btValue || !atValue) {
        errorContainer.textContent = 'Παρακαλώ συμπληρώστε τόσο τους χρόνους εκτέλεσης όσο και τους χρόνους άφιξης!';
        errorContainer.style.display = 'block';
        btInput.classList.add('input-error');
        atInput.classList.add('input-error');
        return;
    }

    // Έλεγχος αν τα inputs περιέχουν μόνο αριθμούς χωρισμένους με κόμματα
    if (!validFormat.test(btValue) || !validFormat.test(atValue)) {
        errorContainer.textContent = 'Τα πεδία πρέπει να περιέχουν μόνο αριθμούς χωρισμένους με κόμματα, χωρίς κενά!';
        errorContainer.style.display = 'block';
        btInput.classList.add('input-error');
        atInput.classList.add('input-error');
        return;
    }

    // Διαχωρισμός τιμών και μετατροπή σε αριθμητικούς πίνακες
    const burstTime = btValue.split(',').map(Number);
    const arrivalTime = atValue.split(',').map(Number);

    // Έλεγχος αν το μήκος των ακολουθιών υπερβαίνει το όριο των 100
    if (burstTime.length > 100 || arrivalTime.length > 100) {
        errorContainer.textContent = 'Το μήκος των ακολουθιών δεν πρέπει να υπερβαίνει τα 100!';
        errorContainer.style.display = 'block';
        btInput.classList.add('input-error');
        atInput.classList.add('input-error');
        return;
    }

    // Έλεγχος αν τα μήκη των πινάκων ταιριάζουν
    if (burstTime.length !== arrivalTime.length) {
        errorContainer.textContent = 'Ο αριθμός των χρόνων εκτέλεσης και άφιξης πρέπει να είναι ίδιος!';
        errorContainer.style.display = 'block';
        btInput.classList.add('input-error');
        atInput.classList.add('input-error');
        return;
    }

    // Απόκρυψη του μηνύματος σφάλματος και αφαίρεση της κλάσης σφάλματος
    errorContainer.style.display = 'none';
    btInput.classList.remove('input-error');
    atInput.classList.remove('input-error');

    // Δημιουργία πίνακα διεργασιών
    const processes = Array.from({ length: burstTime.length }, (_, i) => i + 1);

    // Δημιουργία HTML για τον πίνακα
    let output = "<table border='1' style='border-collapse: collapse; width: 100%; text-align: center;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th></tr>";

    for (let i = 0; i < processes.length; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td></tr>`;
    }
    output += "</table>";

    // Εμφάνιση του πίνακα στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById("runButton").style.display = "inline-block";
    document.getElementById("resetButton").style.display = "inline-block";
    // Εμφάνιση του Gantt Chart
    document.getElementById('gantt-wrapper').style.display = "block";
    document.getElementById("stepByStepBtn").style.display = "inline-block";
}



// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας
function generateRandomSequence(length, max = 100, startFromZero = false) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    if (startFromZero && sequence.length > 0) {
        sequence[0] = 0; // Το πρώτο στοιχείο γίνεται 0
    }
    return sequence;
}

// Συνάρτηση δημιουργίας τυχαίων ακολουθιών για burst και arrival time
document.getElementById("generateSequenceButton").addEventListener("click", function () {
    const sequenceLengthInput = document.getElementById("sequenceLength").value;
    const sequenceLength = parseInt(sequenceLengthInput);

    // Δημιουργία τυχαίων ακολουθιών
    const burstTimeSequence = generateRandomSequence(sequenceLength); // Για burst time
    const arrivalTimeSequence = generateRandomSequence(sequenceLength, 100, true); // Για arrival time με πρώτο στοιχείο 0

    // Ενημέρωση των πεδίων εισόδου
    document.getElementById("burst-time").value = burstTimeSequence.join(",");
    document.getElementById("arrival-time").value = arrivalTimeSequence.join(",");
});






function resetFCFS() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';

    // Καθαρισμός του πίνακα αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = '';
  // Απόκρυψη κουμπιών και Gantt Chart
  document.getElementById('gantt-wrapper').style.display = "none";
    // Καθαρισμός του ιστορικού βημάτων
    document.getElementById('stepHistory').innerHTML = '';
    
      // Καθαρισμός του καμβά
      const canvas = document.getElementById('seekCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      document.getElementById("sequenceLength").value = ""; // Μηδενισμός του sequence length
  
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
  