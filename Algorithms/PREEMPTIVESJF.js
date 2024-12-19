function runPreSJFCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const n = burstTime.length;
    const processes = Array.from({ length: n }, (_, i) => i + 1);

    const remainingBurstTime = [...burstTime];
    const wt = new Array(n).fill(0); // Χρόνος αναμονής
    const tat = new Array(n).fill(0); // Χρόνος επιστροφής
    const completionTime = new Array(n).fill(0); // Χρόνος ολοκλήρωσης

    let currentTime = 0; // Τρέχουσα χρονική στιγμή
    let completed = 0; // Μετρητής ολοκληρωμένων διεργασιών
    let lastProcess = -1; // Τελευταία διεργασία
    const schedule = []; // Προγραμματισμός διεργασιών
    let queueOutput = ''; // Αναπαράσταση ουράς

    while (completed < n || remainingBurstTime.some(bt => bt > 0)) {
        const availableProcesses = [];
        for (let i = 0; i < n; i++) {
            if (arrivalTime[i] <= currentTime && remainingBurstTime[i] > 0) {
                availableProcesses.push(i);
            }
        }

        // Αν δεν υπάρχουν διαθέσιμες διεργασίες, απλά αυξάνουμε το currentTime
        if (availableProcesses.length === 0) {
            currentTime++;
            continue;
        }

        // Βρες τη διεργασία με τον μικρότερο υπόλοιπο χρόνο εκτέλεσης
        const shortestJobIndex = availableProcesses.reduce((shortest, i) =>
            remainingBurstTime[i] < remainingBurstTime[shortest] ? i : shortest, availableProcesses[0]);

        // Ενημέρωση ουράς αν αλλάξει διεργασία
        if (lastProcess !== shortestJobIndex) {
            if (lastProcess !== -1) {
                schedule[schedule.length - 1].endTime = currentTime;
            }
            schedule.push({
                process: processes[shortestJobIndex],
                startTime: currentTime,
                processIndex: shortestJobIndex,
            });

            const activeProcess = `<span class="queue-process active">P${processes[shortestJobIndex]}</span>`;
            const waitingQueue = availableProcesses
                .filter((i) => i !== shortestJobIndex)
                .map((i) => `<span class="queue-process">P${processes[i]}</span>`)
                .join(' -> ') || 'Καμία';
            queueOutput += `
                <div class="step-box">
                    <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
                    <div>Εκτελείται: ${activeProcess}</div>
                    <div>Αναμονή: ${waitingQueue}</div>
                </div>
            `;
            lastProcess = shortestJobIndex;
        }

        // Εκτέλεση της διεργασίας για 1 μονάδα χρόνου
        remainingBurstTime[shortestJobIndex]--;
        currentTime++;

        // Αν ολοκληρώθηκε η διεργασία
        if (remainingBurstTime[shortestJobIndex] === 0) {
            completed++;
            completionTime[shortestJobIndex] = currentTime;
            tat[shortestJobIndex] = completionTime[shortestJobIndex] - arrivalTime[shortestJobIndex];
            wt[shortestJobIndex] = tat[shortestJobIndex] - burstTime[shortestJobIndex];
        }
    }

    if (schedule.length > 0) {
        schedule[schedule.length - 1].endTime = currentTime;
    }

    // Τελική κατάσταση ουράς
    queueOutput += `
        <div class="step-box">
            <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
            <div>Όλες οι διεργασίες έχουν ολοκληρωθεί!</div>
            <div>Αναμονή: Καμία</div>
        </div>
    `;

    // Υπολογισμός μέσου χρόνου αναμονής
    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

    // Δημιουργία πίνακα αποτελεσμάτων
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    // Εμφάνιση αποτελεσμάτων στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById('stepHistory').innerHTML = `
        <p><strong>Μέσος Χρόνος Αναμονής :</strong> ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;

    // Δημιουργία Gantt Chart
    drawGanttChart(schedule);

    // Εμφάνιση κουμπιού επαναφοράς
    document.getElementById("resetButton").style.display = "inline-block";
}


function drawGanttChart(schedule) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Υπολογισμός συνολικού χρόνου
    const totalDuration = schedule[schedule.length - 1].endTime;

    // Ρυθμίσεις καμβά
    const canvasWidth = 800; // Πλάτος καμβά
    const scaleFactor = canvasWidth / totalDuration; // Κλίμακα χρόνου
    canvas.width = canvasWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentX = 0; // Αρχικό X για τις μπάρες
    const barHeight = 40; // Ύψος μπάρας
    const labelFontSize = 12; // Σταθερό μέγεθος γραμματοσειράς

    // Χάρτης για την αντιστοίχιση διεργασιών με χρώματα
    const processColors = {};

    for (let i = 0; i < schedule.length; i++) {
        const { process, startTime, endTime } = schedule[i];
        const duration = endTime - startTime;
        const barWidth = duration * scaleFactor;

        // Ανάθεση ή ανάκτηση χρώματος για τη διεργασία
        if (!processColors[process]) {
            processColors[process] = `hsl(${(Object.keys(processColors).length * 60) % 360}, 70%, 70%)`;
        }
        ctx.fillStyle = processColors[process];

        // Σχεδίαση μπάρας διεργασίας
        ctx.fillRect(currentX, 50, barWidth, barHeight);

        // Ετικέτα διεργασίας μέσα στη μπάρα
        const label = `P${process}`;
        ctx.fillStyle = '#000';
        ctx.font = `${labelFontSize}px Arial`;
        ctx.fillText(label, currentX + barWidth / 2 - ctx.measureText(label).width / 2, 75);

        // Ετικέτες χρόνου (start time, end time)
        ctx.fillText(startTime, currentX, 45); // Χρόνος έναρξης
        ctx.fillText(endTime, currentX + barWidth, 45); // Χρόνος λήξης


        currentX += barWidth; // Ενημέρωση για την επόμενη μπάρα
    }
}






let stepCurrentTime = 0;
let stepProcesses = [];
let stepBurstTime = [];
let stepArrivalTime = [];
let stepRemainingTime = [];
let stepWaitingTime = [];
let stepTurnAroundTime = [];
let stepCompleted = [];
let stepSchedule = [];


function startStepByStep() {
    // Αρχικοποίηση δεδομένων από τα πεδία εισόδου
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);
    const n = stepBurstTime.length;

    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);
    stepRemainingTime = [...stepBurstTime];
    stepWaitingTime = new Array(n).fill(0);
    stepTurnAroundTime = new Array(n).fill(0);
    stepCompleted = new Array(n).fill(false);

    stepCurrentTime = 0;

    const stepHistoryContainer = document.getElementById('stepHistory');
    stepHistoryContainer.innerHTML = ''; // Καθαρισμός ιστορικού

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο βήμα';
    nextButton.id = 'nextStepButton';
    nextButton.onclick = stepByStepExecution;
    stepHistoryContainer.appendChild(nextButton); // Τοποθέτηση κουμπιού στο container

    stepByStepExecution(); // Ξεκινάμε από το πρώτο βήμα
     // Εμφάνιση κουμπιού επαναφοράς
     document.getElementById("resetButton").style.display = "inline-block";
}

function stepByStepExecution() {
    const n = stepProcesses.length;

    const stepHistoryContainer = document.getElementById('stepHistory');

    // Προσθήκη κουτιού έναρξης αν είναι το πρώτο βήμα
    if (stepCurrentTime === 0 && !document.querySelector('.start-box')) {
        const startBox = document.createElement('div');
        startBox.classList.add('step-box', 'start-box');
        startBox.innerHTML = `
            <div class="step-time">Εκκίνηση διαδικασίας!</div>
            <div>Αριθμός διεργασιών: ${n}</div>
        `;
        stepHistoryContainer.appendChild(startBox);
    }

    // Βρες τις διαθέσιμες διεργασίες
    const availableProcesses = stepProcesses
        .map((_, i) => (stepArrivalTime[i] <= stepCurrentTime && stepRemainingTime[i] > 0 ? i : -1))
        .filter((i) => i !== -1);

    // Αν δεν υπάρχουν διαθέσιμες διεργασίες
    if (availableProcesses.length === 0) {
        const idleBox = document.createElement('div');
        idleBox.classList.add('step-box');
        idleBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Καμία διεργασία διαθέσιμη ή σε αναμονή.</div>
        `;
        stepHistoryContainer.appendChild(idleBox);
        stepCurrentTime++;
        return;
    }

    // Επιλέγουμε τη διεργασία με τον μικρότερο υπόλοιπο χρόνο εκτέλεσης
    const shortestJobIndex = availableProcesses.reduce((shortest, i) =>
        stepRemainingTime[i] < stepRemainingTime[shortest] ? i : shortest, availableProcesses[0]);

    // Δημιουργία της ουράς
    const activeProcess = `<span class="queue-process active">P${stepProcesses[shortestJobIndex]}</span>`;
    const waitingQueue = availableProcesses
        .filter((i) => i !== shortestJobIndex)
        .map((i) => `<span class="queue-process">P${stepProcesses[i]}</span>`)
        .join(' -> ') || 'Καμία';

    const stepBox = document.createElement('div');
    stepBox.classList.add('step-box');
    stepBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
        <div>Εκτελείται: ${activeProcess}</div>
        <div>Αναμονή: ${waitingQueue}</div>
    `;
    stepHistoryContainer.appendChild(stepBox);

    // Ενημέρωση προγράμματος εκτέλεσης
    if (
        stepSchedule.length === 0 ||
        stepSchedule[stepSchedule.length - 1].processIndex !== shortestJobIndex
    ) {
        if (stepSchedule.length > 0) {
            stepSchedule[stepSchedule.length - 1].endTime = stepCurrentTime;
        }
        stepSchedule.push({
            process: stepProcesses[shortestJobIndex],
            processIndex: shortestJobIndex,
            startTime: stepCurrentTime,
        });
    }

    // Εκτέλεση της διεργασίας για 1 μονάδα χρόνου
    stepRemainingTime[shortestJobIndex]--;
    stepCurrentTime++;

    // Ενημέρωση της ολοκλήρωσης εάν η διεργασία τελείωσε
    if (stepRemainingTime[shortestJobIndex] === 0) {
        stepCompleted[shortestJobIndex] = true;
        stepTurnAroundTime[shortestJobIndex] = stepCurrentTime - stepArrivalTime[shortestJobIndex];
        stepWaitingTime[shortestJobIndex] =
            stepTurnAroundTime[shortestJobIndex] - stepBurstTime[shortestJobIndex];
    }

    // Ελέγξτε αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (stepCompleted.every((completed) => completed)) {
        document.getElementById('nextStepButton').remove();

        // Ολοκλήρωση του τελευταίου χρονικού διαστήματος στο πρόγραμμα
        if (stepSchedule.length > 0) {
            stepSchedule[stepSchedule.length - 1].endTime = stepCurrentTime;
        }

        // Προσθήκη κουτιού για την τελευταία χρονική στιγμή
        const finalIdleBox = document.createElement('div');
        finalIdleBox.classList.add('step-box');
        finalIdleBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Όλες οι διεργασίες έχουν ολοκληρωθεί και δεν υπάρχει αναμονή.</div>
        `;
        stepHistoryContainer.appendChild(finalIdleBox);

        // Δημιουργία Gantt Chart
        drawGanttChart(stepSchedule);

        // Υπολογισμός μέσου χρόνου αναμονής
        const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
        const avgWaitingTimeBox = `<p><strong>Μέσος Χρόνος Αναμονής :</strong> ${averageWaitingTime.toFixed(2)}</p>`;
        stepHistoryContainer.insertAdjacentHTML('afterbegin', avgWaitingTimeBox);

        // Προσθήκη κουτιού τέλους διαδικασίας
        const endBox = document.createElement('div');
        endBox.classList.add('step-box');
        endBox.innerHTML = `
            <div class="step-time">Τέλος Αλγορίθμου!</div>
            <div>Όλες οι διεργασίες έχουν εκτελεστεί επιτυχώς.</div>
        `;
        stepHistoryContainer.appendChild(endBox);

        // Δημιουργία πεντάστηλου πίνακα
        createFinalTable();
    }
}


// Συνάρτηση δημιουργίας του πεντάστηλου πίνακα
function createFinalTable() {
    const tableContainer = document.getElementById('seek-count');
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";

    for (let i = 0; i < stepProcesses.length; i++) {
        output += `<tr>
            <td>P${stepProcesses[i]}</td>
            <td>${stepBurstTime[i]}</td>
            <td>${stepArrivalTime[i]}</td>
            <td>${stepWaitingTime[i]}</td>
            <td>${stepTurnAroundTime[i]}</td>
        </tr>`;
    }

    output += "</table>";
    tableContainer.innerHTML = output;
}




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

    const n = burstTime.length;

    // Δημιουργία πίνακα διεργασιών
    const processes = Array.from({ length: n }, (_, i) => i + 1);

    // Δημιουργία HTML για τον πίνακα
    let output = "<table border='1' style='border-collapse: collapse; width: 100%; text-align: center;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th></tr>";

    for (let i = 0; i < n; i++) {
        output += `<tr><td>P${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td></tr>`;
    }
    output += "</table>";

    // Εμφάνιση του πίνακα στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById("runButton").style.display = "inline-block";
    document.getElementById("stepByStepBtn").style.display = "inline-block";
    document.getElementById("resetButton").style.display = "inline-block";
}

// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας
function generateRandomSequence(length, max = 50) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    return sequence;
}
// Συνάρτηση δημιουργίας τυχαίων ακολουθιών για burst και arrival time
document.getElementById("generateSequenceButton").addEventListener("click", function () {
    const sequenceLengthInput = document.getElementById("sequenceLength").value;
    const sequenceLength = parseInt(sequenceLengthInput);

  
    // Δημιουργία τυχαίων ακολουθιών
    const burstTimeSequence = generateRandomSequence(sequenceLength); // Για burst time
    const arrivalTimeSequence = generateRandomSequence(sequenceLength); // Για arrival time

    // Ενημέρωση των πεδίων εισόδου
    document.getElementById("burst-time").value = burstTimeSequence.join(",");
    document.getElementById("arrival-time").value = arrivalTimeSequence.join(",");

});

function resetPreSJF() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';

    // Καθαρισμός του πίνακα αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = '';

    document.getElementById("sequenceLength").value = ""; // Μηδενισμός του sequence length
    
    // Καθαρισμός του ιστορικού βημάτων
    document.getElementById('stepHistory').innerHTML = '';
   
     // Καθαρισμός καμβά
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
  
