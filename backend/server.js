const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/JitechDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// Employee Schema and Model
const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String, required: true },
  department: { type: String, required: true },
});

const Employee = mongoose.model('Employee', EmployeeSchema);

// Routes
app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add new employee (with padded employeeId)
app.post('/employees', async (req, res) => {
  try {
    // Find the last employee and generate a new ID
    const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
    const newEmployeeId = lastEmployee
      ? String(lastEmployee.employeeId + 1).padStart(5, '0') // Pad the employeeId to 5 digits
      : '00001'; // Start with '00001' if no employees exist

    const newEmployee = new Employee({
      ...req.body,
      employeeId: newEmployeeId, // Use the padded ID
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Fetch next available employee ID (padded)
app.get('/employees/next-id', async (req, res) => {
  try {
    const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
    const nextId = lastEmployee
      ? String(parseInt(lastEmployee.employeeId) + 1).padStart(5, '0') // Pad the next ID to 5 digits
      : '00001'; // Start with '00001' if no employees exist
    res.json(nextId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/employees/:id', async (req, res) => {
  try {
    // Check if the new employeeId already exists
    const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (existingEmployee && existingEmployee._id.toString() !== req.params.id) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.delete('/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
