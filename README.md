# 🎮 Decentralized Multi-Game Room

A production-ready hackathon project featuring **4 lightweight multiplayer games** with **hardest AI difficulty** that simultaneously meets **three critical tracks**: 2G Connection Ninja, Memory Monk, and Offline Survivalist.

## 🎯 Available Games

- **🎯 Tic-Tac-Toe** - Classic 3x3 grid with unbeatable minimax AI
- **🔴 Connect Four** - 7x6 grid with advanced AI strategy  
- **🔢 Number Guessing** - Guess 1-100 with binary search AI

## 🏆 Hackathon Track Compliance

### ✅ 2G Connection Ninja
- **Requirement**: App must be usable under Chrome DevTools Slow 2G network throttling
- **Implementation**: 
  - Minimal initial payload (<50KB total)
  - Service Worker caches entire app shell on first load
  - Offline fallback automatically available if network fails
  - **Proof**: See `evidence/slow2g_load.mp4` and test steps below

### ✅ Memory Monk  
- **Requirement**: Peak client RAM usage < 10 MB during typical gameplay
- **Implementation**:
  - Single global app instance (no multiple event listeners)
  - Limited move history (MAX_HISTORY = 50)
  - Minimal DOM manipulation and reuse
  - No heavy assets or external libraries
  - **Proof**: See `evidence/memory_snapshot.png` and Chrome DevTools steps below

### ✅ Offline Survivalist
- **Requirement**: Full gameplay available offline after single successful initial load
- **Implementation**:
  - Service Worker caches entire app shell
  - Deterministic AI opponent (no random seeds)
  - Hotseat mode for same-device multiplayer
  - WebRTC signaling server is completely optional
  - **Proof**: See `evidence/offline_demo.mp4` and test steps below

## 🚀 Quick Start

### Option 1: Static Hosting (Recommended for Demo)
```bash
# Clone the repository
git clone https://github.com/your-username/decentralized-game-room.git
cd decentralized-game-room

# Serve with any static server
python -m http.server 8000
# or
npx serve .
# or
# Open index.html directly in Chrome
```

### Option 2: With Signaling Server (Optional)
```bash
# Install dependencies
npm install

# Start signaling server
npm start

# In another terminal, serve the static files
python -m http.server 8000
```

## 🧪 Judge Test Checklist

### Test 1: 2G Connection Ninja
1. Open Chrome DevTools (F12)
2. Go to Network tab → Throttling → Slow 2G
3. Reload the page
4. **Expected**: App loads and shows lobby within 30 seconds
5. **Expected**: "Play vs AI (Offline)" and "Hotseat (Offline)" buttons work immediately
6. **Evidence**: Record screen showing successful load under Slow 2G

### Test 2: Memory Monk
1. Open Chrome DevTools (F12)
2. Go to Memory tab
3. Start a game (AI or Hotseat mode)
4. Make several moves
5. Click "Take heap snapshot"
6. **Expected**: Used JS Heap Size < 10 MB
7. **Evidence**: Screenshot the memory snapshot showing < 10 MB usage

### Test 3: Offline Survivalist
1. Load the app once (with internet)
2. Disable network (Wi-Fi off or DevTools → Network → Offline)
3. Try "Play vs AI (Offline)" - should work
4. Try "Hotseat (Offline)" - should work
5. **Expected**: Full gameplay available without internet
6. **Evidence**: Record screen showing offline gameplay

## 🔧 Technical Architecture

### Memory Optimizations (< 10 MB Target)
- **Single Global Instance**: One `AppState` instance, no multiple event listeners
- **Limited History**: Move history capped at 50 moves, older moves automatically removed
- **DOM Reuse**: Game board cells reused, minimal DOM manipulation
- **No Heavy Assets**: CSS-only graphics, no images, no external libraries
- **Efficient Updates**: Memory monitoring every 2 seconds instead of every second
- **Compact Messages**: Network messages use `mv:12` format instead of verbose JSON

### Offline-First Design
- **Service Worker**: Caches `index.html`, `sw.js` on first load
- **Cache-First Strategy**: App shell served from cache when available
- **Graceful Degradation**: Network features fail gracefully, offline modes always available
- **Deterministic AI**: Same AI moves every time for given board state

### WebRTC Implementation
- **RTCDataChannel Only**: No audio/video tracks (memory optimization)
- **Compact Signaling**: Minimal JSON messages with short keys
- **Optional Server**: Signaling server completely optional, app works without it
- **Fallback Handling**: Automatic fallback to offline mode if signaling fails

## 📁 Project Structure

```
/
├── index.html          # Single-page app with inline CSS/JS
├── sw.js              # Service Worker for offline caching
├── signaller.js       # Optional WebRTC signaling server
├── package.json       # Node.js dependencies
├── README.md          # This file
├── DEMO-TEST-STEPS.md # Detailed test instructions
├── evidence/          # Test evidence folder
│   ├── memory_snapshot.png
│   ├── slow2g_load.mp4
│   └── offline_demo.mp4
└── LICENSE            # MIT License
```

## 🎯 Game Engine

### Single Codebase for All Modes
- **AI Mode**: Deterministic opponent using priority-based strategy
- **Hotseat Mode**: Two players alternating on same device
- **Network Mode**: P2P gameplay via WebRTC RTCDataChannel

### Game Logic
- **Multi-Game Engine**: Supports 4 different game types with unified interface
- **Advanced AI**: Minimax algorithm for Tic-Tac-Toe, strategic AI for Connect Four
- **Pattern Learning**: RPS AI analyzes player patterns, Number Guessing uses binary search
- **Compact State**: Efficient board representations for all game types
- **Win Detection**: Optimized algorithms for each game's victory conditions

## 🌐 Signaling Protocol

### WebSocket Messages (Minimal Format)
```json
{"t":"create","room":"rabc123"}
{"t":"join","room":"rabc123"}
{"t":"offer","room":"rabc123","offer":{/* SDP */}}
{"t":"answer","room":"rabc123","answer":{/* SDP */}}
{"t":"ice","room":"rabc123","cand":{/* ICE */}}
```

### RTCDataChannel Messages (Game-Specific)
```
tictactoe:5        # Tic-tac-toe move to position 5
connect4:3         # Connect Four drop in column 3
numguess:42        # Number guess of 42
```

## 🔍 Debug Features

### Real-Time Monitoring
- **Memory Usage**: Shows current JS heap size (if `performance.memory` available)
- **Connection Status**: Online/offline state
- **Peer Status**: WebRTC connection state
- **Game State**: Current game mode

### Memory Snapshot Export
- Click "Export Memory Snapshot" in debug panel
- Downloads JSON file with detailed memory metrics
- Useful for judge verification

## 🚨 Troubleshooting

### Common Issues
1. **Service Worker Not Working**: Check if HTTPS or localhost
2. **WebRTC Failing**: Ensure signaling server is running (optional)
3. **Memory High**: Check for browser extensions or multiple tabs
4. **Offline Not Working**: Reload page once with internet first

### Browser Compatibility
- **Primary**: Chrome 90+ (tested)
- **Secondary**: Firefox 88+, Safari 14+
- **Required**: Service Worker support, WebRTC support

## 📊 Performance Metrics

### Target Achievements
- **Initial Load**: < 50KB total payload
- **Memory Usage**: < 10 MB peak during gameplay
- **Offline Capability**: 100% functionality after first load
- **2G Performance**: Usable within 30 seconds on Slow 2G

### Optimization Techniques
- **Code Splitting**: Single HTML file with inline CSS/JS
- **Asset Optimization**: No external images, CSS-only graphics
- **Memory Management**: Limited object creation, efficient cleanup
- **Network Efficiency**: Minimal signaling messages, compact game state

## 🤝 Contributing

This is a hackathon project demonstrating:
1. **Memory efficiency** through careful code design
2. **Offline-first architecture** using modern web standards
3. **Network resilience** with graceful degradation
4. **Performance optimization** for constrained environments

## 📄 License

MIT License - see LICENSE file for details.

---

**🎯 Ready for Judge Testing**: This repository contains all required evidence files and meets all three hackathon track requirements simultaneously.
