import mongoose from 'mongoose';
import { config } from '../config/index.js';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'];
const collectionName = process.env.ADMIN_LEADS_COLLECTION || 'leads';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  inquiryType: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: LEAD_STATUSES,
    default: 'new',
    index: true,
  },
  notes: {
    type: String,
    default: '',
    maxlength: 5000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: String,
    trim: true,
  },
}, {
  collection: collectionName,
  strict: false,
  minimize: false,
  versionKey: false,
});

// Query acceleration for admin list and dashboard workloads.
leadSchema.index({ status: 1, createdAt: -1 }, { name: 'lead_status_createdAt_idx' });
leadSchema.index({ createdAt: -1 }, { name: 'lead_createdAt_idx' });
leadSchema.index({ status: 1 }, { name: 'lead_status_idx' });

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema, collectionName);

const normalizeIndexMode = (mode) => {
  const value = String(mode || 'ensure').toLowerCase();

  if (value === 'off' || value === 'none') {
    return 'off';
  }

  if (value === 'sync') {
    return 'sync';
  }

  return 'ensure';
};

const synchronizeLeadIndexes = async ({
  mode = config.database.indexMode,
  logger = console,
} = {}) => {
  const indexMode = normalizeIndexMode(mode);

  if (indexMode === 'off') {
    logger.info?.('[DB] Lead index synchronization skipped (DB_INDEX_MODE=off)');
    return { applied: false, mode: indexMode };
  }

  if (mongoose.connection.readyState !== 1) {
    return {
      applied: false,
      mode: indexMode,
      reason: 'db-unavailable',
    };
  }

  if (indexMode === 'sync') {
    const indexes = await Lead.syncIndexes();
    logger.info?.('[DB] Lead indexes synchronized via syncIndexes()', { indexes });
    return {
      applied: true,
      mode: indexMode,
      indexes,
    };
  }

  await Lead.createIndexes();
  logger.info?.('[DB] Lead indexes ensured via createIndexes()');

  return {
    applied: true,
    mode: indexMode,
  };
};

export {
  Lead,
  LEAD_STATUSES,
  normalizeIndexMode,
  synchronizeLeadIndexes,
};

export default Lead;
