
import mongoose from 'mongoose';
import { TenantModel } from '../src/models/tenant.model';
import { UserModel } from '../src/models/user.model';
import { CreditTransactionModel } from '../src/models/credit-transaction.model';
import { TenantService } from '../src/services/tenant.service';
import { CreditService } from '../src/services/credit.service';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = "mongodb://localhost:27017/nebula_studio_db"; // Hardcoded for this environment based on prev knowledge or default

async function runTest() {
    console.log('Starting Tenant Flow Test...');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Setup Data
        const testOwnerId = new mongoose.Types.ObjectId();
        const testUser = await UserModel.create({
            _id: testOwnerId,
            firstName: 'Test',
            lastName: 'Owner',
            email: `testowner_${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'user'
        });
        console.log('User created:', testUser.email);

        // 2. Create Tenant
        console.log('Creating Tenant...');
        const tenant = await TenantService.createTenant({
            name: 'Acme Corp',
            type: 'ORGANIZATION',
            ownerUserId: testOwnerId.toString(),
            initialCredits: 500
        });
        console.log('Tenant Created:', tenant.name, tenant._id);

        if (tenant.credits.balance !== 500) throw new Error('Initial credits mismatch');

        // Verify User Linkage
        const updatedUser = await UserModel.findById(testOwnerId);
        if (updatedUser?.role !== 'tenant_owner') throw new Error('User role not updated');
        if (updatedUser?.tenantId?.toString() !== tenant._id.toString()) throw new Error('User tenantId not correctly linked');
        console.log('User linked correctly.');

        // 3. Assign Custom Plan
        console.log('Assigning Custom Plan...');
        const updatedTenant = await TenantService.assignCustomPlan(tenant._id.toString(), {
            basePlanId: 'TEAM',
            customLimits: {
                maxUsers: 50,
                monthlyCredits: 10000,
                features: ['all']
            }
        });

        if (updatedTenant?.plan.id !== 'CUSTOM') throw new Error('Plan not set to CUSTOM');
        if (updatedTenant?.plan.customLimits?.maxUsers !== 50) throw new Error('Custom limits not applied');
        console.log('Custom Plan Assigned.');

        // 4. Grant Credits
        console.log('Granting Credits...');
        await CreditService.grantCredits({
            tenantId: tenant._id.toString(),
            amount: 200,
            adminUserId: testOwnerId.toString(), // Faking admin ID
            reason: 'Bonus'
        });

        const tenantAfterGrant = await TenantModel.findById(tenant._id);
        if (tenantAfterGrant?.credits.balance !== 700) throw new Error('Grant failed');
        console.log('Credits Granted. New Balance:', tenantAfterGrant.credits.balance);

        // 5. Suspend
        console.log('Suspending Tenant...');
        await TenantService.suspendTenant(tenant._id.toString(), 'Violation');
        const suspendedTenant = await TenantModel.findById(tenant._id);
        if (suspendedTenant?.status !== 'SUSPENDED') throw new Error('Suspend failed');
        console.log('Tenant Suspended.');

        // Cleanup
        await TenantModel.deleteOne({ _id: tenant._id });
        await UserModel.deleteOne({ _id: testOwnerId });
        await CreditTransactionModel.deleteMany({ tenantId: tenant._id });
        console.log('Cleanup Done.');

    } catch (e) {
        console.error('TEST FAILED:', e);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
