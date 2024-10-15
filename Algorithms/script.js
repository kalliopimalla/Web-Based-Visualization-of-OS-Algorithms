function runFCFS() {
    // Λήψη της ουράς διεργασιών και της θέσης κεφαλής από τον χρήστη
    var processQueueInput = document.getElementById('process-queue').value;
    var headPositionInput = parseInt(document.getElementById('head-position').value);

    // Μετατροπή της ουράς διεργασιών σε πίνακα αριθμών
    var arr = processQueueInput.split(',').map(Number);

    // Έλεγχος αν η είσοδος είναι έγκυρη
    if (arr.length === 0 || isNaN(headPositionInput)) {
        alert('Παρακαλώ εισάγετε έγκυρες τιμές για την ουρά διεργασιών και τη θέση κεφαλής.');
        return;
    }

    // Κλήση της συνάρτησης FCFS με τις τιμές που εισήγαγε ο χρήστης
    FCFS(arr, headPositionInput);
}

// Javascript program to demonstrate
// FCFS Disk Scheduling algorithm
function FCFS(arr, head) {
    var seek_count = 0;
    var distance, cur_track;
    var sequence = '';

    for (var i = 0; i < arr.length; i++) {
        cur_track = arr[i];

        // Υπολογισμός απόστασης
        distance = Math.abs(cur_track - head);

        // Αύξηση του συνολικού αριθμού των seek operations
        seek_count += distance;

        // Το τρέχον track γίνεται η νέα κεφαλή
        head = cur_track;

        // Προσθήκη στο sequence
        sequence += '<div class="disk-track">' + cur_track + '</div>';
    }

    // Εμφάνιση του συνολικού αριθμού seek operations
    document.getElementById('seek-count').textContent =
        'Συνολικός αριθμός seek operations = ' + seek_count;

    // Εμφάνιση της σειράς εξυπηρέτησης
    document.getElementById('seek-sequence').innerHTML = 
        'Η σειρά εξυπηρέτησης είναι: <br>' + sequence;
}
