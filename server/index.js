const { Server } = require('socket.io');

// Create a new instance of the Socket.IO server
const io = new Server(8000, {
    cors: {
        origin: '*',
    }
});

// Map to store email to socket ID mapping
const emailToSocketIdMap = new Map();

// Map to store socket ID to email mapping
const socketIdToEmailMap = new Map();

// Event handler for when a client connects to the server
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    
    // Event handler for when a client disconnects from the server
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    
    // Event handler for when a client joins a room
    socket.on('room:join', ({ email, room }) => {
        console.log('room:join', { email, room });
        
        // Store the email to socket ID mapping
        emailToSocketIdMap.set(email, socket.id);
        
        // Store the socket ID to email mapping
        socketIdToEmailMap.set(socket.id, email);
        
        // Emit an event to all clients in the room that a user has joined
        io.to(room).emit("user:joined", { email, id: socket.id });
        
        // Make the client join the specified room
        socket.join(room);
        
        // Emit an event to the client that they have joined the room
        io.to(socket.id).emit("room:join", { email, room });
    });

    // Event handler for when a client initiates a call
    socket.on('user:call', ({ offer, to }) => {
        console.log('user:call', {  to });
        
        // Emit an event to the recipient client to initiate the call
        io.to(to).emit('call:ayi', { offer, from: socket.id });
        
        console.log(`Mene Call bhej Di Bhai : Socket Id Yeh hai Bhai :${socket.id}`);
    });

    // Event handler for when a call is accepted by the recipient client
    socket.on('call:accepted', ({ answer, to }) => {
        console.log('call:accepted', {  to });
        
        // Emit an event to the caller client that the call has been accepted
        io.to(to).emit('call:accepted', { answer, from: socket.id });
    });

    // Event handler for when negotiation is needed between peers
    socket.on('peer:nego:needed', ({ offer, to }) => {
        console.log('peer:nego:needed', {  to });
        
        // Emit an event to the recipient client to initiate negotiation
        io.to(to).emit('peer:nego:needed', { offer, from: socket.id });
    });

    // Event handler for when negotiation is done between peers
    socket.on('peer:nego:done', ({ answer, to }) => {
        console.log('peer:nego:done', { to });
        
        // Emit an event to the caller client that negotiation is done
        io.to(to).emit('peer:nego:final', { answer, from: socket.id });
    });
});
