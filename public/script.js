let timeLeft = 25 * 60;
let timerRunning = false;

// AI Chat Communication [cite: 36]
async function sendChat() {
    const input = document.getElementById("chatInput");
    const chatBox = document.getElementById("chatBox");
    if (!input.value) return;

    chatBox.innerHTML += `<div class="msg user"><b>You:</b> ${input.value}</div>`;
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.value })
    });
    const data = await res.json();
    chatBox.innerHTML += `<div class="msg ai"><b>AI:</b> ${data.reply}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Timer Logic & Logging [cite: 110, 116]
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
            alert("Study session complete!");
        } else {
            timeLeft--;
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById("timer").innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function updateStats() {
    const res = await fetch('/api/stats/day');
    const data = await res.json();
    document.getElementById("dailyStats").innerText = `Today's Study: ${data.totalMinutes} mins`;
}

// Initialize
updateStats();