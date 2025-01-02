
const schedule = []; // Πίνακας προγραμματισμού για το Gantt Chart

function runRoundRobinCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const quantumInput = document.getElementById('quantum').value;



    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const quantum = parseInt(quantumInput);
    const n = burstTime.length;


    const processes = Array.from({ length: n }, (_, i) => i + 1);
    const remainingBurstTime = [...burstTime];
    const wt = new Array(n).fill(0);
    const tat = new Array(n).fill(0);

    let currentTime = 0;
    let completed = 0;
    let queue = [];
    let visited = new Array(n).fill(false);
    let queueOutput = '';

    // Αρχικοποίηση: προσθήκη διεργασιών που φτάνουν στη χρονική στιγμή 0
    for (let i = 0; i < n; i++) {
        if (arrivalTime[i] <= currentTime && !visited[i]) {
            queue.push(i);
            visited[i] = true;
        }
    }

    while (completed < n) {
        if (queue.length === 0) {
            currentTime++;
            // Προσθήκη νέων διεργασιών αν φτάσουν
            for (let i = 0; i < n; i++) {
                if (arrivalTime[i] <= currentTime && !visited[i]) {
                    queue.push(i);
                    visited[i] = true;
                }
            }
            continue;
        }

        const currentProcess = queue.shift();

        // Εμφάνιση της ουράς διεργασιών
        const activeProcess = `<span class="queue-process active">P${processes[currentProcess]}</span>`;
        const waitingQueue = queue
            .map((i) => `<span class="queue-process">P${processes[i]}</span>`)
            .join(' -> ') || 'Καμία';

        queueOutput += `
            <div class="step-box">
                <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
                <div>Εκτελείται: ${activeProcess}</div>
                <div>Αναμονή: ${waitingQueue}</div>
            </div>
        `;

        // Εκτέλεση για το quantum ή για το υπόλοιπο burst time
        const executionTime = Math.min(quantum, remainingBurstTime[currentProcess]);
        currentTime += executionTime;
        remainingBurstTime[currentProcess] -= executionTime;
        if (
            schedule.length === 0 ||
            schedule[schedule.length - 1].process !== processes[currentProcess]
        ) {
            schedule.push({
                process: processes[currentProcess],
                startTime: currentTime - executionTime,
                endTime: currentTime,
            });
        } else {
            schedule[schedule.length - 1].endTime = currentTime;
        }
        
        
        // Αν ολοκληρώθηκε η διεργασία
        if (remainingBurstTime[currentProcess] === 0) {
            completed++;
            tat[currentProcess] = currentTime - arrivalTime[currentProcess];
            wt[currentProcess] = tat[currentProcess] - burstTime[currentProcess];
        } else {
            queue.push(currentProcess); // Επιστροφή της διεργασίας στην ουρά
        }

        // Προσθήκη νέων διεργασιών που φτάνουν στο currentTime
        for (let i = 0; i < n; i++) {
            if (arrivalTime[i] <= currentTime && !visited[i]) {
                queue.push(i);
                visited[i] = true;
            }
        }
    }

    // Υπολογισμός μέσου χρόνου αναμονής
    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

    // Δημιουργία πίνακα αποτελεσμάτων
    let output = "<table border='1'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>P${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    document.getElementById('seek-count').innerHTML = output;
    document.getElementById('stepHistory').innerHTML = `
        <p><strong>Μέσος Χρόνος Αναμονής :<\strong> ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;
    document.getElementById("resetButton").style.display = "inline-block";
    drawGanttChart(schedule);
        // Καθαρισμός καμβά
        const canvas = document.getElementById('seekCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

}

function runRoundRobinCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const quantumInput = document.getElementById('quantum').value;

    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const quantum = parseInt(quantumInput);
    const n = burstTime.length;

    const processes = Array.from({ length: n }, (_, i) => i + 1);
    const remainingBurstTime = [...burstTime];
    const wt = new Array(n).fill(0);
    const tat = new Array(n).fill(0);

    let currentTime = 0;
    let completed = 0;
    let queue = [];
    let visited = new Array(n).fill(false);
    let queueOutput = '';
    const schedule = []; // Τοπική μεταβλητή για το Gantt Chart

    // Αρχικοποίηση: προσθήκη διεργασιών που φτάνουν στη χρονική στιγμή 0
    for (let i = 0; i < n; i++) {
        if (arrivalTime[i] <= currentTime && !visited[i]) {
            queue.push(i);
            visited[i] = true;
        }
    }

    while (completed < n) {
        if (queue.length === 0) {
            currentTime++;
            // Προσθήκη νέων διεργασιών αν φτάσουν
            for (let i = 0; i < n; i++) {
                if (arrivalTime[i] <= currentTime && !visited[i]) {
                    queue.push(i);
                    visited[i] = true;
                }
            }
            continue;
        }

        const currentProcess = queue.shift();

        // Εμφάνιση της ουράς διεργασιών
        const activeProcess = `<span class="queue-process active">P${processes[currentProcess]}</span>`;
        const waitingQueue = queue
            .map((i) => `<span class="queue-process">P${processes[i]}</span>`)
            .join(' -> ') || 'Καμία';

        queueOutput += `
            <div class="step-box">
                <div class="step-time">Χρονική στιγμή: ${currentTime}</div>
                <div>Εκτελείται: ${activeProcess}</div>
                <div>Αναμονή: ${waitingQueue}</div>
            </div>
        `;

        // Εκτέλεση για το quantum ή για το υπόλοιπο burst time
        const executionTime = Math.min(quantum, remainingBurstTime[currentProcess]);
        currentTime += executionTime;
        remainingBurstTime[currentProcess] -= executionTime;
        if (
            schedule.length === 0 ||
            schedule[schedule.length - 1].process !== processes[currentProcess]
        ) {
            schedule.push({
                process: processes[currentProcess],
                startTime: currentTime - executionTime,
                endTime: currentTime,
            });
        } else {
            schedule[schedule.length - 1].endTime = currentTime;
        }

        // Αν ολοκληρώθηκε η διεργασία
        if (remainingBurstTime[currentProcess] === 0) {
            completed++;
            tat[currentProcess] = currentTime - arrivalTime[currentProcess];
            wt[currentProcess] = tat[currentProcess] - burstTime[currentProcess];
        } else {
            queue.push(currentProcess); // Επιστροφή της διεργασίας στην ουρά
        }

        // Προσθήκη νέων διεργασιών που φτάνουν στο currentTime
        for (let i = 0; i < n; i++) {
            if (arrivalTime[i] <= currentTime && !visited[i]) {
                queue.push(i);
                visited[i] = true;
            }
        }
    }

    // Υπολογισμός μέσου χρόνου αναμονής
    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

    // Δημιουργία πίνακα αποτελεσμάτων
    let output = "<table border='1'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>P${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    document.getElementById('seek-count').innerHTML = output;
    document.getElementById('stepHistory').innerHTML = `
        <p><strong>Μέσος Χρόνος Αναμονής :</strong> ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;
    document.getElementById("resetButton").style.display = "inline-block";
    drawGanttChart(schedule);

   
}



function drawGanttChart(schedule) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalBurstTime = schedule[schedule.length - 1].endTime;
    const scaleFactor = canvas.parentElement.clientWidth / totalBurstTime;
    let currentX = 0;

    schedule.forEach(({ process, startTime, endTime }) => {
        const duration = endTime - startTime;
        const barWidth = Math.max(duration * scaleFactor, 50); // Ελάχιστο πλάτος

        // Σχεδίαση μπάρας
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 70%)`; // Τυχαίο χρώμα
        ctx.fillRect(currentX, 50, barWidth, 40);
        ctx.strokeRect(currentX, 50, barWidth, 40);

        // Ετικέτες
        ctx.fillStyle = '#000';
        ctx.fillText(`P${process}`, currentX + barWidth / 2 - 10, 75);
        ctx.fillText(startTime, currentX, 45);

        if (endTime === totalBurstTime) {
            ctx.fillText(endTime, currentX + barWidth - 10, 45);
        }

        currentX += barWidth;
    });
}







let stepCurrentTime = 0;
let stepProcesses = [];
let stepBurstTime = [];
let stepArrivalTime = [];
let stepQuantum = 0; // Quantum για το RR
let stepRemainingTime = [];
let stepWaitingTime = [];
let stepTurnAroundTime = [];
let stepCompleted = [];
let stepQueue = []; // Ουρά διεργασιών

function startStepByStep() {
    // Αρχικοποίηση δεδομένων από τα πεδία εισόδου
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const quantumInput = document.getElementById('quantum').value; // Quantum

    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);
    stepQuantum = parseInt(quantumInput, 10);
    const n = stepBurstTime.length;

    stepProcesses = Array.from({ length: n }, (_, i) => i + 1);
    stepRemainingTime = [...stepBurstTime];
    stepWaitingTime = new Array(n).fill(0);
    stepTurnAroundTime = new Array(n).fill(0);
    stepCompleted = new Array(n).fill(false);



    stepCurrentTime = 0;
    stepQueue = []; // Καθαρισμός της ουράς

    // Προσθέτουμε αρχικές διεργασίες στην ουρά
    for (let i = 0; i < n; i++) {
        if (stepArrivalTime[i] === 0) {
            stepQueue.push(i);
        }
    }

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

    // Έλεγχος αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (stepCompleted.every((completed) => completed)) {
        const endBox = document.createElement('div');
        endBox.classList.add('step-box');
        endBox.innerHTML = `
            <div class="step-time">Τέλος Εκτέλεσης</div>
            <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
        `;
        document.getElementById('stepHistory').appendChild(endBox);

        const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
        const avgWaitingTimeBox = `<p><strong>Μέσος Χρόνος Αναμονής :</strong> ${averageWaitingTime.toFixed(2)}</p>`;
        document.getElementById('stepHistory').insertAdjacentHTML('afterbegin', avgWaitingTimeBox);

        // Σχεδιάστε το Gantt Chart στο τέλος
        drawGanttChart(schedule);

        document.getElementById('nextStepButton').remove();
        document.getElementById("resetButton").style.display = "inline-block";
        return;
    }

    // Αν η ουρά είναι κενή, προχωράμε στον επόμενο χρόνο
    if (stepQueue.length === 0) {
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Καμία διεργασία διαθέσιμη. Αναμονή...</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);

        // Προσθήκη νέων διεργασιών που φτάνουν στη χρονική στιγμή
        for (let i = 0; i < n; i++) {
            if (
                stepArrivalTime[i] <= stepCurrentTime &&
                stepRemainingTime[i] > 0 &&
                !stepQueue.includes(i)
            ) {
                stepQueue.push(i);
            }
        }

        stepCurrentTime++; // Αύξηση της χρονικής στιγμής
        return;
    }

    // Πάρε την πρώτη διεργασία από την ουρά
    const currentProcess = stepQueue.shift();

    // Εκτέλεση της διεργασίας για το quantum ή τον υπόλοιπο χρόνο
    const executionTime = Math.min(stepQuantum, stepRemainingTime[currentProcess]);
    
    for (let t = 0; t < executionTime; t++) {
        stepCurrentTime++;

        // Ενημέρωση του schedule για κάθε χρονική στιγμή
        if (
            schedule.length === 0 ||
            schedule[schedule.length - 1].process !== stepProcesses[currentProcess]
        ) {
            schedule.push({
                process: stepProcesses[currentProcess],
                startTime: stepCurrentTime - 1,
                endTime: stepCurrentTime,
            });
        } else {
            schedule[schedule.length - 1].endTime = stepCurrentTime;
        }

        // Δημιουργία του ενεργού κουτιού διεργασίας για κάθε χρονική στιγμή
        const activeProcess = `<span class="queue-process active">P${stepProcesses[currentProcess]}</span>`;
        const waitingQueue = stepQueue
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
    }

    stepRemainingTime[currentProcess] -= executionTime;

    // Ενημέρωση αν η διεργασία ολοκληρώθηκε
    if (stepRemainingTime[currentProcess] === 0) {
        stepCompleted[currentProcess] = true;
        stepTurnAroundTime[currentProcess] =
            stepCurrentTime - stepArrivalTime[currentProcess];
        stepWaitingTime[currentProcess] =
            stepTurnAroundTime[currentProcess] - stepBurstTime[currentProcess];
    } else {
        // Επιστροφή της διεργασίας στο τέλος της ουράς
        stepQueue.push(currentProcess);
    }

    // Προσθήκη νέων διεργασιών που φτάνουν κατά τη διάρκεια εκτέλεσης
    for (let i = 0; i < n; i++) {
        if (
            stepArrivalTime[i] > stepCurrentTime - executionTime &&
            stepArrivalTime[i] <= stepCurrentTime &&
            stepRemainingTime[i] > 0 &&
            !stepQueue.includes(i)
        ) {
            stepQueue.push(i);
        }
    }
}





function createThreeColumnTable() {
    const btInput = document.getElementById('burst-time');
    const atInput = document.getElementById('arrival-time');
    const quantumInput = document.getElementById('quantum'); // Νέο πεδίο για το quantum
    const errorContainer = document.getElementById('error-container');

    const btValue = btInput.value.trim();
    const atValue = atInput.value.trim();
    const quantumValue = quantumInput.value.trim();

    // Κανονική έκφραση για έλεγχο αριθμών χωρισμένων με κόμμα χωρίς κενά
    const validFormat = /^(\d+)(,\d+)*$/;

    // Έλεγχος αν τα inputs είναι κενά
    if (!btValue || !atValue || !quantumValue) {
        errorContainer.textContent = 'Παρακαλώ συμπληρώστε τους χρόνους εκτέλεσης, τους χρόνους άφιξης και το χρονικό κβάντο!';
        errorContainer.style.display = 'block';

        // Προσθήκη της κλάσης σφάλματος
        btInput.classList.add('input-error');
        atInput.classList.add('input-error');
        quantumInput.classList.add('input-error');
        return;
    }

    // Αφαίρεση του σφάλματος αν τα πεδία δεν είναι κενά
    errorContainer.style.display = 'none';
    btInput.classList.remove('input-error');
    atInput.classList.remove('input-error');
    quantumInput.classList.remove('input-error');

    // Έλεγχος αν τα inputs περιέχουν μόνο αριθμούς χωρισμένους με κόμματα
    if (!validFormat.test(btValue) || !validFormat.test(atValue) || isNaN(quantumValue) || Number(quantumValue) <= 0) {
        errorContainer.textContent = 'Οι χρόνοι πρέπει να περιέχουν μόνο αριθμούς διαχωρισμένους με κόμμα, και το χρονικό κβάντο πρέπει να είναι θετικός αριθμός!';
        errorContainer.style.display = 'block';
        return;
    }

    // Διαχωρισμός τιμών και μετατροπή σε αριθμητικούς πίνακες
    const burstTime = btValue.split(',').map(Number);
    const arrivalTime = atValue.split(',').map(Number);
    const quantum = Number(quantumValue);

    const n = burstTime.length;

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
        errorContainer.textContent = 'Ο αριθμός των χρόνων εκτέλεσης και άφιξης πρέπει να είναι ίδιος.';
        errorContainer.style.display = 'block';
        return;
    }

    // Δημιουργία πίνακα διεργασιών
    const processes = Array.from({ length: n }, (_, i) => i + 1);

    // Δημιουργία HTML για τον πίνακα
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th></tr>";

    for (let i = 0; i < n; i++) {
        output += `<tr>
            <td>P${processes[i]}</td>
            <td>${burstTime[i]}</td>
            <td>${arrivalTime[i]}</td>
        </tr>`;
    }
    output += "</table>";

    // Εμφάνιση του πίνακα στη σελίδα
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById("runButton").style.display = "inline-block";
    document.getElementById("stepByStepBtn").style.display = "inline-block";
    document.getElementById("resetButton").style.display = "inline-block";

    // Εμφάνιση του quantum στην οθόνη
    const quantumDisplay = `<p><strong>Χρονικό Κβάντο:</strong> ${quantum}</p>`;
    document.getElementById('quantum-display').innerHTML = quantumDisplay;
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



// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton2").addEventListener("click", function () {
    const randomQuantum = Math.floor(Math.random() * 10) + 1; // Δημιουργία τυχαίου αριθμού από 1 έως 10
    document.getElementById("quantum").value = randomQuantum; // Ενημέρωση του πεδίου εισόδου για το κβάντο
});



function resetRR() {
    // Καθαρισμός των πεδίων εισόδου
    document.getElementById('burst-time').value = '';
    document.getElementById('arrival-time').value = '';
    document.getElementById('quantum').value = '';

    // Καθαρισμός του πίνακα αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = '';

    document.getElementById("sequenceLength").value = ""; // Μηδενισμός του sequence length

    // Καθαρισμός του ιστορικού βημάτων
    document.getElementById('stepHistory').innerHTML = '';
    // Καθαρισμός καμβά
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Καθαρισμός μεταβλητών
        schedule.length = 0;
        stepCurrentTime = 0;
        stepQueue = [];
        stepRemainingTime = [];
        stepWaitingTime = [];
        stepTurnAroundTime = [];
        stepCompleted = [];
    
        // Καθαρισμός πεδίων εισόδου
        document.getElementById('burst-time').value = '';
        document.getElementById('arrival-time').value = '';
        document.getElementById('quantum').value = '';
    
        // Καθαρισμός DOM στοιχείων
        document.getElementById('stepHistory').innerHTML = '';
        document.getElementById('seek-count').innerHTML = '';
        document.getElementById('quantum-display').innerHTML = '';
        document.getElementById("sequenceLength").value = "";
    
       
    
        // Απόκρυψη κουμπιών
        document.getElementById('runButton').style.display = 'none';
        document.getElementById('stepByStepBtn').style.display = 'none';
        document.getElementById('resetButton').style.display = 'none';
  

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
  