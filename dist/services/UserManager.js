"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const types_1 = require("../types");
const uuid_1 = require("uuid");
class UserManager {
    constructor() {
        this.users = new Map();
        this.connectedUsers = new Map(); // userId -> socketId
        this.initializeMockUsers();
    }
    initializeMockUsers() {
        const mockUsers = [
            {
                id: 'user-1',
                username: 'admin',
                password: 'admin123',
                name: 'Administrador',
                email: 'admin@bingo.com',
                role: types_1.UserRole.ADMIN,
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
                role: types_1.UserRole.ORGANIZER,
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
                role: types_1.UserRole.USER,
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
                role: types_1.UserRole.USER,
                balance: 150,
                avatar: '🎲',
                isOnline: false
            }
        ];
        mockUsers.forEach(user => {
            this.users.set(user.id, user);
        });
    }
    getAllUsers() {
        return Array.from(this.users.values()).map(user => ({
            ...user,
            password: undefined // No enviar contraseñas al cliente
        }));
    }
    getUser(userId) {
        const user = this.users.get(userId);
        if (user) {
            return {
                ...user,
                password: undefined
            };
        }
        return undefined;
    }
    getUserByUsername(username) {
        for (const user of this.users.values()) {
            if (user.username.toLowerCase() === username.toLowerCase()) {
                return user;
            }
        }
        return undefined;
    }
    authenticateUser(username, password) {
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
    registerUser(userData) {
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
        const newUser = {
            id: (0, uuid_1.v4)(),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            role: types_1.UserRole.USER,
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
    connectUser(userId, socketId) {
        const user = this.users.get(userId);
        if (user) {
            user.isOnline = true;
            user.socketId = socketId;
            this.connectedUsers.set(userId, socketId);
            this.users.set(userId, user);
        }
    }
    disconnectUser(socketId) {
        // Encontrar el usuario por socketId
        let disconnectedUser;
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
    updateUserBalance(userId, amount, operation) {
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
    transferCredits(fromUserId, toUserId, amount) {
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
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys())
            .map(userId => this.getUser(userId))
            .filter(user => user !== undefined);
    }
    getUserSocketId(userId) {
        return this.connectedUsers.get(userId);
    }
}
exports.UserManager = UserManager;
//# sourceMappingURL=UserManager.js.map