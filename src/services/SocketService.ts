import { Server as SocketIOServer, Socket } from 'socket.io';
import { UserManager } from './UserManager';
import { GameManager } from './GameManager';
import { RaffleManager } from './RaffleManager';
import { ChatManager } from './ChatManager';
import { User } from '../types';

export class SocketService {
    private io: SocketIOServer;
    private userManager: UserManager;
    private gameManager: GameManager;
    private raffleManager: RaffleManager;
    private chatManager: ChatManager;
    private authenticatedSockets: Map<string, User> = new Map(); // socketId -> User

    constructor(io: SocketIOServer) {
        this.io = io;
        this.userManager = new UserManager();
        this.gameManager = new GameManager();
        this.raffleManager = new RaffleManager();
        this.chatManager = new ChatManager();
        
        this.setupSocketHandlers();
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`Cliente conectado: ${socket.id}`);

            // Enviar estado inicial
            this.sendInitialState(socket);

            // Eventos de autenticación
            socket.on('user:login', (data) => this.handleUserLogin(socket, data));
            socket.on('user:register', (data) => this.handleUserRegister(socket, data));
            socket.on('user:logout', (data) => this.handleUserLogout(socket, data));

            // Eventos de juegos
            socket.on('game:create', (data) => this.handleGameCreate(socket, data));
            socket.on('game:join', (data) => this.handleGameJoin(socket, data));
            socket.on('game:start', (data) => this.handleGameStart(socket, data));
            socket.on('game:call-number', (data) => this.handleGameCallNumber(socket, data));
            socket.on('game:claim-bingo', (data) => this.handleGameClaimBingo(socket, data));
            socket.on('game:mark-number', (data) => this.handleGameMarkNumber(socket, data));

            // Eventos de chat
            socket.on('chat:send-message', (data) => this.handleChatSendMessage(socket, data));
            socket.on('chat:mark-read', (data) => this.handleChatMarkRead(socket, data));

            // Eventos de rifas
            socket.on('raffle:create', (data) => this.handleRaffleCreate(socket, data));
            socket.on('raffle:buy-ticket', (data) => this.handleRaffleBuyTicket(socket, data));
            socket.on('raffle:draw', (data) => this.handleRaffleDraw(socket, data));

            // Eventos de créditos
            socket.on('credits:transfer', (data) => this.handleCreditsTransfer(socket, data));

            // Desconexión
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    private sendInitialState(socket: Socket): void {
        const games = this.gameManager.getAllGames();
        const raffles = this.raffleManager.getAllRaffles();
        const users = this.userManager.getAllUsers();

        socket.emit('state:initial', { games, raffles, users });
    }

    private handleUserLogin(socket: Socket, data: { username: string; password: string }): void {
        const result = this.userManager.authenticateUser(data.username, data.password);
        
        if (result.success && result.user) {
            this.authenticatedSockets.set(socket.id, result.user);
            this.userManager.connectUser(result.user.id, socket.id);
            
            socket.emit('user:authenticated', { user: result.user, success: true });
            
            // Notificar a todos los clientes sobre el usuario conectado
            this.io.emit('state:initial', {
                games: this.gameManager.getAllGames(),
                raffles: this.raffleManager.getAllRaffles(),
                users: this.userManager.getAllUsers()
            });
        } else {
            socket.emit('user:authenticated', { success: false, error: result.error });
        }
    }

    private handleUserRegister(socket: Socket, data: { username: string; password: string; name: string; email?: string }): void {
        const result = this.userManager.registerUser(data);
        
        if (result.success && result.user) {
            socket.emit('user:registered', { user: result.user, success: true });
        } else {
            socket.emit('user:registered', { success: false, error: result.error });
        }
    }

    private handleUserLogout(socket: Socket, data: { userId: string }): void {
        this.authenticatedSockets.delete(socket.id);
        this.userManager.disconnectUser(socket.id);
        
        // Notificar a todos los clientes sobre el cambio de estado
        this.io.emit('state:initial', {
            games: this.gameManager.getAllGames(),
            raffles: this.raffleManager.getAllRaffles(),
            users: this.userManager.getAllUsers()
        });
    }

    private handleGameCreate(socket: Socket, data: any): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const game = this.gameManager.createGame(data, user);
        
        // Notificar a todos los clientes sobre el nuevo juego
        this.io.emit('game:created', { game });
    }

    private handleGameJoin(socket: Socket, data: { gameId: string; userId: string }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user || user.id !== data.userId) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.gameManager.joinGame(data.gameId, user);
        
        if (result.success && result.game) {
            // Descontar el precio del cartón del balance del usuario
            this.userManager.updateUserBalance(user.id, result.game.cardPrice, 'subtract');
            
            // Notificar a todos los clientes sobre el jugador que se unió
            this.io.emit('game:updated', { game: result.game });
            this.io.emit('credits:updated', { userId: user.id, newBalance: user.balance - result.game.cardPrice });
        } else {
            socket.emit('error', { message: result.error || 'Error al unirse al juego', code: 'GAME_JOIN_ERROR' });
        }
    }

    private handleGameStart(socket: Socket, data: { gameId: string }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.gameManager.startGame(data.gameId, user.id);
        
        if (result.success && result.game) {
            this.io.emit('game:started', { gameId: data.gameId });
            this.io.emit('game:updated', { game: result.game });
        } else {
            socket.emit('error', { message: result.error || 'Error al iniciar el juego', code: 'GAME_START_ERROR' });
        }
    }

    private handleGameCallNumber(socket: Socket, data: { gameId: string; number: number }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.gameManager.callNumber(data.gameId, user.id, data.number);
        
        if (result.success && result.game) {
            this.io.emit('game:number-called', { gameId: data.gameId, number: data.number });
            this.io.emit('game:updated', { game: result.game });
        } else {
            socket.emit('error', { message: result.error || 'Error al llamar número', code: 'GAME_CALL_ERROR' });
        }
    }

    private handleGameClaimBingo(socket: Socket, data: { gameId: string; userId: string; cardIndex: number }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user || user.id !== data.userId) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.gameManager.claimBingo(data.gameId, data.userId, data.cardIndex);
        
        if (result.success && result.game && result.isWinner) {
            // Pagar el premio al ganador
            this.userManager.updateUserBalance(data.userId, result.game.prize, 'add');
            
            this.io.emit('game:winner-declared', { gameId: data.gameId, winnerId: data.userId });
            this.io.emit('game:updated', { game: result.game });
            this.io.emit('credits:updated', { userId: data.userId, newBalance: user.balance + result.game.prize });
        } else {
            socket.emit('error', { message: result.error || 'Error al reclamar bingo', code: 'BINGO_CLAIM_ERROR' });
        }
    }

    private handleGameMarkNumber(socket: Socket, data: { gameId: string; userId: string; cardIndex: number; row: number; col: number }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user || user.id !== data.userId) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.gameManager.markNumber(data.gameId, data.userId, data.cardIndex, data.row, data.col);
        
        if (result.success && result.game) {
            this.io.emit('game:card-marked', { 
                gameId: data.gameId, 
                userId: data.userId, 
                cardIndex: data.cardIndex, 
                row: data.row, 
                col: data.col 
            });
        } else {
            socket.emit('error', { message: result.error || 'Error al marcar número', code: 'MARK_ERROR' });
        }
    }

    private handleChatSendMessage(socket: Socket, data: any): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const message = this.chatManager.sendMessage(data, user);
        this.io.emit('chat:new-message', { message });
    }

    private handleChatMarkRead(socket: Socket, data: { messageId: string }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        this.chatManager.markMessageAsRead(data.messageId);
        this.io.emit('chat:message-read', { messageId: data.messageId });
    }

    private handleRaffleCreate(socket: Socket, data: any): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const raffle = this.raffleManager.createRaffle(data, user);
        this.io.emit('raffle:created', { raffle });
    }

    private handleRaffleBuyTicket(socket: Socket, data: { raffleId: string; ticketNumber: number; userId: string }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user || user.id !== data.userId) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.raffleManager.buyTicket(data.raffleId, data.ticketNumber, user);
        
        if (result.success && result.raffle) {
            this.userManager.updateUserBalance(user.id, result.raffle.ticketPrice, 'subtract');
            
            this.io.emit('raffle:ticket-sold', { 
                raffleId: data.raffleId, 
                ticketNumber: data.ticketNumber, 
                buyerId: data.userId 
            });
            this.io.emit('credits:updated', { userId: user.id, newBalance: user.balance - result.raffle.ticketPrice });
        } else {
            socket.emit('error', { message: result.error || 'Error al comprar boleto', code: 'TICKET_BUY_ERROR' });
        }
    }

    private handleRaffleDraw(socket: Socket, data: { raffleId: string }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.raffleManager.drawWinner(data.raffleId, user.id);
        
        if (result.success && result.raffle && result.winnerId) {
            // Pagar el premio al ganador
            this.userManager.updateUserBalance(result.winnerId, result.raffle.prize, 'add');
            
            this.io.emit('raffle:winner-drawn', { 
                raffleId: data.raffleId, 
                winnerTicket: result.raffle.winnerTicket!, 
                winnerId: result.winnerId 
            });
            this.io.emit('credits:updated', { userId: result.winnerId, newBalance: this.userManager.getUser(result.winnerId)?.balance || 0 });
        } else {
            socket.emit('error', { message: result.error || 'Error al sortear', code: 'RAFFLE_DRAW_ERROR' });
        }
    }

    private handleCreditsTransfer(socket: Socket, data: { fromUserId: string; toUserId: string; amount: number }): void {
        const user = this.authenticatedSockets.get(socket.id);
        if (!user || user.id !== data.fromUserId) {
            socket.emit('error', { message: 'No autenticado', code: 'NOT_AUTHENTICATED' });
            return;
        }

        const result = this.userManager.transferCredits(data.fromUserId, data.toUserId, data.amount);
        
        if (result.success && result.fromUser && result.toUser) {
            this.io.emit('credits:updated', { userId: data.fromUserId, newBalance: result.fromUser.balance });
            this.io.emit('credits:updated', { userId: data.toUserId, newBalance: result.toUser.balance });
        } else {
            socket.emit('error', { message: result.error || 'Error en transferencia', code: 'TRANSFER_ERROR' });
        }
    }

    private handleDisconnect(socket: Socket): void {
        console.log(`Cliente desconectado: ${socket.id}`);
        
        const user = this.authenticatedSockets.get(socket.id);
        if (user) {
            this.userManager.disconnectUser(socket.id);
            this.authenticatedSockets.delete(socket.id);
            
            // Notificar a todos los clientes sobre el cambio de estado
            this.io.emit('state:initial', {
                games: this.gameManager.getAllGames(),
                raffles: this.raffleManager.getAllRaffles(),
                users: this.userManager.getAllUsers()
            });
        }
    }
}

