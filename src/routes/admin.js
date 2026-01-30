const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.js');
const { validate, validateLeadId, validateLeadStatus, validateLeadNotes, validatePagination } = require('../middleware/validation.js');

const router = express.Router();

const getLeads = (req, res) => {
  res.status(200).json({ message: 'Get leads endpoint - placeholder' });
};

const getLeadById = (req, res) => {
  res.status(200).json({ message: 'Get lead by ID endpoint - placeholder' });
};

const updateLead = (req, res) => {
  res.status(200).json({ message: 'Update lead endpoint - placeholder' });
};

const deleteLead = (req, res) => {
  res.status(200).json({ message: 'Delete lead endpoint - placeholder' });
};

const getStats = (req, res) => {
  res.status(200).json({ message: 'Get stats endpoint - placeholder' });
};

router.get('/leads', authenticate, authorize(['admin']), validatePagination, validate, getLeads);

router.get('/leads/:id', authenticate, authorize(['admin']), validateLeadId, validate, getLeadById);

router.patch('/leads/:id', authenticate, authorize(['admin']), validateLeadId, validateLeadStatus, validateLeadNotes, validate, updateLead);

router.delete('/leads/:id', authenticate, authorize(['admin']), validateLeadId, validate, deleteLead);

router.get('/stats', authenticate, authorize(['admin']), getStats);

module.exports = router;
