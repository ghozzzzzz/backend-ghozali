const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Public route - Get all drought incidents
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id, province, district, drought_level, affected_area,
        affected_people, start_date, end_date, status, land_type,
        water_source_impact, mitigation_efforts, description,
        created_at, updated_at
       FROM drought_incidents 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching drought incidents:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Get single drought incident
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM drought_incidents WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drought incident not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error fetching drought incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Protected routes below - require authentication

// Add new drought incident
router.post('/', auth, async (req, res) => {
  try {
    const {
      province,
      district,
      drought_level,
      affected_area,
      affected_people,
      start_date,
      end_date,
      status,
      land_type,
      water_source_impact,
      mitigation_efforts,
      description
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO drought_incidents 
       (province, district, drought_level, affected_area,
        affected_people, start_date, end_date, status, land_type,
        water_source_impact, mitigation_efforts, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [province, district, drought_level, affected_area,
       affected_people, start_date, end_date, status, land_type,
       water_source_impact, mitigation_efforts, description]
    );

    const [newIncident] = await db.query(
      'SELECT * FROM drought_incidents WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Drought incident added successfully',
      data: newIncident[0]
    });
  } catch (err) {
    console.error('Error adding drought incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Update drought incident
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      province,
      district,
      drought_level,
      affected_area,
      affected_people,
      start_date,
      end_date,
      status,
      land_type,
      water_source_impact,
      mitigation_efforts,
      description
    } = req.body;

    const [existingIncident] = await db.query(
      'SELECT * FROM drought_incidents WHERE id = ?',
      [req.params.id]
    );

    if (existingIncident.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drought incident not found'
      });
    }

    await db.query(
      `UPDATE drought_incidents
       SET province = ?, district = ?, drought_level = ?,
           affected_area = ?, affected_people = ?, start_date = ?,
           end_date = ?, status = ?, land_type = ?,
           water_source_impact = ?, mitigation_efforts = ?, description = ?
       WHERE id = ?`,
      [province, district, drought_level, affected_area,
       affected_people, start_date, end_date, status, land_type,
       water_source_impact, mitigation_efforts, description, req.params.id]
    );

    const [updatedIncident] = await db.query(
      'SELECT * FROM drought_incidents WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Drought incident updated successfully',
      data: updatedIncident[0]
    });
  } catch (err) {
    console.error('Error updating drought incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Delete drought incident
router.delete('/:id', auth, async (req, res) => {
  try {
    const [existingIncident] = await db.query(
      'SELECT * FROM drought_incidents WHERE id = ?',
      [req.params.id]
    );

    if (existingIncident.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drought incident not found'
      });
    }

    await db.query('DELETE FROM drought_incidents WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Drought incident deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting drought incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

module.exports = router;
