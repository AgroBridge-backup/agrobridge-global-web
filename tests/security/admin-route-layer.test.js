import express from 'express';
import { jest } from '@jest/globals';
import request from 'supertest';
import { createAdminRouter } from '../../src/routes/admin.js';
import errorHandler from '../../src/middleware/errorHandler.js';

const allowAuth = (req, _res, next) => {
  req.user = { id: 'admin-1', role: 'admin' };
  next();
};

const allowRole = () => (_req, _res, next) => next();

const createTestApp = (service) => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', createAdminRouter({
    service,
    authenticateMiddleware: allowAuth,
    authorizeMiddleware: allowRole,
  }));
  app.use(errorHandler);
  return app;
};

describe('Admin router service delegation', () => {
  test('GET /leads delegates to service and returns contract payload', async () => {
    const service = {
      listLeads: jest.fn().mockResolvedValue({
        leads: [{ _id: 'lead-1', status: 'new' }],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }),
    };

    const app = createTestApp(service);
    const response = await request(app).get('/api/admin/leads?page=1&limit=20');

    expect(response.status).toBe(200);
    expect(service.listLeads).toHaveBeenCalledWith(expect.objectContaining({ page: '1', limit: '20' }));
    expect(response.body.success).toBe(true);
    expect(response.body.data[0]._id).toBe('lead-1');
    expect(response.body.pagination.total).toBe(1);
  });

  test('GET /leads/:id returns validation error for invalid lead id', async () => {
    const service = {
      getLeadById: jest.fn(),
    };

    const app = createTestApp(service);
    const response = await request(app).get('/api/admin/leads/not-a-mongo-id');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(service.getLeadById).not.toHaveBeenCalled();
  });

  test('GET /leads/:id propagates service not found errors', async () => {
    const notFoundError = new Error('Lead not found');
    notFoundError.statusCode = 404;
    notFoundError.code = 'LEAD_NOT_FOUND';

    const service = {
      getLeadById: jest.fn().mockRejectedValue(notFoundError),
    };

    const app = createTestApp(service);
    const response = await request(app).get('/api/admin/leads/507f1f77bcf86cd799439011');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('LEAD_NOT_FOUND');
  });
});
