package com.rnt.rent.service;

import com.rnt.rent.query.QueryRequest.FilterNode;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;

/**
 * Evaluates a {@link FilterNode} tree against a single record's data map
 * in-memory. Shared by the workflow engine for CONDITION steps so the same DSL
 * powers both querying and workflow conditions.
 */
@Component
public class RecordMatcher {

    public boolean matches(FilterNode node, Map<String, Object> data) {
        if (node == null) {
            return true;
        }
        if (node.isGroup()) {
            if (node.getAnd() != null && !node.getAnd().isEmpty()) {
                return node.getAnd().stream().allMatch(child -> matches(child, data));
            }
            return node.getOr().stream().anyMatch(child -> matches(child, data));
        }
        return leaf(node, data);
    }

    private boolean leaf(FilterNode node, Map<String, Object> data) {
        Object actual = data == null ? null : data.get(node.getField());
        Object expected = node.getValue();
        if (node.getOp() == null) {
            return false;
        }
        return switch (node.getOp()) {
            case EQ -> eq(actual, expected);
            case NEQ -> !eq(actual, expected);
            case IN -> expected instanceof Collection<?> c && c.stream().anyMatch(e -> eq(actual, e));
            case NIN -> !(expected instanceof Collection<?> c && c.stream().anyMatch(e -> eq(actual, e)));
            case GT -> cmp(actual, expected) > 0;
            case GTE -> cmp(actual, expected) >= 0;
            case LT -> cmp(actual, expected) < 0;
            case LTE -> cmp(actual, expected) <= 0;
            case CONTAINS -> actual != null && String.valueOf(actual).toLowerCase()
                    .contains(String.valueOf(expected).toLowerCase());
            case STARTS_WITH -> actual != null && String.valueOf(actual).toLowerCase()
                    .startsWith(String.valueOf(expected).toLowerCase());
            case IS_NULL -> Boolean.FALSE.equals(expected) ? actual != null : actual == null;
            case BETWEEN -> between(actual, expected);
        };
    }

    private boolean eq(Object a, Object b) {
        if (a == null || b == null) {
            return a == b;
        }
        if (a instanceof Number && b instanceof Number) {
            return ((Number) a).doubleValue() == ((Number) b).doubleValue();
        }
        return String.valueOf(a).equals(String.valueOf(b));
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private int cmp(Object a, Object b) {
        if (a instanceof Number na && b instanceof Number nb) {
            return Double.compare(na.doubleValue(), nb.doubleValue());
        }
        if (a instanceof Comparable ca && b != null) {
            return ca.compareTo(b);
        }
        return String.valueOf(a).compareTo(String.valueOf(b));
    }

    private boolean between(Object actual, Object expected) {
        if (expected instanceof java.util.List<?> list && list.size() == 2) {
            return cmp(actual, list.get(0)) >= 0 && cmp(actual, list.get(1)) <= 0;
        }
        return false;
    }
}
