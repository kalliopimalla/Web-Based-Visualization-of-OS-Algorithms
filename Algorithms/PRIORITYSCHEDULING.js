function runPriorityCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const prInput = document.getElementById('priority').value;
    const agingRate = parseInt(document.getElementById('aging-rate-input').value || 0);
    const priorityOrder = document.getElementById('priority-order').value;
    const executionType = document.getElementById('execution-type').value;

    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const priority = prInput.split(',').map(Number);
    const n = burstTime.length;

    const remainingBurstTime = [...burstTime];
    const wt = new Array(n).fill(0);
    const tat = new Array(n).fill(0);
    const completionTime = new Array(n).fill(0);

    const schedule = [];
    let currentTime = 0;
    let completed = 0;
    let lastProcess = -1;
    let queueOutput = '';

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

        if (agingRate > 0) {
            availableProcesses.forEach((i) => {
                if (i !== lastProcess) {
                    priority[i] -= agingRate;
                }
            });
        }

        const highestPriorityIndex = availableProcesses.reduce((highest, i) => {
            if (priorityOrder === 'higher-first') {
                if (priority[i] < priority[highest]) {
                    return i;
                }
            } else {
                if (priority[i] > priority[highest]) {
                    return i;
                }
            }
            if (priority[i] === priority[highest]) {
                return arrivalTime[i] < arrivalTime[highest] ? i : highest;
            }
            return highest;
        }, availableProcesses[0]);

        if (executionType === 'non-preemptive') {
            if (lastProcess !== highestPriorityIndex) {
                const activeProcess = `<span class="queue-process active">P${highestPriorityIndex}</span>`;
                const waitingQueue = availableProcesses
                    .filter((i) => i !== highestPriorityIndex)
                    .map((i) => `<span class="queue-process">P${i}</span>`)
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

            schedule.push({
                process: highestPriorityIndex,
                startTime: currentTime,
                endTime: currentTime + remainingBurstTime[highestPriorityIndex],
            });

            currentTime += remainingBurstTime[highestPriorityIndex];
            completionTime[highestPriorityIndex] = currentTime;
            tat[highestPriorityIndex] =
                completionTime[highestPriorityIndex] - arrivalTime[highestPriorityIndex];
            wt[highestPriorityIndex] =
                tat[highestPriorityIndex] - burstTime[highestPriorityIndex];

            remainingBurstTime[highestPriorityIndex] = 0;
            completed++;
        } else {
            remainingBurstTime[highestPriorityIndex]--;
            currentTime++;

            const waitingQueue = availableProcesses
                .filter((i) => i !== highestPriorityIndex && remainingBurstTime[i] > 0)
                .map((i) => `<span class="queue-process">P${i}</span>`)
                .join(' -> ') || 'Καμία';

            queueOutput += `
                <div class="step-box">
                    <div class="step-time">Χρονική στιγμή: ${currentTime - 1}</div>
                    <div>Εκτελείται: <span class="queue-process active">P${highestPriorityIndex}</span></div>
                    <div>Αναμονή: ${waitingQueue}</div>
                </div>
            `;

            if (remainingBurstTime[highestPriorityIndex] === 0) {
                completed++;
                completionTime[highestPriorityIndex] = currentTime;

                tat[highestPriorityIndex] =
                    completionTime[highestPriorityIndex] - arrivalTime[highestPriorityIndex];
                wt[highestPriorityIndex] =
                    tat[highestPriorityIndex] - burstTime[highestPriorityIndex];

                if (schedule.length > 0 && schedule[schedule.length - 1].process === highestPriorityIndex) {
                    schedule[schedule.length - 1].endTime = currentTime;
                }
            } else {
                if (
                    schedule.length === 0 ||
                    schedule[schedule.length - 1].process !== highestPriorityIndex
                ) {
                    schedule.push({
                        process: highestPriorityIndex,
                        startTime: currentTime - 1,
                        endTime: null,
                    });
                }
            }

            if (schedule.length > 0 && schedule[schedule.length - 1].process === highestPriorityIndex) {
                schedule[schedule.length - 1].endTime = currentTime;
            }
        }
    }

    const averageWaitingTime = wt.reduce((sum, time) => sum + time, 0) / n;

    let output =
        "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Προτεραιότητα</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>P${i}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${priority[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    document.getElementById('seek-count').innerHTML = output;
    document.getElementById('stepHistory').innerHTML = `
        <p><strong>Μέσος Χρόνος Αναμονής :</strong> ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;
    drawGanttChart(schedule);
}



function drawGanttChart(schedule) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    // Υπολογισμός συνολικού χρόνου
    const totalBurstTime = schedule[schedule.length - 1].endTime;

    // Δυναμικός καθορισμός πλάτους καμβά
    const scaleFactor = 10; // Pixels ανά μονάδα χρόνου
    const canvasWidth = Math.max(800, totalBurstTime * scaleFactor);
    canvas.width = canvasWidth; // Ορισμός πλάτους καμβά
    canvas.height = 150; // Σταθερό ύψος καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentX = 0; // Αρχική θέση X για τις μπάρες
    const barHeight = 40; // Ύψος μπάρας
    const labelFontSize = 12; // Μέγεθος γραμματοσειράς για ετικέτες
    const minBarWidth = 50; // Ελάχιστο πλάτος για κάθε μπάρα

    // Χάρτης για την αντιστοίχιση διεργασιών με χρώματα
    const processColors = {};
    const colorStep = 360 / schedule.length; // Βήμα για ομοιόμορφη κατανομή χρωμάτων

    for (let i = 0; i < schedule.length; i++) {
        const { process, startTime, endTime } = schedule[i];
        const duration = endTime - startTime;
        let barWidth = duration * scaleFactor;

        // Εξασφάλιση ότι κάθε μπάρα έχει ελάχιστο πλάτος
        barWidth = Math.max(barWidth, minBarWidth);

        // Ανάθεση ή ανάκτηση χρώματος για κάθε διεργασία
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

        // Σχεδίαση μπάρας διεργασίας
        ctx.fillRect(currentX, 50, barWidth, barHeight);

        // Ετικέτα διεργασίας μέσα στη μπάρα
        const label = `P${process}`;
        ctx.fillStyle = '#000';
        ctx.font = `${labelFontSize}px Arial`;
        const labelWidth = ctx.measureText(label).width;

        if (labelWidth < barWidth) {
            ctx.fillText(label, currentX + barWidth / 2 - labelWidth / 2, 75); // Τοποθέτηση στο κέντρο της μπάρας
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
let stepPriority = [];
let stepRemainingTime = [];
let stepSchedule = [];
let stepCompleted = 0;
let stepWaitingTime = [];
let stepTurnAroundTime = [];
let stepCompletedProcesses = [];
let stepLastProcess = -1;

function startStepByStep() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const prInput = document.getElementById('priority').value;

    // Αρχικοποίηση μεταβλητών
    stepBurstTime = btInput.split(',').map(Number);
    stepArrivalTime = atInput.split(',').map(Number);
    stepPriority = prInput.split(',').map(Number);
    stepProcesses = Array.from({ length: stepBurstTime.length }, (_, i) => i);
    stepRemainingTime = [...stepBurstTime];
    stepCompletedProcesses = new Array(stepBurstTime.length).fill(false);
    stepWaitingTime = new Array(stepBurstTime.length).fill(0);
    stepTurnAroundTime = new Array(stepBurstTime.length).fill(0);
    stepCurrentTime = 0;
    stepCompleted = 0;
    stepSchedule = [];
    stepLastProcess = -1;

    // Καθαρισμός ιστορικού και εμφάνιση κουμπιού "Επόμενο Βήμα"
    document.getElementById('stepHistory').innerHTML = '';
    document.getElementById('seek-count').innerHTML = '';
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Επόμενο Βήμα';
    nextButton.id = 'nextStepButton';
    nextButton.onclick = stepByStepExecution;
    document.getElementById('stepHistory').appendChild(nextButton);

    // Δημιουργία αρχικού πίνακα
    createResultTable();

    // Έναρξη πρώτου βήματος
    stepByStepExecution();
}

function stepByStepExecution() {
    const n = stepProcesses.length;
    const priorityOrder = document.getElementById('priority-order').value;
    const agingRate = parseInt(document.getElementById('aging-rate-input').value || 0);
    const executionType = document.getElementById('execution-type').value;

    // Βρες τις διαθέσιμες διεργασίες
    const availableProcesses = stepProcesses
        .map((_, i) => (stepArrivalTime[i] <= stepCurrentTime && stepRemainingTime[i] > 0 ? i : -1))
        .filter((i) => i !== -1);

    if (availableProcesses.length === 0) {
        stepCurrentTime++;
        return;
    }

    // Ενημέρωση προτεραιοτήτων με aging
    if (agingRate > 0) {
        availableProcesses.forEach((i) => {
            if (i !== stepLastProcess) {
                stepPriority[i] -= agingRate; // Μειώνεται η προτεραιότητα με το aging rate
            }
        });
    }

    // Βρες τη διεργασία με την υψηλότερη προτεραιότητα
    const highestPriorityIndex = availableProcesses.reduce((highest, i) => {
        if (priorityOrder === 'higher-first') {
            if (stepPriority[i] < stepPriority[highest]) {
                return i;
            }
        } else {
            if (stepPriority[i] > stepPriority[highest]) {
                return i;
            }
        }
        if (stepPriority[i] === stepPriority[highest]) {
            return stepArrivalTime[i] < stepArrivalTime[highest] ? i : highest;
        }
        return highest;
    }, availableProcesses[0]);

    // Μη Προεκχωρισιμή Λογική
    if (executionType === 'non-preemptive') {
        if (stepLastProcess !== highestPriorityIndex) {
            stepSchedule.push({
                process: highestPriorityIndex,
                startTime: stepCurrentTime,
                endTime: stepCurrentTime + stepRemainingTime[highestPriorityIndex],
            });
        }

        stepCurrentTime += stepRemainingTime[highestPriorityIndex];
        stepRemainingTime[highestPriorityIndex] = 0;

        stepTurnAroundTime[highestPriorityIndex] =
            stepCurrentTime - stepArrivalTime[highestPriorityIndex];
        stepWaitingTime[highestPriorityIndex] =
            stepTurnAroundTime[highestPriorityIndex] - stepBurstTime[highestPriorityIndex];

        stepCompleted++;
        updateResultTable(highestPriorityIndex);
    } else {
        // Προεκχωρισιμή Λογική
        stepRemainingTime[highestPriorityIndex]--;
        stepCurrentTime++;

        if (stepRemainingTime[highestPriorityIndex] === 0) {
            stepCompleted++;
            stepTurnAroundTime[highestPriorityIndex] =
                stepCurrentTime - stepArrivalTime[highestPriorityIndex];
            stepWaitingTime[highestPriorityIndex] =
                stepTurnAroundTime[highestPriorityIndex] - stepBurstTime[highestPriorityIndex];
            updateResultTable(highestPriorityIndex);

            stepSchedule.push({
                process: highestPriorityIndex,
                startTime: stepCurrentTime - 1,
                endTime: stepCurrentTime,
            });
        }
    }

    // Ενημέρωση ουράς διεργασιών και εμφάνιση κατάστασης
    const activeProcess = `<span class="queue-process active">P${highestPriorityIndex}</span>`;
    const waitingQueue = availableProcesses
        .filter((i) => i !== highestPriorityIndex && stepRemainingTime[i] > 0)
        .map((i) => `<span class="queue-process">P${i}</span>`)
        .join(' -> ') || 'Καμία';

    const stepBox = document.createElement('div');
    stepBox.classList.add('step-box');
    stepBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
        <div>Εκτελείται: ${activeProcess}</div>
        <div>Αναμονή: ${waitingQueue}</div>
    `;
    document.getElementById('stepHistory').appendChild(stepBox);

    // Έλεγχος αν όλες οι διεργασίες ολοκληρώθηκαν
    if (stepCompleted === n) {
        const endBox = document.createElement('div');
        endBox.classList.add('step-box');
        endBox.innerHTML = `
            <div class="step-time">Τέλος Εκτέλεσης</div>
            <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
        `;
        document.getElementById('stepHistory').appendChild(endBox);

        const avgWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
        const avgBox = document.createElement('p');
        avgBox.innerHTML = `<strong>Μέσος Χρόνος Αναμονής :</strong> ${avgWaitingTime.toFixed(2)}`;
        document.getElementById('seek-count').appendChild(avgBox);

        drawGanttChart(stepSchedule);

        // Απόκρυψη κουμπιού "Επόμενο Βήμα"
        document.getElementById('nextStepButton').remove();
    }
}


function createResultTable() {
    const n = stepProcesses.length;

    let output = "<table border='1' style='border-collapse: collapse; width: 100%;' id='resultTable'>";
    output += "<tr><th>Διεργασίες</th><th>Χρόνος Εκτέλεσης</th><th>Χρόνος Άφιξης</th><th>Προτεραιότητα</th><th>Χρόνος Αναμονής</th><th>Χρόνος Επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr id="row-${i}">
            <td>P${i}</td>
            <td>${stepBurstTime[i]}</td>
            <td>${stepArrivalTime[i]}</td>
            <td>${stepPriority[i]}</td>
            <td>-</td>
            <td>-</td>
        </tr>`;
    }
    output += "</table>";
    document.getElementById('seek-count').innerHTML = output;
}

function updateResultTable(processIndex) {
    const row = document.getElementById(`row-${processIndex}`);
    const waitingTimeCell = row.children[4];
    const turnAroundTimeCell = row.children[5];

    waitingTimeCell.textContent = stepWaitingTime[processIndex];
    turnAroundTimeCell.textContent = stepTurnAroundTime[processIndex];
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
function generateRandomPrioritySequence(length, order = 'higher-first') {
    // Δημιουργία σειράς [1, 2, ..., length]
    let sequence = Array.from({ length }, (_, i) => i + 1);

    // Ανακάτεμα της σειράς (Fisher-Yates Shuffle)
    for (let i = sequence.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }

    // Ταξινόμηση ανάλογα με την επιλογή
    if (order === 'higher-first') {
        sequence.sort((a, b) => a - b); // Μικρότεροι αριθμοί πρώτα
    } else if (order === 'lower-first') {
        sequence.sort((a, b) => b - a); // Μεγαλύτεροι αριθμοί πρώτα
    }

    return sequence;
}

// Σύνδεση της λειτουργίας με το κουμπί
document.getElementById("generateSequenceButton2").addEventListener("click", function () {
    const burstInput = document.getElementById("burst-time").value; // Παίρνουμε το μήκος από το burst-time
    const processCount = burstInput.split(",").length; // Υπολογισμός αριθμού διεργασιών

    const order = document.getElementById("priority-order").value; // Παίρνουμε την επιλογή από το dropdown
    const randomSequence = generateRandomPrioritySequence(processCount, order); // Δημιουργία τυχαίας σειράς

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
  