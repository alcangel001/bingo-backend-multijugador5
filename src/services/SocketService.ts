import { Server as SocketIOServer, Socket } from 'socket.io';
import { UserManager } from './UserManager';
import { GameManager } from './GameManager'; // Asumiendo que tienes un GameManager
import { RaffleManager } from './RaffleManager'; // Asumiendo que tienes un RaffleManager
import { ChatManager } from './ChatManager'; // Asumiendo que tienes un ChatManager

export class SocketService {
    private io: SocketIOServer;
    private userManager: UserManager;
    private gameManager: GameManager;
    private raffleManager: RaffleManager;
    private chatManager: ChatManager;

    constructor(io: SocketIOServer) {
        this.io = io;
        this.userManager = new UserManager();
        this.gameManager = new GameManager(); // Inicializa tu GameManager
        this.raffleManager = new RaffleManager(); // Inicializa tu RaffleManager
        this.chatManager = new ChatManager(); // Inicializa tu ChatManager
        
        this.setupSocketHandlers();
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`Cliente conectado: ${socket.id}`);

            // Enviar estado inicial (si aplica)
            // this.sendInitialState(socket);

            // Eventos de autenticación y usuario
            socket.on('user:login', (data) => this.userManager.login(socket, data));
            socket.on('user:register', (data) => this.userManager.register(socket, data));
            // socket.on('user:logout', (data) => this.userManager.logout(socket, data)); // Si tienes un método logout en UserManager

            // Eventos de juegos
            socket.on('game:create', (data) => this.gameManager.createGame(socket, data));
            socket.on('game:join', (data) => this.gameManager.joinGame(socket, data));
            socket.on('game:start', (data) => this.gameManager.startGame(socket, data));
            socket.on('game:call-number', (data) => this.gameManager.callNumber(socket, data));
            socket.on('game:claim-bingo', (data) => this.gameManager.claimBingo(socket, data));
            socket.on('game:mark-number', (data) => this.gameManager.markNumber(socket, data));

            // Eventos de chat
            socket.on('chat:send-message', (data) => this.chatManager.sendMessage(socket, data));
            socket.on('chat:mark-read', (data) => this.chatManager.markMessageRead(socket, data));

            // Eventos de rifas
            socket.on('raffle:create', (data) => this.raffleManager.createRaffle(socket, data));
            socket.on('raffle:buy-ticket', (data) => this.raffleManager.buyTicket(socket, data));
            socket.on('raffle:draw', (data) => this.raffleManager.drawRaffle(socket, data));

            // Eventos de créditos
            socket.on('credits:transfer', (data) => this.userManager.transferCredits(socket, data));
            socket.on('credits:request', (data) => this.userManager.requestCredits(socket, data));

            // Desconexión
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    private handleDisconnect(socket: Socket): void {
        console.log(`Cliente desconectado: ${socket.id}`);
        this.userManager.removeUserSocketId(socket.id);
        // Aquí podrías añadir lógica para manejar la desconexión de juegos o rifas
    }

    // Si tienes un método para enviar el estado inicial, descomenta y úsalo
    // private sendInitialState(socket: Socket): void {
    //     // Ejemplo: enviar lista de usuarios, juegos, rifas, etc.
    //     socket.emit('initial:users', this.userManager.getAllUsers());
    //     // ... otros datos iniciales
    // }
}
