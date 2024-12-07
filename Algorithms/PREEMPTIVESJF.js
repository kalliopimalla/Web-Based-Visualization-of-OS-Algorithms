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

    while (completed < n) {
        const availableProcesses = [];
        for (let i = 0; i < n; i++) {
            if (arrivalTime[i] <= currentTime && remainingBurstTime[i] > 0) {
                availableProcesses.push(i);
            }
        }

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
        <p>Μέσος Χρόνος Αναμονής : ${averageWaitingTime.toFixed(2)}</p>
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

    for (let i = 0; i < schedule.length; i++) {
        const { process, startTime, endTime } = schedule[i];
        const duration = endTime - startTime;
        const barWidth = duration * scaleFactor;

        // Προσθήκη idle time αν υπάρχει κενό
        if (i === 0 && startTime > 0) {
            const idleWidth = startTime * scaleFactor;
            ctx.fillStyle = 'gray'; // Χρώμα για idle time
            ctx.fillRect(currentX, 50, idleWidth, 40);
            currentX += idleWidth;
        }

        if (i > 0 && schedule[i - 1].endTime < startTime) {
            const idleWidth = (startTime - schedule[i - 1].endTime) * scaleFactor;
            ctx.fillStyle = 'gray';
            ctx.fillRect(currentX, 50, idleWidth, 40);
            currentX += idleWidth;
        }

        // Σχεδίαση μπάρας διεργασίας
        ctx.fillStyle = `hsl(${(i * 60) % 360}, 70%, 70%)`; // Χρώμα διεργασίας
        ctx.fillRect(currentX, 50, barWidth, 40);

        // Ετικέτα διεργασίας μέσα στη μπάρα
        ctx.fillStyle = '#000';
        const label = `P${process}`;
        const labelWidth = ctx.measureText(label).width;
        const fontSize = Math.min(12, barWidth / labelWidth * 10);
        ctx.font = `${fontSize}px Arial`;

        if (labelWidth <= barWidth) {
            ctx.fillText(label, currentX + barWidth / 2 - labelWidth / 2, 75);
        } else {
            ctx.fillText(label, currentX + 5, 75); // Αν η ετικέτα δεν χωράει, αριστερά
        }

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

    if (stepBurstTime.length !== stepArrivalTime.length) {
        alert('Οι χρόνοι εκτέλεσης και άφιξης πρέπει να έχουν το ίδιο μήκος!');
        return;
    }

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

    // Βρες τις διαθέσιμες διεργασίες
    const availableProcesses = stepProcesses
        .map((_, i) => (stepArrivalTime[i] <= stepCurrentTime && stepRemainingTime[i] > 0 ? i : -1))
        .filter((i) => i !== -1);

    if (availableProcesses.length === 0) {
        stepCurrentTime++;
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Καμία διεργασία διαθέσιμη. Αναμονή...</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);
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
    document.getElementById('stepHistory').appendChild(stepBox);

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

    // Ενημέρωση του πεντάστηλου πίνακα
    const tableContainer = document.getElementById('seek-count');
    if (!document.querySelector('#preemptive-sjf-table')) {
        let output = "<table id='preemptive-sjf-table' border='1' style='border-collapse: collapse; width: 100%;'>";
        output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
        tableContainer.innerHTML = output + "</table>";
    }

    if (stepCompleted[shortestJobIndex]) {
        const table = document.querySelector('#preemptive-sjf-table');
        const newRow = table.insertRow(-1);
        newRow.innerHTML = `
            <td>${stepProcesses[shortestJobIndex]}</td>
            <td>${stepBurstTime[shortestJobIndex]}</td>
            <td>${stepArrivalTime[shortestJobIndex]}</td>
            <td>${stepWaitingTime[shortestJobIndex]}</td>
            <td>${stepTurnAroundTime[shortestJobIndex]}</td>
        `;
    }

    // Ελέγξτε αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (stepCompleted.every((completed) => completed)) {
        alert('Η εκτέλεση ολοκληρώθηκε!');
        document.getElementById('nextStepButton').remove();

        // Ολοκλήρωση του τελευταίου χρονικού διαστήματος στο πρόγραμμα
        if (stepSchedule.length > 0) {
            stepSchedule[stepSchedule.length - 1].endTime = stepCurrentTime;
        }

        // Δημιουργία Gantt Chart
        drawGanttChart(stepSchedule);

        // Υπολογισμός μέσου χρόνου αναμονής
        const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
        const avgWaitingTimeBox = `<p>Μέσος Χρόνος Αναμονής : ${averageWaitingTime.toFixed(2)}</p>`;
        document.getElementById('stepHistory').insertAdjacentHTML('afterbegin', avgWaitingTimeBox);
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
function generateRandomSequence(length = 6, max = 50) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * max); // Τυχαίος αριθμός από 0 έως max
        sequence.push(randomNum);
    }
    return sequence;
}

// Σύνδεση της λειτουργίας με το κουμπί για το burst-time
document.getElementById("generateSequenceButton1").addEventListener("click", function() {
    const randomSequence = generateRandomSequence(); // Δημιουργία τυχαίας ακολουθίας
    document.getElementById("burst-time").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου
});

// Σύνδεση της λειτουργίας με το κουμπί για το arrival-time (ξεκινά πάντα από 0)
document.getElementById("generateSequenceButton").addEventListener("click", function() {
    const randomSequence = generateRandomSequence(); // Δημιουργία τυχαίας ακολουθίας
    randomSequence[0] = 0; // Ορισμός του πρώτου στοιχείου ως 0
    document.getElementById("arrival-time").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου
});


function resetPreSJF() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';

    // Καθαρισμός του πίνακα αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = '';

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
  
