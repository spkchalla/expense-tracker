import { TransactionService } from '../services/transactionService.js';

export class TransactionController {
  static async getTransactions(req, res, next) {
    try {
      const result = await TransactionService.getTransactions(req.user._id, req.query);
      res.json({ success: true, data: result.transactions, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const transaction = await TransactionService.getTransactionById(req.user._id, req.params.id);
      res.json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req, res, next) {
    try {
      const transaction = await TransactionService.createTransaction(req.user._id, req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  static async syncTransactions(req, res, next) {
    try {
      const results = await TransactionService.syncTransactions(
        req.user._id,
        req.body.transactions
      );
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req, res, next) {
    try {
      const transaction = await TransactionService.updateTransaction(
        req.user._id,
        req.params.id,
        req.body
      );
      res.json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req, res, next) {
    try {
      const result = await TransactionService.deleteTransaction(req.user._id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(req, res, next) {
    try {
      const csv = await TransactionService.exportToCsv(req.user._id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="transactions_${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}
