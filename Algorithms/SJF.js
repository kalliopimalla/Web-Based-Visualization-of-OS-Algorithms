
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
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
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
    }

    // Έλεγχος αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (!stepBurstTime.some((bt) => bt > 0)) {
        if (!document.getElementById('endMessage')) {
            const finalMomentBox = document.createElement('div');
            finalMomentBox.classList.add('step-box');
            finalMomentBox.innerHTML = `
                <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
                <div>Καμία διεργασία δεν είναι σε εκτέλεση ή αναμονή.</div>
            `;
            document.getElementById('stepHistory').appendChild(finalMomentBox);

            const endBox = document.createElement('div');
            endBox.classList.add('step-box');
            endBox.id = 'endMessage';
            endBox.innerHTML = `
                <div class="step-time">Τέλος Εκτέλεσης</div>
                <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
            `;
            document.getElementById('stepHistory').appendChild(endBox);

            // Υπολογισμός μέσου χρόνου αναμονής
            const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
            const avgWaitingTimeBox = `<p><strong>Μέσος Χρόνος Αναμονής:</strong> ${averageWaitingTime.toFixed(2)}</p>`;
            document.getElementById('stepHistory').insertAdjacentHTML('afterbegin', avgWaitingTimeBox);

            createFiveColumnTable(stepProcesses, originalBurstTime, stepArrivalTime, stepWaitingTime);
            drawGanttChart(stepProcesses, originalBurstTime, stepArrivalTime, completionOrder);

            document.getElementById('nextStepButton').style.display = 'none';
            document.getElementById('resetButton').style.display = 'inline-block';
        }
        return;
    }

    // Βρες τις διαθέσιμες διεργασίες
    const availableProcesses = stepProcesses
        .map((_, i) => (stepArrivalTime[i] <= stepCurrentTime && stepBurstTime[i] > 0 ? i : -1))
        .filter((i) => i !== -1);

    if (availableProcesses.length === 0) {
        stepCurrentTime++;
        return;
    }

    // Βρες τη διεργασία με τον μικρότερο χρόνο εκτέλεσης
    const activeProcessIndex = availableProcesses.reduce((shortest, i) =>
        stepBurstTime[i] < stepBurstTime[shortest] ? i : shortest
    );

    // Ενημέρωση της σειράς ολοκλήρωσης
    if (!completionOrder.includes(activeProcessIndex)) {
        completionOrder.push(activeProcessIndex);
    }

    // Δημιουργία κατάστασης
    const activeProcess = `<span class="queue-process active">P${stepProcesses[activeProcessIndex]}</span>`;
    const waitingQueue = availableProcesses
        .filter((i) => i !== activeProcessIndex)
        .map((i) => `<span class="queue-process">P${stepProcesses[i]}</span>`)
        .join(' -> ') || 'Καμία';

    const queueBox = document.createElement('div');
    queueBox.classList.add('step-box');
    queueBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
        <div>Εκτελείται: ${activeProcess}</div>
        <div>Αναμονή: ${waitingQueue}</div>
    `;
    document.getElementById('stepHistory').appendChild(queueBox);

    // Ενημέρωση χρόνου αναμονής για τις υπόλοιπες διεργασίες
    for (let i = 0; i < n; i++) {
        if (i !== activeProcessIndex && stepBurstTime[i] > 0 && stepArrivalTime[i] <= stepCurrentTime) {
            stepWaitingTime[i]++;
        }
    }

    // Εκτέλεση της διεργασίας
    stepBurstTime[activeProcessIndex]--;
    if (stepBurstTime[activeProcessIndex] === 0) {
        stepCompletionTime[activeProcessIndex] = stepCurrentTime + 1;
    }

    stepCurrentTime++;
}



// Δημιουργία 5-στήλου πίνακα
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

// Δημιουργία του Gantt Chart
function drawGanttChart(processes, burstTime, arrivalTime, completionOrder) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Υπολογισμός της συνολικής διάρκειας
    const totalBurstTime = burstTime.reduce((sum, time) => sum + time, 0);

    // Βασικό πλάτος καμβά
    const baseWidth = 800;
    const scaleFactor = baseWidth / totalBurstTime; // Κλίμακα χρόνου σε pixels

    // Καθαρισμός του καμβά
    canvas.width = Math.max(baseWidth, totalBurstTime * scaleFactor + 50); // Δυναμικό πλάτος καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Αρχικοποίηση
    let currentX = 0;
    ctx.font = '12px Arial';

    for (const processIndex of completionOrder) {
        const process = processes[processIndex];
        const burst = burstTime[processIndex];

        // Υπολογισμός πλάτους μπάρας
        let barWidth = burst * scaleFactor;

        // Προσαρμογή πλάτους αν είναι μικρότερο από το ελάχιστο
        const label = `P${process}`;
        const labelWidth = ctx.measureText(label).width + 10; // Επιπλέον περιθώριο για να χωράει η ετικέτα
        if (barWidth < labelWidth) {
            barWidth = labelWidth; // Προσαρμογή πλάτους
        }

        // Σχεδίαση μπάρας
        ctx.fillStyle = `hsl(${(processIndex * 60) % 360}, 70%, 70%)`; // Χρώμα ανά διεργασία
        ctx.fillRect(currentX, 50, barWidth, 40);

        // Ετικέτα διεργασίας μέσα στη μπάρα
        ctx.fillStyle = '#000';
        ctx.fillText(label, currentX + barWidth / 2 - ctx.measureText(label).width / 2, 75); // Κέντρο μπάρας

        currentX += barWidth; // Μετατόπιση για την επόμενη διεργασία
    }
}





function createThreeColumnTable() {
    const btInput = document.getElementById('burst-time');
    const atInput = document.getElementById('arrival-time');

    const btValue = btInput.value.trim();
    const atValue = atInput.value.trim();

    // Έλεγχος αν έχουν συμπληρωθεί και τα δύο πεδία
    if (!btValue || !atValue) {
        const errorContainer = document.getElementById('error-container');
        errorContainer.textContent = 'Παρακαλώ συμπληρώστε τόσο τους χρόνους εκτέλεσης όσο και τους χρόνους άφιξης!';
        errorContainer.style.display = 'block';

        // Εφαρμογή της κλάσης σφάλματος
        if (!btValue) btInput.classList.add('input-error');
        if (!atValue) atInput.classList.add('input-error');
        return;
    }

    // Διαχωρισμός τιμών και μετατροπή σε αριθμητικούς πίνακες
    const burstTime = btValue.split(',').map(Number);
    const arrivalTime = atValue.split(',').map(Number);

    // Έλεγχος αν τα μήκη των πινάκων ταιριάζουν
    if (burstTime.length !== arrivalTime.length) {
        const errorContainer = document.getElementById('error-container');
        errorContainer.textContent = 'Ο αριθμός των χρόνων εκτέλεσης και άφιξης πρέπει να είναι ίδιος!';
        errorContainer.style.display = 'block';

        // Εφαρμογή της κλάσης σφάλματος
        btInput.classList.add('input-error');
        atInput.classList.add('input-error');
        return;
    }

    // Απόκρυψη του μηνύματος σφάλματος και αφαίρεση της κλάσης σφάλματος
    const errorContainer = document.getElementById('error-container');
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


function resetSJF() {
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
  