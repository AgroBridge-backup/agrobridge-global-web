import { LEAD_STATUSES } from '../models/Lead.js';
import leadRepository from '../repositories/leadRepository.js';

const createHttpError = (statusCode, message, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

class AdminLeadService {
  constructor({ repository = leadRepository } = {}) {
    this.repository = repository;
  }

  async listLeads(query = {}) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
    const status = typeof query.status === 'string' ? query.status.trim() : '';

    if (status && !LEAD_STATUSES.includes(status)) {
      throw createHttpError(400, 'Invalid lead status filter', 'LEAD_STATUS_INVALID');
    }

    const { leads, total } = await this.repository.listLeads({
      page,
      limit,
      status: status || undefined,
    });

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getLeadById(id) {
    const lead = await this.repository.getLeadById(id);
    if (!lead) {
      throw createHttpError(404, 'Lead not found', 'LEAD_NOT_FOUND');
    }

    return lead;
  }

  async updateLead(id, payload = {}, actorId = 'system') {
    const updateDoc = {
      updatedAt: new Date(),
      updatedBy: actorId,
    };

    if (typeof payload.status === 'string') {
      updateDoc.status = payload.status;
    }

    if (typeof payload.notes === 'string') {
      updateDoc.notes = payload.notes;
    }

    if (Object.keys(updateDoc).length <= 2) {
      throw createHttpError(400, 'At least one field must be updated', 'LEAD_UPDATE_EMPTY');
    }

    const updatedLead = await this.repository.updateLeadById(id, updateDoc);

    if (!updatedLead) {
      throw createHttpError(404, 'Lead not found', 'LEAD_NOT_FOUND');
    }

    return updatedLead;
  }

  async deleteLead(id) {
    const deleted = await this.repository.deleteLeadById(id);
    if (!deleted) {
      throw createHttpError(404, 'Lead not found', 'LEAD_NOT_FOUND');
    }

    return true;
  }

  async getStats() {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    const { totalLeads, recentLeads, statusCounts, latestLead } = await this.repository.getLeadStats({
      sinceDate: thirtyDaysAgo,
    });

    const byStatus = statusCounts.reduce((accumulator, item) => {
      const key = item?._id || 'unknown';
      accumulator[key] = item?.count || 0;
      return accumulator;
    }, Object.create(null));

    return {
      totalLeads,
      recentLeads,
      byStatus,
      latestLeadAt: latestLead?.createdAt || null,
    };
  }
}

const adminLeadService = new AdminLeadService();

export {
  AdminLeadService,
  createHttpError,
};

export default adminLeadService;
