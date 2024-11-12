// Function to find the waiting time for all processes
function findWaitingTime(processes, n, bt, wt, at) {
    wt[0] = 0;

    for (let i = 1; i < n; i++) {
        wt[i] = bt[i - 1] + wt[i - 1] + at[i - 1] - at[i];
        if (wt[i] < 0) {
            wt[i] = 0; // Αν ο χρόνος αναμονής είναι αρνητικός, τότε μηδενίζεται
        }
    }
}

function findTurnAroundTime(processes, n, bt, wt, tat) {
    for (let i = 0; i < n; i++) {
        tat[i] = bt[i] + wt[i];
    }
}

function runFCFSCPU() {
    const btInput = document.getElementById('burst-time').value;
    const atInput = document.getElementById('arrival-time').value;

    const burstTime = btInput.split(',').map(Number);
    const arrivalTime = atInput.split(',').map(Number);
    
    const n = burstTime.length;
    let wt = new Array(n);
    let tat = new Array(n);
    let processes = Array.from({ length: n }, (_, i) => i + 1);

    findWaitingTime(processes, n, burstTime, wt, arrivalTime);
    findTurnAroundTime(processes, n, burstTime, wt, tat);

    const totalWt = wt.reduce((a, b) => a + b, 0);
    const averageWt = totalWt / n;

    let output = "<table border='1' style='border-collapse: collapse; width: 100%;'><tr><th>Διεργασίες</th><th>Χρόνος εκτέλεσης</th><th>Χρόνος άφιξης</th><th>Χρόνος αναμονής</th><th>Χρόνος επιστροφής</th></tr>";
    for (let i = 0; i < n; i++) {
        output += `<tr><td>${processes[i]}</td><td>${burstTime[i]}</td><td>${arrivalTime[i]}</td><td>${wt[i]}</td><td>${tat[i]}</td></tr>`;
    }
    output += `</table><br>Μέσος χρόνος αναμονής = ${averageWt.toFixed(2)}`;
    document.getElementById('seek-count').innerHTML = output;

    drawGanttChart(processes, burstTime, arrivalTime, wt);
}
 

function drawGanttChart(processes, bt, at, wt) {
    const canvas = document.getElementById('seekCanvas');
    const ctx = canvas.getContext('2d');
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F']; // Χρώματα για τις διεργασίες
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let currentTime = 0;
    for (let i = 0; i < processes.length; i++) {
        const start = Math.max(currentTime, at[i]);
        const end = start + bt[i];
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(start * 20, 50, (end - start) * 20, 40);
        
        ctx.fillStyle = '#000';
        ctx.fillText(`P${processes[i]}`, (start + end) / 2 * 20 - 10, 75);
        
        currentTime = end;
    }
}
