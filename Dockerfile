# Multi-stage Dockerfile for Used Car Buy & Sell Platform
# Stage 1: Build backend JAR
FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder

WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 3: Runtime image
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create non-root user and install runtime healthcheck dependency
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    addgroup --gid 1000 --system appgroup && \
    adduser --uid 1000 --system --ingroup appgroup appuser

# Copy backend JAR
COPY --from=backend-builder /app/backend/target/used-car-management-0.0.1-SNAPSHOT.jar app.jar

# Copy frontend build to Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist/used-cars-frontend/browser ./static

# Create directory for Derby database
RUN mkdir -p /app/data /app/logs && chown -R appuser:appgroup /app

# Environment variables (override at runtime)
ENV DB_URL=jdbc:derby:/app/data/usedcarsdb;create=true \
    DB_USERNAME= \
    DB_PASSWORD= \
    DB_DRIVER=org.apache.derby.iapi.jdbc.AutoloadedDriver \
    JPA_DDL_AUTO=update \
    SESSION_EXPIRATION_MINUTES=120 \
    NOTIFICATION_EMAIL_ENABLED=false \
    PORT=8080 \
    LOG_FILE=/app/logs/spring-app.log

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
