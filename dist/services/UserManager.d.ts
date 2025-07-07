import { User } from '../types';
export declare class UserManager {
    private users;
    private connectedUsers;
    constructor();
    private initializeMockUsers;
    getAllUsers(): User[];
    getUser(userId: string): User | undefined;
    getUserByUsername(username: string): User | undefined;
    authenticateUser(username: string, password: string): {
        success: boolean;
        user?: User;
        error?: string;
    };
    registerUser(userData: {
        username: string;
        password: string;
        name: string;
        email?: string;
    }): {
        success: boolean;
        user?: User;
        error?: string;
    };
    connectUser(userId: string, socketId: string): void;
    disconnectUser(socketId: string): User | undefined;
    updateUserBalance(userId: string, amount: number, operation: 'add' | 'subtract'): {
        success: boolean;
        user?: User;
        error?: string;
    };
    transferCredits(fromUserId: string, toUserId: string, amount: number): {
        success: boolean;
        error?: string;
        fromUser?: User;
        toUser?: User;
    };
    getConnectedUsers(): User[];
    getUserSocketId(userId: string): string | undefined;
}
//# sourceMappingURL=UserManager.d.ts.map