package com.rnt.rent.service;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.query.QueryRequest;
import com.rnt.rent.query.QueryRequest.FilterNode;
import com.rnt.rent.query.QueryRequest.SortSpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Compiles the {@link QueryRequest} JSON DSL into a MongoDB query, always scoped
 * to a single entity type. Tenant isolation is provided by the per-tenant
 * database routing in {@code MongoConfig}.
 */
@Service
public class QueryService {

    private static final Set<String> TOP_LEVEL = Set.of("createdAt", "updatedAt", "version", "parentRecordId");

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<EntityRecord> query(String entityTypeId, QueryRequest request) {
        Query query = new Query(Criteria.where("entityTypeId").is(entityTypeId));

        if (request != null && request.getFilter() != null) {
            query.addCriteria(build(request.getFilter()));
        }
        if (request != null && request.getSort() != null) {
            for (SortSpec spec : request.getSort()) {
                Sort.Direction dir = "desc".equalsIgnoreCase(spec.getDir())
                        ? Sort.Direction.DESC : Sort.Direction.ASC;
                query.with(Sort.by(dir, path(spec.getField())));
            }
        }
        if (request != null && request.getPage() != null) {
            query.skip(Math.max(0, request.getPage().getOffset()));
            query.limit(request.getPage().getLimit() <= 0 ? 50 : request.getPage().getLimit());
        } else {
            query.limit(50);
        }
        return mongoTemplate.find(query, EntityRecord.class);
    }

    private Criteria build(FilterNode node) {
        if (node.isGroup()) {
            if (node.getAnd() != null && !node.getAnd().isEmpty()) {
                return new Criteria().andOperator(buildAll(node.getAnd()));
            }
            return new Criteria().orOperator(buildAll(node.getOr()));
        }
        return leaf(node);
    }

    private Criteria[] buildAll(List<FilterNode> nodes) {
        List<Criteria> out = new ArrayList<>();
        for (FilterNode child : nodes) {
            out.add(build(child));
        }
        return out.toArray(new Criteria[0]);
    }

    private Criteria leaf(FilterNode node) {
        if (node.getField() == null || node.getOp() == null) {
            throw new IllegalArgumentException("Filter leaf requires 'field' and 'op'");
        }
        String path = path(node.getField());
        Criteria c = Criteria.where(path);
        Object v = node.getValue();
        return switch (node.getOp()) {
            case EQ -> c.is(v);
            case NEQ -> c.ne(v);
            case IN -> c.in(asCollection(v));
            case NIN -> c.nin(asCollection(v));
            case GT -> c.gt(v);
            case GTE -> c.gte(v);
            case LT -> c.lt(v);
            case LTE -> c.lte(v);
            case CONTAINS -> c.regex(Pattern.compile(Pattern.quote(String.valueOf(v)), Pattern.CASE_INSENSITIVE));
            case STARTS_WITH -> c.regex(Pattern.compile("^" + Pattern.quote(String.valueOf(v)), Pattern.CASE_INSENSITIVE));
            case IS_NULL -> Boolean.FALSE.equals(v) ? c.ne(null) : c.is(null);
            case BETWEEN -> between(c, v);
        };
    }

    private Criteria between(Criteria c, Object v) {
        Collection<?> bounds = asCollection(v);
        List<?> list = new ArrayList<>(bounds);
        if (list.size() != 2) {
            throw new IllegalArgumentException("BETWEEN requires a [min, max] array");
        }
        return c.gte(list.get(0)).lte(list.get(1));
    }

    private Collection<?> asCollection(Object v) {
        if (v instanceof Collection<?> col) {
            return col;
        }
        throw new IllegalArgumentException("Operator requires an array value");
    }

    /** Maps a logical field name to its physical document path. */
    private String path(String field) {
        if ("id".equals(field)) {
            return "_id";
        }
        if (TOP_LEVEL.contains(field)) {
            return field;
        }
        return "data." + field;
    }
}
