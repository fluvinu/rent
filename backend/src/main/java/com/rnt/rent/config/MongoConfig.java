package com.rnt.rent.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.rnt.rent.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database:rent_admin}")
    private String defaultDatabaseName;

    @Override
    protected String getDatabaseName() {
        return defaultDatabaseName;
    }

    @Override
    public MongoClient mongoClient() {
        return MongoClients.create(mongoUri);
    }

    @Bean
    @Override
    public MongoDatabaseFactory mongoDbFactory() {
        return new SimpleMongoClientDatabaseFactory(mongoClient(), getDatabaseName()) {
            @Override
            public com.mongodb.client.MongoDatabase getMongoDatabase() {
                String tenant = TenantContext.getTenantId();
                String dbName = (tenant != null && !tenant.isEmpty()) ? tenant : defaultDatabaseName;
                return getMongoClient().getDatabase(dbName);
            }
        };
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoDbFactory());
    }
}
