import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 8181;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        credentials: true
    }
});

app.get('/', (req, res) => {
    res.json("Hello World");
});

io.on('connection', (socket) => {
    console.log('a user connected : ', socket.id);

    socket.on('join-room', (mb) => {
        console.log('user mobile room : ', mb);
        socket.join(mb);
        io.to(mb).emit('user-joined', mb);
    });

    socket.on('call-user', (payload) => {
        console.log('call-user payload : ', payload);
        io.to(payload.from).emit('call-user', payload);
    });

    socket.on('call-received', (data) => {
        io.to(data.target).emit('call-received', data);
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
        console.log('ice-candidate payload : ', payload);
        io.to(payload.target).emit('ice-candidate', payload.candidate);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

server.listen(PORT, () => {
    console.log(`listening on port : ${PORT}`);
});