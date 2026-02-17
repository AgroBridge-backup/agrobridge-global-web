import { body, param, query, validationResult } from 'express-validator';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/validation-errors.log' })
  ]
});

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      errors: formattedErrors,
      timestamp: new Date().toISOString()
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
      requestId: req.id,
    });
  }
  
  next();
};

export const validateLeadId = param('id')
  .isMongoId()
  .withMessage('Invalid lead ID format');

export const validateLeadStatus = body('status')
  .optional()
  .isIn(['new', 'contacted', 'qualified', 'converted', 'closed'])
  .withMessage('Status must be one of: new, contacted, qualified, converted, closed');

export const validateLeadNotes = body('notes')
  .optional()
  .isLength({ max: 5000 })
  .withMessage('Notes must not exceed 5000 characters')
  .trim();

export const validateEmail = body('email')
  .isEmail()
  .withMessage('Invalid email format')
  .normalizeEmail();

export const validatePassword = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters');

export const validatePagination = query(['page', 'limit'])
  .optional()
  .isInt({ min: 1, max: 100 })
  .withMessage('Page and limit must be integers between 1 and 100');
