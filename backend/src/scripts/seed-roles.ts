import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Role, RoleName } from '../modules/users/role.entity';

config(); // Load environment variables

async function seedRoles() {
  console.log('🌱 Starting role seed...\n');
  
  // Create a new DataSource specifically for this script
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity{.ts,.js}'], // Load all entities using glob pattern
    synchronize: false,
  });
  
  await dataSource.initialize();
  console.log('✓ Database connected\n');
  
  const roleRepo = dataSource.getRepository(Role);
  
  const roles = [
    RoleName.ADMIN,
    RoleName.TEACHER,
    RoleName.STUDENT,
    RoleName.EMPLOYEE,
  ];
  
  for (const roleName of roles) {
    const exists = await roleRepo.findOne({ where: { name: roleName } });
    if (!exists) {
      await roleRepo.save({ name: roleName });
      console.log(`✓ Created role: ${roleName}`);
    } else {
      console.log(`- Role already exists: ${roleName}`);
    }
  }
  
  console.log('\n✅ Roles seeded successfully!');
  await dataSource.destroy();
}

seedRoles().catch((error) => {
  console.error('❌ Error seeding roles:', error);
  process.exit(1);
});
