#!/usr/bin/env node

// Minimal WebRTC Signaling Server for Decentralized Game Room
// Memory optimization: no persistence, minimal state, ephemeral operation

const WebSocket = require('ws');
const http = require('http');

// Memory optimization: simple in-memory room tracking
const rooms = new Map(); // roomId -> Set of WebSocket connections
const connections = new Map(); // WebSocket -> roomId

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

console.log('🎮 Decentralized Game Room Signaling Server');
console.log('Starting on port 8080...');

// Memory optimization: minimal connection tracking
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    // Memory optimization: simple message handling
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(ws, message);
        } catch (error) {
            console.log('Invalid message format:', error.message);
        }
    });
    
    // Memory optimization: cleanup on disconnect
    ws.on('close', () => {
        cleanupConnection(ws);
    });
    
    // Memory optimization: handle errors gracefully
    ws.on('error', (error) => {
        console.log('WebSocket error:', error.message);
        cleanupConnection(ws);
    });
});

// Memory optimization: simple message routing
function handleMessage(ws, message) {
    const { t, room } = message;
    
    switch (t) {
        case 'create':
            handleCreate(ws, room);
            break;
        case 'join':
            handleJoin(ws, room);
            break;
        case 'offer':
            handleOffer(ws, room, message.offer);
            break;
        case 'answer':
            handleAnswer(ws, room, message.answer);
            break;
        case 'ice':
            handleIce(ws, room, message.cand);
            break;
        case 'list':
            handleList(ws);
            break;
        case 'rooms':
            handleRooms(ws);
            break;
        default:
            console.log('Unknown message type:', t);
    }
}

// Memory optimization: simple room creation
function handleCreate(ws, roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId);
    room.add(ws);
    connections.set(ws, roomId);
    
    console.log(`Room created: ${roomId}`);
    
    // Send confirmation
    ws.send(JSON.stringify({
        t: 'created',
        room: roomId
    }));
}

// Memory optimization: simple room joining
function handleJoin(ws, roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId);
    room.add(ws);
    connections.set(ws, roomId);
    
    console.log(`Peer joined room: ${roomId}`);
    
    // Notify other peers in the room
    room.forEach(peer => {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify({
                t: 'peer_joined',
                room: roomId
            }));
        }
    });
}

// Memory optimization: forward offers to other peers
function handleOffer(ws, roomId, offer) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.forEach(peer => {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify({
                t: 'offer',
                room: roomId,
                offer: offer
            }));
        }
    });
}

// Memory optimization: forward answers to other peers
function handleAnswer(ws, roomId, answer) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.forEach(peer => {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify({
                t: 'answer',
                room: roomId,
                answer: answer
            }));
        }
    });
}

// Memory optimization: forward ICE candidates to other peers
function handleIce(ws, roomId, candidate) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.forEach(peer => {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify({
                t: 'ice',
                room: roomId,
                cand: candidate
            }));
        }
    });
}

// Memory optimization: list available rooms
function handleList(ws) {
    const roomList = Array.from(rooms.keys());
    ws.send(JSON.stringify({
        t: 'rooms',
        list: roomList
    }));
}

// Memory optimization: send room list
function handleRooms(ws) {
    const roomList = Array.from(rooms.keys());
    ws.send(JSON.stringify({
        t: 'rooms',
        list: roomList
    }));
}

// Memory optimization: cleanup disconnected peers
function cleanupConnection(ws) {
    const roomId = connections.get(ws);
    if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
            room.delete(ws);
            
            // Memory optimization: remove empty rooms
            if (room.size === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} removed (empty)`);
            } else {
                // Notify remaining peers
                room.forEach(peer => {
                    if (peer.readyState === WebSocket.OPEN) {
                        peer.send(JSON.stringify({
                            t: 'peer_left',
                            room: roomId
                        }));
                    }
                });
            }
        }
        connections.delete(ws);
    }
    
    console.log('Connection cleaned up');
}

// Memory optimization: graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down signaling server...');
    
    // Close all WebSocket connections
    wss.clients.forEach(client => {
        client.close();
    });
    
    // Clear memory
    rooms.clear();
    connections.clear();
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Memory optimization: handle uncaught errors
process.on('uncaughtException', (error) => {
    console.log('Uncaught exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Signaling server running on port ${PORT}`);
    console.log('Press Ctrl+C to stop');
});

// Memory optimization: periodic cleanup of stale connections
setInterval(() => {
    let cleaned = 0;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.CLOSED || client.readyState === WebSocket.CLOSING) {
            cleanupConnection(client);
            cleaned++;
        }
    });
    
    if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} stale connections`);
    }
}, 30000); // Clean up every 30 seconds
