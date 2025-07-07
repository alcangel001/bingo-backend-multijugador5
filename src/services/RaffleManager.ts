import { Raffle, RaffleStatus, RaffleTicket, RaffleTicketStatus, RaffleMode, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class RaffleManager {
    private raffles: Map<string, Raffle> = new Map();

    constructor() {
        this.initializeMockRaffles();
    }

    private initializeMockRaffles() {
        const mockRaffle: Raffle = {
            id: 'raffle-1',
            organizerId: 'user-1',
            organizerName: 'Admin',
            name: 'Rifa de Prueba',
            prize: 500,
            ticketPrice: 25,
            status: RaffleStatus.WAITING,
            tickets: this.generateTickets(20, 25),
            createdAt: Date.now(),
            mode: RaffleMode.MANUAL,
            payoutComplete: false
        };
        this.raffles.set(mockRaffle.id, mockRaffle);
    }

    private generateTickets(count: number, price: number): RaffleTicket[] {
        const tickets: RaffleTicket[] = [];
        for (let i = 1; i <= count; i++) {
            tickets.push({
                number: i,
                status: RaffleTicketStatus.AVAILABLE
            });
        }
        return tickets;
    }

    getAllRaffles(): Raffle[] {
        return Array.from(this.raffles.values());
    }

    getRaffle(raffleId: string): Raffle | undefined {
        return this.raffles.get(raffleId);
    }

    createRaffle(raffleData: Partial<Raffle>, organizer: User): Raffle {
        const ticketCount = raffleData.tickets?.length || 50;
        const ticketPrice = raffleData.ticketPrice || 10;

        const raffle: Raffle = {
            id: uuidv4(),
            organizerId: organizer.id,
            organizerName: organizer.name,
            name: raffleData.name || 'Nueva Rifa',
            prize: raffleData.prize || 0,
            ticketPrice: ticketPrice,
            status: RaffleStatus.WAITING,
            tickets: this.generateTickets(ticketCount, ticketPrice),
            createdAt: Date.now(),
            mode: raffleData.mode || RaffleMode.MANUAL,
            payoutComplete: false
        };

        this.raffles.set(raffle.id, raffle);
        return raffle;
    }

    buyTicket(raffleId: string, ticketNumber: number, user: User): { success: boolean; error?: string; raffle?: Raffle } {
        const raffle = this.raffles.get(raffleId);
        if (!raffle) {
            return { success: false, error: 'Rifa no encontrada' };
        }

        if (raffle.status !== RaffleStatus.WAITING) {
            return { success: false, error: 'La rifa ya ha finalizado' };
        }

        const ticket = raffle.tickets.find(t => t.number === ticketNumber);
        if (!ticket) {
            return { success: false, error: 'Boleto no encontrado' };
        }

        if (ticket.status !== RaffleTicketStatus.AVAILABLE) {
            return { success: false, error: 'Este boleto ya no está disponible' };
        }

        if (user.balance < raffle.ticketPrice) {
            return { success: false, error: 'Saldo insuficiente' };
        }

        // Marcar el boleto como vendido
        ticket.status = RaffleTicketStatus.SOLD;
        ticket.ownerId = user.id;
        ticket.ownerName = user.name;

        this.raffles.set(raffleId, raffle);
        return { success: true, raffle };
    }

    drawWinner(raffleId: string, organizerId: string): { success: boolean; error?: string; raffle?: Raffle; winnerId?: string } {
        const raffle = this.raffles.get(raffleId);
        if (!raffle) {
            return { success: false, error: 'Rifa no encontrada' };
        }

        if (raffle.organizerId !== organizerId) {
            return { success: false, error: 'Solo el organizador puede sortear la rifa' };
        }

        if (raffle.status !== RaffleStatus.WAITING) {
            return { success: false, error: 'La rifa ya ha sido sorteada' };
        }

        const soldTickets = raffle.tickets.filter(t => t.status === RaffleTicketStatus.SOLD);
        if (soldTickets.length === 0) {
            return { success: false, error: 'No hay boletos vendidos para sortear' };
        }

        // Seleccionar un boleto ganador al azar
        const winnerTicket = soldTickets[Math.floor(Math.random() * soldTickets.length)];
        
        raffle.status = RaffleStatus.FINISHED;
        raffle.winnerTicket = winnerTicket.number;
        raffle.winnerId = winnerTicket.ownerId;

        this.raffles.set(raffleId, raffle);
        return { success: true, raffle, winnerId: winnerTicket.ownerId };
    }

    updateRaffle(raffle: Raffle): void {
        this.raffles.set(raffle.id, raffle);
    }

    deleteRaffle(raffleId: string, organizerId: string): { success: boolean; error?: string } {
        const raffle = this.raffles.get(raffleId);
        if (!raffle) {
            return { success: false, error: 'Rifa no encontrada' };
        }

        if (raffle.organizerId !== organizerId) {
            return { success: false, error: 'Solo el organizador puede eliminar la rifa' };
        }

        if (raffle.status === RaffleStatus.FINISHED) {
            return { success: false, error: 'No se puede eliminar una rifa finalizada' };
        }

        // Verificar si hay boletos vendidos
        const soldTickets = raffle.tickets.filter(t => t.status === RaffleTicketStatus.SOLD);
        if (soldTickets.length > 0) {
            return { success: false, error: 'No se puede eliminar una rifa con boletos vendidos' };
        }

        this.raffles.delete(raffleId);
        return { success: true };
    }
}

