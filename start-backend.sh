#!/bin/bash
mkdir -p /home/runner/workspace/data/db

# Start MongoDB in background
mongod --dbpath /home/runner/workspace/data/db --port 27017 --bind_ip 127.0.0.1 --logpath /home/runner/workspace/data/mongod.log --fork

# Wait for MongoDB to be ready
for i in {1..30}; do
  if mongo --quiet --eval "db.runCommand({ping:1})" > /dev/null 2>&1; then
    echo "MongoDB is ready"
    break
  fi
  echo "Waiting for MongoDB... ($i)"
  sleep 1
done

# Start Spring Boot
exec java -jar /home/runner/workspace/backend/target/spring-rent.jar
