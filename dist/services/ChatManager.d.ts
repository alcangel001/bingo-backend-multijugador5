import { ChatMessage, User } from '../types';
export declare class ChatManager {
    private messages;
    constructor();
    private initializeMockMessages;
    getAllMessages(): ChatMessage[];
    getMessagesBetweenUsers(userId1: string, userId2: string): ChatMessage[];
    sendMessage(messageData: Partial<ChatMessage>, sender: User): ChatMessage;
    markMessageAsRead(messageId: string): boolean;
    getUnreadMessagesForUser(userId: string): ChatMessage[];
    getUnreadCountForUser(userId: string, partnerId: string): number;
    deleteMessage(messageId: string, userId: string): {
        success: boolean;
        error?: string;
    };
    markAllMessagesAsRead(userId: string, partnerId: string): void;
}
//# sourceMappingURL=ChatManager.d.ts.map