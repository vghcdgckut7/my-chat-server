const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } 
});

// Массив, где будут временно храниться последние сообщения
let msgHistory = [];

io.on('connection', (socket) => {
    // Передаем историю чата новому подключившемуся другу
    socket.emit('chatHistory', msgHistory);

    // Принимаем новое сообщение
    socket.on('chatMessage', (data) => {
        if (!data.username || !data.text) return;
        
        const newMsg = { username: data.username, text: data.text };
        msgHistory.push(newMsg);
        
        // Храним только последние 100 сообщений, чтобы не забивать память
        if (msgHistory.length > 100) msgHistory.shift();

        // Отправляем это сообщение всем троим в реальном времени
        io.emit('message', newMsg);
    });
});

// Сервер сам выберет нужный порт при запуске в интернете
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
});
