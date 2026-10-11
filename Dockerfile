# Stage 1: Build application with Maven and Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependency layer
COPY backend/pom.xml ./
RUN mvn -q -B dependency:go-offline

# Compile and package Spring Boot application
COPY backend/src ./src
RUN mvn -q -B clean package -DskipTests

# Stage 2: Production JRE runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run as non-root user for security and create data directory for embedded Docker DB
RUN groupadd -r appgroup && useradd -r -g appgroup -s /bin/false appuser && \
    mkdir -p /app/data && chown -R appuser:appgroup /app/data

COPY --from=build --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseG1GC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
