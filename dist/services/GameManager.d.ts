import { Game, User } from '../types';
export declare class GameManager {
    private games;
    constructor();
    private initializeMockGames;
    getAllGames(): Game[];
    getGame(gameId: string): Game | undefined;
    createGame(gameData: Partial<Game>, organizer: User): Game;
    joinGame(gameId: string, user: User): {
        success: boolean;
        error?: string;
        game?: Game;
    };
    startGame(gameId: string, organizerId: string): {
        success: boolean;
        error?: string;
        game?: Game;
    };
    callNumber(gameId: string, organizerId: string, number: number): {
        success: boolean;
        error?: string;
        game?: Game;
    };
    claimBingo(gameId: string, userId: string, cardIndex: number): {
        success: boolean;
        error?: string;
        game?: Game;
        isWinner?: boolean;
    };
    markNumber(gameId: string, userId: string, cardIndex: number, row: number, col: number): {
        success: boolean;
        error?: string;
        game?: Game;
    };
    deleteGame(gameId: string, organizerId: string): {
        success: boolean;
        error?: string;
    };
    updateGame(game: Game): void;
}
//# sourceMappingURL=GameManager.d.ts.map