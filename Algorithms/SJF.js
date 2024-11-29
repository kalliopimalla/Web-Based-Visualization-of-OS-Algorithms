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

        // Αν καμία διεργασία δεν είναι διαθέσιμη
        if (availableProcesses.length === 0) {
            // Βρες την επόμενη χρονική στιγμή που θα φτάσει μια διεργασία
            const nextArrivalTime = Math.min(...arrivalTime.filter((at, i) => !isCompleted[i]));
            currentTime = Math.max(currentTime, nextArrivalTime); // Μεταπήδηση στον επόμενο χρόνο
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

let stepCurrentExecutionTime = 0; // Μετρητής για την τρέχουσα διεργασία

function stepByStepExecution() {
    const n = stepProcesses.length;

    // Εμφάνιση κουτιού αρχής εκτέλεσης αν είναι το πρώτο βήμα
    if (stepCurrentTime === 0 && stepCompleted.every((c) => !c)) {
        const startBox = document.createElement('div');
        startBox.classList.add('step-box');
        startBox.innerHTML = `
            <div class="step-time">Αρχή Εκτέλεσης</div>
            <div>Οι διεργασίες ξεκινούν τώρα!</div>
        `;
        document.getElementById('stepHistory').appendChild(startBox);
    }

    // Βρες τις διαθέσιμες διεργασίες
    const availableProcesses = stepProcesses
        .map((p, i) => (stepArrivalTime[i] <= stepCurrentTime && !stepCompleted[i] ? i : -1))
        .filter((i) => i !== -1);

    // Δημιουργία ουράς αναμονής
    const waitingQueue = availableProcesses
        .map((i) => `<span class="queue-process">P${stepProcesses[i]}</span>`)
        .join(' -> ') || 'Καμία';

    // Εμφάνιση της ουράς αναμονής για κάθε χρονική στιγμή
    const queueBox = document.createElement('div');
    queueBox.classList.add('step-box');
    queueBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
        <div>Ουρά Αναμονής: ${waitingQueue}</div>
    `;
    document.getElementById('stepHistory').appendChild(queueBox);

    if (availableProcesses.length === 0) {
        // Αν δεν υπάρχουν διαθέσιμες διεργασίες, εμφάνιση μηνύματος αναμονής
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Καμία διεργασία διαθέσιμη. Αναμονή...</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);

        // Αύξηση χρόνου και έξοδος από τη συνάρτηση
        stepCurrentTime++;
        return;
    }

    // Επιλέγουμε τη διεργασία με τον μικρότερο χρόνο εκτέλεσης
    const shortestJobIndex = availableProcesses.reduce((shortest, i) =>
        stepBurstTime[i] < stepBurstTime[shortest] ? i : shortest
    );

    // Υπολογισμός χρόνου εκκίνησης και λήξης για την τρέχουσα διεργασία
    const start = Math.max(stepCurrentTime, stepArrivalTime[shortestJobIndex]);
    const end = start + stepBurstTime[shortestJobIndex];

    // Ενημέρωση χρόνου εκτέλεσης μόνο αν είναι το πρώτο βήμα της διεργασίας
    if (stepCurrentExecutionTime === 0) {
        stepWaitingTime[shortestJobIndex] = start - stepArrivalTime[shortestJobIndex];
        if (stepWaitingTime[shortestJobIndex] < 0) stepWaitingTime[shortestJobIndex] = 0;
        stepTurnAroundTime[shortestJobIndex] = stepWaitingTime[shortestJobIndex] + stepBurstTime[shortestJobIndex];
        stepCurrentTime = start; // Ορισμός του χρόνου έναρξης
    }

    // Δημιουργία κουτιού για την τρέχουσα διεργασία
    const activeProcess = `<span class="queue-process active">P${stepProcesses[shortestJobIndex]}</span>`;
    const stepBox = document.createElement('div');
    stepBox.classList.add('step-box');
    stepBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
        <div>Εκτελείται: ${activeProcess}</div>
    `;
    document.getElementById('stepHistory').appendChild(stepBox);

    // Ενημέρωση χρόνου για την επόμενη χρονική στιγμή
    stepCurrentTime++;
    stepCurrentExecutionTime++;

    // Όταν ολοκληρωθεί η διεργασία
    if (stepCurrentExecutionTime === stepBurstTime[shortestJobIndex]) {
        // Ενημέρωση του πεντάστηλου πίνακα
        const tableContainer = document.getElementById('seek-count');
        if (!document.querySelector('#sjf-table')) {
            let output = "<table id='sjf-table' border='1' style='border-collapse: collapse; width: 100%;'>";
            output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
            tableContainer.innerHTML = output + "</table>";
        }

        const table = document.querySelector('#sjf-table');
        const newRow = table.insertRow(-1);
        newRow.innerHTML = `
            <td>${stepProcesses[shortestJobIndex]}</td>
            <td>${stepBurstTime[shortestJobIndex]}</td>
            <td>${stepArrivalTime[shortestJobIndex]}</td>
            <td>${stepWaitingTime[shortestJobIndex]}</td>
            <td>${stepTurnAroundTime[shortestJobIndex]}</td>
        `;

        // Ενημέρωση κατάστασης και επαναφορά του μετρητή εκτέλεσης
        stepCompleted[shortestJobIndex] = true;
        stepCurrentExecutionTime = 0;

        // Έλεγχος αν όλες οι διεργασίες έχουν ολοκληρωθεί
        if (stepCompleted.every((completed) => completed)) {
            // Προσθήκη κουτιού για το τέλος της εκτέλεσης
            const endBox = document.createElement('div');
            endBox.classList.add('step-box');
            endBox.innerHTML = `
                <div class="step-time">Τέλος Εκτέλεσης</div>
                <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
            `;
            document.getElementById('stepHistory').appendChild(endBox);

            // Υπολογισμός μέσου χρόνου αναμονής
            const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
            const avgWaitingTimeBox = `<p>Μέσος Χρόνος Αναμονής : ${averageWaitingTime.toFixed(2)}</p>`;
            document.getElementById('stepHistory').insertAdjacentHTML('afterbegin', avgWaitingTimeBox);

            alert('Η εκτέλεση ολοκληρώθηκε!');
            document.getElementById('nextStepButton').remove();
            document.getElementById("resetButton").style.display = "inline-block";
        }
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
  