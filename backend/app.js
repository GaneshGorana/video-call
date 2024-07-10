import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { configDotenv } from 'dotenv';
configDotenv();

const app = express();
const PORT = 8181;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_ORIGIN_URL,
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('a user connected : ', socket.id);

    socket.on('join-room', (mb) => {
        socket.join(mb);
        io.to(mb).emit('user-joined', mb);
    });
    socket.on('offer', (payload) => {
        console.log('offer payload : ', payload);
        io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
        console.log('answer payload : ', payload);
        io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', (payload) => {
        io.to(payload.target).emit('ice-candidate', payload.candidate);
    });

    socket.on('call-ended', (mb) => {
        io.to(mb).emit('call-ended', mb);
    });

    socket.on('call-rejected', (mb) => {
        io.to(mb).emit('call-rejected', mb);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

server.listen(PORT, () => {
    console.log(`listening on port : ${PORT}`);
});