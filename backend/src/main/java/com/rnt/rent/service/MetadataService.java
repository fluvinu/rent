package com.rnt.rent.service;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.repository.EntityTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Owns the metadata plane: CRUD of entity types and their fields. Derives a
 * stable, immutable {@code key} for every field so that records (keyed by
 * {@code key}) survive display-name changes, and bumps a schema {@code version}
 * on every change.
 */
@Service
public class MetadataService {

    @Autowired
    private EntityTypeRepository entityTypeRepository;

    public List<EntityType> getAll() {
        return entityTypeRepository.findAll();
    }

    public EntityType getById(String id) {
        return entityTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entity Type not found: " + id));
    }

    public EntityType create(EntityType entityType) {
        entityType.setId(null);
        normalizeFields(entityType);
        entityType.setVersion(1);
        return entityTypeRepository.save(entityType);
    }

    public EntityType update(String id, EntityType incoming) {
        EntityType existing = getById(id);
        incoming.setId(existing.getId());
        normalizeFields(incoming);
        incoming.setVersion(existing.getVersion() + 1);
        return entityTypeRepository.save(incoming);
    }

    public EntityType addField(String id, FieldDefinition field) {
        EntityType type = getById(id);
        if (type.getFields() == null) {
            type.setFields(new ArrayList<>());
        }
        type.getFields().add(field);
        normalizeFields(type);
        type.setVersion(type.getVersion() + 1);
        return entityTypeRepository.save(type);
    }

    public EntityType removeField(String id, String fieldKey) {
        EntityType type = getById(id);
        if (type.getFields() != null) {
            type.getFields().removeIf(f -> fieldKey.equals(f.getKey()));
        }
        type.setVersion(type.getVersion() + 1);
        return entityTypeRepository.save(type);
    }

    public void delete(String id) {
        entityTypeRepository.deleteById(id);
    }

    /** Assigns a unique slug key to any field that does not already have one. */
    private void normalizeFields(EntityType type) {
        if (type.getFields() == null) {
            return;
        }
        Set<String> used = new HashSet<>();
        for (FieldDefinition field : type.getFields()) {
            String key = field.getKey();
            if (key == null || key.isBlank()) {
                key = slugify(field.getName());
            }
            if (key.isBlank()) {
                key = "field";
            }
            String unique = key;
            int n = 2;
            while (!used.add(unique)) {
                unique = key + "_" + n++;
            }
            field.setKey(unique);
        }
    }

    private String slugify(String input) {
        if (input == null) {
            return "";
        }
        return input.trim().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }
}
