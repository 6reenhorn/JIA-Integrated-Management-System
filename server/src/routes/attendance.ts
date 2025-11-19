import express from 'express';
import { Request, Response } from 'express';
import { checkIn, getAttendanceRecords } from '../controllers/attendanceController';

const router = express.Router();

// POST /api/attendance/checkin - Check in an employee
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) {
      return res.status(400).json({ error: 'Employee ID and password are required' });
    }
    const result = await checkIn(employeeId, password);
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/attendance - Get all attendance records
router.get('/', async (req: Request, res: Response) => {
  try {
    const records = await getAttendanceRecords();
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
