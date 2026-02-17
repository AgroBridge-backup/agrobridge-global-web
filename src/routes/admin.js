import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validate,
  validateLeadId,
  validateLeadStatus,
  validateLeadNotes,
  validatePagination,
} from '../middleware/validation.js';
import adminLeadService from '../services/adminLeadService.js';

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const createAdminRouter = ({
  service = adminLeadService,
  authenticateMiddleware = authenticate,
  authorizeMiddleware = authorize,
} = {}) => {
  const router = express.Router();

  router.get(
    '/leads',
    authenticateMiddleware,
    authorizeMiddleware(['admin']),
    validatePagination,
    validate,
    asyncHandler(async (req, res) => {
      const result = await service.listLeads(req.query);

      return res.status(200).json({
        success: true,
        data: result.leads,
        pagination: result.pagination,
      });
    })
  );

  router.get(
    '/leads/:id',
    authenticateMiddleware,
    authorizeMiddleware(['admin']),
    validateLeadId,
    validate,
    asyncHandler(async (req, res) => {
      const lead = await service.getLeadById(req.params.id);

      return res.status(200).json({
        success: true,
        data: lead,
      });
    })
  );

  router.patch(
    '/leads/:id',
    authenticateMiddleware,
    authorizeMiddleware(['admin']),
    validateLeadId,
    validateLeadStatus,
    validateLeadNotes,
    validate,
    asyncHandler(async (req, res) => {
      const actorId = req.user?.id || req.user?.userId || 'system';
      const updatedLead = await service.updateLead(req.params.id, req.body, actorId);

      return res.status(200).json({
        success: true,
        data: updatedLead,
      });
    })
  );

  router.delete(
    '/leads/:id',
    authenticateMiddleware,
    authorizeMiddleware(['admin']),
    validateLeadId,
    validate,
    asyncHandler(async (req, res) => {
      await service.deleteLead(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    })
  );

  router.get(
    '/stats',
    authenticateMiddleware,
    authorizeMiddleware(['admin']),
    asyncHandler(async (_req, res) => {
      const stats = await service.getStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    })
  );

  return router;
};

const router = createAdminRouter();

export {
  createAdminRouter,
};

export default router;
