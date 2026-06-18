package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.ConfigUtil;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.stereotype.Component;

@Component
public class NumberFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.NUMBER;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number n) {
            return n.doubleValue();
        }
        try {
            return Double.parseDouble(raw.toString().trim());
        } catch (NumberFormatException e) {
            throw new ValidationException("must be a number");
        }
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        double d = ((Number) value).doubleValue();
        Double min = ConfigUtil.getNumber(field, "min");
        Double max = ConfigUtil.getNumber(field, "max");
        boolean integer = ConfigUtil.getBoolean(field, "integer");

        if (integer && d != Math.floor(d)) {
            throw new ValidationException("must be an integer");
        }
        if (min != null && d < min) {
            throw new ValidationException("must be >= " + min);
        }
        if (max != null && d > max) {
            throw new ValidationException("must be <= " + max);
        }
    }
}
