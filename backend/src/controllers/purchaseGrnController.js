const PurchaseGrnService = require('../services/purchaseGrnService');

/**
 * Create a new GRN
 */
exports.createGrn = (req, res) => {
  try {
    const { invoice_number, vendor_name, item_name, quantity, received_quantity, unit, quality, remarks } = req.body;
    const userId = req.user?.id || 'system';

    // Validation
    if (!invoice_number || !vendor_name || !item_name || !quantity) {
      return res.status(400).json({ 
        error: 'Invoice number, vendor name, item name, and quantity are required' 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const grn = PurchaseGrnService.createGrn({
      invoice_number,
      vendor_name,
      item_name,
      quantity: parseFloat(quantity),
      received_quantity: received_quantity ? parseFloat(received_quantity) : parseFloat(quantity),
      unit: unit || 'PCS',
      quality: quality || 'good',
      remarks: remarks || '',
      received_by: userId
    });

    return res.status(201).json({
      success: true,
      message: 'GRN created successfully',
      data: grn
    });
  } catch (error) {
    console.error('Create GRN error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all GRNs
 */
exports.getAllGrns = (req, res) => {
  try {
    const { status, vendor_name, received_by, quality } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (vendor_name) filters.vendor_name = vendor_name;
    if (received_by) filters.received_by = received_by;
    if (quality) filters.quality = quality;

    const grns = PurchaseGrnService.getAllGrns(filters);

    return res.json({
      success: true,
      data: grns,
      count: grns.length
    });
  } catch (error) {
    console.error('Get GRNs error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get GRN by ID
 */
exports.getGrnById = (req, res) => {
  try {
    const { id } = req.params;

    const grn = PurchaseGrnService.getGrnById(id);
    if (!grn) {
      return res.status(404).json({ error: 'GRN not found' });
    }

    return res.json({
      success: true,
      data: grn
    });
  } catch (error) {
    console.error('Get GRN error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get GRNs by invoice number
 */
exports.getGrnByInvoice = (req, res) => {
  try {
    const { invoiceNumber } = req.params;

    const grns = PurchaseGrnService.getGrnByInvoice(invoiceNumber);

    return res.json({
      success: true,
      data: grns,
      count: grns.length
    });
  } catch (error) {
    console.error('Get GRN by invoice error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get GRNs by vendor
 */
exports.getGrnsByVendor = (req, res) => {
  try {
    const { vendorName } = req.params;

    const grns = PurchaseGrnService.getGrnsByVendor(vendorName);

    return res.json({
      success: true,
      data: grns,
      count: grns.length
    });
  } catch (error) {
    console.error('Get GRNs by vendor error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update GRN
 */
exports.updateGrn = (req, res) => {
  try {
    const { id } = req.params;
    const { received_quantity, quality, remarks } = req.body;

    const updateData = {};
    if (received_quantity !== undefined) updateData.received_quantity = parseFloat(received_quantity);
    if (quality !== undefined) updateData.quality = quality;
    if (remarks !== undefined) updateData.remarks = remarks;

    const grn = PurchaseGrnService.updateGrn(id, updateData);

    return res.json({
      success: true,
      message: 'GRN updated successfully',
      data: grn
    });
  } catch (error) {
    console.error('Update GRN error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Approve GRN
 */
exports.approveGrn = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'system';

    const grn = PurchaseGrnService.approveGrn(id, userId);

    return res.json({
      success: true,
      message: 'GRN approved successfully',
      data: grn
    });
  } catch (error) {
    console.error('Approve GRN error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Reject GRN
 */
exports.rejectGrn = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'system';

    const grn = PurchaseGrnService.rejectGrn(id, userId);

    return res.json({
      success: true,
      message: 'GRN rejected successfully',
      data: grn
    });
  } catch (error) {
    console.error('Reject GRN error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Mark GRN as received
 */
exports.markAsReceived = (req, res) => {
  try {
    const { id } = req.params;

    const grn = PurchaseGrnService.markAsReceived(id);

    return res.json({
      success: true,
      message: 'GRN marked as received successfully',
      data: grn
    });
  } catch (error) {
    console.error('Mark as received error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get quantity variance
 */
exports.getVariance = (req, res) => {
  try {
    const { id } = req.params;

    const variance = PurchaseGrnService.getVariance(id);

    return res.json({
      success: true,
      data: variance
    });
  } catch (error) {
    console.error('Get variance error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get GRN statistics
 */
exports.getStatistics = (req, res) => {
  try {
    const stats = PurchaseGrnService.getStatistics();

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending GRNs count
 */
exports.getPendingCount = (req, res) => {
  try {
    const count = PurchaseGrnService.getPendingCount();

    return res.json({
      success: true,
      data: { pending_count: count }
    });
  } catch (error) {
    console.error('Get pending count error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get vendors list
 */
exports.getVendorsList = (req, res) => {
  try {
    const vendors = PurchaseGrnService.getVendorsList();

    return res.json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete GRN
 */
exports.deleteGrn = (req, res) => {
  try {
    const { id } = req.params;

    const result = PurchaseGrnService.deleteGrn(id);

    return res.json({
      success: true,
      message: 'GRN deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete GRN error:', error);
    return res.status(500).json({ error: error.message });
  }
};
