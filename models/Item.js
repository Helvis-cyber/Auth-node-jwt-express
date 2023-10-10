const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  _id: mongoose.Schema.Types.ObjectId,
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
