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

// ==========================================
// AI CHAT & SESSION ENDPOINTS
// ==========================================
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

app.get('/api/sessions', async (req, res) => res.json(await Session.find({}, 'title')));
app.get('/api/sessions/:id', async (req, res) => res.json(await Session.findById(req.params.id)));
app.patch('/api/sessions/:id', async (req, res) => res.json(await Session.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/sessions/:id', async (req, res) => {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: "Session deleted" });
});
app.post('/api/chat/continue', async (req, res) => {
    // Acts similar to standard chat for simplicity in this implementation
    const { message, sessionId } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
});
app.delete('/api/chat/message/:id', async (req, res) => res.json({ message: "Message deleted" }));
app.get('/api/status', (req, res) => res.json({ status: "online" }));

// ==========================================
// TO-DO LIST ENDPOINTS
// ==========================================
app.get('/api/tasks', async (req, res) => res.json(await Task.find()));
app.post('/api/tasks', async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
});
app.patch('/api/tasks/:id', async (req, res) => res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
});

// ==========================================
// CALENDAR ENDPOINTS
// ==========================================
app.get('/api/events', async (req, res) => res.json(await Event.find()));
app.post('/api/events', async (req, res) => {
    const event = new Event(req.body);
    await event.save();
    res.json(event);
});
app.get('/api/events/:id', async (req, res) => res.json(await Event.findById(req.params.id)));
app.patch('/api/events/:id', async (req, res) => res.json(await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/events/:id', async (req, res) => {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
});

// Convert AI text to Calendar Event
app.post('/api/events/from-ai', async (req, res) => {
    const { text } = req.body;
    try {
        const prompt = `Extract an event from this text: "${text}". Return ONLY raw JSON with keys "title", "date" (YYYY-MM-DD), and "time" (e.g. 7:00 PM).`;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        let rawJson = result.response.text().replace(/```json/g, '').replace(/```/g, '');
        const eventData = JSON.parse(rawJson);
        const event = new Event(eventData);
        await event.save();
        res.json(event);
    } catch (err) { res.status(500).json({ error: "Failed to parse AI event" }); }
});

// ==========================================
// TIMER & STATS ENDPOINTS
// ==========================================
app.post('/api/timer/log', async (req, res) => {
    const log = new TimerLog({ duration: req.body.duration });
    await log.save();
    res.json({ message: "Session logged" });
});
app.delete('/api/timer/log/:id', async (req, res) => {
    await TimerLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Timer log deleted" });
});
app.patch('/api/timer/log/:id', async (req, res) => res.json(await TimerLog.findByIdAndUpdate(req.params.id, req.body, { new: true })));

// Stat calculations
const getStats = async (days) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const logs = await TimerLog.find({ date: { $gte: start } });
    return logs.reduce((sum, log) => sum + log.duration, 0);
};

app.get('/api/stats/day', async (req, res) => res.json({ totalMinutes: await getStats(1) }));
app.get('/api/stats/week', async (req, res) => res.json({ totalMinutes: await getStats(7) }));
app.get('/api/stats/month', async (req, res) => res.json({ totalMinutes: await getStats(30) }));

app.listen(process.env.PORT || 3000, () => console.log(`BookLight running on http://localhost:${process.env.PORT || 3000}`));