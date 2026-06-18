package com.rnt.rent.query;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * JSON filter / sort / pagination DSL for dynamic record queries.
 *
 * <pre>
 * {
 *   "filter": { "and": [ { "field": "status", "op": "IN", "value": ["Active"] } ] },
 *   "sort":   [ { "field": "updatedAt", "dir": "desc" } ],
 *   "expand": ["orders"],
 *   "page":   { "limit": 50, "offset": 0 }
 * }
 * </pre>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class QueryRequest {

    private FilterNode filter;
    private List<SortSpec> sort;
    private List<String> expand;
    private PageSpec page;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FilterNode {
        // Group form: exactly one of and/or is set.
        private List<FilterNode> and;
        private List<FilterNode> or;

        // Leaf form.
        private String field;
        private FilterOperator op;
        private Object value;

        public boolean isGroup() {
            return (and != null && !and.isEmpty()) || (or != null && !or.isEmpty());
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SortSpec {
        private String field;
        private String dir = "asc";
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PageSpec {
        private int limit = 50;
        private int offset = 0;
    }
}
