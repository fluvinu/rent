package com.rnt.rent.metadata;

import java.util.ArrayList;
import java.util.List;

/**
 * Thrown when record data fails validation against its EntityType metadata.
 * Carries per-field errors so the API can return a 422 with inline messages.
 */
public class ValidationException extends RuntimeException {

    public record FieldError(String field, String message) {
    }

    private final List<FieldError> fieldErrors = new ArrayList<>();

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(List<FieldError> errors) {
        super("Validation failed");
        this.fieldErrors.addAll(errors);
    }

    public ValidationException add(String field, String message) {
        this.fieldErrors.add(new FieldError(field, message));
        return this;
    }

    public List<FieldError> getFieldErrors() {
        return fieldErrors;
    }

    public boolean hasErrors() {
        return !fieldErrors.isEmpty();
    }
}
