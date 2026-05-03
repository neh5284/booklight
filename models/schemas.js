const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    text: String,
    completed: { type: Boolean, default: false }
});

const SessionSchema = new mongoose.Schema({
    title: { type: String, default: "New Study Session" },
    messages: [{ role: String, text: String }],
    createdAt: { type: Date, default: Date.now }
});

const EventSchema = new mongoose.Schema({
    title: String,
    date: String
});

module.exports = {
    Task: mongoose.model('Task', TaskSchema),
    Session: mongoose.model('Session', SessionSchema),
    Event: mongoose.model('Event', EventSchema)
};