package com.rnt.rent.tenant;

public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_ROLE = new ThreadLocal<>();

    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void setTenantId(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static String getRole() {
        return CURRENT_ROLE.get();
    }

    public static void setRole(String role) {
        CURRENT_ROLE.set(role);
    }

    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_ROLE.remove();
    }
}
