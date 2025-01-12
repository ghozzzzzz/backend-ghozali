const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Public route - Get all fire incidents
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id, province, district, fire_level, burned_area,
        affected_people, start_date, end_date, status,
        fire_type, description, created_at, updated_at
       FROM fire_incidents 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching fire incidents:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Get single fire incident
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM fire_incidents WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fire incident not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error fetching fire incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Protected routes below - require authentication

// Add new fire incident
router.post('/', auth, async (req, res) => {
  try {
    const {
      province,
      district,
      fire_level,
      burned_area,
      affected_people,
      start_date,
      end_date,
      status,
      fire_type,
      description
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO fire_incidents 
       (province, district, fire_level, burned_area,
        affected_people, start_date, end_date, status,
        fire_type, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [province, district, fire_level, burned_area,
       affected_people, start_date, end_date, status,
       fire_type, description]
    );

    const [newIncident] = await db.query(
      'SELECT * FROM fire_incidents WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Fire incident added successfully',
      data: newIncident[0]
    });
  } catch (err) {
    console.error('Error adding fire incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Update fire incident
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      province,
      district,
      fire_level,
      burned_area,
      affected_people,
      start_date,
      end_date,
      status,
      fire_type,
      description
    } = req.body;

    const [existingIncident] = await db.query(
      'SELECT * FROM fire_incidents WHERE id = ?',
      [req.params.id]
    );

    if (existingIncident.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fire incident not found'
      });
    }

    await db.query(
      `UPDATE fire_incidents
       SET province = ?, district = ?, fire_level = ?,
           burned_area = ?, affected_people = ?, start_date = ?,
           end_date = ?, status = ?, fire_type = ?, description = ?
       WHERE id = ?`,
      [province, district, fire_level, burned_area,
       affected_people, start_date, end_date, status,
       fire_type, description, req.params.id]
    );

    const [updatedIncident] = await db.query(
      'SELECT * FROM fire_incidents WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Fire incident updated successfully',
      data: updatedIncident[0]
    });
  } catch (err) {
    console.error('Error updating fire incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

// Delete fire incident
router.delete('/:id', auth, async (req, res) => {
  try {
    const [existingIncident] = await db.query(
      'SELECT * FROM fire_incidents WHERE id = ?',
      [req.params.id]
    );

    if (existingIncident.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fire incident not found'
      });
    }

    await db.query('DELETE FROM fire_incidents WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Fire incident deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting fire incident:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

module.exports = router;
