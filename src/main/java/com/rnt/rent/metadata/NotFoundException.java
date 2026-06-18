package com.rnt.rent.metadata;

/**
 * Thrown when a requested resource (record, entity type, relation target) does
 * not exist in the current tenant. Mapped to HTTP 404.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
