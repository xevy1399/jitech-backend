const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true }, // Ensure type matches your input
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String, required: true },
  department: { type: String, required: true },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
