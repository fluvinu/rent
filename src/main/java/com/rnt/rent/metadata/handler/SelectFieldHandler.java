package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.ConfigUtil;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class SelectFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.SELECT;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        return raw == null ? null : raw.toString();
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        Set<String> allowed = allowedValues(field);
        if (!allowed.isEmpty() && !allowed.contains(value.toString())) {
            throw new ValidationException("must be one of " + allowed);
        }
    }

    /**
     * Options may be a list of plain strings or a list of maps with an
     * "id"/"value"/"label" key. Returns the set of acceptable stored values.
     */
    static Set<String> allowedValues(FieldDefinition field) {
        List<?> options = ConfigUtil.getList(field, "options");
        if (options == null) {
            return Set.of();
        }
        return options.stream().map(SelectFieldHandler::optionValue).collect(Collectors.toSet());
    }

    private static String optionValue(Object option) {
        if (option instanceof Map<?, ?> m) {
            Object v = m.get("value");
            if (v == null) {
                v = m.get("id");
            }
            if (v == null) {
                v = m.get("label");
            }
            return v == null ? "" : v.toString();
        }
        return option.toString();
    }
}
