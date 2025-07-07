import { Raffle, User } from '../types';
export declare class RaffleManager {
    private raffles;
    constructor();
    private initializeMockRaffles;
    private generateTickets;
    getAllRaffles(): Raffle[];
    getRaffle(raffleId: string): Raffle | undefined;
    createRaffle(raffleData: Partial<Raffle>, organizer: User): Raffle;
    buyTicket(raffleId: string, ticketNumber: number, user: User): {
        success: boolean;
        error?: string;
        raffle?: Raffle;
    };
    drawWinner(raffleId: string, organizerId: string): {
        success: boolean;
        error?: string;
        raffle?: Raffle;
        winnerId?: string;
    };
    updateRaffle(raffle: Raffle): void;
    deleteRaffle(raffleId: string, organizerId: string): {
        success: boolean;
        error?: string;
    };
}
//# sourceMappingURL=RaffleManager.d.ts.map