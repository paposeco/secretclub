const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true },
  password: { type: String, required: true },
  membership: { type: String, required: true, enum: ["Insider", "Outsider"] },
  admin: { type: Boolean, default: false },
});

MemberSchema.virtual("fullname").get(function() {
  return this.firstname + " " + this.lastname;
});

module.exports = mongoose.model("Member", MemberSchema);
