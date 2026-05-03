let timeLeft = 25 * 60;
let timerInterval = null;
let studyMinutes = 0;

function sendMessage() {
    const input = document.getElementById("chatInput");
    const chatBox = document.getElementById("chatBox");
    const message = input.value.trim();

    if (message === "") return;

    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = message;
    chatBox.appendChild(userMessage);

    input.value = "";

    setTimeout(() => {
        const aiMessage = document.createElement("div");
        aiMessage.className = "message ai";
        aiMessage.textContent = "Good question. I can help you break that into study steps or add it as a task.";
        chatBox.appendChild(aiMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 600);
}

function addTask() {
    const input = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const taskText = input.value.trim();

    if (taskText === "") return;

    const li = document.createElement("li");
    li.textContent = taskText;

    li.onclick = function () {
        li.classList.toggle("completed");
    };

    taskList.appendChild(li);
    input.value = "";
}

function addEvent() {
    const title = document.getElementById("eventInput").value.trim();
    const date = document.getElementById("eventDate").value;
    const eventList = document.getElementById("eventList");

    if (title === "" || date === "") return;

    const li = document.createElement("li");
    li.textContent = `${title} — ${date}`;
    eventList.appendChild(li);

    document.getElementById("eventInput").value = "";
    document.getElementById("eventDate").value = "";
}

function startTimer() {
    if (timerInterval !== null) return;

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            studyMinutes += 25;
            document.getElementById("studyStats").textContent =
                `Study time today: ${studyMinutes} minutes`;
            alert("Pomodoro complete!");
            resetTimer();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById("timer").textContent =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}