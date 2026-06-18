package com.rnt.rent.controller;

import com.rnt.rent.metadata.NotFoundException;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(ValidationException ex) {
        List<Map<String, String>> fieldErrors = ex.getFieldErrors().stream()
                .map(fe -> Map.of("field", fe.field(), "message", fe.message()))
                .toList();
        return ResponseEntity.unprocessableEntity().body(error("VALIDATION_FAILED", ex.getMessage(), fieldErrors));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("NOT_FOUND", ex.getMessage(), null));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(error("BAD_REQUEST", ex.getMessage(), null));
    }

    private Map<String, Object> error(String code, String message, Object fieldErrors) {
        Map<String, Object> err = new java.util.HashMap<>();
        err.put("code", code);
        err.put("message", message);
        if (fieldErrors != null) {
            err.put("fieldErrors", fieldErrors);
        }
        return Map.of("error", err);
    }
}
