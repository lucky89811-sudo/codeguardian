const express = require('express');
const app = express();

// Insecure CORS wildcard with credentials
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// DOM Injection / Raw HTML rendering
app.get('/render', (req, res) => {
    const userInput = req.query.msg;
    res.send(`<div id="content">${userInput}</div>`);
});

// Insecure random for authentication session
app.get('/session', (req, res) => {
    const sessionToken = Math.random().toString(36).substring(2);
    res.json({ token: sessionToken });
});

app.listen(3000);
