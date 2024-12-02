

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

    // Εμφάνιση αποτελεσμάτων
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    document.getElementById('seek-count').innerHTML = output;

    // Εμφάνιση μέσου χρόνου αναμονής
    document.getElementById('stepHistory').innerHTML = `
        <p>Μέσος Χρόνος Αναμονής : ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;

    // Δημιουργία Gantt Chart
    drawGanttChart(processes, burstTime, arrivalTime, completionOrder);

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
}

function drawGanttChart(processes, bt, at, completionOrder) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Υπολογισμός συνολικού χρόνου (τέλος της τελευταίας διεργασίας)
    const totalTime = completionOrder.reduce(
        (total, processIndex) => total + bt[processIndex],
        0
    );

    // Ορισμός πλάτους καμβά για να χωρέσουν όλες οι διεργασίες
    canvas.width = totalTime * 40; // 40 pixels ανά μονάδα χρόνου

    // Καθαρισμός καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentTime = 0;

    completionOrder.forEach((processIndex) => {
        const start = Math.max(currentTime, at[processIndex]);
        const end = start + bt[processIndex];

        // Γέμισμα μπάρας
        ctx.fillStyle = `hsl(${(processIndex * 60) % 360}, 70%, 70%)`;
        ctx.fillRect(start * 40, 50, (end - start) * 40, 40);

        // Ετικέτες για τη διεργασία και τους χρόνους
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(`P${processes[processIndex]}`, (start * 40) + ((end - start) * 20) - 10, 75); // Κέντρο μπάρας
        ctx.fillText(`${start}`, start * 40, 100); // Αρχή
        ctx.fillText(`${end}`, end * 40, 100); // Τέλος

        currentTime = end;
    });
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

    if (stepBurstTime.length !== stepArrivalTime.length) {
        alert('Οι χρόνοι εκτέλεσης και άφιξης πρέπει να έχουν το ίδιο μήκος!');
        return;
    }

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
function stepByStepExecution() {
    const n = stepProcesses.length;

    // Έλεγχος αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (!stepBurstTime.some((bt) => bt > 0)) {
        // Έλεγχος αν το μήνυμα "Τέλος Εκτέλεσης" έχει ήδη εμφανιστεί
        if (!document.getElementById('endMessage')) {
            const endBox = document.createElement('div');
            endBox.classList.add('step-box');
            endBox.id = 'endMessage'; // Μοναδικό ID για αποφυγή επαναλήψεων
            endBox.innerHTML = `
                <div class="step-time">Τέλος Εκτέλεσης</div>
                <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
            `;
            document.getElementById('stepHistory').appendChild(endBox);

            // Υπολογισμός μέσου χρόνου αναμονής
            const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
            const avgWaitingTimeBox = `<p><strong>Μέσος Χρόνος Αναμονής:</strong> ${averageWaitingTime.toFixed(2)}</p>`;
            document.getElementById('stepHistory').insertAdjacentHTML('afterbegin', avgWaitingTimeBox);

            // Δημιουργία του 5-στήλου πίνακα
            createFiveColumnTable(stepProcesses, stepBurstTime, stepArrivalTime, stepWaitingTime);

            // Δημιουργία του Gantt Chart
            drawGanttChart(stepProcesses, stepBurstTime, stepArrivalTime);

            // Απόκρυψη του κουμπιού "Επόμενο Βήμα" και εμφάνιση του κουμπιού "Επαναφορά"
            document.getElementById('nextStepButton').style.display = 'none';
            document.getElementById('resetButton').style.display = 'inline-block';

            alert('Η εκτέλεση ολοκληρώθηκε!');
        }
        return;
    }

    // Βρες τις διαθέσιμες διεργασίες
    const availableProcesses = stepProcesses
        .map((p, i) => (stepArrivalTime[i] <= stepCurrentTime && stepBurstTime[i] > 0 ? i : -1))
        .filter((i) => i !== -1);

    // Εύρεση του ενεργού process
    const activeProcessIndex = availableProcesses.length > 0
        ? availableProcesses.reduce((shortest, i) =>
            stepBurstTime[i] < stepBurstTime[shortest] ? i : shortest
        )
        : null;

    // Δημιουργία του ενεργού process (αν υπάρχει διαθέσιμο)
    const activeProcess = activeProcessIndex !== null
        ? `<span class="queue-process active">P${stepProcesses[activeProcessIndex]}</span>`
        : 'Καμία διεργασία εκτελείται';

    // Δημιουργία της ουράς αναμονής
    const waitingQueue = availableProcesses
        .filter((i) => i !== activeProcessIndex)
        .map((i) => `<span class="queue-process">P${stepProcesses[i]}</span>`)
        .join(' -> ') || 'Καμία';

    // Εμφάνιση της κατάστασης για κάθε χρονική στιγμή
    const queueBox = document.createElement('div');
    queueBox.classList.add('step-box');
    queueBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
        <div>Εκτελείται: ${activeProcess}</div>
        <div>Αναμονή: ${waitingQueue}</div>
    `;
    document.getElementById('stepHistory').appendChild(queueBox);

    // Αν δεν υπάρχουν διαθέσιμες διεργασίες, αύξησε τον χρόνο και συνέχισε
    if (availableProcesses.length === 0) {
        stepCurrentTime++;
        return;
    }

    // Μείωση του burstTime της διεργασίας που εκτελείται
    stepBurstTime[activeProcessIndex]--;

    // Ενημέρωση χρόνου αναμονής για τις υπόλοιπες διεργασίες
    for (let i = 0; i < n; i++) {
        if (i !== activeProcessIndex && stepBurstTime[i] > 0 && stepArrivalTime[i] <= stepCurrentTime) {
            stepWaitingTime[i]++;
        }
    }

    // Αύξηση της χρονικής στιγμής
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
function drawGanttChart(processes, bt, at) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Υπολογισμός συνολικού χρόνου (άθροισμα όλων των burst times)
    const totalTime = processes.reduce(
        (sum, p, i) => sum + bt[i],
        0
    );

    // Ορισμός πλάτους καμβά
    canvas.width = totalTime * 40; // 40 pixels ανά μονάδα χρόνου

    // Καθαρισμός καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentTime = 0;

    processes.forEach((process, i) => {
        const start = currentTime;
        const end = start + bt[i];

        // Γέμισμα μπάρας
        ctx.fillStyle = `hsl(${(i * 60) % 360}, 70%, 70%)`;
        ctx.fillRect(start * 40, 50, (end - start) * 40, 40);

        // Ετικέτες για τη διεργασία και τους χρόνους
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(`P${process}`, (start * 40) + ((end - start) * 20) - 10, 75); // Κέντρο μπάρας
        ctx.fillText(`${start}`, start * 40, 100); // Αρχή
        ctx.fillText(`${end}`, end * 40, 100); // Τέλος

        currentTime = end;
    });
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
  