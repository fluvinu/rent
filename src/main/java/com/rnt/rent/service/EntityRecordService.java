package com.rnt.rent.service;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.EntityType;
import com.rnt.rent.metadata.MetadataValidator;
import com.rnt.rent.metadata.NotFoundException;
import com.rnt.rent.metadata.RelationResolver;
import com.rnt.rent.query.QueryResult;
import com.rnt.rent.query.QueryTranslator;
import com.rnt.rent.query.RecordQuery;
import com.rnt.rent.repository.EntityRecordRepository;
import com.rnt.rent.repository.EntityTypeRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EntityRecordService {

    private final EntityRecordRepository entityRecordRepository;
    private final EntityTypeRepository entityTypeRepository;
    private final MetadataValidator metadataValidator;
    private final QueryTranslator queryTranslator;
    private final RelationResolver relationResolver;
    private final MongoTemplate mongoTemplate;

    public EntityRecordService(EntityRecordRepository entityRecordRepository,
                               EntityTypeRepository entityTypeRepository,
                               MetadataValidator metadataValidator,
                               QueryTranslator queryTranslator,
                               RelationResolver relationResolver,
                               MongoTemplate mongoTemplate) {
        this.entityRecordRepository = entityRecordRepository;
        this.entityTypeRepository = entityTypeRepository;
        this.metadataValidator = metadataValidator;
        this.queryTranslator = queryTranslator;
        this.relationResolver = relationResolver;
        this.mongoTemplate = mongoTemplate;
    }

    public List<EntityRecord> getByEntityTypeId(String entityTypeId) {
        return entityRecordRepository.findByEntityTypeId(entityTypeId);
    }

    public EntityRecord getById(String id) {
        return entityRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Record not found: " + id));
    }

    public EntityRecord getById(String id, List<String> expand) {
        EntityRecord record = getById(id);
        EntityType entityType = requireEntityType(record.getEntityTypeId());
        relationResolver.expand(List.of(record), entityType, expand);
        return record;
    }

    public EntityRecord create(String entityTypeId, EntityRecord record) {
        EntityType entityType = requireEntityType(entityTypeId);
        record.setData(metadataValidator.validateAndCoerce(record.getData(), entityType));
        record.setEntityTypeId(entityTypeId);
        record.setId(null);
        return entityRecordRepository.save(record);
    }

    public EntityRecord update(String id, EntityRecord record) {
        EntityRecord existing = getById(id);
        EntityType entityType = requireEntityType(existing.getEntityTypeId());
        record.setData(metadataValidator.validateAndCoerce(record.getData(), entityType));
        record.setId(id);
        record.setEntityTypeId(existing.getEntityTypeId());
        return entityRecordRepository.save(record);
    }

    public void delete(String id) {
        getById(id);
        entityRecordRepository.deleteById(id);
    }

    public QueryResult query(String entityTypeId, RecordQuery request) {
        EntityType entityType = requireEntityType(entityTypeId);
        Query query = queryTranslator.toQuery(request, entityType);

        // count ignores skip/limit; compute before paginating
        long total = mongoTemplate.count(query, EntityRecord.class);

        RecordQuery.Page page = queryTranslator.page(request);
        query.skip(Math.max(0, page.getOffset())).limit(Math.max(0, page.getLimit()));

        List<EntityRecord> data = mongoTemplate.find(query, EntityRecord.class);
        relationResolver.expand(data, entityType, request.getExpand());

        return new QueryResult(data, total, page.getLimit(), page.getOffset());
    }

    private EntityType requireEntityType(String entityTypeId) {
        return entityTypeRepository.findById(entityTypeId)
                .orElseThrow(() -> new NotFoundException("Entity Type not found: " + entityTypeId));
    }
}
