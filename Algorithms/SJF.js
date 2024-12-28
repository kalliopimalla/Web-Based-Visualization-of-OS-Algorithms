
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
    let completionOrder = []; // Σειρά ολοκλήρωσης διεργασιών

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
            const nextArrivalTime = Math.min(...arrivalTime.filter((at, i) => !isCompleted[i]));
            currentTime = Math.max(currentTime, nextArrivalTime);
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

        // Ενημέρωση της σειράς ολοκλήρωσης
        completionOrder.push(shortestJobIndex);

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

    // Προσθήκη κουτιού για την τελική χρονική στιγμή
    queueOutput += `
        <div class="step-box">
            <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
            <div>Όλες οι διεργασίες έχουν ολοκληρωθεί!</div>
            <div>Αναμονή: Καμία</div>
        </div>
    `;

    // Εμφάνιση αποτελεσμάτων
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>P${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    document.getElementById('seek-count').innerHTML = output;

    // Εμφάνιση μέσου χρόνου αναμονής
    document.getElementById('stepHistory').innerHTML = `
        <p><strong>Μέσος Χρόνος Αναμονής :</strong> ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;

    // Δημιουργία Gantt Chart
    drawGanttChart(processes, burstTime, arrivalTime, completionOrder);

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";

    // Απόκρυψη κουμπιού εκτέλεσης
    document.getElementById("runButton").style.display = "none";
}





let stepIndex = 0;
let stepCurrentTime = 0;
let stepProcesses = [];
let stepBurstTime = [];
let stepArrivalTime = [];
let stepWaitingTime = [];
let stepTurnAroundTime = [];
let stepCompleted = []; // Καταστάσεις ολοκλήρωσης διεργασιών

function startStepByStep() {
    // Αρχικοποίηση δεδομένων από τα πεδία εισόδου
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);
    const n = stepBurstTime.length;
    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);
    stepWaitingTime = new Array(n).fill(0);
    stepTurnAroundTime = new Array(n).fill(0);
    stepCompleted = new Array(n).fill(false); // Αρχικοποίηση μη ολοκληρωμένων διεργασιών



    stepIndex = 0;
    stepCurrentTime = 0;

    document.getElementById('stepHistory').innerHTML = ''; // Καθαρισμός ιστορικού
    document.getElementById('seek-count').innerHTML = ''; // Καθαρισμός πίνακα

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο βήμα';
    nextButton.id = 'nextStepButton';
    nextButton.onclick = stepByStepExecution;
    document.getElementById('stepHistory').appendChild(nextButton);

    stepByStepExecution(); // Ξεκινάμε από το πρώτο βήμα
}


let startDisplayed = false;
let completionOrder = [];
let originalBurstTime = [];

function stepByStepExecution() {
    const n = stepProcesses.length;

    // Προσθήκη κουτιού έναρξης, αν δεν έχει ήδη εμφανιστεί
    if (!startDisplayed) {
        const startBox = document.createElement('div');
        startBox.classList.add('step-box');
        startBox.innerHTML = `
            <div class="step-time">Εκκίνηση διαδικασίας!</div>
            <div>Αριθμός διεργασιών: ${n}</div>
        `;
        document.getElementById('stepHistory').appendChild(startBox);
        startDisplayed = true;
        originalBurstTime = [...stepBurstTime]; // Αποθήκευση αρχικών χρόνων εκτέλεσης
        stepCurrentTime = 0; // Ξεκινάμε από το t=0
    }

    // Έλεγχος αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (stepCompleted.every((completed) => completed)) {
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Τέλος Αλγορίθμου!</div>
            <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);

        // Υπολογισμός μέσου χρόνου αναμονής
        const totalWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0);
        const averageWaitingTime = totalWaitingTime / stepProcesses.length;

        const avgBox = document.createElement('div');
        avgBox.innerHTML = `
            <p><strong>Μέσος Χρόνος Αναμονής:</strong> ${averageWaitingTime.toFixed(2)}</p>
        `;
        document.getElementById('stepHistory').insertAdjacentElement('afterbegin', avgBox);

        // Δημιουργία του 5-στήλου πίνακα
        createFiveColumnTable(stepProcesses, originalBurstTime, stepArrivalTime, stepWaitingTime);

        // Δημιουργία Gantt Chart
        drawGanttChart(stepProcesses, originalBurstTime, stepArrivalTime, completionOrder);

        // Αφαίρεση κουμπιού "Επόμενο Βήμα"
        const nextStepButton = document.getElementById('nextStepButton');
        if (nextStepButton) {
            nextStepButton.remove();
        }
        return;
    }

    // Βρες τη διαθέσιμη διεργασία με τον μικρότερο χρόνο εκτέλεσης
    const availableProcesses = stepProcesses
        .map((_, i) => (stepArrivalTime[i] <= stepCurrentTime && !stepCompleted[i] ? i : -1))
        .filter((i) => i !== -1);

    if (availableProcesses.length === 0) {
        // Αν δεν υπάρχουν διαθέσιμες διεργασίες, αυξάνουμε τη χρονική στιγμή
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Εκτελείται: Καμία</div>
            <div>Αναμονή: Καμία</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);

        stepCurrentTime++;
        return;
    }

    const shortestJobIndex = availableProcesses.reduce((shortest, i) =>
        stepBurstTime[i] < stepBurstTime[shortest] ? i : shortest
    );

    // Δημιουργία κουτιού για την τρέχουσα διεργασία
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

    // Εκτέλεση της διεργασίας
    stepCurrentTime += stepBurstTime[shortestJobIndex];
    stepTurnAroundTime[shortestJobIndex] = stepCurrentTime - stepArrivalTime[shortestJobIndex];
    stepWaitingTime[shortestJobIndex] = stepTurnAroundTime[shortestJobIndex] - originalBurstTime[shortestJobIndex];
    stepBurstTime[shortestJobIndex] = 0;
    stepCompleted[shortestJobIndex] = true;
    completionOrder.push(shortestJobIndex);
}





// Δημιουργία 5-στήλου πίνακα
function createFiveColumnTable(processes, bt, at, wt) {
    const tat = processes.map((_, i) => bt[i] + wt[i]); // Υπολογισμός Turnaround Time

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

    // Εμφάνιση του πίνακα στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
}


function drawGanttChart(processes, burstTime, arrivalTime, completionOrder) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Υπολογισμός της συνολικής διάρκειας
    const totalBurstTime = burstTime.reduce((sum, time) => sum + time, 0);

    // Βασικό πλάτος καμβά
    const baseWidth = 800;
    const scaleFactor = Math.max(baseWidth / totalBurstTime, 1); // Κλίμακα χρόνου σε pixels
    const minBarWidth = 50; // Ελάχιστο πλάτος μπάρας

    // Καθαρισμός και δυναμικό πλάτος καμβά
    canvas.width = Math.max(baseWidth, totalBurstTime * scaleFactor + 1300);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Αρχικοποίηση
    let currentX = 0;
    let currentTime = Math.min(...arrivalTime); // Ξεκινάμε από το ελάχιστο arrival time
    ctx.font = '12px Arial';

    const colorStep = 360 / processes.length; // Υπολογισμός βήματος χρώματος

    for (let index = 0; index < completionOrder.length; index++) {
        const processIndex = completionOrder[index];
        const process = processes[processIndex];
        const burst = burstTime[processIndex];
        const arrival = arrivalTime[processIndex];

        // Ξεκινάμε το process μόνο αν έχει φτάσει (arrival <= currentTime)
        const startTime = Math.max(currentTime, arrival);

        // Υπολογισμός πλάτους μπάρας
        let barWidth = burst * scaleFactor;

        // Προσαρμογή πλάτους αν είναι μικρότερο από το ελάχιστο
        barWidth = Math.max(barWidth, minBarWidth);

        // Σχεδίαση μπάρας
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

        // Ετικέτα διεργασίας μέσα στη μπάρα
        ctx.fillStyle = '#000';
        const label = `P${process}`;
        ctx.fillText(label, currentX + barWidth / 2 - ctx.measureText(label).width / 2, 75); // Κέντρο μπάρας

        // Ετικέτες χρόνου (start time, end time)
        ctx.fillText(startTime, currentX, 45); // Χρόνος έναρξης
        currentTime = startTime + burst; // Ενημέρωση τρέχοντος χρόνου
        currentX += barWidth; // Μετατόπιση για την επόμενη διεργασία
        ctx.fillText(currentTime, currentX, 45); // Χρόνος λήξης
    }
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

        // Εφαρμογή της κλάσης σφάλματος
        if (!btValue) btInput.classList.add('input-error');
        if (!atValue) atInput.classList.add('input-error');
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

     

    // Απόκρυψη του μηνύματος σφάλματος και αφαίρεση της κλάσης σφάλματος
    errorContainer.style.display = 'none';
    btInput.classList.remove('input-error');
    atInput.classList.remove('input-error');
    
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

    // Δημιουργία πίνακα διεργασιών
    const n = burstTime.length;
    const processes = Array.from({ length: n }, (_, i) => i + 1);

    // Δημιουργία HTML για τον πίνακα
    let output = "<table border='1' style='border-collapse: collapse; width: 100%; text-align: center;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th></tr>";

    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td></tr>`;
    }
    output += "</table>";

    // Εμφάνιση του πίνακα στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById("runButton").style.display = "inline-block";
    document.getElementById("stepByStepBtn").style.display = "inline-block";
    document.getElementById("resetButton").style.display = "inline-block";
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



function resetSJF() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';

    // Καθαρισμός του πίνακα αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = '';

    // Καθαρισμός του ιστορικού βημάτων
    document.getElementById('stepHistory').innerHTML = '';

    document.getElementById("sequenceLength").value = ""; // Μηδενισμός του sequence length

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
  