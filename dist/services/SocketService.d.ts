import { Server as SocketIOServer } from 'socket.io';
export declare class SocketService {
    private io;
    private userManager;
    private gameManager;
    private raffleManager;
    private chatManager;
    private authenticatedSockets;
    constructor(io: SocketIOServer);
    private setupSocketHandlers;
    private sendInitialState;
    private handleUserLogin;
    private handleUserRegister;
    private handleUserLogout;
    private handleGameCreate;
    private handleGameJoin;
    private handleGameStart;
    private handleGameCallNumber;
    private handleGameClaimBingo;
    private handleGameMarkNumber;
    private handleChatSendMessage;
    private handleChatMarkRead;
    private handleRaffleCreate;
    private handleRaffleBuyTicket;
    private handleRaffleDraw;
    private handleCreditsTransfer;
    private handleDisconnect;
}
//# sourceMappingURL=SocketService.d.ts.map