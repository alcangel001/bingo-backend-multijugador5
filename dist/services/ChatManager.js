"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatManager = void 0;
const uuid_1 = require("uuid");
class ChatManager {
    constructor() {
        this.messages = new Map();
        this.initializeMockMessages();
    }
    initializeMockMessages() {
        const mockMessages = [
            {
                id: 'msg-1',
                senderId: 'user-1',
                senderName: 'Admin',
                receiverId: 'user-3',
                text: '¡Bienvenido al juego de bingo!',
                timestamp: Date.now() - 3600000, // 1 hora atrás
                read: false
            },
            {
                id: 'msg-2',
                senderId: 'user-3',
                senderName: 'Jugador Uno',
                receiverId: 'user-1',
                text: '¡Gracias! Estoy emocionado de jugar.',
                timestamp: Date.now() - 3000000, // 50 minutos atrás
                read: true
            }
        ];
        mockMessages.forEach(message => {
            this.messages.set(message.id, message);
        });
    }
    getAllMessages() {
        return Array.from(this.messages.values()).sort((a, b) => a.timestamp - b.timestamp);
    }
    getMessagesBetweenUsers(userId1, userId2) {
        return this.getAllMessages().filter(message => (message.senderId === userId1 && message.receiverId === userId2) ||
            (message.senderId === userId2 && message.receiverId === userId1));
    }
    sendMessage(messageData, sender) {
        const message = {
            id: (0, uuid_1.v4)(),
            senderId: sender.id,
            senderName: sender.name,
            receiverId: messageData.receiverId || '',
            text: messageData.text || '',
            timestamp: Date.now(),
            read: false
        };
        this.messages.set(message.id, message);
        return message;
    }
    markMessageAsRead(messageId) {
        const message = this.messages.get(messageId);
        if (message) {
            message.read = true;
            this.messages.set(messageId, message);
            return true;
        }
        return false;
    }
    getUnreadMessagesForUser(userId) {
        return this.getAllMessages().filter(message => message.receiverId === userId && !message.read);
    }
    getUnreadCountForUser(userId, partnerId) {
        return this.getAllMessages().filter(message => message.senderId === partnerId &&
            message.receiverId === userId &&
            !message.read).length;
    }
    deleteMessage(messageId, userId) {
        const message = this.messages.get(messageId);
        if (!message) {
            return { success: false, error: 'Mensaje no encontrado' };
        }
        if (message.senderId !== userId) {
            return { success: false, error: 'Solo puedes eliminar tus propios mensajes' };
        }
        this.messages.delete(messageId);
        return { success: true };
    }
    markAllMessagesAsRead(userId, partnerId) {
        this.getAllMessages()
            .filter(message => message.senderId === partnerId &&
            message.receiverId === userId &&
            !message.read)
            .forEach(message => {
            message.read = true;
            this.messages.set(message.id, message);
        });
    }
}
exports.ChatManager = ChatManager;
//# sourceMappingURL=ChatManager.js.map