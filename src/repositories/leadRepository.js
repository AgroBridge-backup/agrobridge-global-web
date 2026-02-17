import mongoose from 'mongoose';
import Lead, { synchronizeLeadIndexes } from '../models/Lead.js';

const createHttpError = (statusCode, message, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const assertDatabaseReady = () => {
  if (mongoose.connection.readyState !== 1) {
    throw createHttpError(503, 'Database connection unavailable', 'DB_UNAVAILABLE');
  }
};

class LeadRepository {
  async listLeads({ page, limit, status }) {
    assertDatabaseReady();

    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Lead.countDocuments(filter),
    ]);

    return {
      leads,
      total,
    };
  }

  async getLeadById(id) {
    assertDatabaseReady();

    return Lead.findById(id)
      .lean()
      .exec();
  }

  async updateLeadById(id, updateDoc) {
    assertDatabaseReady();

    return Lead.findByIdAndUpdate(
      id,
      { $set: updateDoc },
      {
        new: true,
        runValidators: true,
      }
    )
      .lean()
      .exec();
  }

  async deleteLeadById(id) {
    assertDatabaseReady();

    const result = await Lead.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async getLeadStats({ sinceDate }) {
    assertDatabaseReady();

    const [totalLeads, recentLeads, statusCounts, latestLead] = await Promise.all([
      Lead.countDocuments({}),
      Lead.countDocuments({ createdAt: { $gte: sinceDate } }),
      Lead.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Lead.findOne({})
        .sort({ createdAt: -1, _id: -1 })
        .select({ createdAt: 1 })
        .lean()
        .exec(),
    ]);

    return {
      totalLeads,
      recentLeads,
      statusCounts,
      latestLead,
    };
  }

  async ensureIndexes(options) {
    return synchronizeLeadIndexes(options);
  }
}

const leadRepository = new LeadRepository();

export {
  createHttpError,
  LeadRepository,
};

export default leadRepository;
