const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Notification = require('./models/Notification');
const Organization = require('./models/Organization');
const Workspace = require('./models/Workspace');

const onlineUsers = new Map();

function getOrgMembers(orgId) {
  const members = [];
  for (const [socketId, data] of onlineUsers.entries()) {
    if (data.orgIds.includes(orgId.toString())) {
      members.push({ userId: data.userId, name: data.name, socketId });
    }
  }
  return members;
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userId})`);

    const userOrgs = await Organization.find({ 'members.user': socket.userId });
    const orgIds = userOrgs.map((o) => o._id.toString());

    onlineUsers.set(socket.id, {
      userId: socket.userId,
      name: socket.userName,
      orgIds,
    });

    for (const orgId of orgIds) {
      const members = getOrgMembers(orgId);
      const unique = [...new Map(members.map((m) => [m.userId, m])).values()];
      io.emit(`presence:${orgId}`, unique);
    }

    socket.on('chat:join', async (workspaceId) => {
      socket.join(`chat:${workspaceId}`);
    });

    socket.on('chat:leave', (workspaceId) => {
      socket.leave(`chat:${workspaceId}`);
    });

    socket.on('chat:message', async (data) => {
      try {
        const { workspaceId, text } = data;

        let chat = await Chat.findOne({ workspace: workspaceId });
        if (!chat) {
          chat = await Chat.create({ workspace: workspaceId, messages: [] });
        }

        const message = {
          text,
          author: socket.userId,
          _id: new mongoose.Types.ObjectId(),
          createdAt: new Date(),
        };

        chat.messages.push(message);
        if (chat.messages.length > 200) {
          chat.messages = chat.messages.slice(-200);
        }
        await chat.save();

        const populated = {
          ...message,
          author: { _id: socket.userId, name: socket.userName },
        };

        io.to(`chat:${workspaceId}`).emit('chat:message', {
          workspaceId,
          message: populated,
        });
      } catch (err) {
        console.error('Chat error:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userName}`);
      onlineUsers.delete(socket.id);

      for (const orgId of orgIds) {
        const members = getOrgMembers(orgId);
        const unique = [...new Map(members.map((m) => [m.userId, m])).values()];
        io.emit(`presence:${orgId}`, unique);
      }
    });
  });

  return io;
}

module.exports = { setupSocket, onlineUsers };
