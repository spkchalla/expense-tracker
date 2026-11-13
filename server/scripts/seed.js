import { connectDB, disconnectDB } from '../src/config/db.js';
import { AuthService } from '../src/services/authService.js';
import { User } from '../src/models/User.js';
import { config } from '../src/config/env.js';

async function seed() {
  console.log('[Seed] Starting database seed...');
  await connectDB();

  const adminEmail = config.bootstrapAdminEmail || 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    console.log(`[Seed] Creating bootstrap admin account (${adminEmail})...`);
    await AuthService.register({
      displayName: 'System Admin',
      email: adminEmail,
      password: 'AdminPassword123!',
    });
    console.log('[Seed] Admin account created successfully.');
  } else {
    console.log(`[Seed] Admin account (${adminEmail}) already exists.`);
  }

  await disconnectDB();
  console.log('[Seed] Seed script completed.');
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
