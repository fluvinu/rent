package com.rnt.rent.query;

import lombok.Data;

import java.util.List;

/**
 * A node in the filter tree. A node is either:
 *  - a leaf condition: {@code field} + {@code op} (+ {@code value}), or
 *  - a group: {@code and} / {@code or} lists of child nodes.
 */
@Data
public class FilterNode {
    private List<FilterNode> and;
    private List<FilterNode> or;

    private String field;
    private String op;
    private Object value;

    public boolean isLeaf() {
        return field != null;
    }
}
