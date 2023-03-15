const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  message_content: { type: String, required: true, maxLength: 300 },
  timestamp: { type: Date, default: Date.now, required: true },
  message_author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

MessageSchema.virtual("message_timestamp").get(function() {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime.DATETIME_SHORT
  );
});

module.exports = mongoose.model("Message", MessageSchema);
