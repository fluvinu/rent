package com.rnt.rent.query;

import lombok.Data;

import java.util.List;

/**
 * Request body for the dynamic record query endpoint: filter / sort / search /
 * relation expansion / pagination.
 */
@Data
public class RecordQuery {

    private FilterNode filter;
    private List<SortSpec> sort;
    private String search;
    private List<String> expand;
    private Page page;

    @Data
    public static class SortSpec {
        private String field;
        private String dir; // "asc" | "desc"
    }

    @Data
    public static class Page {
        private int limit = 50;
        private int offset = 0;
    }
}
