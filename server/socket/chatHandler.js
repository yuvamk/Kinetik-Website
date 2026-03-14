// Active chat sessions: sessionId -> { socketId, messages, visitorName }
const activeSessions = new Map();

const initializeChatHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─────────────────────────────────────────────
    // VISITOR SIDE
    // ─────────────────────────────────────────────
    socket.on('visitor_join', ({ sessionId, visitorName }) => {
      socket.join(`session_${sessionId}`);

      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
          socketId: socket.id,
          visitorName: visitorName || 'Anonymous',
          messages: [],
          startedAt: new Date(),
          sessionId,
        });
      } else {
        activeSessions.get(sessionId).socketId = socket.id;
      }

      // Notify admin of new / returning visitor
      io.to('admin_room').emit('visitor_connected', {
        sessionId,
        visitorName: visitorName || 'Anonymous',
        startedAt: activeSessions.get(sessionId).startedAt,
        messages: activeSessions.get(sessionId).messages,
      });
    });

    socket.on('visitor_message', ({ sessionId, message }) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      const msg = {
        id: Date.now(),
        from: 'visitor',
        message,
        timestamp: new Date(),
      };
      session.messages.push(msg);

      // Broadcast to admin room
      io.to('admin_room').emit('visitor_message', { sessionId, msg, visitorName: session.visitorName });
    });

    // ─────────────────────────────────────────────
    // ADMIN SIDE
    // ─────────────────────────────────────────────
    socket.on('admin_join', () => {
      socket.join('admin_room');
      console.log(`👑 Admin joined admin_room: ${socket.id}`);

      // Send list of active sessions
      const sessions = Array.from(activeSessions.values()).map((s) => ({
        sessionId: s.sessionId,
        visitorName: s.visitorName,
        startedAt: s.startedAt,
        messageCount: s.messages.length,
        lastMessage: s.messages[s.messages.length - 1] || null,
      }));
      socket.emit('active_sessions', sessions);
    });

    socket.on('admin_reply', ({ sessionId, message }) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      const msg = {
        id: Date.now(),
        from: 'admin',
        message,
        timestamp: new Date(),
      };
      session.messages.push(msg);

      // Send to visitor's session room
      io.to(`session_${sessionId}`).emit('admin_reply', { msg });
    });

    socket.on('get_session_messages', ({ sessionId }) => {
      const session = activeSessions.get(sessionId);
      if (session) {
        socket.emit('session_messages', { sessionId, messages: session.messages });
      }
    });

    // ─────────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Optionally notify admin if a visitor disconnected
      for (const [sessionId, session] of activeSessions.entries()) {
        if (session.socketId === socket.id) {
          io.to('admin_room').emit('visitor_disconnected', { sessionId });
          break;
        }
      }
    });
  });
};

module.exports = { initializeChatHandler, activeSessions };
