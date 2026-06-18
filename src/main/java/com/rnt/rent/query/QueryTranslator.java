package com.rnt.rent.query;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.FieldTypeRegistry;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Translates a {@link RecordQuery} into a MongoDB {@link Query}, scoped to one
 * entity type. Field names and operators are whitelisted against the entity's
 * metadata so callers cannot inject arbitrary queries, and values are coerced
 * to each field's type.
 */
@Component
public class QueryTranslator {

    private final FieldTypeRegistry registry;

    public QueryTranslator(FieldTypeRegistry registry) {
        this.registry = registry;
    }

    public Query toQuery(RecordQuery request, EntityType entityType) {
        Map<String, FieldDefinition> fields = fieldsByName(entityType);

        List<Criteria> top = new ArrayList<>();
        top.add(Criteria.where("entityTypeId").is(entityType.getId()));

        if (request.getFilter() != null) {
            top.add(buildCriteria(request.getFilter(), fields));
        }
        if (request.getSearch() != null && !request.getSearch().isBlank()) {
            top.add(buildSearch(request.getSearch().trim(), entityType));
        }

        Query query = new Query(new Criteria().andOperator(top.toArray(new Criteria[0])));

        if (request.getSort() != null) {
            for (RecordQuery.SortSpec sort : request.getSort()) {
                requireField(fields, sort.getField());
                Sort.Direction dir = "desc".equalsIgnoreCase(sort.getDir())
                        ? Sort.Direction.DESC : Sort.Direction.ASC;
                query.with(Sort.by(dir, "data." + sort.getField()));
            }
        }
        return query;
    }

    public RecordQuery.Page page(RecordQuery request) {
        return request.getPage() != null ? request.getPage() : new RecordQuery.Page();
    }

    private Criteria buildCriteria(FilterNode node, Map<String, FieldDefinition> fields) {
        if (node.isLeaf()) {
            return leafCriteria(node, fields);
        }
        if (node.getAnd() != null && !node.getAnd().isEmpty()) {
            return new Criteria().andOperator(childCriteria(node.getAnd(), fields));
        }
        if (node.getOr() != null && !node.getOr().isEmpty()) {
            return new Criteria().orOperator(childCriteria(node.getOr(), fields));
        }
        return new Criteria();
    }

    private Criteria[] childCriteria(List<FilterNode> nodes, Map<String, FieldDefinition> fields) {
        return nodes.stream().map(n -> buildCriteria(n, fields)).toArray(Criteria[]::new);
    }

    private Criteria leafCriteria(FilterNode node, Map<String, FieldDefinition> fields) {
        FieldDefinition field = requireField(fields, node.getField());
        String path = "data." + field.getName();
        String op = node.getOp() == null ? "eq" : node.getOp().toLowerCase();
        Criteria c = Criteria.where(path);

        switch (op) {
            case "eq" -> { return c.is(coerce(node.getValue(), field)); }
            case "ne" -> { return c.ne(coerce(node.getValue(), field)); }
            case "gt" -> { return c.gt(coerce(node.getValue(), field)); }
            case "gte" -> { return c.gte(coerce(node.getValue(), field)); }
            case "lt" -> { return c.lt(coerce(node.getValue(), field)); }
            case "lte" -> { return c.lte(coerce(node.getValue(), field)); }
            case "in" -> { return c.in(coerceList(node.getValue(), field)); }
            case "nin" -> { return c.nin(coerceList(node.getValue(), field)); }
            case "contains" -> { return c.regex(Pattern.quote(asString(node.getValue())), "i"); }
            case "startswith" -> { return c.regex("^" + Pattern.quote(asString(node.getValue())), "i"); }
            case "between" -> {
                List<?> bounds = asList(node.getValue());
                if (bounds.size() != 2) {
                    throw new IllegalArgumentException("'between' requires a [min, max] array for field " + field.getName());
                }
                return c.gte(coerce(bounds.get(0), field)).lte(coerce(bounds.get(1), field));
            }
            case "isnull" -> { return c.is(null); }
            case "isnotnull" -> { return c.ne(null); }
            default -> throw new IllegalArgumentException("Unsupported operator: " + node.getOp());
        }
    }

    private Criteria buildSearch(String term, EntityType entityType) {
        List<Criteria> ors = new ArrayList<>();
        for (FieldDefinition field : entityType.getFields()) {
            if (field.getType() == FieldType.TEXT || field.getType() == FieldType.SELECT) {
                ors.add(Criteria.where("data." + field.getName()).regex(Pattern.quote(term), "i"));
            }
        }
        if (ors.isEmpty()) {
            // no searchable fields → match nothing for this clause
            return Criteria.where("entityTypeId").is("__no_searchable_fields__");
        }
        return new Criteria().orOperator(ors.toArray(new Criteria[0]));
    }

    private Object coerce(Object value, FieldDefinition field) {
        return registry.get(field.getType()).coerce(value, field);
    }

    private List<Object> coerceList(Object value, FieldDefinition field) {
        List<Object> out = new ArrayList<>();
        for (Object v : asList(value)) {
            out.add(coerce(v, field));
        }
        return out;
    }

    private FieldDefinition requireField(Map<String, FieldDefinition> fields, String name) {
        FieldDefinition field = fields.get(name);
        if (field == null) {
            throw new IllegalArgumentException("Unknown field: " + name);
        }
        return field;
    }

    private Map<String, FieldDefinition> fieldsByName(EntityType entityType) {
        Map<String, FieldDefinition> map = new HashMap<>();
        if (entityType.getFields() != null) {
            for (FieldDefinition field : entityType.getFields()) {
                map.put(field.getName(), field);
            }
        }
        return map;
    }

    private String asString(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("operator requires a value");
        }
        return value.toString();
    }

    private List<?> asList(Object value) {
        if (value instanceof List<?> list) {
            return list;
        }
        throw new IllegalArgumentException("operator requires an array value");
    }
}
