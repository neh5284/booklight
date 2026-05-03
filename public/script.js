let timeLeft = 25 * 60;
let timerRunning = false;

// --- AI Chat ---
async function sendChat() {
    const input = document.getElementById("chatInput");
    const chatBox = document.getElementById("chatBox");
    if (!input.value) return;

    chatBox.innerHTML += `<div class="message user"><b>You:</b> ${input.value}</div>`;
    const messageText = input.value;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
    });
    const data = await res.json();

    // Add AI Response with an "Add to Calendar" button
    chatBox.innerHTML += `
        <div class="message ai">
            <b>AI:</b> ${data.reply}
            <br><button onclick="createEventFromAI('${data.reply.replace(/'/g, "\\'")}')" style="margin-top: 10px; font-size: 12px;">Turn into Calendar Event</button>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function createEventFromAI(text) {
    const res = await fetch('/api/events/from-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
    });
    const event = await res.json();
    alert(`Event added: ${event.title}`);
    loadEvents();
}

// --- Tasks ---
async function addTask() {
    const input = document.getElementById("taskInput");
    if (!input.value) return;
    await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.value })
    });
    input.value = "";
    loadTasks();
}

async function toggleTask(id, currentStatus) {
    await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
    });
    loadTasks();
}

async function clearCompleted() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    for (let task of tasks) {
        if (task.completed) {
            await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
        }
    }
    loadTasks();
}

async function loadTasks() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    document.getElementById("taskList").innerHTML = tasks.map(t =>
        `<li class="${t.completed ? 'completed' : ''}" onclick="toggleTask('${t._id}', ${t.completed})">
            ${t.text}
        </li>`
    ).join('');
}

// --- Events ---
async function loadEvents() {
    const res = await fetch('/api/events');
    const events = await res.json();
    document.getElementById("eventList").innerHTML = events.map(e =>
        `<li>${e.title} <br><small>${e.date || ''} ${e.time || ''}</small></li>`
    ).join('');
}

// --- Timer ---
function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    const interval = setInterval(async () => {
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerRunning = false;
            await fetch('/api/timer/log', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ duration: 25 })
            });
            updateStats();
            timeLeft = 25 * 60; // Reset timer
            updateTimerDisplay();
            alert("Study session complete!");
        } else {
            timeLeft--;
            updateTimerDisplay();
        }
    }, 1000);
}

function resetTimer() {
    timeLeft = 25 * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById("timer").innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function updateStats() {
    const dayRes = await fetch('/api/stats/day');
    const weekRes = await fetch('/api/stats/week');
    const monthRes = await fetch('/api/stats/month');

    const dayData = await dayRes.json();
    const weekData = await weekRes.json();
    const monthData = await monthRes.json();

    document.getElementById("dailyStats").innerHTML = `
        Today: <b>${dayData.totalMinutes} mins</b> <br>
        This Week: <b>${weekData.totalMinutes} mins</b> <br>
        This Month: <b>${monthData.totalMinutes} mins</b>
    `;
}

// Initialization
window.onload = () => {
    loadTasks();
    loadEvents();
    updateStats();
};