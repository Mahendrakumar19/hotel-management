const express = require('express');
const router = express.Router();
const purchaseGrnController = require('../controllers/purchaseGrnController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * @route   POST /api/purchase-grn
 * @desc    Create a new GRN
 * @access  Private (Admin, Store Manager)
 */
router.post('/', purchaseGrnController.createGrn);

/**
 * @route   GET /api/purchase-grn
 * @desc    Get all GRNs with optional filters
 * @access  Private
 */
router.get('/', purchaseGrnController.getAllGrns);

/**
 * @route   GET /api/purchase-grn/statistics
 * @desc    Get GRN statistics
 * @access  Private
 */
router.get('/statistics', purchaseGrnController.getStatistics);

/**
 * @route   GET /api/purchase-grn/pending-count
 * @desc    Get pending GRNs count
 * @access  Private
 */
router.get('/pending-count', purchaseGrnController.getPendingCount);

/**
 * @route   GET /api/purchase-grn/vendors
 * @desc    Get list of all vendors
 * @access  Private
 */
router.get('/vendors', purchaseGrnController.getVendorsList);

/**
 * @route   GET /api/purchase-grn/invoice/:invoiceNumber
 * @desc    Get GRNs by invoice number
 * @access  Private
 */
router.get('/invoice/:invoiceNumber', purchaseGrnController.getGrnByInvoice);

/**
 * @route   GET /api/purchase-grn/vendor/:vendorName
 * @desc    Get GRNs by vendor name
 * @access  Private
 */
router.get('/vendor/:vendorName', purchaseGrnController.getGrnsByVendor);

/**
 * @route   GET /api/purchase-grn/:id
 * @desc    Get GRN by ID
 * @access  Private
 */
router.get('/:id', purchaseGrnController.getGrnById);

/**
 * @route   PUT /api/purchase-grn/:id
 * @desc    Update a GRN
 * @access  Private (Admin, Receiver)
 */
router.put('/:id', purchaseGrnController.updateGrn);

/**
 * @route   POST /api/purchase-grn/:id/approve
 * @desc    Approve a GRN
 * @access  Private (Admin)
 */
router.post('/:id/approve', purchaseGrnController.approveGrn);

/**
 * @route   POST /api/purchase-grn/:id/reject
 * @desc    Reject a GRN
 * @access  Private (Admin)
 */
router.post('/:id/reject', purchaseGrnController.rejectGrn);

/**
 * @route   POST /api/purchase-grn/:id/mark-received
 * @desc    Mark GRN as received
 * @access  Private (Admin, Store Manager)
 */
router.post('/:id/mark-received', purchaseGrnController.markAsReceived);

/**
 * @route   GET /api/purchase-grn/:id/variance
 * @desc    Get quantity variance for a GRN
 * @access  Private
 */
router.get('/:id/variance', purchaseGrnController.getVariance);

/**
 * @route   DELETE /api/purchase-grn/:id
 * @desc    Delete a GRN
 * @access  Private (Admin)
 */
router.delete('/:id', purchaseGrnController.deleteGrn);

module.exports = router;
