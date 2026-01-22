
import mongoose from 'mongoose';
import { TenantModel } from '../src/models/tenant.model';
import { UserModel } from '../src/models/user.model';
import { SystemFeatureModel } from '../src/models/system-feature.model';
import { TenantService } from '../src/services/tenant.service';
import { FeatureAccessService } from '../src/services/feature-access.service';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = "mongodb://localhost:27017/nebula_studio_db";

async function runFeatureTest() {
    console.log('Starting Feature Guard Test...');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Initialize features
        await FeatureAccessService.initializeFeatures();

        // 1. Create a Free Plan Tenant (Only TEXT_TO_IMAGE)
        const testOwnerId = new mongoose.Types.ObjectId();
        await UserModel.create({
            _id: testOwnerId,
            firstName: 'Free',
            lastName: 'User',
            email: `free${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'user'
        });

        const tenant = await TenantService.createTenant({
            name: 'Free Tenant',
            type: 'INDIVIDUAL',
            ownerUserId: testOwnerId.toString(),
            planId: 'FREE'
        });
        console.log('Free Tenant Created');

        // 2. Check Access
        console.log('Checking FREE tenant access...');
        // Should have TEXT_TO_IMAGE
        const hasImg = await FeatureAccessService.canAccessFeature(tenant._id.toString(), 'TEXT_TO_IMAGE');
        if (!hasImg) throw new Error('Free tenant should have TEXT_TO_IMAGE');
        console.log('OK: Has TEXT_TO_IMAGE');

        // Should NOT have TEXT_TO_VIDEO
        const hasVid = await FeatureAccessService.canAccessFeature(tenant._id.toString(), 'TEXT_TO_VIDEO');
        if (hasVid) throw new Error('Free tenant should NOT have TEXT_TO_VIDEO');
        console.log('OK: No TEXT_TO_VIDEO');

        // 3. Override Feature
        console.log('Adding override for TEXT_TO_VIDEO...');
        await TenantService.addFeatureOverride(tenant._id.toString(), 'TEXT_TO_VIDEO');

        const hasVidAfter = await FeatureAccessService.canAccessFeature(tenant._id.toString(), 'TEXT_TO_VIDEO');
        if (!hasVidAfter) throw new Error('Override failed, should have TEXT_TO_VIDEO now');
        console.log('OK: Override granted TEXT_TO_VIDEO');

        // 4. Global Kill Switch
        console.log('Activating Global Kill Switch for TEXT_TO_IMAGE...');
        await FeatureAccessService.toggleGlobalFeature('TEXT_TO_IMAGE', false, testOwnerId.toString(), 'Emergency');

        const hasImgBlocked = await FeatureAccessService.canAccessFeature(tenant._id.toString(), 'TEXT_TO_IMAGE');
        if (hasImgBlocked) throw new Error('Global kill switch failed, should block TEXT_TO_IMAGE');
        console.log('OK: TEXT_TO_IMAGE blocked globally');

        // Restore
        await FeatureAccessService.toggleGlobalFeature('TEXT_TO_IMAGE', true, testOwnerId.toString());

        // Cleanup
        await TenantModel.deleteOne({ _id: tenant._id });
        await UserModel.deleteOne({ _id: testOwnerId });
        console.log('Cleanup Done.');

    } catch (e) {
        console.error('TEST FAILED:', e);
    } finally {
        await mongoose.disconnect();
    }
}

runFeatureTest();
