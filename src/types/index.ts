export enum UserRole {
    USER = 'user',
    ORGANIZER = 'organizer',
    ADMIN = 'admin',
}

export interface User {
    id: string;
    username: string;
    password?: string;
    name: string;
    email?: string;
    role: UserRole;
    balance: number;
    avatar: string;
    isOnline?: boolean;
    socketId?: string;
}

export interface BingoNumber {
    value: number;
    marked: boolean;
}

export type BingoCard = (BingoNumber | { value: 'FREE'; marked: true })[][];

export interface GamePlayer {
    userId: string;
    cards: BingoCard[];
}

export enum GameStatus {
    WAITING = 'Esperando Jugadores',
    IN_PROGRESS = 'En Progreso',
    FINISHED = 'Finalizado',
}

export enum GameMode {
    AUTOMATIC = 'Automático',
    MANUAL = 'Manual',
}

export enum BingoPattern {
    FULL_HOUSE = 'Cartón Lleno',
    ANY_LINE = 'Cualquier Línea',
    FOUR_CORNERS = '4 Esquinas',
    CROSS = 'Cruz',
    LETTER_X = 'Letra X',
    SMALL_SQUARE = 'Cuadrito',
    TOP_ROW = 'Línea Arriba',
    MIDDLE_ROW = 'Línea Medio',
    BOTTOM_ROW = 'Línea Abajo',
    LEFT_L = 'L Izquierda',
    RIGHT_L = 'L Derecha',
}

export enum CreditRequestStatus {
    PENDING = 'Pendiente',
    APPROVED = 'Aprobado',
    REJECTED = 'Rechazado',
}

export interface CreditRequest {
    id: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    amount: number;
    status: CreditRequestStatus;
    createdAt: number;
    paymentProofUrl?: string;
}

export interface Game {
    id: string;
    organizerId: string;
    organizerName: string;
    prize: number;
    cardPrice: number;
    status: GameStatus;
    players: GamePlayer[];
    calledNumbers: number[];
    winners: string[];
    createdAt: number;
    pot: number;
    mode: GameMode;
    pattern: BingoPattern;
    payoutComplete?: boolean;
}

export enum RaffleStatus {
    WAITING = 'Abierta',
    FINISHED = 'Finalizada',
}

export enum RaffleTicketStatus {
    AVAILABLE = 'Disponible',
    RESERVED = 'Reservado',
    SOLD = 'Vendido',
}

export enum RaffleMode {
    AUTOMATIC = 'Automático',
    MANUAL = 'Manual',
}

export interface RaffleTicket {
    number: number;
    status: RaffleTicketStatus;
    ownerId?: string;
    ownerName?: string;
    paymentProofUrl?: string;
}

export interface Raffle {
    id: string;
    organizerId: string;
    organizerName: string;
    name: string;
    prize: number;
    ticketPrice: number;
    status: RaffleStatus;
    tickets: RaffleTicket[];
    createdAt: number;
    mode: RaffleMode;
    winnerTicket?: number;
    winnerId?: string;
    payoutComplete?: boolean;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    text: string;
    timestamp: number;
    read: boolean;
}

// Eventos WebSocket
export interface SocketEvents {
    // Eventos del cliente al servidor
    'user:login': (data: { username: string; password: string }) => void;
    'user:logout': (data: { userId: string }) => void;
    'user:register': (data: { username: string; password: string; name: string; email?: string }) => void;
    
    'game:create': (data: Partial<Game>) => void;
    'game:join': (data: { gameId: string; userId: string }) => void;
    'game:start': (data: { gameId: string }) => void;
    'game:call-number': (data: { gameId: string; number: number }) => void;
    'game:claim-bingo': (data: { gameId: string; userId: string; cardIndex: number }) => void;
    'game:mark-number': (data: { gameId: string; userId: string; cardIndex: number; row: number; col: number }) => void;
    
    'chat:send-message': (data: ChatMessage) => void;
    'chat:mark-read': (data: { messageId: string }) => void;
    
    'raffle:create': (data: Partial<Raffle>) => void;
    'raffle:buy-ticket': (data: { raffleId: string; ticketNumber: number; userId: string }) => void;
    'raffle:draw': (data: { raffleId: string }) => void;
    
    'credits:transfer': (data: { fromUserId: string; toUserId: string; amount: number }) => void;
    
    // Eventos del servidor al cliente
    'state:initial': (data: { games: Game[]; raffles: Raffle[]; users: User[] }) => void;
    'user:authenticated': (data: { user: User; success: boolean; error?: string }) => void;
    'user:registered': (data: { user: User; success: boolean; error?: string }) => void;
    
    'game:created': (data: { game: Game }) => void;
    'game:updated': (data: { game: Game }) => void;
    'game:player-joined': (data: { gameId: string; player: GamePlayer }) => void;
    'game:started': (data: { gameId: string }) => void;
    'game:number-called': (data: { gameId: string; number: number }) => void;
    'game:winner-declared': (data: { gameId: string; winnerId: string }) => void;
    'game:card-marked': (data: { gameId: string; userId: string; cardIndex: number; row: number; col: number }) => void;
    
    'chat:new-message': (data: { message: ChatMessage }) => void;
    'chat:message-read': (data: { messageId: string }) => void;
    
    'raffle:created': (data: { raffle: Raffle }) => void;
    'raffle:ticket-sold': (data: { raffleId: string; ticketNumber: number; buyerId: string }) => void;
    'raffle:winner-drawn': (data: { raffleId: string; winnerTicket: number; winnerId: string }) => void;
    
    'credits:updated': (data: { userId: string; newBalance: number }) => void;
    
    'error': (data: { message: string; code: string }) => void;
}

