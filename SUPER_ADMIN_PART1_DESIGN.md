# SUPER ADMIN PANEL – PART 1: DESIGN SPECIFICATION

## 1. Architectural Overview & Data Model
To support the multi-tenant SaaS requirements of Nebula Studio, we will introduce a strict `Tenant` hierarchy.

### A. New Entity: Tenant (`TenantModel`)
This is the root entity for billing and resource isolation.
```typescript
interface ITenant {
  _id: ObjectId;
  name: string;
  type: 'INDIVIDUAL' | 'ORGANIZATION';
  
  // PRIMARY OWNER (For communication & billing)
  ownerUserId: ObjectId;
  
  // BILLING & PLAN
  plan: {
    id: 'FREE' | 'PRO' | 'TEAM' | 'CUSTOM';
    isCustom: boolean; 
    // If Custom, these override the system defaults
    customLimits?: {
      maxUsers: number;
      features: string[]; // Whitelisted features
    };
    expiresAt?: Date; // For custom contracts
  };

  // ECONOMY
  credits: {
    balance: number;
    lifetimeIssued: number; // Auditing
  };

  // STATUS
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED_PAYMENT_FAIL';
  
  createdAt: Date;
}
```

### B. Updated Entity: User (`UserModel`)
Users must now belong to a specific Tenant.
```typescript
interface IUser {
  // Existing fields...
  tenantId: ObjectId; // REQUIRED linkage
  role: 'OWNER' | 'ADMIN' | 'MEMBER'; // Role within the Tenant
}
```

### C. System Constants: Plans
To prevent accidental pricing modifications, System Plans are code-defined constants, not DB rows.
```typescript
export const SYSTEM_PLANS = {
  FREE: { name: 'Free', monthlyCredits: 100, features: ['txt2img'], maxUsers: 1 },
  PRO: { name: 'Pro', monthlyCredits: 1000, features: ['all'], maxUsers: 1 },
  TEAM: { name: 'Team', monthlyCredits: 5000, features: ['all'], maxUsers: 10 },
};
// Custom Plans are stored on the Tenant document directly.
```

---

## 2. Module Breakdown & Screen Structure

### Module 1: Tenant Management
**Route**: `/admin/tenants`

#### Screen 1.1: Tenant List View
*   **Layout**: Data Table.
*   **Columns**: 
    *   Tenant Name (Link to Detail)
    *   Type (Ind/Org badge)
    *   Plan (Pro/Team/Custom badge)
    *   Credit Balance
    *   Status (Green Active / Red Suspended)
*   **Filters**: Show Suspended Only, Filter by Plan.
*   **Search**: By Tenant ID, Email, Name.

#### Screen 1.2: Tenant Detail View (`/admin/tenants/:id`)
*   **Header Section**: 
    *   Big Title: Tenant Name.
    *   Actions: [Reset Password], [Suspend Tenant].
*   **Tab 1: Overview**:
    *   Owner Info.
    *   Current Plan Summary.
    *   Status indicators.
*   **Tab 2: Usage & Credits**:
    *   Manual Credit Actions (Grant/Deduct).
    *   Recent consumption log.
*   **Tab 3: Configuration**:
    *   Feature Toggles (Overrides).
    *   Plan Switching.

---

## 3. Key Actions & Logic

### A. Plan & Pricing Enforcement
*   **Action**: `Assign Custom Plan`
*   **UI**: Form to select a "Base Plan" (e.g., Team) and open override fields.
*   **Logic**:
    *   Inputs: Custom Credit amount, Custom User Limit, Expiry Date.
    *   **Validation**: Warning if `Custom Credit < Usage`.
    *   **Storage**: Saves to `Tenant.plan.customLimits`.

### B. Credit Governance
*   **Action**: `Manual Credit Adjustment`
*   **UI**: "Grant" or "Deduct" button opening a modal.
*   **Inputs**: Amount, Reason (Text, Required).
*   **Safety**: All adjustments are logged to `CreditTransaction` collection (immutable).

### C. Feature Access Control
*   **Logic**: 
    *   `canAccess(feature) = (Plan.features.includes(feature) || Tenant.overrides.includes(feature)) && !GlobalKillSwitch.active(feature)`
*   **Global Emergency Stop**:
    *   A red "Emergency" panel in the Super Admin dashboard.
    *   Toggles: "Disable Text-to-Video globally".
    *   Effect: Immediately blocks endpoints for that feature across ALL tenants.
    *   **Safeguard**: "Type 'SHUTDOWN' to confirm."

---

## 4. Cost Visibility & Protection
**Route**: `/admin/financials`

### Screen 4.1: Cost Monitor
*   **Metrics**:
    *   Total Credits Consumed Today (vs 7-day avg).
    *   Estimated Infrastructure Cost (based on static cost-per-credit math).
*   **Alerts**:
    *   List of "High Velocity" tenants (consuming credits 5x faster than normal).
    *   Action: [Freeze Tenant] directly from this list.

---

## 5. Security & Validations
1.  **Authorization**: strict `super_admin` role check on ALL `/admin/*` routes.
2.  **Destructive Actions**:
    *   Suspending a Tenant -> Modal, requires typing Tenant Name to confirm.
    *   Deducting Credits -> Modal, requires Admin Password confirmation.
3.  **Data Integrity**:
    *   Cannot delete Tenants (Soft Delete / Archive only).
    *   Cannot remove 'Owner' from Organization without assigning new Owner.

## 6. Implementation Notes for Developer
*   **Database**: Create `tenants`, `credit_transactions` collections.
*   **Middleware**: Update `authMiddleware` to attach `req.tenant` based on `user.tenantId`.
*   **Frontend**: Use a dense, data-heavy component library (e.g., Shadcn/UI Data Table). Avoid unnecessary whitespace.
*   **State**: Use React Query for Admin data; it changes frequently and needs fresh state.
