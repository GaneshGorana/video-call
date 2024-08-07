import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { configDotenv } from 'dotenv';
import connectDB from './db/connection.js';
import userRoutes from "./routes/user.js"

import cors from 'cors';

configDotenv();

const app = express();
const PORT = 8181;

const server = http.createServer(app);

app.use(cors())

connectDB();

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_ORIGIN_URL,
        credentials: true
    }
});

app.use('/', userRoutes)

io.on('connection', (socket) => {
    socket.on('join-room', (mb) => {
        socket.join(mb);
        io.to(mb).emit('user-joined', mb);
    });
    socket.on('offer', (payload) => {
        io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
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

});

server.listen(PORT, () => {
    console.log(`listening on port : ${PORT}`);
});