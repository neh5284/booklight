const mongoose = require('mongoose');

// Chat Session Schema [cite: 35]
const SessionSchema = new mongoose.Schema({
    title: { type: String, default: "New Study Session" },
    messages: [{ role: String, text: String }],
    createdAt: { type: Date, default: Date.now }
});

// To-Do List Schema [cite: 66]
const TaskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

// Calendar Event Schema [cite: 83]
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: String
});

// Timer Log Schema [cite: 109]
const TimerLogSchema = new mongoose.Schema({
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = {
    Session: mongoose.model('Session', SessionSchema),
    Task: mongoose.model('Task', TaskSchema),
    Event: mongoose.model('Event', EventSchema),
    TimerLog: mongoose.model('TimerLog', TimerLogSchema)
};