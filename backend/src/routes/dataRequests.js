const express = require('express');
const router = express.Router();
const dataRequestController = require('../controllers/dataRequestController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Create a new data request
router.post('/', dataRequestController.createDataRequest);

// Get current user's requests
router.get('/my', dataRequestController.getMyRequests);

// Get request by ID (accessible by owner or admin)
router.get('/:id', dataRequestController.getRequestById);

// Admin-only routes
router.get('/', requireAdmin, dataRequestController.getAllRequests);
router.get('/admin/pending', requireAdmin, dataRequestController.getPendingRequests);
router.get('/admin/statistics', requireAdmin, dataRequestController.getRequestStatistics);
router.put('/:id/review', requireAdmin, dataRequestController.reviewRequest);

module.exports = router; 