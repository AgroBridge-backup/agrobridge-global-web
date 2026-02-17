import { jest } from '@jest/globals';
import { AdminLeadService } from '../../src/services/adminLeadService.js';

describe('AdminLeadService', () => {
  test('lists leads with pagination from repository', async () => {
    const repository = {
      listLeads: jest.fn().mockResolvedValue({
        leads: [{ _id: 'lead-1' }],
        total: 1,
      }),
    };

    const service = new AdminLeadService({ repository });
    const result = await service.listLeads({ page: '2', limit: '10', status: 'new' });

    expect(repository.listLeads).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      status: 'new',
    });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.total).toBe(1);
    expect(result.leads).toHaveLength(1);
  });

  test('throws LEAD_UPDATE_EMPTY when no mutable fields are provided', async () => {
    const service = new AdminLeadService({
      repository: {
        updateLeadById: jest.fn(),
      },
    });

    await expect(service.updateLead('507f1f77bcf86cd799439011', {}, 'admin')).rejects.toMatchObject({
      statusCode: 400,
      code: 'LEAD_UPDATE_EMPTY',
    });
  });

  test('throws LEAD_NOT_FOUND when repository cannot find lead by id', async () => {
    const service = new AdminLeadService({
      repository: {
        getLeadById: jest.fn().mockResolvedValue(null),
      },
    });

    await expect(service.getLeadById('507f1f77bcf86cd799439011')).rejects.toMatchObject({
      statusCode: 404,
      code: 'LEAD_NOT_FOUND',
    });
  });

  test('throws LEAD_NOT_FOUND when delete target is missing', async () => {
    const service = new AdminLeadService({
      repository: {
        deleteLeadById: jest.fn().mockResolvedValue(false),
      },
    });

    await expect(service.deleteLead('507f1f77bcf86cd799439011')).rejects.toMatchObject({
      statusCode: 404,
      code: 'LEAD_NOT_FOUND',
    });
  });
});
