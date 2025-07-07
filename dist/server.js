"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const SocketService_1 = require("./services/SocketService");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Configuración de CORS
const corsOptions = {
    origin: "*", // En producción, especificar el dominio del frontend
    methods: ["GET", "POST"],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Configuración de Socket.IO
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
});
// Inicializar el servicio de sockets
const socketService = new SocketService_1.SocketService(io);
// Ruta de salud para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Bingo Kusu Backend está funcionando',
        timestamp: new Date().toISOString(),
        connectedClients: io.engine.clientsCount
    });
});
// Ruta de información del servidor
app.get('/info', (req, res) => {
    res.json({
        name: 'Bingo Kusu Backend',
        version: '1.0.0',
        description: 'Backend multijugador para Bingo Kusu Online',
        features: [
            'Autenticación de usuarios',
            'Juegos de bingo en tiempo real',
            'Sistema de rifas',
            'Chat entre usuarios',
            'Gestión de créditos'
        ],
        endpoints: {
            health: '/health',
            info: '/info',
            websocket: 'ws://localhost:3001'
        }
    });
});
// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});
// Configuración del puerto
const PORT = parseInt(process.env.PORT || '3001', 10);
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Bingo Kusu Backend ejecutándose en puerto ${PORT}`);
    console.log(`📡 WebSocket disponible en ws://localhost:${PORT}`);
    console.log(`🌐 API REST disponible en http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`ℹ️  Info del servidor: http://localhost:${PORT}/info`);
});
// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map