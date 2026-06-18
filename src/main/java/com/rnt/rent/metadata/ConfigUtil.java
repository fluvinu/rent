package com.rnt.rent.metadata;

import com.rnt.rent.entity.EntityType.FieldDefinition;

import java.util.List;
import java.util.Map;

/**
 * Helpers for reading optional values out of a field's free-form config map.
 */
public final class ConfigUtil {

    private ConfigUtil() {
    }

    private static Object raw(FieldDefinition field, String key) {
        Map<String, Object> config = field.getConfig();
        return config == null ? null : config.get(key);
    }

    public static String getString(FieldDefinition field, String key) {
        Object v = raw(field, key);
        return v == null ? null : v.toString();
    }

    public static Double getNumber(FieldDefinition field, String key) {
        Object v = raw(field, key);
        if (v instanceof Number n) {
            return n.doubleValue();
        }
        if (v instanceof String s && !s.isBlank()) {
            try {
                return Double.parseDouble(s);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    public static boolean getBoolean(FieldDefinition field, String key) {
        Object v = raw(field, key);
        if (v instanceof Boolean b) {
            return b;
        }
        return v != null && Boolean.parseBoolean(v.toString());
    }

    public static List<?> getList(FieldDefinition field, String key) {
        Object v = raw(field, key);
        return v instanceof List<?> list ? list : null;
    }
}
