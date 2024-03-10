const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String,
    amount: Number,
    date: Date
});

module.exports = mongoose.model('Transaction', TransactionSchema);
