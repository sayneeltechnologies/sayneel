/**
 * BalSaathi Web Portal - Centralized API Configuration & Endpoints Registry
 * 
 * Single source of truth for all API routes, base URLs, and endpoint builders.
 * Configurable via NEXT_PUBLIC_API_URL environment variable for cross-environment deployments.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const API_ENDPOINTS = {
  // ==================== BDO GOVERNANCE DASHBOARD ====================
  /**
   * Primary BDO dashboard overview (Taluka KPI summary, 4 WHO dimensions, Village list)
   * GET /api/dashboard/bdo?block_id=<id>
   */
  bdoDashboard: (blockId?: string) =>
    blockId
      ? `${API_BASE_URL}/api/dashboard/bdo?block_id=${encodeURIComponent(blockId)}`
      : `${API_BASE_URL}/api/dashboard/bdo`,

  // ==================== ON-DEMAND VILLAGE CHILD REGISTRY ====================
  /**
   * On-demand child clinical roster filtered by village and block
   * GET /api/dashboard/bdo/children?village=<name>&block_id=<id>
   */
  villageChildren: (villageName: string, blockId: string) =>
    `${API_BASE_URL}/api/dashboard/bdo/children?village=${encodeURIComponent(
      villageName
    )}&block_id=${encodeURIComponent(blockId)}`,

  // ==================== INDIVIDUAL CHILD GROWTH TIMELINE ====================
  /**
   * Longitudinal WHO growth history timeline for an individual child
   * GET /api/dashboard/bdo/children?child_id=<id>
   */
  childGrowthHistory: (childId: string) =>
    `${API_BASE_URL}/api/dashboard/bdo/children?child_id=${encodeURIComponent(childId)}`,

  // ==================== AWC SPECIFIC ROSTER ====================
  /**
   * Child roster for a single Anganwadi center
   * GET /api/dashboard/bdo/children?awc_id=<id>
   */
  awcChildren: (awcId: string) =>
    `${API_BASE_URL}/api/dashboard/bdo/children?awc_id=${encodeURIComponent(awcId)}`,
} as const;
