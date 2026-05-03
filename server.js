require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Session, Task, Event, TimerLog } = require('./models/schemas');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- AI Chat Endpoints ---
app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(message);
        const reply = result.response.text();

        const session = await Session.findOneAndUpdate(
            { _id: sessionId || new mongoose.Types.ObjectId() },
            { $push: { messages: [{ role: 'user', text: message }, { role: 'ai', text: reply }] } },
            { upsert: true, new: true }
        );
        res.json({ reply, sessionId: session._id });
    } catch (err) { res.status(500).send(err.message); }
});

// --- To-Do Endpoints ---
app.get('/api/tasks', async (req, res) => res.json(await Task.find()));
app.post('/api/tasks', async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
});

// --- Calendar Endpoints ---
app.get('/api/events', async (req, res) => res.json(await Event.find()));
app.post('/api/events', async (req, res) => {
    const event = new Event(req.body);
    await event.save();
    res.json(event);
});

// --- Timer & Stats Endpoints ---
app.post('/api/timer/log', async (req, res) => {
    const log = new TimerLog({ duration: req.body.duration });
    await log.save();
    res.json({ message: "Session logged" });
});

app.get('/api/stats/day', async (req, res) => {
    const start = new Date(); start.setHours(0,0,0,0);
    const logs = await TimerLog.find({ date: { $gte: start } });
    const total = logs.reduce((sum, log) => sum + log.duration, 0);
    res.json({ totalMinutes: total });
});

app.listen(3000, () => console.log("BookLight running on http://localhost:3000"));