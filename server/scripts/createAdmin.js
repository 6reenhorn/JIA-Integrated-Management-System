const { dbHelper } = require('../src/db/dbHelper');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await dbHelper.queryOne(
      "SELECT * FROM employees WHERE emp_id = 'ADMIN001'"
    );

    if (adminExists) {
      console.log('Admin user already exists, updating missing fields...');
      
      // Update existing admin with missing fields
      const adminName = adminExists.name || 'System Administrator';
      const nameParts = adminName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'System';
      const lastName = nameParts.slice(1).join(' ') || 'Administrator';
      
      // Extract email and phone from contact if available
      const contact = adminExists.contact || 'admin@example.com';
      const emailMatch = contact.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const phoneMatch = contact.match(/[\d\s\+\-\(\)]+/);
      const email = emailMatch ? emailMatch[0] : 'admin@example.com';
      const phone = phoneMatch ? phoneMatch[0].trim() : '+1 (555) 000-0000';
      
      const updateData = {
        first_name: adminExists.first_name || firstName,
        last_name: adminExists.last_name || lastName,
        department: adminExists.department || 'Administrative',
        email: adminExists.email || email,
        phone: adminExists.phone || phone
      };
      
      await dbHelper.update('employees', adminExists.id, updateData);
      console.log('✅ Admin user updated with missing fields');
      console.log('First Name:', updateData.first_name);
      console.log('Last Name:', updateData.last_name);
      console.log('Department:', updateData.department);
      console.log('Email:', updateData.email);
      console.log('Phone:', updateData.phone);
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user with all employee fields
    // Split "System Administrator" into first_name and last_name
    const adminName = 'System Administrator';
    const nameParts = adminName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'System';
    const lastName = nameParts.slice(1).join(' ') || 'Administrator';
    
    const adminUser = {
      emp_id: 'ADMIN001',
      name: adminName,
      first_name: firstName,
      last_name: lastName,
      role: 'Admin',
      department: 'Administrative',
      contact: 'admin@example.com\n+1 (555) 000-0000\n123 Admin St, Admin City',
      email: 'admin@example.com',
      phone: '+1 (555) 000-0000',
      status: 'Active',
      last_login: null,
      avatar: null,
      address: '123 Admin St, Admin City',
      salary: '0', // Set appropriate salary
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