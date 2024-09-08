# Build stage
FROM maven:3-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Check if JAR exists
RUN ls -la /app/target/

# Run stage
FROM eclipse-temurin:17-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar spring-rent.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/spring-rent.jar"]
