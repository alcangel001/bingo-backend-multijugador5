import { Socket } from 'socket.io';

interface User {
    id: string;
    username: string;
    password?: string; // La contraseña no debería ser enviada al frontend
    role: 'admin' | 'organizer' | 'player';
    credits: number;
    socketId?: string; // Añadimos socketId para rastrear la conexión
}

interface CreditRequest {
    id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
}

export class UserManager {
    private users: User[] = [];
    private creditRequests: CreditRequest[] = [];

    constructor() {
        // Usuarios de prueba
        this.users.push({ id: '1', username: 'admin', password: 'admin123', role: 'admin', credits: 1000 });
        this.users.push({ id: '2', username: 'organizador1', password: 'org123', role: 'organizer', credits: 500 });
        this.users.push({ id: '3', username: 'jugador1', password: 'player123', role: 'player', credits: 100 });
    }

    public async login(socket: Socket, data: any): Promise<void> {
        console.log(`[UserManager] Intento de login para usuario: ${data.username}`);
        const { username, password } = data;

        const user = this.users.find(u => u.username === username);

        if (!user) {
            console.log(`[UserManager] Login fallido: Usuario ${username} no encontrado.`);
            socket.emit("user:loginFailed", "Usuario o contraseña incorrectos.");
            return;
        }

        if (user.password !== password) {
            console.log(`[UserManager] Login fallido: Contraseña incorrecta para ${username}.`);
            socket.emit("user:loginFailed", "Usuario o contraseña incorrectos.");
            return;
        }

        // Si el login es exitoso
        user.socketId = socket.id; // Asignar el socketId al usuario
        console.log(`[UserManager] Login exitoso para ${username}. Socket ID: ${socket.id}`);
        // Emitir el usuario sin la contraseña por seguridad
        const userToSend = { ...user };
        delete userToSend.password;
        socket.emit("user:loggedIn", userToSend); 
        socket.emit("user:data", userToSend); 
    }

    public async register(socket: Socket, data: any): Promise<void> {
        const { username, password, role } = data;
        if (this.users.some(u => u.username === username)) {
            socket.emit("user:registerFailed", "El nombre de usuario ya existe.");
            return;
        }
        const newUser: User = {
            id: (this.users.length + 1).toString(),
            username,
            password,
            role,
            credits: 0
        };
        this.users.push(newUser);
        socket.emit("user:registered", newUser);
    }

    public getUserById(id: string): User | undefined {
        return this.users.find(user => user.id === id);
    }

    public getUserBySocketId(socketId: string): User | undefined {
        return this.users.find(user => user.socketId === socketId);
    }

    public updateCredits(userId: string, amount: number): boolean {
        const user = this.getUserById(userId);
        if (user) {
            user.credits += amount;
            return true;
        }
        return false;
    }

    public requestCredits(socket: Socket, data: any): void {
        const { userId, amount } = data;
        const user = this.getUserById(userId);
        if (user && user.role === 'player') {
            const newRequest: CreditRequest = {
                id: (this.creditRequests.length + 1).toString(),
                userId,
                amount,
                status: 'pending'
            };
            this.creditRequests.push(newRequest);
            socket.emit("credits:requestSubmitted", newRequest);
        } else {
            socket.emit("credits:requestFailed", "Solo los jugadores pueden solicitar créditos.");
        }
    }

    public approveCreditRequest(requestId: string): boolean {
        const request = this.creditRequests.find(req => req.id === requestId);
        if (request && request.status === 'pending') {
            const user = this.getUserById(request.userId);
            if (user) {
                user.credits += request.amount;
                request.status = 'approved';
                return true;
            }
        }
        return false;
    }

    public rejectCreditRequest(requestId: string): boolean {
        const request = this.creditRequests.find(req => req.id === requestId);
        if (request && request.status === 'pending') {
            request.status = 'rejected';
            return true;
        }
        return false;
    }

    public getCreditRequests(): CreditRequest[] {
        return this.creditRequests;
    }

    public removeUserSocketId(socketId: string): void {
        const user = this.users.find(u => u.socketId === socketId);
        if (user) {
            user.socketId = undefined;
        }
    }

    public getAllUsers(): User[] {
        // No devolver contraseñas
        return this.users.map(user => {
            const userCopy = { ...user };
            delete userCopy.password;
            return userCopy;
        });
    }
}
