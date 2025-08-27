/* app.js
   Main application logic. Keep this file in the root and referenced by index.html
*/
(function () {
  "use strict";

  // Small helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  // --- GameEngine ---
  class GameEngine {
    constructor() {
      this.setGameType("tictactoe");
      this.MAX_HISTORY = 50;
      this.reset();
    }
    setGameType(type) {
      this.gameType = type;
      this.reset();
    }
    reset() {
      this.currentPlayer = "x";
      this.gameOver = false;
      this.winner = null;
      this.moveHistory = [];
      this.score = { x: 0, o: 0, draws: 0 };
      if (this.gameType === "tictactoe") this.board = Array(9).fill("");
      if (this.gameType === "connect4") this.board = Array(42).fill("");
      if (this.gameType === "numguess") {
        this.targetNumber = Math.floor(Math.random() * 100) + 1;
        this.attempts = 0;
        this.maxAttempts = 7;
        this.guesses = [];
      }
    }
    makeMove(data) {
      if (this.gameType === "tictactoe") return this.makeTicTacToeMove(data);
      if (this.gameType === "connect4") return this.makeConnect4Move(data);
      if (this.gameType === "numguess") return this.makeNumGuessMove(data);
      return false;
    }
    makeTicTacToeMove(index) {
      if (this.board[index] !== "" || this.gameOver) return false;
      this.board[index] = this.currentPlayer;
      this.moveHistory.push({ player: this.currentPlayer, index });
      if (this.moveHistory.length > this.MAX_HISTORY) this.moveHistory.shift();
      if (this.checkTicTacToeWin(index)) {
        this.gameOver = true;
        this.winner = this.currentPlayer;
        this.score[this.currentPlayer]++;
        return true;
      }
      if (this.checkTicTacToeDraw()) {
        this.gameOver = true;
        this.winner = "draw";
        this.score.draws++;
        return true;
      }
      this.currentPlayer = this.currentPlayer === "x" ? "o" : "x";
      return true;
    }
    checkTicTacToeWin(index) {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      return lines.some(
        (line) =>
          line.includes(index) &&
          this.board[line[0]] &&
          this.board[line[0]] === this.board[line[1]] &&
          this.board[line[1]] === this.board[line[2]]
      );
    }
    checkTicTacToeDraw() {
      return this.board.every((c) => c !== "");
    }
    makeConnect4Move(col) {
      if (this.gameOver || col < 0 || col > 6) return false;
      for (let row = 5; row >= 0; row--) {
        const i = row * 7 + col;
        if (this.board[i] === "") {
          this.board[i] = this.currentPlayer;
          this.moveHistory.push({ player: this.currentPlayer, index: i });
          if (this.checkConnect4Win(i)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.score[this.currentPlayer]++;
            return true;
          }
          if (this.checkConnect4Draw()) {
            this.gameOver = true;
            this.winner = "draw";
            this.score.draws++;
            return true;
          }
          this.currentPlayer = this.currentPlayer === "x" ? "o" : "x";
          return true;
        }
      }
      return false;
    }
    checkConnect4Win(index) {
      const row = Math.floor(index / 7),
        col = index % 7,
        player = this.board[index];
      let count = 1;
      for (let c = col - 1; c >= 0 && this.board[row * 7 + c] === player; c--)
        count++;
      for (let c = col + 1; c < 7 && this.board[row * 7 + c] === player; c++)
        count++;
      if (count >= 4) return true;
      count = 1;
      for (let r = row - 1; r >= 0 && this.board[r * 7 + col] === player; r--)
        count++;
      for (let r = row + 1; r < 6 && this.board[r * 7 + col] === player; r++)
        count++;
      if (count >= 4) return true;
      count = 1;
      for (
        let r = row - 1, c = col - 1;
        r >= 0 && c >= 0 && this.board[r * 7 + c] === player;
        r--, c--
      )
        count++;
      for (
        let r = row + 1, c = col + 1;
        r < 6 && c < 7 && this.board[r * 7 + c] === player;
        r++, c++
      )
        count++;
      if (count >= 4) return true;
      count = 1;
      for (
        let r = row - 1, c = col + 1;
        r >= 0 && c < 7 && this.board[r * 7 + c] === player;
        r--, c++
      )
        count++;
      for (
        let r = row + 1, c = col - 1;
        r < 6 && c >= 0 && this.board[r * 7 + c] === player;
        r++, c--
      )
        count++;
      if (count >= 4) return true;
      return false;
    }
    checkConnect4Draw() {
      return this.board.every((c) => c !== "");
    }
    makeNumGuessMove(guess) {
      if (this.gameOver || this.attempts >= this.maxAttempts) return false;
      this.attempts++;
      this.guesses.push(guess);
      if (guess === this.targetNumber) {
        this.gameOver = true;
        this.winner = this.currentPlayer;
        this.score[this.currentPlayer]++;
        return true;
      } else if (this.attempts >= this.maxAttempts) {
        this.gameOver = true;
        this.winner = this.currentPlayer === "x" ? "o" : "x";
        this.score[this.winner]++;
        return true;
      }
      return true;
    }
    getAIMove() {
      if (this.gameType === "tictactoe") return this.getTicTacToeAIMove();
      if (this.gameType === "connect4") return this.getConnect4AIMove();
      if (this.gameType === "numguess") return this.getNumGuessAIMove();
      return -1;
    }
    getTicTacToeAIMove() {
      const board = this.board;
      if (board[4] === "") return 4;
      const corners = [0, 2, 6, 8];
      for (let c of corners) if (board[c] === "") return c;
      for (let i = 0; i < 9; i++) if (board[i] === "") return i;
      return -1;
    }
    getConnect4AIMove() {
      const priorities = [3, 2, 4, 1, 5, 0, 6];
      for (let c of priorities)
        if (this.canDropConnect4([...this.board], c)) return c;
      return 3;
    }
    canDropConnect4(board, col) {
      return board[col] === "";
    }
    dropConnect4Piece(board, col, player) {
      const copy = [...board];
      for (let r = 5; r >= 0; r--) {
        const i = r * 7 + col;
        if (copy[i] === "") {
          copy[i] = player;
          break;
        }
      }
      return copy;
    }
    getNumGuessAIMove() {
      if (this.guesses.length === 0) return 50;
      let min = 1,
        max = 100;
      for (let g of this.guesses) {
        if (g < this.targetNumber) min = Math.max(min, g + 1);
        else if (g > this.targetNumber) max = Math.min(max, g - 1);
      }
      return Math.floor((min + max) / 2);
    }
    serializeMove(data) {
      return `${this.gameType}:${JSON.stringify(data)}`;
    }
    deserializeMove(message) {
      const [gameType, dataStr] = message.split(":");
      if (gameType === this.gameType) {
        try {
          return JSON.parse(dataStr);
        } catch (e) {
          return parseInt(dataStr);
        }
      }
      return null;
    }
  }

  // --- AppState ---
  class AppState {
    constructor() {
      this.gameEngine = new GameEngine();
      this.currentMode = "lobby";
      this.selectedGame = "tictactoe";
      this.peerConnection = null;
      this.dataChannel = null;
      this.isOnline = navigator.onLine;
      this.isInitiator = false;
      this.memoryInterval = null;
      this.myPlayerSymbol = "x";
      this.init();
    }
    init() {
      this.bindUI();
      this.startMemoryMonitoring();
      this.updateOnlineStatus();
      this.registerServiceWorker();
    }
    bindUI() {
      document.querySelectorAll(".game-card").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const g = btn.dataset.game;
          this.selectGame(g);
        })
      );
      document.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]")?.dataset?.action;
        if (!action) return;
        switch (action) {
          case "create":
            this.createRoom();
            break;
          case "join":
            this.connectToRoom();
            break;
          case "ai":
            this.playVsAI();
            break;
          case "hotseat":
            this.playHotseat();
            break;
          case "back":
            this.backToGameSelection();
            break;
          case "home":
            this.backToGameSelection();
            break;
          case "rematch":
            this.rematchGame();
            break;
          case "guess":
            this.makeNumGuess();
            break;
          case "start-create":
            this.startCreateMode();
            break;
          case "start-join":
            this.startJoinMode();
            break;
          case "generate-answer":
            this.processReceivedOffer();
            break;
          case "copy-offer":
            this.copyToClipboard("offerText");
            break;
          case "copy-answer":
            this.copyToClipboard("answerText");
            break;
          case "close-modal":
            this.closeHandshakeModal();
            break;
          case "show-answer-input":
            this.showAnswerInput();
            break;
          case "submit-answer":
            this.processManualAnswer();
            break;
          case "export-memory":
            exportMemorySnapshot();
            break;
        }
      });

      document.addEventListener("click", (e) => {
        const cell = e.target.closest(".cell, .connect4-cell");
        if (!cell) return;
        const idx = parseInt(cell.dataset.index, 10);
        if (Number.isFinite(idx)) this.handleCellClick(idx, cell);
      });

      $("#debugToggle") &&
        on($("#debugToggle"), "click", () => {
          const p = $("#debugPanel");
          p.classList.toggle("collapsed");
          $("#debugContent").classList.toggle("hidden");
        });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.closeHandshakeModal();
      });
      this.updateDebugInfo();
    }

    startMemoryMonitoring() {
      this.memoryInterval = setInterval(() => this.updateDebugInfo(), 2000);
    }
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
      this.updateDebugInfo();
    }
    updateDebugInfo() {
      $("#onlineStatus") &&
        ($("#onlineStatus").textContent = this.isOnline ? "online" : "offline");
      $("#gameState") && ($("#gameState").textContent = this.currentMode);
      $("#peerStatus") &&
        ($("#peerStatus").textContent = this.dataChannel
          ? "connected"
          : "none");
      try {
        if (performance && performance.memory)
          $("#memoryUsage").textContent = `${(
            performance.memory.usedJSHeapSize /
            1024 /
            1024
          ).toFixed(1)} MB`;
      } catch (e) {}
    }

    async registerServiceWorker() {
      if (location.protocol === "file:") return;
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
          console.log("SW registered");
        } catch (e) {
          console.warn("SW failed", e);
        }
      }
    }

    selectGame(gameType) {
      this.selectedGame = gameType;
      this.gameEngine.setGameType(gameType);
      this.showGameModeSelection();
    }
    showGameModeSelection() {
      $("#lobby").classList.add("hidden");
      $("#gameMode").classList.remove("hidden");
      $("#selectedGameTitle").textContent =
        {
          tictactoe: "Tic-Tac-Toe",
          connect4: "Connect Four",
          numguess: "Number Guessing",
        }[this.selectedGame] || this.selectedGame;
    }
    backToGameSelection() {
      this.currentMode = "lobby";
      this.gameEngine.reset();
      this.cleanupConnection();
      $("#game").classList.add("hidden");
      $("#gameMode").classList.add("hidden");
      this.closeHandshakeModal();
      $("#lobby").classList.remove("hidden");
    }

    createRoom() {
      this.isInitiator = true;
      this.startManualHandshake();
    }
    connectToRoom() {
      this.isInitiator = false;
      this.startManualHandshake();
    }
    playVsAI() {
      this.currentMode = "ai";
      this.gameEngine.reset();
      this.showGame();
    }
    playHotseat() {
      this.currentMode = "hotseat";
      this.gameEngine.reset();
      this.showGame();
    }

    showGame() {
      $("#gameMode").classList.add("hidden");
      $("#lobby").classList.add("hidden");
      $("#game").classList.remove("hidden");
      $("#game").removeAttribute("aria-hidden");
      this.renderGameBoard();
      this.updateGameStatus();
    }

    backToLobby() {
      this.currentMode = "lobby";
      this.gameEngine.reset();
      this.cleanupConnection();
      this.isInitiator = false;
      $("#game").classList.add("hidden");
      $("#lobby").classList.remove("hidden");
    }

    cleanupConnection() {
      try {
        if (this.dataChannel) this.dataChannel.close();
        if (this.peerConnection) this.peerConnection.close();
        this.dataChannel = null;
        this.peerConnection = null;
      } catch (e) {
        console.warn(e);
      }
    }

    startManualHandshake() {
      this.resetHandshakeModal();
      this.clearHandshakeInputs();
      this.openHandshakeModal();
    }
    openHandshakeModal() {
      const modal = $("#handshakeModal");
      modal.setAttribute("aria-hidden", "false");
      modal.classList.remove("hidden");
    }
    closeHandshakeModal() {
      const modal = $("#handshakeModal");
      modal.setAttribute("aria-hidden", "true");
      modal.classList.add("hidden");
      this.resetHandshakeModal();
    }
    resetHandshakeModal() {
      $("#modeSelection").classList.remove("hidden");
      $("#createMode").classList.add("hidden");
      $("#joinMode").classList.add("hidden");
      $("#answerText").classList.add("hidden");
    }
    clearHandshakeInputs() {
      ["offerText", "answerInput", "receivedOfferInput", "answerText"].forEach(
        (id) => {
          const el = $("#" + id);
          if (el) el.value = "";
        }
      );
    }
    showAnswerInput() {
      $("#answerInput").classList.remove("hidden");
      $("#answerInput").focus();
    }

    startCreateMode() {
      $("#modeSelection").classList.add("hidden");
      $("#createMode").classList.remove("hidden");
      this.generateOffer();
    }
    startJoinMode() {
      $("#modeSelection").classList.add("hidden");
      $("#joinMode").classList.remove("hidden");
    }

    async generateOffer() {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        const dc = pc.createDataChannel("gameData");
        dc.onopen = () => {
          console.log("datachannel open");
          this.setupDataChannel(dc);
        };
        pc.onicecandidate = () => {};
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await new Promise((r) => setTimeout(r, 600));
        const desc = pc.localDescription;
        $("#offerText").value = JSON.stringify(desc);
        this._tempPC = pc;
      } catch (e) {
        console.error(e);
      }
    }

    async processReceivedOffer() {
      const val = $("#receivedOfferInput").value.trim();
      if (!val) return alert("Paste an offer");
      try {
        const offer = JSON.parse(val);
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pc.ondatachannel = (ev) => this.setupDataChannel(ev.channel);
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await new Promise((r) => setTimeout(r, 600));
        $("#answerText").value = JSON.stringify(pc.localDescription);
        $("#answerText").classList.remove("hidden");
        $("#answerText").focus();
        this.peerConnection = pc;
      } catch (e) {
        console.error(e);
        alert("Invalid offer");
      }
    }

    async processManualAnswer() {
      const val = $("#answerInput").value.trim();
      if (!val) return alert("Paste answer");
      try {
        const answer = JSON.parse(val);
        if (this._tempPC) {
          await this._tempPC.setRemoteDescription(answer);
          this.setupDataChannel(this._tempPC.createDataChannel("gameData"));
        } else {
          console.warn("No temporary pc");
        }
        this.closeHandshakeModal();
        this.showGame();
      } catch (e) {
        console.error(e);
        alert("Invalid answer");
      }
    }

    setupDataChannel(channel) {
      this.dataChannel = channel;
      channel.onopen = () => {
        console.log("DC open");
        this.updatePeerStatus("connected");
        this.currentMode = "network";
        this.gameEngine.reset();
        this.closeHandshakeModal();
        this.showGame();
        this.renderGameBoard();
      };
      channel.onmessage = (ev) => {
        const move = this.gameEngine.deserializeMove(ev.data);
        if (move !== null) {
          this.gameEngine.makeMove(move);
          this.renderGameBoard();
          this.updateGameStatus();
        }
        if (ev.data === "rematch") {
          this.gameEngine.reset();
          this.renderGameBoard();
        }
      };
      channel.onclose = () => {
        this.updatePeerStatus("disconnected");
      };
    }

    updatePeerStatus(status) {
      $("#peerStatus") && ($("#peerStatus").textContent = status);
    }

    renderGameBoard() {
      $("#tictactoeBoard").classList.add("hidden");
      $("#connect4Board").classList.add("hidden");
      $("#numguessControls").classList.add("hidden");
      const names = {
        tictactoe: "Tic-Tac-Toe",
        connect4: "Connect Four",
        numguess: "Number Guessing",
      };
      $("#gameTitle").textContent =
        names[this.selectedGame] || this.selectedGame;
      switch (this.selectedGame) {
        case "tictactoe":
          this.renderTicTacToeBoard();
          break;
        case "connect4":
          this.renderConnect4Board();
          break;
        case "numguess":
          this.renderNumGuessBoard();
          break;
      }
      this.updateScoreDisplay();
    }
    renderTicTacToeBoard() {
      const boardEl = $("#tictactoeBoard");
      boardEl.innerHTML = "";
      boardEl.classList.remove("hidden");
      for (let i = 0; i < 9; i++) {
        const d = document.createElement("div");
        d.className = "cell";
        d.tabIndex = 0;
        d.dataset.index = i;
        if (this.gameEngine.board[i] === "x") {
          d.textContent = "X";
          d.classList.add("x");
        } else if (this.gameEngine.board[i] === "o") {
          d.textContent = "O";
          d.classList.add("o");
        }
        boardEl.appendChild(d);
      }
    }
    renderConnect4Board() {
      const boardEl = $("#connect4Board");
      boardEl.innerHTML = "";
      boardEl.classList.remove("hidden");
      for (let i = 0; i < 42; i++) {
        const d = document.createElement("div");
        d.className = "connect4-cell";
        d.dataset.index = i;
        d.dataset.col = i % 7;
        if (this.gameEngine.board[i] === "x") d.classList.add("red");
        else if (this.gameEngine.board[i] === "o") d.classList.add("yellow");
        boardEl.appendChild(d);
      }
    }
    renderNumGuessBoard() {
      $("#numguessControls").classList.remove("hidden");
      $("#numguessInfo").textContent = this.gameEngine.gameOver
        ? `The number was ${this.gameEngine.targetNumber}`
        : `Guess a number between 1 and 100! (${
            this.gameEngine.maxAttempts - this.gameEngine.attempts
          } attempts left)`;
      $(
        "#numguessAttempts"
      ).textContent = `Attempts: ${this.gameEngine.attempts}`;
    }
    updateScoreDisplay() {
      const s = this.gameEngine.score;
      $("#scoreDisplay").textContent =
        this.gameEngine.gameType === "numguess"
          ? `You: ${s.x} Opp: ${s.o}`
          : `Player X: ${s.x} | Player O: ${s.o} | Draws: ${s.draws}`;
    }

    updateGameStatus() {
      const statusEl = $("#gameStatus");
      if (!statusEl) return;
      if (this.gameEngine.gameOver) {
        statusEl.textContent =
          this.gameEngine.winner === "draw"
            ? "Draw"
            : `${this.gameEngine.winner.toUpperCase()} wins!`;
        $("#gameControls") && $("#gameControls").classList.remove("hidden");
      } else {
        statusEl.textContent =
          this.gameEngine.currentPlayer === "x"
            ? "Player X's turn"
            : "Player O's turn";
      }
    }

    handleCellClick(index, el) {
      if (this.selectedGame === "tictactoe") {
        if (this.gameEngine.makeMove(index)) {
          if (this.dataChannel && this.dataChannel.readyState === "open")
            this.dataChannel.send(this.gameEngine.serializeMove(index));
          this.renderGameBoard();
          this.updateGameStatus();
        }
      } else if (this.selectedGame === "connect4") {
        const col = index % 7;
        if (this.gameEngine.makeMove(col)) {
          if (this.dataChannel && this.dataChannel.readyState === "open")
            this.dataChannel.send(this.gameEngine.serializeMove(col));
          this.renderGameBoard();
          this.updateGameStatus();
        }
      }
    }

    makeNumGuess() {
      const val = parseInt($("#numguessInput").value, 10);
      if (!val || val < 1 || val > 100) return alert("Enter 1-100");
      if (this.gameEngine.makeMove(val)) {
        if (this.dataChannel && this.dataChannel.readyState === "open")
          this.dataChannel.send(this.gameEngine.serializeMove(val));
        this.renderNumGuessBoard();
        this.updateGameStatus();
      }
    }

    rematchGame() {
      this.gameEngine.reset();
      if (this.dataChannel && this.dataChannel.readyState === "open")
        this.dataChannel.send("rematch");
      this.renderGameBoard();
      this.updateGameStatus();
    }

    copyToClipboard(id) {
      const t = $("#" + id);
      if (!t) return;
      t.select && t.select();
      try {
        navigator.clipboard.writeText(t.value || t.textContent);
        alert("Copied to clipboard");
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = t.value || t.textContent;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("Copied");
      }
    }
  }

  // Export memory snapshot helper
  window.exportMemorySnapshot = function () {
    if (performance && performance.memory) {
      const memory = performance.memory;
      const snapshot = {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        ts: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "memory-snapshot.json";
      a.click();
      URL.revokeObjectURL(url);
    } else alert("Memory API not supported");
  };

  // Initialize app on DOMContentLoaded
  window.addEventListener("DOMContentLoaded", () => {
    try {
      window.appState = new AppState();
      console.log("AppState ready");
    } catch (e) {
      console.error("Init failed", e);
      alert("Initialization failed: " + e.message);
    }
  });
})();
