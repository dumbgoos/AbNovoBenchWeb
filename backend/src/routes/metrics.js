const express = require('express');
const router = express.Router();
const { enzymeController, speciesController, allController, errorTypeController } = require('../controllers/metricController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateEnzymeMetric, validateSpeciesMetric } = require('../middleware/validation');

// 酶指标路由
router.get('/enzyme', enzymeController.getAllMetrics);
router.get('/enzyme/model/:modelId', enzymeController.getMetricsByModelId);
router.post('/enzyme', authenticateToken, requireAdmin, validateEnzymeMetric, enzymeController.createMetric);
router.put('/enzyme/:id', authenticateToken, requireAdmin, validateEnzymeMetric, enzymeController.updateMetric);
router.delete('/enzyme/:id', authenticateToken, requireAdmin, enzymeController.deleteMetric);
router.get('/enzyme/leaderboard', enzymeController.getLeaderboard);
router.get('/enzyme/types', enzymeController.getAllEnzymes);
router.get('/enzyme/stats', enzymeController.getStats);

// 物种指标路由
router.get('/species', speciesController.getAllMetrics);
router.get('/species/model/:modelId', speciesController.getMetricsByModelId);
router.post('/species', authenticateToken, requireAdmin, validateSpeciesMetric, speciesController.createMetric);
router.put('/species/:id', authenticateToken, requireAdmin, validateSpeciesMetric, speciesController.updateMetric);
router.delete('/species/:id', authenticateToken, requireAdmin, speciesController.deleteMetric);
router.get('/species/leaderboard', speciesController.getLeaderboard);
router.get('/species/types', speciesController.getAllSpecies);
router.get('/species/stats', speciesController.getStats);

// 汇总指标路由
router.get('/all', allController.getAllMetrics);
router.get('/all/model/:modelId', allController.getMetricsByModelId);
router.post('/all', authenticateToken, requireAdmin, allController.createMetric);
router.put('/all/:id', authenticateToken, requireAdmin, allController.updateMetric);
router.delete('/all/:id', authenticateToken, requireAdmin, allController.deleteMetric);
router.get('/all/leaderboard', allController.getLeaderboard);
router.get('/all/stats', allController.getStats);

// 错误类型路由
router.get('/error-types', errorTypeController.getAllErrorTypes);
router.get('/error-types/model/:modelId', errorTypeController.getErrorTypesByModelId);
router.post('/error-types', authenticateToken, requireAdmin, errorTypeController.createErrorType);
router.put('/error-types/:id', authenticateToken, requireAdmin, errorTypeController.updateErrorType);
router.delete('/error-types/:id', authenticateToken, requireAdmin, errorTypeController.deleteErrorType);
router.get('/error-types/leaderboard', errorTypeController.getLeaderboard);
router.get('/error-types/stats', errorTypeController.getStats);

// 比较路由
router.get('/comparison/:modelId', speciesController.getSpeciesEnzymeComparison);

module.exports = router; 