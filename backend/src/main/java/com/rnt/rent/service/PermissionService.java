package com.rnt.rent.service;

import com.rnt.rent.entity.Permission;
import com.rnt.rent.repository.PermissionRepository;
import com.rnt.rent.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Enforces org / role / field-level permissions. The org boundary is provided by
 * per-tenant database routing; this layer adds role-based entity and field
 * access. It is <b>open by default</b>: if no {@link Permission} document exists
 * for the current role + entity type, all access is allowed, preserving the
 * platform's current behaviour until permissions are configured.
 */
@Service
public class PermissionService {

    public enum Action { CREATE, READ, UPDATE, DELETE }

    @Autowired
    private PermissionRepository permissionRepository;

    private String currentRole() {
        String role = TenantContext.getRole();
        return role != null ? role : "ADMIN";
    }

    /** Permissions for the current role that apply to this entity type (type-specific + global). */
    private List<Permission> applicable(String entityTypeId) {
        String role = currentRole();
        List<Permission> result = new ArrayList<>(permissionRepository.findByRoleAndEntityTypeId(role, entityTypeId));
        for (Permission p : permissionRepository.findByRole(role)) {
            if (p.getEntityTypeId() == null) {
                result.add(p);
            }
        }
        return result;
    }

    public void enforce(Action action, String entityTypeId) {
        List<Permission> perms = applicable(entityTypeId);
        if (perms.isEmpty()) {
            return; // open by default
        }
        boolean allowed = perms.stream().anyMatch(p -> switch (action) {
            case CREATE -> p.isCanCreate();
            case READ -> p.isCanRead();
            case UPDATE -> p.isCanUpdate();
            case DELETE -> p.isCanDelete();
        });
        if (!allowed) {
            throw new AccessDeniedException("Role " + currentRole() + " cannot " + action + " on " + entityTypeId);
        }
    }

    /** Removes fields the current role may not read from a record data map. */
    public Map<String, Object> projectReadable(Map<String, Object> data, String entityTypeId) {
        if (data == null) {
            return null;
        }
        List<String> readable = mergeFieldLists(applicable(entityTypeId), true);
        if (readable == null) {
            return data; // all fields readable
        }
        Map<String, Object> out = new LinkedHashMap<>();
        for (String key : readable) {
            if (data.containsKey(key)) {
                out.put(key, data.get(key));
            }
        }
        return out;
    }

    /** Rejects writes touching fields the current role may not write. */
    public void enforceWritableFields(Map<String, Object> data, String entityTypeId) {
        if (data == null) {
            return;
        }
        List<String> writable = mergeFieldLists(applicable(entityTypeId), false);
        if (writable == null) {
            return; // all fields writable
        }
        for (String key : data.keySet()) {
            if (!writable.contains(key)) {
                throw new AccessDeniedException("Role " + currentRole() + " cannot write field: " + key);
            }
        }
    }

    /**
     * Merges field allow-lists across applicable permissions. Returns {@code null}
     * when any permission grants all fields (empty/null list), meaning "no restriction".
     */
    private List<String> mergeFieldLists(List<Permission> perms, boolean read) {
        if (perms.isEmpty()) {
            return null;
        }
        List<String> merged = new ArrayList<>();
        for (Permission p : perms) {
            List<String> fields = read ? p.getReadableFields() : p.getWritableFields();
            if (fields == null || fields.isEmpty()) {
                return null; // this permission allows all fields
            }
            merged.addAll(fields);
        }
        return merged;
    }
}
