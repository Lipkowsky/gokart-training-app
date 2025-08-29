const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: "https://www.app.gokart-training.cloud",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Trasy
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Serwer HTTP + Socket.IO
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "https://www.app.gokart-training.cloud", credentials: true }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

startCleanupCron();

server.listen(PORT, HOST, () => {
  console.log(`API + WebSocket running on http://${HOST}:${PORT}`);
});
