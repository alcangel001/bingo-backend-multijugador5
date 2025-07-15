import { Server as SocketIOServer, Socket } from 'socket.io';
import { UserManager } from './UserManager';
import { GameManager } from './GameManager';
import { RaffleManager } from './RaffleManager';
import { ChatManager } from './ChatManager';

export class SocketService {
    private io: SocketIOServer;
    private userManager: UserManager;
    private gameManager: GameManager;
    private raffleManager: RaffleManager;
    private chatManager: ChatManager;

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

            // Eventos de autenticación y usuario
            socket.on('user:login', (data) => this.userManager.login(socket, data));
            socket.on('user:register', (data) => this.userManager.register(socket, data));
            // Si tienes un método logout en UserManager y lo usas:
            // socket.on('user:logout', (data) => this.userManager.logout(socket, data));

            // Eventos de juegos
            socket.on('game:create', (data) => this.gameManager.handleCreateGame(socket, data));
            socket.on('game:join', (data) => this.gameManager.handleJoinGame(socket, data));
            socket.on('game:start', (data) => this.gameManager.handleStartGame(socket, data));
            socket.on('game:call-number', (data) => this.gameManager.handleCallNumber(socket, data));
            socket.on('game:claim-bingo', (data) => this.gameManager.handleClaimBingo(socket, data));
            socket.on('game:mark-number', (data) => this.gameManager.handleMarkNumber(socket, data));

            // Eventos de chat
            socket.on('chat:send-message', (data) => this.chatManager.handleSendMessage(socket, data));
            socket.on('chat:mark-read', (data) => this.chatManager.handleMarkRead(socket, data));

            // Eventos de rifas
            socket.on('raffle:create', (data) => this.raffleManager.handleCreateRaffle(socket, data));
            socket.on('raffle:buy-ticket', (data) => this.raffleManager.handleBuyTicket(socket, data));
            socket.on('raffle:draw', (data) => this.raffleManager.handleDrawRaffle(socket, data));

            // Eventos de créditos
            // Asegúrate de que estos métodos existan en UserManager y que la lógica sea correcta
            socket.on('credits:transfer', (data) => this.userManager.handleTransferCredits(socket, data));
            socket.on('credits:request', (data) => this.userManager.handleRequestCredits(socket, data));

            // Desconexión
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    private handleDisconnect(socket: Socket): void {
        console.log(`Cliente desconectado: ${socket.id}`);
        this.userManager.removeUserSocketId(socket.id);
        // Aquí podrías añadir lógica para manejar la desconexión de juegos o rifas
    }
}
