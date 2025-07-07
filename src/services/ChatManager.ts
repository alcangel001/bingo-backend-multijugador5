import { ChatMessage, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ChatManager {
    private messages: Map<string, ChatMessage> = new Map();

    constructor() {
        this.initializeMockMessages();
    }

    private initializeMockMessages() {
        const mockMessages: ChatMessage[] = [
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

    getAllMessages(): ChatMessage[] {
        return Array.from(this.messages.values()).sort((a, b) => a.timestamp - b.timestamp);
    }

    getMessagesBetweenUsers(userId1: string, userId2: string): ChatMessage[] {
        return this.getAllMessages().filter(message => 
            (message.senderId === userId1 && message.receiverId === userId2) ||
            (message.senderId === userId2 && message.receiverId === userId1)
        );
    }

    sendMessage(messageData: Partial<ChatMessage>, sender: User): ChatMessage {
        const message: ChatMessage = {
            id: uuidv4(),
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

    markMessageAsRead(messageId: string): boolean {
        const message = this.messages.get(messageId);
        if (message) {
            message.read = true;
            this.messages.set(messageId, message);
            return true;
        }
        return false;
    }

    getUnreadMessagesForUser(userId: string): ChatMessage[] {
        return this.getAllMessages().filter(message => 
            message.receiverId === userId && !message.read
        );
    }

    getUnreadCountForUser(userId: string, partnerId: string): number {
        return this.getAllMessages().filter(message => 
            message.senderId === partnerId && 
            message.receiverId === userId && 
            !message.read
        ).length;
    }

    deleteMessage(messageId: string, userId: string): { success: boolean; error?: string } {
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

    markAllMessagesAsRead(userId: string, partnerId: string): void {
        this.getAllMessages()
            .filter(message => 
                message.senderId === partnerId && 
                message.receiverId === userId && 
                !message.read
            )
            .forEach(message => {
                message.read = true;
                this.messages.set(message.id, message);
            });
    }
}

