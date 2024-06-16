const { Schema, model } = require("mongoose");

const publicationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    
  },

  text: {
    type: String,
    required: true,
  },

  file: String,

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Publication", publicationSchema,"publications");
