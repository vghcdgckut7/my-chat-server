const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Добавляем обычный текстовый ответ на главную страницу, 
// чтобы вместо "Not Found" было понятно, что сервер живой
app.get('/', (req, res) => {
    res.send('Сервер мессенджера успешно работает!');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Разрешаем подключаться с любых телефонов и сайтов
        methods: ["GET", "POST"]
    }
});

let msgHistory = [];

io.on('connection', (socket) => {
    console.log('Пользователь подключился');
    socket.emit('chatHistory', msgHistory);

    socket.on('chatMessage', (data) => {
        if (!data.username || !data.text) return;
        
        const newMsg = { username: data.username, text: data.text };
        msgHistory.push(newMsg);
        
        if (msgHistory.length > 100) msgHistory.shift();

        io.emit('message', newMsg);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
