const express = require('express');
const router = express.Router();
const storeRequisitionController = require('../controllers/storeRequisitionController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * @route   POST /api/store-requisitions
 * @desc    Create a new store requisition
 * @access  Private (Admin, F&B Manager)
 */
router.post('/', storeRequisitionController.createRequisition);

/**
 * @route   GET /api/store-requisitions
 * @desc    Get all store requisitions with optional filters
 * @access  Private
 */
router.get('/', storeRequisitionController.getAllRequisitions);

/**
 * @route   GET /api/store-requisitions/statistics
 * @desc    Get store requisition statistics
 * @access  Private
 */
router.get('/statistics', storeRequisitionController.getStatistics);

/**
 * @route   GET /api/store-requisitions/pending-count
 * @desc    Get pending requisitions count
 * @access  Private
 */
router.get('/pending-count', storeRequisitionController.getPendingCount);

/**
 * @route   GET /api/store-requisitions/:id
 * @desc    Get requisition by ID
 * @access  Private
 */
router.get('/:id', storeRequisitionController.getRequisitionById);

/**
 * @route   PUT /api/store-requisitions/:id
 * @desc    Update a requisition
 * @access  Private (Admin, Requester)
 */
router.put('/:id', storeRequisitionController.updateRequisition);

/**
 * @route   POST /api/store-requisitions/:id/approve
 * @desc    Approve a requisition
 * @access  Private (Admin)
 */
router.post('/:id/approve', storeRequisitionController.approveRequisition);

/**
 * @route   POST /api/store-requisitions/:id/reject
 * @desc    Reject a requisition
 * @access  Private (Admin)
 */
router.post('/:id/reject', storeRequisitionController.rejectRequisition);

/**
 * @route   DELETE /api/store-requisitions/:id
 * @desc    Delete a requisition
 * @access  Private (Admin)
 */
router.delete('/:id', storeRequisitionController.deleteRequisition);

module.exports = router;
