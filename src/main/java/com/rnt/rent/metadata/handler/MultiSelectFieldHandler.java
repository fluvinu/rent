package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.ConfigUtil;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class MultiSelectFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.MULTI_SELECT;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof List<?> list) {
            return list.stream().map(v -> v == null ? null : v.toString()).toList();
        }
        throw new ValidationException("must be an array");
    }

    @Override
    @SuppressWarnings("unchecked")
    public void validate(Object value, FieldDefinition field) {
        List<String> values = (List<String>) value;
        Double maxSelected = ConfigUtil.getNumber(field, "maxSelected");
        if (maxSelected != null && values.size() > maxSelected) {
            throw new ValidationException("at most " + maxSelected.intValue() + " selections allowed");
        }
        Set<String> allowed = SelectFieldHandler.allowedValues(field);
        if (!allowed.isEmpty()) {
            for (String v : values) {
                if (!allowed.contains(v)) {
                    throw new ValidationException("'" + v + "' is not one of " + allowed);
                }
            }
        }
    }
}
