
const schedule = []; // Πίνακας προγραμματισμού για το Gantt Chart

function runRoundRobinCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;
    const quantumInput = document.getElementById('quantum').value;

    if (!btInput || !atInput || !quantumInput) {
        alert('Παρακαλώ εισάγετε όλους τους χρόνους εκτέλεσης, άφιξης και το quantum!');
        return;
    }

    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    const quantum = parseInt(quantumInput);
    const n = burstTime.length;

    if (arrivalTime.length !== n) {
        alert('Τα πεδία χρόνου εκτέλεσης και άφιξης πρέπει να έχουν ίσο αριθμό τιμών!');
        return;
    }

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
            // Αν είναι νέα διεργασία, προσθήκη στο schedule
            schedule.push({
                process: processes[currentProcess],
                startTime: currentTime - executionTime,
                endTime: currentTime,
            });
        } else {
            // Αν συνεχίζεται η ίδια διεργασία, ενημέρωση της ώρας λήξης
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
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += "</table>";

    document.getElementById('seek-count').innerHTML = output;
    document.getElementById('stepHistory').innerHTML = `
        <p>Μέσος Χρόνος Αναμονής : ${averageWaitingTime.toFixed(2)}</p>
        ${queueOutput}
    `;
    document.getElementById("resetButton").style.display = "inline-block";
    drawGanttChart(schedule);

}

function drawGanttChart(schedule) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');

    if (schedule.length === 0) {
        console.error("Το Gantt Chart δεν μπορεί να σχεδιαστεί, το schedule είναι κενό.");
        return;
    }

    // Υπολογισμός της συνολικής διάρκειας
    const totalBurstTime = schedule[schedule.length - 1].endTime;

    // Λήψη του διαθέσιμου πλάτους από το container του καμβά
    const containerWidth = canvas.parentElement.clientWidth; // Το πλάτος του container
    const scaleFactor = containerWidth / totalBurstTime; // Κλίμακα χρόνου σε pixels
    const barHeight = 40; // Ύψος κάθε μπάρας
    const minBarWidth = 50; // Ελάχιστο πλάτος για τη μπάρα (ώστε να χωράει η ετικέτα)

    // Καθορισμός πλάτους καμβά ανάλογα με τη συνολική διάρκεια
    canvas.width = Math.max(containerWidth, totalBurstTime * minBarWidth);
    canvas.height = barHeight + 60; // Προσθήκη περιθωρίου για καλύτερη εμφάνιση

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentX = 0;
    ctx.font = '12px Arial';

    schedule.forEach(({ process, startTime, endTime }) => {
        const duration = endTime - startTime;
        const barWidth = Math.max(duration * scaleFactor, minBarWidth); // Χρήση ελάχιστου πλάτους

        // Σχεδίαση μπάρας
        ctx.fillStyle = `hsl(${(process * 60) % 360}, 70%, 70%)`; // Χρώμα ανά διεργασία
        ctx.fillRect(currentX, 50, barWidth, barHeight);

        // Ετικέτα διεργασίας μέσα στη μπάρα
        const label = `P${process}`;
        const labelWidth = ctx.measureText(label).width;

        ctx.fillStyle = '#000'; // Χρώμα ετικέτας
        ctx.fillText(label, currentX + barWidth / 2 - labelWidth / 2, 75); // Τοποθέτηση στο κέντρο της μπάρας

        currentX += barWidth; // Ενημέρωση της θέσης X
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

    if (stepBurstTime.length !== stepArrivalTime.length || isNaN(stepQuantum) || stepQuantum <= 0) {
        alert('Οι χρόνοι εκτέλεσης, άφιξης και quantum πρέπει να έχουν σωστές τιμές!');
        return;
    }

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

    if (stepQueue.length === 0) {
        // Αν δεν υπάρχουν διεργασίες στην ουρά, προχωράμε στον επόμενο χρόνο
        stepCurrentTime++;
        const stepBox = document.createElement('div');
        stepBox.classList.add('step-box');
        stepBox.innerHTML = `
            <div class="step-time">Χρονική στιγμή: ${stepCurrentTime}</div>
            <div>Καμία διεργασία διαθέσιμη. Αναμονή...</div>
        `;
        document.getElementById('stepHistory').appendChild(stepBox);

        // Ελέγχουμε αν έχουν έρθει νέες διεργασίες
        for (let i = 0; i < n; i++) {
            if (
                stepArrivalTime[i] <= stepCurrentTime &&
                stepRemainingTime[i] > 0 &&
                !stepQueue.includes(i)
            ) {
                stepQueue.push(i);
            }
        }

        return;
    }

    // Πάρε την πρώτη διεργασία από την ουρά
    const currentProcess = stepQueue.shift();

    // Εκτέλεση της διεργασίας για το quantum ή τον υπόλοιπο χρόνο
    const executionTime = Math.min(stepQuantum, stepRemainingTime[currentProcess]);
    stepRemainingTime[currentProcess] -= executionTime;
    stepCurrentTime += executionTime;

    // Ενημέρωση του schedule
    if (
        schedule.length === 0 ||
        schedule[schedule.length - 1].process !== stepProcesses[currentProcess]
    ) {
        schedule.push({
            process: stepProcesses[currentProcess],
            startTime: stepCurrentTime - executionTime,
            endTime: stepCurrentTime,
        });
    } else {
        schedule[schedule.length - 1].endTime = stepCurrentTime;
    }

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

    // Δημιουργία του ενεργού κουτιού διεργασίας
    const activeProcess = `<span class="queue-process active">P${stepProcesses[currentProcess]}</span>`;
    const waitingQueue = stepQueue
        .map((i) => `<span class="queue-process">P${stepProcesses[i]}</span>`)
        .join(' -> ') || 'Καμία';

    const stepBox = document.createElement('div');
    stepBox.classList.add('step-box');
    stepBox.innerHTML = `
        <div class="step-time">Χρονική στιγμή: ${stepCurrentTime - executionTime}</div>
        <div>Εκτελείται: ${activeProcess}</div>
        <div>Αναμονή: ${waitingQueue}</div>
    `;
    document.getElementById('stepHistory').appendChild(stepBox);

    // Ελέγξτε αν όλες οι διεργασίες έχουν ολοκληρωθεί
    if (stepCompleted.every((completed) => completed)) {
        const endBox = document.createElement('div');
        endBox.classList.add('step-box');
        endBox.innerHTML = `
            <div class="step-time">Τέλος Εκτέλεσης</div>
            <div>Όλες οι διεργασίες ολοκληρώθηκαν!</div>
        `;
        document.getElementById('stepHistory').appendChild(endBox);

        const averageWaitingTime = stepWaitingTime.reduce((sum, time) => sum + time, 0) / n;
        const avgWaitingTimeBox = `<p>Μέσος Χρόνος Αναμονής : ${averageWaitingTime.toFixed(2)}</p>`;
        document.getElementById('stepHistory').insertAdjacentHTML('afterbegin', avgWaitingTimeBox);

        alert('Η εκτέλεση ολοκληρώθηκε!');

        // Σχεδιάστε το Gantt Chart στο τέλος
        drawGanttChart(schedule);

        document.getElementById('nextStepButton').remove();
        document.getElementById("resetButton").style.display = "inline-block";
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
  