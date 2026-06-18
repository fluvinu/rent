package com.rnt.rent.query;

import com.rnt.rent.entity.EntityRecord;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class QueryResult {
    private List<EntityRecord> data;
    private long total;
    private int limit;
    private int offset;
}
