package com.rnt.rent.metadata;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.handler.BooleanFieldHandler;
import com.rnt.rent.metadata.handler.DateFieldHandler;
import com.rnt.rent.metadata.handler.FileFieldHandler;
import com.rnt.rent.metadata.handler.JsonFieldHandler;
import com.rnt.rent.metadata.handler.MultiSelectFieldHandler;
import com.rnt.rent.metadata.handler.NumberFieldHandler;
import com.rnt.rent.metadata.handler.RelationFieldHandler;
import com.rnt.rent.metadata.handler.SelectFieldHandler;
import com.rnt.rent.metadata.handler.TextFieldHandler;
import com.rnt.rent.repository.EntityRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MetadataValidatorTest {

    private MetadataValidator validator;

    @BeforeEach
    void setUp() {
        EntityRecordRepository repo = Mockito.mock(EntityRecordRepository.class);
        FieldTypeRegistry registry = new FieldTypeRegistry(List.of(
                new TextFieldHandler(), new NumberFieldHandler(), new BooleanFieldHandler(),
                new DateFieldHandler(), new SelectFieldHandler(), new MultiSelectFieldHandler(),
                new RelationFieldHandler(repo), new FileFieldHandler(), new JsonFieldHandler()));
        validator = new MetadataValidator(registry);
    }

    private EntityType entityType(FieldDefinition... fields) {
        EntityType et = new EntityType();
        et.setId("et1");
        et.setName("Test");
        et.setFields(List.of(fields));
        return et;
    }

    private FieldDefinition field(String name, FieldType type, boolean required) {
        FieldDefinition f = new FieldDefinition();
        f.setName(name);
        f.setType(type);
        f.setRequired(required);
        return f;
    }

    @Test
    void rejectsMissingRequiredField() {
        EntityType et = entityType(field("name", FieldType.TEXT, true));
        ValidationException ex = assertThrows(ValidationException.class,
                () -> validator.validateAndCoerce(Map.of(), et));
        assertEquals("name", ex.getFieldErrors().get(0).field());
    }

    @Test
    void coercesNumericStringToNumber() {
        EntityType et = entityType(field("age", FieldType.NUMBER, false));
        Map<String, Object> result = validator.validateAndCoerce(Map.of("age", "42"), et);
        assertEquals(42.0, result.get("age"));
    }

    @Test
    void rejectsNonNumericNumber() {
        EntityType et = entityType(field("age", FieldType.NUMBER, false));
        ValidationException ex = assertThrows(ValidationException.class,
                () -> validator.validateAndCoerce(Map.of("age", "abc"), et));
        assertEquals("age", ex.getFieldErrors().get(0).field());
    }

    @Test
    void enforcesSelectOptions() {
        FieldDefinition status = field("status", FieldType.SELECT, false);
        status.setConfig(Map.of("options", List.of("open", "closed")));
        EntityType et = entityType(status);

        assertEquals("open", validator.validateAndCoerce(Map.of("status", "open"), et).get("status"));
        assertThrows(ValidationException.class,
                () -> validator.validateAndCoerce(Map.of("status", "invalid"), et));
    }

    @Test
    void enforcesNumberRange() {
        FieldDefinition score = field("score", FieldType.NUMBER, false);
        score.setConfig(Map.of("min", 0, "max", 100));
        EntityType et = entityType(score);
        assertThrows(ValidationException.class,
                () -> validator.validateAndCoerce(Map.of("score", 150), et));
    }

    @Test
    void rejectsUnknownField() {
        EntityType et = entityType(field("name", FieldType.TEXT, false));
        ValidationException ex = assertThrows(ValidationException.class,
                () -> validator.validateAndCoerce(Map.of("bogus", "x"), et));
        assertTrue(ex.getFieldErrors().stream().anyMatch(e -> e.field().equals("bogus")));
    }
}
