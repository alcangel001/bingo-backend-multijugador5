import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserManager {
    private users: Map<string, User> = new Map();
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    constructor() {
        this.initializeMockUsers();
    }

    private initializeMockUsers() {
        const mockUsers: User[] = [
            {
                id: 'user-1',
                username: 'admin',
                password: 'admin123',
                name: 'Administrador',
                email: 'admin@bingo.com',
                role: UserRole.ADMIN,
                balance: 10000,
                avatar: '👑',
                isOnline: false
            },
            {
                id: 'user-2',
                username: 'organizador1',
                password: 'org123',
                name: 'Organizador Principal',
                email: 'org@bingo.com',
                role: UserRole.ORGANIZER,
                balance: 5000,
                avatar: '🎯',
                isOnline: false
            },
            {
                id: 'user-3',
                username: 'jugador1',
                password: 'player123',
                name: 'Jugador Uno',
                email: 'player1@bingo.com',
                role: UserRole.USER,
                balance: 100,
                avatar: '🎮',
                isOnline: false
            },
            {
                id: 'user-4',
                username: 'jugador2',
                password: 'player456',
                name: 'Jugador Dos',
                email: 'player2@bingo.com',
                role: UserRole.USER,
                balance: 150,
                avatar: '🎲',
                isOnline: false
            }
        ];

        mockUsers.forEach(user => {
            this.users.set(user.id, user);
        });
    }

    getAllUsers(): User[] {
        return Array.from(this.users.values()).map(user => ({
            ...user,
            password: undefined // No enviar contraseñas al cliente
        }));
    }

    getUser(userId: string): User | undefined {
        const user = this.users.get(userId);
        if (user) {
            return {
                ...user,
                password: undefined
            };
        }
        return undefined;
    }

    getUserByUsername(username: string): User | undefined {
        for (const user of this.users.values()) {
            if (user.username.toLowerCase() === username.toLowerCase()) {
                return user;
            }
        }
        return undefined;
    }

    authenticateUser(username: string, password: string): { success: boolean; user?: User; error?: string } {
        const user = this.getUserByUsername(username);
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Contraseña incorrecta' };
        }

        return {
            success: true,
            user: {
                ...user,
                password: undefined
            }
        };
    }

    registerUser(userData: { username: string; password: string; name: string; email?: string }): { success: boolean; user?: User; error?: string } {
        // Verificar si el usuario ya existe
        if (this.getUserByUsername(userData.username)) {
            return { success: false, error: 'El nombre de usuario ya está en uso' };
        }

        // Verificar si el email ya está en uso
        if (userData.email) {
            for (const user of this.users.values()) {
                if (user.email && user.email.toLowerCase() === userData.email.toLowerCase()) {
                    return { success: false, error: 'El email ya está en uso' };
                }
            }
        }

        const newUser: User = {
            id: uuidv4(),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            role: UserRole.USER,
            balance: 0,
            avatar: '👤',
            isOnline: false
        };

        this.users.set(newUser.id, newUser);

        return {
            success: true,
            user: {
                ...newUser,
                password: undefined
            }
        };
    }

    connectUser(userId: string, socketId: string): void {
        const user = this.users.get(userId);
        if (user) {
            user.isOnline = true;
            user.socketId = socketId;
            this.connectedUsers.set(userId, socketId);
            this.users.set(userId, user);
        }
    }

    disconnectUser(socketId: string): User | undefined {
        // Encontrar el usuario por socketId
        let disconnectedUser: User | undefined;
        for (const [userId, userSocketId] of this.connectedUsers.entries()) {
            if (userSocketId === socketId) {
                const user = this.users.get(userId);
                if (user) {
                    user.isOnline = false;
                    user.socketId = undefined;
                    this.users.set(userId, user);
                    disconnectedUser = user;
                }
                this.connectedUsers.delete(userId);
                break;
            }
        }
        return disconnectedUser;
    }

    updateUserBalance(userId: string, amount: number, operation: 'add' | 'subtract'): { success: boolean; user?: User; error?: string } {
        const user = this.users.get(userId);
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        const newBalance = operation === 'add' ? user.balance + amount : user.balance - amount;
        
        if (newBalance < 0) {
            return { success: false, error: 'Saldo insuficiente' };
        }

        user.balance = newBalance;
        this.users.set(userId, user);

        return {
            success: true,
            user: {
                ...user,
                password: undefined
            }
        };
    }

    transferCredits(fromUserId: string, toUserId: string, amount: number): { success: boolean; error?: string; fromUser?: User; toUser?: User } {
        const fromUser = this.users.get(fromUserId);
        const toUser = this.users.get(toUserId);

        if (!fromUser || !toUser) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        if (fromUser.balance < amount) {
            return { success: false, error: 'Saldo insuficiente' };
        }

        if (amount <= 0) {
            return { success: false, error: 'El monto debe ser mayor a 0' };
        }

        fromUser.balance -= amount;
        toUser.balance += amount;

        this.users.set(fromUserId, fromUser);
        this.users.set(toUserId, toUser);

        return {
            success: true,
            fromUser: { ...fromUser, password: undefined },
            toUser: { ...toUser, password: undefined }
        };
    }

    getConnectedUsers(): User[] {
        return Array.from(this.connectedUsers.keys())
            .map(userId => this.getUser(userId))
            .filter(user => user !== undefined) as User[];
    }

    getUserSocketId(userId: string): string | undefined {
        return this.connectedUsers.get(userId);
    }
}

