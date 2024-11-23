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
        <p>Μέσος Χρόνος Αναμονής (AWT): ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;

    // Δημιουργία του πίνακα 5 στηλών
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";
    document.getElementById('seek-count').innerHTML = output;

    // Εμφάνιση του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "inline-block";
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

    if (stepBurstTime.length !== stepArrivalTime.length) {
        alert('Οι χρόνοι εκτέλεσης και άφιξης πρέπει να έχουν το ίδιο μήκος!');
        return;
    }

    stepIndex = 0;
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
    if (stepIndex < stepProcesses.length) {
        // Υπολογισμός χρόνου εκκίνησης και λήξης για την τρέχουσα διεργασία
        const start = Math.max(stepCurrentTime, stepArrivalTime[stepIndex]);
        const end = start + stepBurstTime[stepIndex];

        // Ενημέρωση χρόνου αναμονής και επιστροφής για την τρέχουσα διεργασία
        stepWaitingTime[stepIndex] = start - stepArrivalTime[stepIndex];
        if (stepWaitingTime[stepIndex] < 0) stepWaitingTime[stepIndex] = 0;
        stepTurnAroundTime[stepIndex] = stepWaitingTime[stepIndex] + stepBurstTime[stepIndex];

        // Υπολογισμός μέσου χρόνου αναμονής
        const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / stepProcesses.length;

        // Εμφάνιση του μέσου χρόνου αναμονής στην αρχή
        const stepHistoryContainer = document.getElementById('stepHistory');
        const avgWaitingTimeBox = `<p>Μέσος Χρόνος Αναμονής (AWT): ${averageWaitingTime.toFixed(2)}</p>`;
        if (!document.querySelector('#avg-waiting-time')) {
            // Αν δεν υπάρχει το μήνυμα, προσθέστε το
            stepHistoryContainer.insertAdjacentHTML('afterbegin', `<div id="avg-waiting-time">${avgWaitingTimeBox}</div>`);
        } else {
            // Αν υπάρχει, ενημερώστε το
            document.querySelector('#avg-waiting-time').innerHTML = avgWaitingTimeBox;
        }

        // Δημιουργία του ενεργού κουτιού διεργασίας
        const activeProcess = `<span class="queue-process active">P${stepProcesses[stepIndex]}</span>`;
        const waitingQueue = stepProcesses
            .slice(stepIndex + 1)
            .map((p) => `<span class="queue-process">P${p}</span>`)
            .join(' -> ') || 'Καμία';

        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${start}</div>
            <div>Εκτελείται: ${activeProcess}</div>
            <div>Αναμονή: ${waitingQueue}</div>
        `;
        stepHistoryContainer.appendChild(stepBox); // Προσθέστε την ουρά κάτω από το μήνυμα

        // Ενημέρωση του πεντάστηλου πίνακα
        const tableContainer = document.getElementById('seek-count');
        if (!document.querySelector('#fcfs-table')) {
            let output = "<table id='fcfs-table' border='1' style='border-collapse: collapse; width: 100%;'>";
            output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
            tableContainer.innerHTML = output + "</table>";
        }

        const table = document.querySelector('#fcfs-table');
        const newRow = table.insertRow(-1);
        newRow.innerHTML = `
            <td>${stepProcesses[stepIndex]}</td>
            <td>${stepBurstTime[stepIndex]}</td>
            <td>${stepArrivalTime[stepIndex]}</td>
            <td>${stepWaitingTime[stepIndex]}</td>
            <td>${stepTurnAroundTime[stepIndex]}</td>
        `;

        // Ενημέρωση χρόνου και δείκτη
        stepCurrentTime = end;
        stepIndex++;

        if (stepIndex === stepProcesses.length) {
            alert('Η εκτέλεση ολοκληρώθηκε!');
            document.getElementById('nextStepButton').remove();
            document.getElementById("resetButton").style.display = "inline-block";
        }
    } else {
        alert('Η εκτέλεση έχει ήδη ολοκληρωθεί!');
    }
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

function resetFCFS() {
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
