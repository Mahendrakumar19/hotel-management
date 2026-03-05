const StoreRequisitionService = require('../services/storeRequisitionService');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new store requisition
 */
exports.createRequisition = (req, res) => {
  try {
    const { item_name, quantity, unit, priority, description } = req.body;
    const userId = req.user?.id || 'system';

    // Validation
    if (!item_name || !quantity) {
      return res.status(400).json({ error: 'Item name and quantity are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const requisition = StoreRequisitionService.createRequisition({
      item_name,
      quantity: parseFloat(quantity),
      unit: unit || 'PCS',
      priority: priority || 'routine',
      description: description || '',
      requested_by: userId
    });

    return res.status(201).json({
      success: true,
      message: 'Requisition created successfully',
      data: requisition
    });
  } catch (error) {
    console.error('Create requisition error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all requisitions
 */
exports.getAllRequisitions = (req, res) => {
  try {
    const { status, priority, requested_by } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (requested_by) filters.requested_by = requested_by;

    const requisitions = StoreRequisitionService.getAllRequisitions(filters);

    return res.json({
      success: true,
      data: requisitions,
      count: requisitions.length
    });
  } catch (error) {
    console.error('Get requisitions error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get requisition by ID
 */
exports.getRequisitionById = (req, res) => {
  try {
    const { id } = req.params;

    const requisition = StoreRequisitionService.getRequisitionById(id);
    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }

    return res.json({
      success: true,
      data: requisition
    });
  } catch (error) {
    console.error('Get requisition error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update requisition
 */
exports.updateRequisition = (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, quantity, unit, priority, description } = req.body;

    const updateData = {};
    if (item_name !== undefined) updateData.item_name = item_name;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (priority !== undefined) updateData.priority = priority;
    if (description !== undefined) updateData.description = description;

    const requisition = StoreRequisitionService.updateRequisition(id, updateData);

    return res.json({
      success: true,
      message: 'Requisition updated successfully',
      data: requisition
    });
  } catch (error) {
    console.error('Update requisition error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Approve requisition
 */
exports.approveRequisition = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'system';

    const requisition = StoreRequisitionService.approveRequisition(id, userId);

    return res.json({
      success: true,
      message: 'Requisition approved successfully',
      data: requisition
    });
  } catch (error) {
    console.error('Approve requisition error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Reject requisition
 */
exports.rejectRequisition = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'system';

    const requisition = StoreRequisitionService.rejectRequisition(id, userId);

    return res.json({
      success: true,
      message: 'Requisition rejected successfully',
      data: requisition
    });
  } catch (error) {
    console.error('Reject requisition error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete requisition
 */
exports.deleteRequisition = (req, res) => {
  try {
    const { id } = req.params;

    const result = StoreRequisitionService.deleteRequisition(id);

    return res.json({
      success: true,
      message: 'Requisition deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete requisition error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get requisition statistics
 */
exports.getStatistics = (req, res) => {
  try {
    const stats = StoreRequisitionService.getStatistics();

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
 * Get pending requisitions count
 */
exports.getPendingCount = (req, res) => {
  try {
    const count = StoreRequisitionService.getPendingCount();

    return res.json({
      success: true,
      data: { pending_count: count }
    });
  } catch (error) {
    console.error('Get pending count error:', error);
    return res.status(500).json({ error: error.message });
  }
};
