import { NeedService } from '../services/needService.js';

export class NeedController {
  static async getNeeds(req, res, next) {
    try {
      const monthStr = req.query.month;
      const includeArchived = req.query.includeArchived === 'true';
      const needs = await NeedService.getNeeds(req.user._id, { monthStr, includeArchived });
      res.json({ success: true, data: needs });
    } catch (error) {
      next(error);
    }
  }

  static async getNeedById(req, res, next) {
    try {
      const need = await NeedService.getNeedById(req.user._id, req.params.id, req.query.month);
      res.json({ success: true, data: need });
    } catch (error) {
      next(error);
    }
  }

  static async createNeed(req, res, next) {
    try {
      const need = await NeedService.createNeed(req.user._id, req.body);
      res.status(201).json({ success: true, data: need });
    } catch (error) {
      next(error);
    }
  }

  static async updateNeed(req, res, next) {
    try {
      const need = await NeedService.updateNeed(req.user._id, req.params.id, req.body);
      res.json({ success: true, data: need });
    } catch (error) {
      next(error);
    }
  }

  static async archiveNeed(req, res, next) {
    try {
      const need = await NeedService.archiveNeed(req.user._id, req.params.id);
      res.json({ success: true, data: need });
    } catch (error) {
      next(error);
    }
  }

  static async getContributions(req, res, next) {
    try {
      const contributions = await NeedService.getContributions(req.user._id, req.params.id);
      res.json({ success: true, data: contributions });
    } catch (error) {
      next(error);
    }
  }

  static async addContribution(req, res, next) {
    try {
      const contribution = await NeedService.addContribution(
        req.user._id,
        req.params.id,
        req.body
      );
      res.status(201).json({ success: true, data: contribution });
    } catch (error) {
      next(error);
    }
  }

  static async deleteContribution(req, res, next) {
    try {
      const result = await NeedService.deleteContribution(
        req.user._id,
        req.params.id,
        req.params.contributionId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
