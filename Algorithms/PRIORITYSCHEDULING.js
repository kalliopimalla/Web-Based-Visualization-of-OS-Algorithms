function runPriorityCPU() {
    // Είσοδοι
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const prInput = document.getElementById('priority').value;
    const schedule = []; // Πίνακας προγραμματισμού για το Gantt Chart

  
    // Διαχωρισμός δεδομένων σε πίνακες
    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const priority = prInput.split(',').map(Number);
    const n = burstTime.length;


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
        if (
            schedule.length === 0 ||
            schedule[schedule.length - 1].process !== processes[highestPriorityIndex]
        ) {
            // Αν είναι νέα διεργασία, προσθήκη στο schedule
            schedule.push({
                process: processes[highestPriorityIndex],
                startTime: currentTime - 1,
                endTime: currentTime,
            });
        } else {
            // Ενημέρωση της λήξης αν είναι η ίδια διεργασία
            schedule[schedule.length - 1].endTime = currentTime;
        }
        

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
        output += `<tr><td>P${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${priority[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";
    
    // Εμφάνιση αποτελεσμάτων
    document.getElementById('seek-count').innerHTML = output;
    document.getElementById('stepHistory').innerHTML = `
        <p><strong>Μέσος Χρόνος Αναμονής :</strong> ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;
    // Δημιουργία του Gantt Chart
drawGanttChart(schedule);

    document.getElementById("resetButton").style.display = "inline-block";
}


function drawGanttChart(schedule) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Υπολογισμός συνολικής διάρκειας
    const totalBurstTime = schedule[schedule.length - 1].endTime;

    // Ρυθμίσεις καμβά
    const baseWidth = 800; // Πλάτος καμβά
    const scaleFactor = baseWidth / totalBurstTime; // Κλίμακα χρόνου
    canvas.width = baseWidth;
    canvas.height = 150; // Αύξηση ύψους για επιπλέον ετικέτες
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentX = 0; // Αρχική θέση X για τις μπάρες
    const barHeight = 40; // Ύψος μπάρας
    const labelFontSize = 12; // Μέγεθος γραμματοσειράς για ετικέτες

    // Χάρτης για την αντιστοίχιση διεργασιών με χρώματα
    const processColors = {};

    for (let i = 0; i < schedule.length; i++) {
        const { process, startTime, endTime } = schedule[i];
        const duration = endTime - startTime;
        const barWidth = duration * scaleFactor;

        // Ανάθεση ή ανάκτηση χρώματος για κάθε διεργασία
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
        const labelWidth = ctx.measureText(label).width;

        if (labelWidth < barWidth) {
            ctx.fillText(label, currentX + barWidth / 2 - labelWidth / 2, 75); // Κέντρο μπάρας
        }

        // Εμφάνιση χρόνου εκκίνησης κάτω από την αριστερή άκρη της μπάρας
        ctx.fillStyle = '#000';
        ctx.fillText(startTime, currentX, 45); // Χρόνος εκκίνησης

        currentX += barWidth; // Ενημέρωση της θέσης X
    }

    // Εμφάνιση χρόνου λήξης της τελευταίας διεργασίας στο τέλος
    const lastEndTime = schedule[schedule.length - 1].endTime;
    ctx.fillText(lastEndTime, currentX, 45); // Χρόνος λήξης
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
let stepSchedule = [];

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
    
    if (
        stepSchedule.length === 0 ||
        stepSchedule[stepSchedule.length - 1].process !== stepProcesses[highestPriorityIndex]
    ) {
        // Αν είναι νέα διεργασία, προσθήκη στο schedule
        stepSchedule.push({
            process: stepProcesses[highestPriorityIndex],
            startTime: stepCurrentTime - 1,
            endTime: stepCurrentTime,
        });
    } else {
        // Ενημέρωση της λήξης αν είναι η ίδια διεργασία
        stepSchedule[stepSchedule.length - 1].endTime = stepCurrentTime;
    }
    
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
            <td>P${stepProcesses[highestPriorityIndex]}</td>
            <td>${stepBurstTime[highestPriorityIndex]}</td>
            <td>${stepArrivalTime[highestPriorityIndex]}</td>
            <td>${stepPriority[highestPriorityIndex]}</td>
            <td>${stepWaitingTime[highestPriorityIndex]}</td>
            <td>${stepTurnAroundTime[highestPriorityIndex]}</td>
        `;
    }

    // Ελέγξτε αν όλες οι διεργασίες έχουν ολοκληρωθεί
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
        const avgWaitingTimeBox = `<p><strong>Μέσος Χρόνος Αναμονής : </strong>${averageWaitingTime.toFixed(2)}</p>`;
        document.getElementById('stepHistory').insertAdjacentHTML('afterbegin', avgWaitingTimeBox);
        
        
        // Κλήση του Gantt Chart
        drawGanttChart(stepSchedule);

      
        document.getElementById('nextStepButton').remove();
        document.getElementById("resetButton").style.display = "inline-block";
    }
}


function createThreeColumnTable() {
    const btInput = document.getElementById('burst-time');
    const atInput = document.getElementById('arrival-time');
    const prInput = document.getElementById('priority');
    const errorContainer = document.getElementById('error-container');

    const btValue = btInput.value.trim();
    const atValue = atInput.value.trim();
    const prValue = prInput.value.trim();

    // Κανονική έκφραση για έλεγχο αριθμών χωρισμένων με κόμμα χωρίς κενά
    const validFormat = /^(\d+)(,\d+)*$/;

    // Έλεγχος αν τα inputs είναι κενά
    if (!btValue || !atValue || !prValue) {
        errorContainer.textContent = 'Παρακαλώ συμπληρώστε τόσο τους χρόνους εκτέλεσης, τους χρόνους άφιξης όσο και τις προτεραιότητες!';
        errorContainer.style.display = 'block';

        // Προσθήκη της κλάσης σφάλματος
        btInput.classList.add('input-error');
        atInput.classList.add('input-error');
        prInput.classList.add('input-error');
        return;
    }

    // Αφαίρεση του σφάλματος αν τα πεδία δεν είναι κενά
    errorContainer.style.display = 'none';
    btInput.classList.remove('input-error');
    atInput.classList.remove('input-error');
    prInput.classList.remove('input-error');

    // Έλεγχος αν τα inputs περιέχουν μόνο αριθμούς χωρισμένους με κόμματα
    if (!validFormat.test(btValue) || !validFormat.test(atValue) || !validFormat.test(prValue)) {
        errorContainer.textContent = 'Τα πεδία πρέπει να περιέχουν μόνο αριθμούς διαχωρισμένους με κόμμα.';
        errorContainer.style.display = 'block';
        return;
    }

    // Διαχωρισμός τιμών και μετατροπή σε αριθμητικούς πίνακες
    const burstTime = btValue.split(',').map(Number);
    const arrivalTime = atValue.split(',').map(Number);
    const priority = prValue.split(',').map(Number);

    const n = burstTime.length;

        // Έλεγχος αν το μήκος των ακολουθιών υπερβαίνει το όριο των 100
if (burstTime.length > 100 || arrivalTime.length > 100 || priority.length > 100)  {
    errorContainer.textContent = 'Το μήκος των ακολουθιών δεν πρέπει να υπερβαίνει τα 100!';
    errorContainer.style.display = 'block';
    btInput.classList.add('input-error');
    atInput.classList.add('input-error');
    prInput.classList.add('input-error');
    return;
}




    // Έλεγχος αν τα μήκη των πινάκων ταιριάζουν
    if (burstTime.length !== arrivalTime.length || burstTime.length !== priority.length) {
        errorContainer.textContent = 'Ο αριθμός των χρόνων εκτέλεσης, άφιξης και προτεραιοτήτων πρέπει να είναι ίδιος.';
        errorContainer.style.display = 'block';
        return;
    }

    // Δημιουργία πίνακα διεργασιών
    const processes = Array.from({ length: n }, (_, i) => i + 1);

    // Δημιουργία HTML για τον πίνακα
    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Προτεραιότητα</th></tr>";
    
    for (let i = 0; i < n; i++) {
        output += `<tr>
            <td>P${processes[i]}</td>
            <td>${burstTime[i]}</td>
            <td>${arrivalTime[i]}</td>
            <td>${priority[i]}</td>
        </tr>`;
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
  