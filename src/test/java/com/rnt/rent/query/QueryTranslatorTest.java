package com.rnt.rent.query;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.FieldTypeRegistry;
import com.rnt.rent.metadata.handler.NumberFieldHandler;
import com.rnt.rent.metadata.handler.TextFieldHandler;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QueryTranslatorTest {

    private QueryTranslator translator;
    private EntityType entityType;

    @BeforeEach
    void setUp() {
        FieldTypeRegistry registry = new FieldTypeRegistry(List.of(
                new TextFieldHandler(), new NumberFieldHandler()));
        translator = new QueryTranslator(registry);

        entityType = new EntityType();
        entityType.setId("et1");
        entityType.setFields(List.of(
                field("name", FieldType.TEXT),
                field("mrr", FieldType.NUMBER)));
    }

    private FieldDefinition field(String name, FieldType type) {
        FieldDefinition f = new FieldDefinition();
        f.setName(name);
        f.setType(type);
        return f;
    }

    @Test
    void scopesToEntityType() {
        Query q = translator.toQuery(new RecordQuery(), entityType);
        Document doc = q.getQueryObject();
        assertTrue(doc.toJson().contains("entityTypeId"));
        assertTrue(doc.toJson().contains("et1"));
    }

    @Test
    void translatesGteFilterWithCoercion() {
        RecordQuery req = new RecordQuery();
        FilterNode leaf = new FilterNode();
        leaf.setField("mrr");
        leaf.setOp("gte");
        leaf.setValue("100"); // string should be coerced to number
        req.setFilter(leaf);

        Query q = translator.toQuery(req, entityType);
        String json = q.getQueryObject().toJson();
        assertTrue(json.contains("data.mrr"));
        assertTrue(json.contains("100"));
    }

    @Test
    void rejectsUnknownFilterField() {
        RecordQuery req = new RecordQuery();
        FilterNode leaf = new FilterNode();
        leaf.setField("nope");
        leaf.setOp("eq");
        leaf.setValue("x");
        req.setFilter(leaf);

        assertThrows(IllegalArgumentException.class, () -> translator.toQuery(req, entityType));
    }

    @Test
    void rejectsUnknownOperator() {
        RecordQuery req = new RecordQuery();
        FilterNode leaf = new FilterNode();
        leaf.setField("name");
        leaf.setOp("explode");
        leaf.setValue("x");
        req.setFilter(leaf);

        assertThrows(IllegalArgumentException.class, () -> translator.toQuery(req, entityType));
    }

    @Test
    void appliesSort() {
        RecordQuery req = new RecordQuery();
        RecordQuery.SortSpec sort = new RecordQuery.SortSpec();
        sort.setField("name");
        sort.setDir("desc");
        req.setSort(List.of(sort));

        Query q = translator.toQuery(req, entityType);
        assertEquals("data.name", q.getSortObject().keySet().iterator().next());
    }
}
