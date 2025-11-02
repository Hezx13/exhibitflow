import bcrypt from 'bcryptjs';
import User from '../models/user';
import { Department } from '../models/List/list.model';

export class ProvisioningService {
  private static readonly DEFAULT_DEPARTMENT = 'Administration';
  private static readonly DEFAULT_USERNAME = 'admin';
  private static readonly DEFAULT_EMAIL = 'admin@exibitflow.local';
  private static readonly DEFAULT_PASSWORD = 'admin123!';

  public static async checkAndProvision(): Promise<void> {
    try {
      // Check if any departments exist
      const departmentCount = await Department.countDocuments();
      
      if (departmentCount === 0) {
        console.log('\n🔧 FIRST STARTUP DETECTED - Database is empty');
        console.log('📦 Provisioning default department and admin user...\n');
        
        await this.provisionDefaultSetup();
        
        console.log('✅ Provisioning completed successfully!');
        console.log('\n' + '='.repeat(80));
        console.log('⚠️  SETUP CREDENTIALS - FOR DEVELOPMENT/SETUP PURPOSES ONLY');
        console.log('❌ DO NOT USE THESE CREDENTIALS IN PRODUCTION');
        console.log('='.repeat(80));
        console.log(`👤 Username: ${this.DEFAULT_USERNAME}`);
        console.log(`📧 Email: ${this.DEFAULT_EMAIL}`);
        console.log(`🔑 Password: ${this.DEFAULT_PASSWORD}`);
        console.log('🏢 Department: ' + this.DEFAULT_DEPARTMENT);
        console.log('👑 Role: Admin (Full Access)');
        console.log('='.repeat(80));
        console.log('🔄 Please change these credentials immediately after first login!');
        console.log('='.repeat(80) + '\n');
      }
    } catch (error) {
      console.error('❌ Provisioning failed:', error);
      throw error;
    }
  }

  private static async provisionDefaultSetup(): Promise<void> {
    // Create default department
    const department = new Department({
      name: this.DEFAULT_DEPARTMENT,
      users: [], // Will be populated after user creation
    });
    await department.save();
    console.log(`✓ Created department: ${this.DEFAULT_DEPARTMENT}`);

    // Hash the default password
    const hashedPassword = await bcrypt.hash(this.DEFAULT_PASSWORD, 12);

    // Create admin user
    const adminUser = new User({
      username: this.DEFAULT_USERNAME,
      password: hashedPassword,
      email: this.DEFAULT_EMAIL,
      departments: [department._id],
      selectedDepartment: department._id,
      role: 'Admin',
      isApproved: true,
      adminAccess: true,
    });
    await adminUser.save();
    console.log(`✓ Created admin user: ${this.DEFAULT_USERNAME}`);

    // Update department with user reference
    department.users = [adminUser.username];
    await department.save();
    console.log('✓ Linked user to department');
  }
} 