const { dbHelper } = require('../src/db/dbHelper');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await dbHelper.queryOne(
      "SELECT * FROM employees WHERE emp_id = 'ADMIN001'"
    );

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user with all employee fields
    const adminUser = {
      emp_id: 'ADMIN001',
      name: 'System Administrator',
      role: 'admin',
      contact: 'admin@example.com',
      status: 'Active',
      last_login: null,
      avatar: null,
      address: '123 Admin St, Admin City',
      salary: 0, // Set appropriate salary
      contact_name: 'Emergency Contact',
      contact_number: '09123456789',
      relationship: 'Self',
      password: hashedPassword, // Store hashed password
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    // Insert admin user
    const result = await dbHelper.insert('employees', adminUser);
    console.log('✅ Admin user created successfully');
    console.log('Employee ID:', adminUser.emp_id);
    console.log('Name:', adminUser.name);
    console.log('Role:', adminUser.role);
    console.log('Default password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 'SQLITE_ERROR') {
      console.error('Database error details:', error);
    }
    process.exit(1);
  }
};

// Run the function
createAdminUser().then(() => {
  process.exit(0);
});