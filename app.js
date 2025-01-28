document.addEventListener("DOMContentLoaded", ()=> {
    const storedTask = JSON.parse(localStorage.getItem('tasks'));
    if(storedTask){
        storedTask.forEach((task)=> tasks.push(task));
        updateTaskList();
        updateStats();
    }
    const storedReminders = JSON.parse(localStorage.getItem('reminders'));
    if (storedReminders) {
        reminders.push(...storedReminders);
        updateReminderTable();
    }
});



let tasks = [];
let reminders = [];

const saveTasks = ()=>{
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

const saveReminders = () => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
};

const addTask = () => {
    
        const taskInput = document.getElementById('taskInput');
        const dateInput = document.getElementById("date");
        const timeInput = document.getElementById("time")
        const text = taskInput.value.trim();
        

        if (text === '') {
            alert("You must write something!");
        } else{
    
        if(text){
            tasks.push({text: text, completed: false});
            taskInput.value = "";
 
        dateInput.value = "";
        timeInput.value = "";
            updateTaskList();
            updateStats();
            saveTasks();
        }
    }
    
};



const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTaskList();
    console.log({tasks});
    updateStats();
    saveTasks();
};

const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTaskList();
    updateStats();
    saveTasks();
};

const editTask = (index) => {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = tasks[index].text;
    tasks.splice(index, 1);
    updateTaskList();
    updateStats();
    saveTasks();
}

const updateStats = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTask = tasks.length;
    const progressBar = document.getElementById('progress');

    if (totalTask === 0) {
        progressBar.style.width = `0%`; // Reset progress bar
        document.getElementById('number').innerText = `0/0`; // Update stats display
        return; // Exit early as there's nothing more to calculate
    }

    const progress = (completedTasks/totalTask) * 100;
    progressBar.style.width = `${progress}%`;
    document.getElementById('number').innerText = `${completedTasks}/${totalTask}`;

    if(tasks.length && completedTasks === totalTask){
        basicCanon();
    }
};

const updateTaskList = () => {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach((task, index )=>{
        const listItem = document.createElement('li');

        listItem.innerHTML = `
        <div class="taskItem">
           <div class="task ${task.completed? "completed":""}">
                <input type="checkbox" class="checkbox" ${task.completed?"checked":""} />
                <p> ${task.text} </p>
            </div>
            <div class="icons">
            <img src="edit-icon.png" onclick="editTask(${index})"/>
            <img src="delete-icon.png" onclick="deleteTask(${index})" />
            </div>
        </div>`;

        listItem.addEventListener('change', () => toggleTaskComplete(index));
        taskList.append(listItem);

        
    });
};

function voice() {
    const taskInput = document.getElementById('taskInput');
    if (!taskInput) {
        console.error("taskInput element not found!");
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-GB";

    recognition.onresult = function (event) {
        taskInput.value = event.results[0][0].transcript;
    };

    recognition.onerror = function (event) {
        console.error("Speech Recognition Error: ", event.error);
    };

    recognition.start();
}
//Notification
if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
        if (Notification.permission !== "granted") {
            alert("Notifications won't work unless you allow them!");
            location.reload();
        }
    });
}

var timeoutIds = [];

function scheduleReminder() {
    const taskInput = document.getElementById("taskInput");
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const title = taskInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    if (title === '') {
        alert("You must enter a task!");
        return;
    }

    const dateTimeString = `${date} ${time}`.trim();
    const scheduledTime = new Date(dateTimeString);
    const currentTime = new Date();
    const timeDiff = scheduledTime - currentTime;

    // Add to reminders and save to localStorage
    reminders.push({ title: title, dateTime: dateTimeString });
    addReminder(title, dateTimeString);
    saveReminders();

    // Clear input fields
    taskInput.value = "";
    dateInput.value = "";
    timeInput.value = "";

    if (timeDiff > 0) {
        const timeoutId = setTimeout(() => {
            document.getElementById("notificationSound").play();
            new Notification(title, { requireInteraction: true });
        }, timeDiff);
        timeoutIds.push(timeoutId);
    } else {
        alert("The scheduled time is in the past!");
    }
}


function addReminder(title, dateTimeString) {
    var tableBody = document.getElementById("reminderTableBody");

    var row = tableBody.insertRow();

    var titleCell = row.insertCell(0);
    var dateTimeCell = row.insertCell(1);
    var actionCell = row.insertCell(2);

    titleCell.innerHTML = title;
    dateTimeCell.innerHTML = dateTimeString;
    actionCell.innerHTML = 
        '<button onclick="deleteReminder(this);"><img src="delete-icon.png" width="24"></button>';
}

function deleteReminder(button) {
    var row = button.closest("tr");
    var index = row.rowIndex - 1; // Adjust for the header row

    clearTimeout(timeoutIds[index]);
    timeoutIds.splice(index, 1);

    reminders.splice(index, 1);
    saveReminders();
    row.remove();
    //updateReminderTable();
    (console.log(reminders))
}//

const updateReminderTable = () => {
    const tableBody = document.getElementById("reminderTableBody");
    tableBody.innerHTML = ""; // Clear existing rows

    reminders.forEach((reminder) => {
        addReminder(reminder.title, reminder.dateTime);
    });
};

document.getElementById('newTask').addEventListener('click', function(e){
    e.preventDefault();

    addTask();
});

const basicCanon = ()=> {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
}