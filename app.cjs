const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let ballX = 0; 
let speed = 0;
let leftClicks = 0;
let rightClicks = 0;

setInterval(() => {
    ballX += speed;
    speed *= 0.98;//Increase friction to make the ball more organic.

    leftClicks *= 0.9;
    rightClicks *= 0.9;

    //Prevent the ball from rolling off the screen
    if (Math.abs(ballX) > 100) {
        ballX = 0;
        speed = 0;
        io.emit('reset');//Tells all players the ball fell off
    }
    
    //Sending the "State" of the game to every connected browser
    io.emit('update', { 
        ballX, 
        leftClicks: Math.round(leftClicks), 
        rightClicks: Math.round(rightClicks),
        userCount: io.engine.clientsCount 
    });
}, 30);

io.on('connection', (socket) => {
    socket.on('push', (direction) => {
        speed += direction * 0.8; //Changing the speed based on user click
        const side = direction < 0 ? 'LEFT' : 'RIGHT';
        if (direction < 0) leftClicks += 5;
        else rightClicks += 5;

        io.emit('someone_pushed', { side: side });
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`game on: http://localhost:${PORT}`);
});