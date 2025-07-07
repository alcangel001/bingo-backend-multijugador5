"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const types_1 = require("../types");
const bingo_1 = require("../utils/bingo");
const uuid_1 = require("uuid");
class GameManager {
    constructor() {
        this.games = new Map();
        // Inicializar con algunos juegos de ejemplo
        this.initializeMockGames();
    }
    initializeMockGames() {
        const mockGame = {
            id: 'game-1',
            organizerId: 'user-1',
            organizerName: 'Admin',
            prize: 100,
            cardPrice: 10,
            status: types_1.GameStatus.WAITING,
            players: [],
            calledNumbers: [],
            winners: [],
            createdAt: Date.now(),
            pot: 0,
            mode: types_1.GameMode.MANUAL,
            pattern: types_1.BingoPattern.ANY_LINE,
            payoutComplete: false
        };
        this.games.set(mockGame.id, mockGame);
    }
    getAllGames() {
        return Array.from(this.games.values());
    }
    getGame(gameId) {
        return this.games.get(gameId);
    }
    createGame(gameData, organizer) {
        const game = {
            id: (0, uuid_1.v4)(),
            organizerId: organizer.id,
            organizerName: organizer.name,
            prize: gameData.prize || 0,
            cardPrice: gameData.cardPrice || 0,
            status: types_1.GameStatus.WAITING,
            players: [],
            calledNumbers: [],
            winners: [],
            createdAt: Date.now(),
            pot: 0,
            mode: gameData.mode || types_1.GameMode.MANUAL,
            pattern: gameData.pattern || types_1.BingoPattern.ANY_LINE,
            payoutComplete: false
        };
        this.games.set(game.id, game);
        return game;
    }
    joinGame(gameId, user) {
        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, error: 'Juego no encontrado' };
        }
        if (game.status !== types_1.GameStatus.WAITING) {
            return { success: false, error: 'El juego ya ha comenzado' };
        }
        // Verificar si el usuario ya está en el juego
        if (game.players.some(p => p.userId === user.id)) {
            return { success: false, error: 'Ya estás en este juego' };
        }
        // Verificar si el usuario tiene suficiente balance
        if (user.balance < game.cardPrice) {
            return { success: false, error: 'Saldo insuficiente' };
        }
        // Generar cartón de bingo para el jugador
        const playerCards = [(0, bingo_1.generateBingoCard)()];
        const gamePlayer = {
            userId: user.id,
            cards: playerCards
        };
        game.players.push(gamePlayer);
        game.pot += game.cardPrice;
        this.games.set(gameId, game);
        return { success: true, game };
    }
    startGame(gameId, organizerId) {
        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, error: 'Juego no encontrado' };
        }
        if (game.organizerId !== organizerId) {
            return { success: false, error: 'Solo el organizador puede iniciar el juego' };
        }
        if (game.status !== types_1.GameStatus.WAITING) {
            return { success: false, error: 'El juego ya ha comenzado' };
        }
        if (game.players.length === 0) {
            return { success: false, error: 'No hay jugadores en el juego' };
        }
        game.status = types_1.GameStatus.IN_PROGRESS;
        this.games.set(gameId, game);
        return { success: true, game };
    }
    callNumber(gameId, organizerId, number) {
        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, error: 'Juego no encontrado' };
        }
        if (game.organizerId !== organizerId) {
            return { success: false, error: 'Solo el organizador puede llamar números' };
        }
        if (game.status !== types_1.GameStatus.IN_PROGRESS) {
            return { success: false, error: 'El juego no está en progreso' };
        }
        if (number < 1 || number > 75) {
            return { success: false, error: 'Número inválido (debe estar entre 1 y 75)' };
        }
        if (game.calledNumbers.includes(number)) {
            return { success: false, error: 'Este número ya fue llamado' };
        }
        game.calledNumbers.push(number);
        this.games.set(gameId, game);
        return { success: true, game };
    }
    claimBingo(gameId, userId, cardIndex) {
        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, error: 'Juego no encontrado' };
        }
        if (game.status !== types_1.GameStatus.IN_PROGRESS) {
            return { success: false, error: 'El juego no está en progreso' };
        }
        const player = game.players.find(p => p.userId === userId);
        if (!player) {
            return { success: false, error: 'No estás en este juego' };
        }
        if (cardIndex >= player.cards.length) {
            return { success: false, error: 'Cartón inválido' };
        }
        const card = player.cards[cardIndex];
        const isWinner = (0, bingo_1.checkBingoWinner)(card, game.calledNumbers, game.pattern);
        if (!isWinner) {
            return { success: false, error: 'No tienes bingo en este cartón' };
        }
        // Verificar si ya hay ganadores
        if (game.winners.length === 0) {
            game.winners.push(userId);
            game.status = types_1.GameStatus.FINISHED;
            this.games.set(gameId, game);
            return { success: true, game, isWinner: true };
        }
        return { success: false, error: 'Ya hay un ganador en este juego' };
    }
    markNumber(gameId, userId, cardIndex, row, col) {
        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, error: 'Juego no encontrado' };
        }
        const player = game.players.find(p => p.userId === userId);
        if (!player) {
            return { success: false, error: 'No estás en este juego' };
        }
        if (cardIndex >= player.cards.length) {
            return { success: false, error: 'Cartón inválido' };
        }
        const card = player.cards[cardIndex];
        if (row >= card.length || col >= card[row].length) {
            return { success: false, error: 'Posición inválida en el cartón' };
        }
        const cell = card[row][col];
        if (cell.value === 'FREE') {
            return { success: false, error: 'La casilla FREE ya está marcada' };
        }
        // Verificar si el número fue llamado
        if (!game.calledNumbers.includes(cell.value)) {
            return { success: false, error: 'Este número aún no ha sido llamado' };
        }
        // Marcar la casilla
        cell.marked = true;
        this.games.set(gameId, game);
        return { success: true, game };
    }
    deleteGame(gameId, organizerId) {
        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, error: 'Juego no encontrado' };
        }
        if (game.organizerId !== organizerId) {
            return { success: false, error: 'Solo el organizador puede eliminar el juego' };
        }
        if (game.status === types_1.GameStatus.IN_PROGRESS) {
            return { success: false, error: 'No se puede eliminar un juego en progreso' };
        }
        this.games.delete(gameId);
        return { success: true };
    }
    updateGame(game) {
        this.games.set(game.id, game);
    }
}
exports.GameManager = GameManager;
//# sourceMappingURL=GameManager.js.map