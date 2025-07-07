"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaffleManager = void 0;
const types_1 = require("../types");
const uuid_1 = require("uuid");
class RaffleManager {
    constructor() {
        this.raffles = new Map();
        this.initializeMockRaffles();
    }
    initializeMockRaffles() {
        const mockRaffle = {
            id: 'raffle-1',
            organizerId: 'user-1',
            organizerName: 'Admin',
            name: 'Rifa de Prueba',
            prize: 500,
            ticketPrice: 25,
            status: types_1.RaffleStatus.WAITING,
            tickets: this.generateTickets(20, 25),
            createdAt: Date.now(),
            mode: types_1.RaffleMode.MANUAL,
            payoutComplete: false
        };
        this.raffles.set(mockRaffle.id, mockRaffle);
    }
    generateTickets(count, price) {
        const tickets = [];
        for (let i = 1; i <= count; i++) {
            tickets.push({
                number: i,
                status: types_1.RaffleTicketStatus.AVAILABLE
            });
        }
        return tickets;
    }
    getAllRaffles() {
        return Array.from(this.raffles.values());
    }
    getRaffle(raffleId) {
        return this.raffles.get(raffleId);
    }
    createRaffle(raffleData, organizer) {
        const ticketCount = raffleData.tickets?.length || 50;
        const ticketPrice = raffleData.ticketPrice || 10;
        const raffle = {
            id: (0, uuid_1.v4)(),
            organizerId: organizer.id,
            organizerName: organizer.name,
            name: raffleData.name || 'Nueva Rifa',
            prize: raffleData.prize || 0,
            ticketPrice: ticketPrice,
            status: types_1.RaffleStatus.WAITING,
            tickets: this.generateTickets(ticketCount, ticketPrice),
            createdAt: Date.now(),
            mode: raffleData.mode || types_1.RaffleMode.MANUAL,
            payoutComplete: false
        };
        this.raffles.set(raffle.id, raffle);
        return raffle;
    }
    buyTicket(raffleId, ticketNumber, user) {
        const raffle = this.raffles.get(raffleId);
        if (!raffle) {
            return { success: false, error: 'Rifa no encontrada' };
        }
        if (raffle.status !== types_1.RaffleStatus.WAITING) {
            return { success: false, error: 'La rifa ya ha finalizado' };
        }
        const ticket = raffle.tickets.find(t => t.number === ticketNumber);
        if (!ticket) {
            return { success: false, error: 'Boleto no encontrado' };
        }
        if (ticket.status !== types_1.RaffleTicketStatus.AVAILABLE) {
            return { success: false, error: 'Este boleto ya no está disponible' };
        }
        if (user.balance < raffle.ticketPrice) {
            return { success: false, error: 'Saldo insuficiente' };
        }
        // Marcar el boleto como vendido
        ticket.status = types_1.RaffleTicketStatus.SOLD;
        ticket.ownerId = user.id;
        ticket.ownerName = user.name;
        this.raffles.set(raffleId, raffle);
        return { success: true, raffle };
    }
    drawWinner(raffleId, organizerId) {
        const raffle = this.raffles.get(raffleId);
        if (!raffle) {
            return { success: false, error: 'Rifa no encontrada' };
        }
        if (raffle.organizerId !== organizerId) {
            return { success: false, error: 'Solo el organizador puede sortear la rifa' };
        }
        if (raffle.status !== types_1.RaffleStatus.WAITING) {
            return { success: false, error: 'La rifa ya ha sido sorteada' };
        }
        const soldTickets = raffle.tickets.filter(t => t.status === types_1.RaffleTicketStatus.SOLD);
        if (soldTickets.length === 0) {
            return { success: false, error: 'No hay boletos vendidos para sortear' };
        }
        // Seleccionar un boleto ganador al azar
        const winnerTicket = soldTickets[Math.floor(Math.random() * soldTickets.length)];
        raffle.status = types_1.RaffleStatus.FINISHED;
        raffle.winnerTicket = winnerTicket.number;
        raffle.winnerId = winnerTicket.ownerId;
        this.raffles.set(raffleId, raffle);
        return { success: true, raffle, winnerId: winnerTicket.ownerId };
    }
    updateRaffle(raffle) {
        this.raffles.set(raffle.id, raffle);
    }
    deleteRaffle(raffleId, organizerId) {
        const raffle = this.raffles.get(raffleId);
        if (!raffle) {
            return { success: false, error: 'Rifa no encontrada' };
        }
        if (raffle.organizerId !== organizerId) {
            return { success: false, error: 'Solo el organizador puede eliminar la rifa' };
        }
        if (raffle.status === types_1.RaffleStatus.FINISHED) {
            return { success: false, error: 'No se puede eliminar una rifa finalizada' };
        }
        // Verificar si hay boletos vendidos
        const soldTickets = raffle.tickets.filter(t => t.status === types_1.RaffleTicketStatus.SOLD);
        if (soldTickets.length > 0) {
            return { success: false, error: 'No se puede eliminar una rifa con boletos vendidos' };
        }
        this.raffles.delete(raffleId);
        return { success: true };
    }
}
exports.RaffleManager = RaffleManager;
//# sourceMappingURL=RaffleManager.js.map