require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Task, Session, Event } = require('./models/Schemas');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(message);
        const reply = result.response.text();

        // Create/Update session (simplified for demo)
        const session = await Session.findOneAndUpdate(
            {},
            { $push: { messages: [{ role: 'user', text: message }, { role: 'ai', text: reply }] } },
            { upsert: true, new: true }
        );

        res.json({ reply, sessionId: session._id });
    } catch (err) { res.status(500).send(err.message); }
});

// Task Endpoints
app.get('/api/tasks', async (req, res) => res.json(await Task.find()));
app.post('/api/tasks', async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));