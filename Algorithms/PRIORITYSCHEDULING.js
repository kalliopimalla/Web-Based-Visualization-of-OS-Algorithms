function runPriorityCPU() {
    // Είσοδοι
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const prInput = document.getElementById('priority').value;

    // Έλεγχος αν τα πεδία είναι σωστά
    if (!btInput || !atInput || !prInput) {
        alert('Παρακαλώ εισάγετε όλους τους χρόνους εκτέλεσης, άφιξης και προτεραιότητες!');
        return;
    }

    // Διαχωρισμός δεδομένων σε πίνακες
    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const priority = prInput.split(',').map(Number);
    const n = burstTime.length;

    if (arrivalTime.length !== n || priority.length !== n) {
        alert('Τα πεδία πρέπει να έχουν ίσο αριθμό τιμών!');
        return;
    }

    const processes = Array.from({ length: n }, (_, i) => i + 1);
    const remainingBurstTime = [...burstTime];
    const wt = new Array(n).fill(0); // Χρόνος αναμονής
    const tat = new Array(n).fill(0); // Χρόνος επιστροφής
    const completionTime = new Array(n).fill(0); // Χρόνος ολοκλήρωσης

    let currentTime = 0;
    let completed = 0;
    let lastProcess = -1;
    let queueOutput = '';

    // Εκτέλεση Priority Scheduling
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

        // Βρες τη διεργασία με την υψηλότερη προτεραιότητα (χαμηλότερη τιμή)
        const highestPriorityIndex = availableProcesses.reduce((highest, i) =>
            priority[i] < priority[highest] ? i : highest, availableProcesses[0]);

        // Ενημέρωση διεργασίας
        if (lastProcess !== highestPriorityIndex) {
            const activeProcess = `<span class="queue-process active">P${processes[highestPriorityIndex]}</span>`;
            const waitingQueue = availableProcesses
                .filter((i) => i !== highestPriorityIndex)
                .map((i) => `<span class="queue-process">P${processes[i]}</span>`)
                .join(' -> ') || 'Καμία';

            queueOutput += `
                <div class="step-box">
                    <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
                    <div>Εκτελείται: ${activeProcess}</div>
                    <div>Αναμονή: ${waitingQueue}</div>
                </div>
            `;
            lastProcess = highestPriorityIndex;
        }

        remainingBurstTime[highestPriorityIndex]--;
        currentTime++;

        if (remainingBurstTime[highestPriorityIndex] === 0) {
            completed++;
            completionTime[highestPriorityIndex] = currentTime;
            tat[highestPriorityIndex] = completionTime[highestPriorityIndex] - arrivalTime[highestPriorityIndex];
            wt[highestPriorityIndex] = tat[highestPriorityIndex] - burstTime[highestPriorityIndex];
        }
    }

    // Υπολογισμός μέσου χρόνου αναμονής
    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

    // Δημιουργία πίνακα αποτελεσμάτων
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Προτεραιότητα</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${priority[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    // Εμφάνιση αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById('stepHistory').innerHTML = `
        <p>Μέσος Χρόνος Αναμονής (AWT): ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;
    document.getElementById("resetButton").style.display = "inline-block";
}






let stepCurrentTime = 0;
let stepProcesses = [];
let stepBurstTime = [];
let stepArrivalTime = [];
let stepPriority = []; // Προτεραιότητες διεργασιών
let stepRemainingTime = [];
let stepWaitingTime = [];
let stepTurnAroundTime = [];
let stepCompleted = [];

function startStepByStep() {
    // Αρχικοποίηση δεδομένων από τα πεδία εισόδου
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const prInput = document.getElementById('priority').value; // Προτεραιότητα

    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);
    stepPriority = prInput.split(',').map(Number);
    const n = stepBurstTime.length;

    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);
    stepRemainingTime = [...stepBurstTime];
    stepWaitingTime = new Array(n).fill(0);
    stepTurnAroundTime = new Array(n).fill(0);
    stepCompleted = new Array(n).fill(false);

    if (stepBurstTime.length !== stepArrivalTime.length || stepBurstTime.length !== stepPriority.length) {
        alert('Οι χρόνοι εκτέλεσης, άφιξης και προτεραιότητας πρέπει να έχουν το ίδιο μήκος!');
        return;
    }

    stepCurrentTime = 0;
    document.getElementById('stepHistory').innerHTML = ''; // Καθαρισμός ιστορικού
    document.getElementById('seek-count').innerHTML = ''; // Καθαρισμός πίνακα

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο';
    nextButton.id = 'nextStepButton';
    nextButton.onclick = stepByStepExecution;
    document.getElementById('stepHistory').appendChild(nextButton);

    stepByStepExecution(); // Ξεκινάμε από το πρώτο βήμα
}

function stepByStepExecution() {
    const n = stepProcesses.length;

    // Βρες τις διαθέσιμες διεργασίες
    const availableProcesses = stepProcesses
        .map((_, i) => (stepArrivalTime[i] <= stepCurrentTime && stepRemainingTime[i] > 0 ? i : -1))
        .filter((i) => i !== -1);

    if (availableProcesses.length === 0) {
        // Αν δεν υπάρχουν διαθέσιμες διεργασίες, προχωράμε στον επόμενο χρόνο
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

    // Επιλέγουμε τη διεργασία με την υψηλότερη προτεραιότητα (χαμηλότερη τιμή προτεραιότητας)
    const highestPriorityIndex = availableProcesses.reduce((highest, i) =>
        stepPriority[i] < stepPriority[highest] ? i : highest, availableProcesses[0]);

    // Εκτέλεση της διεργασίας για 1 μονάδα χρόνου
    stepRemainingTime[highestPriorityIndex]--;
    stepCurrentTime++;

    // Ενημέρωση της ολοκλήρωσης εάν η διεργασία τελείωσε
    if (stepRemainingTime[highestPriorityIndex] === 0) {
        stepCompleted[highestPriorityIndex] = true;
        stepTurnAroundTime[highestPriorityIndex] =
            stepCurrentTime - stepArrivalTime[highestPriorityIndex];
        stepWaitingTime[highestPriorityIndex] =
            stepTurnAroundTime[highestPriorityIndex] - stepBurstTime[highestPriorityIndex];
    }

    // Δημιουργία του ενεργού κουτιού διεργασίας
    const activeProcess = `<span class="queue-process active">P${stepProcesses[highestPriorityIndex]}</span>`;
    const waitingQueue = availableProcesses
        .filter((i) => i !== highestPriorityIndex)
        .map((i) => `<span class="queue-process">P${stepProcesses[i]}</span>`)
        .join(' -> ') || 'Καμία';

    const stepBox = document.createElement('div');
    stepBox.classList.add('step-box');
    stepBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime - 1}</div>
        <div>Εκτελείται: ${activeProcess}</div>
        <div>Αναμονή: ${waitingQueue}</div>
    `;
    document.getElementById('stepHistory').appendChild(stepBox);

    // Ενημέρωση του πίνακα
    const tableContainer = document.getElementById('seek-count');
    if (!document.querySelector('#priority-scheduling-table')) {
        let output = "<table id='priority-scheduling-table' border='1' style='border-collapse: collapse; width: 100%;'>";
        output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Προτεραιότητα</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
        tableContainer.innerHTML = output + "</table>";
    }

    // Αν ολοκληρώθηκε η διεργασία, ενημερώστε την αντίστοιχη γραμμή
    if (stepCompleted[highestPriorityIndex]) {
        const table = document.querySelector('#priority-scheduling-table');
        const newRow = table.insertRow(-1);
        newRow.innerHTML = `
            <td>${stepProcesses[highestPriorityIndex]}</td>
            <td>${stepBurstTime[highestPriorityIndex]}</td>
            <td>${stepArrivalTime[highestPriorityIndex]}</td>
            <td>${stepPriority[highestPriorityIndex]}</td>
            <td>${stepWaitingTime[highestPriorityIndex]}</td>
            <td>${stepTurnAroundTime[highestPriorityIndex]}</td>
        `;
    }

    // Ελέγξτε αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (stepCompleted.every((completed) => completed)) {
        alert('Η εκτέλεση ολοκληρώθηκε!');
        document.getElementById('nextStepButton').remove();
        document.getElementById("resetButton").style.display = "inline-block";

        // Υπολογισμός μέσου χρόνου αναμονής
        const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
        const avgWaitingTimeBox = `<p>Μέσος Χρόνος Αναμονής (AWT): ${averageWaitingTime.toFixed(2)}</p>`;
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

// Συνάρτηση για τη δημιουργία τυχαίας ακολουθίας αριθμών από 1 έως length
function generateRandomPrioritySequence(length) {
    // Δημιουργία σειράς [1, 2, ..., length]
    let sequence = Array.from({ length }, (_, i) => i + 1);
    // Ανακάτεμα της σειράς (Fisher-Yates Shuffle)
    for (let i = sequence.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }
    return sequence;
}

// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton2").addEventListener("click", function () {
    const burstInput = document.getElementById("burst-time").value; // Παίρνουμε το μήκος από το burst-time
    if (!burstInput) {
        alert("Παρακαλώ εισάγετε χρόνους εκτέλεσης για να ορίσετε αριθμό διεργασιών!");
        return;
    }
    const processCount = burstInput.split(",").length; // Υπολογισμός αριθμού διεργασιών
    const randomSequence = generateRandomPrioritySequence(processCount); // Δημιουργία τυχαίας σειράς
    document.getElementById("priority").value = randomSequence.join(","); // Ενημέρωση του πεδίου εισόδου για προτεραιότητες
});


function resetPrioritySJF() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';
    document.getElementById('priority').value = '';

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
  