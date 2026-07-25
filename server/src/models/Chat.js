const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatSchema.index({ workspace: 1 });

module.exports = mongoose.model('Chat', chatSchema);
