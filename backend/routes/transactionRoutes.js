const express = require('express');
const authenticateJWT = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.use(authenticateJWT);

router.post('/', async (req, res) => {
    try {
        const { user } = req;
        const { type, amount, date } = req.body;
        const transaction = new Transaction({ user_id: user._id, type, amount, date });
        await transaction.save();
        res.status(201).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/', async (req, res) => {
    try {
        const { user } = req;
        const { startDate, endDate } = req.query;
        const transactions = await Transaction.find({ user_id: user._id, date: { $gte: startDate, $lte: endDate } });
        res.send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/summary', async (req, res) => {
    try {
        const { user } = req;
        const { startDate, endDate } = req.query;
        const totalIncome = await Transaction.aggregate([
            { $match: { user_id: user._id, type: 'income', date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpenses = await Transaction.aggregate([
            { $match: { user_id: user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const summary = {
            totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
            totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
            savings: (totalIncome.length > 0 ? totalIncome[0].total : 0) - (totalExpenses.length > 0 ? totalExpenses[0].total : 0)
        };

        res.send(summary);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        await Transaction.findOneAndDelete({ _id: id, user_id: user._id });
        res.send('Transaction deleted successfully');
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
