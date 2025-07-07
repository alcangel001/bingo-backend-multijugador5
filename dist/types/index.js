"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaffleMode = exports.RaffleTicketStatus = exports.RaffleStatus = exports.CreditRequestStatus = exports.BingoPattern = exports.GameMode = exports.GameStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ORGANIZER"] = "organizer";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["WAITING"] = "Esperando Jugadores";
    GameStatus["IN_PROGRESS"] = "En Progreso";
    GameStatus["FINISHED"] = "Finalizado";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
var GameMode;
(function (GameMode) {
    GameMode["AUTOMATIC"] = "Autom\u00E1tico";
    GameMode["MANUAL"] = "Manual";
})(GameMode || (exports.GameMode = GameMode = {}));
var BingoPattern;
(function (BingoPattern) {
    BingoPattern["FULL_HOUSE"] = "Cart\u00F3n Lleno";
    BingoPattern["ANY_LINE"] = "Cualquier L\u00EDnea";
    BingoPattern["FOUR_CORNERS"] = "4 Esquinas";
    BingoPattern["CROSS"] = "Cruz";
    BingoPattern["LETTER_X"] = "Letra X";
    BingoPattern["SMALL_SQUARE"] = "Cuadrito";
    BingoPattern["TOP_ROW"] = "L\u00EDnea Arriba";
    BingoPattern["MIDDLE_ROW"] = "L\u00EDnea Medio";
    BingoPattern["BOTTOM_ROW"] = "L\u00EDnea Abajo";
    BingoPattern["LEFT_L"] = "L Izquierda";
    BingoPattern["RIGHT_L"] = "L Derecha";
})(BingoPattern || (exports.BingoPattern = BingoPattern = {}));
var CreditRequestStatus;
(function (CreditRequestStatus) {
    CreditRequestStatus["PENDING"] = "Pendiente";
    CreditRequestStatus["APPROVED"] = "Aprobado";
    CreditRequestStatus["REJECTED"] = "Rechazado";
})(CreditRequestStatus || (exports.CreditRequestStatus = CreditRequestStatus = {}));
var RaffleStatus;
(function (RaffleStatus) {
    RaffleStatus["WAITING"] = "Abierta";
    RaffleStatus["FINISHED"] = "Finalizada";
})(RaffleStatus || (exports.RaffleStatus = RaffleStatus = {}));
var RaffleTicketStatus;
(function (RaffleTicketStatus) {
    RaffleTicketStatus["AVAILABLE"] = "Disponible";
    RaffleTicketStatus["RESERVED"] = "Reservado";
    RaffleTicketStatus["SOLD"] = "Vendido";
})(RaffleTicketStatus || (exports.RaffleTicketStatus = RaffleTicketStatus = {}));
var RaffleMode;
(function (RaffleMode) {
    RaffleMode["AUTOMATIC"] = "Autom\u00E1tico";
    RaffleMode["MANUAL"] = "Manual";
})(RaffleMode || (exports.RaffleMode = RaffleMode = {}));
//# sourceMappingURL=index.js.map