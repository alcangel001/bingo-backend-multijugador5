import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { SocketService } from './services/SocketService';

const app = express();
const server = createServer(app);

// Configuración de CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuración de Socket.IO
const io = new SocketIOServer(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
});

// Inicializar el servicio de sockets
const socketService = new SocketService(io);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;

