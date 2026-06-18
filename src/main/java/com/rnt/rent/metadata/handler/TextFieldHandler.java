package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.ConfigUtil;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class TextFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.TEXT;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        return raw == null ? null : raw.toString();
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        String s = (String) value;
        Double minLen = ConfigUtil.getNumber(field, "minLen");
        Double maxLen = ConfigUtil.getNumber(field, "maxLen");
        String regex = ConfigUtil.getString(field, "regex");

        if (minLen != null && s.length() < minLen) {
            throw new ValidationException("must be at least " + minLen.intValue() + " characters");
        }
        if (maxLen != null && s.length() > maxLen) {
            throw new ValidationException("must be at most " + maxLen.intValue() + " characters");
        }
        if (regex != null && !regex.isBlank() && !Pattern.compile(regex).matcher(s).matches()) {
            throw new ValidationException("does not match required format");
        }
    }
}
