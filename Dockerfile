# ============================================================
# AgriDoc - Single-Service Render Deployment Dockerfile
# Multi-stage build: packages frontend into Spring Boot JAR
# Build context: repository root (requires access to both
# backend/ and frontend/ directories)
# ============================================================

# ── Stage 1: Build ──────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven wrapper and POM first (layer caching: only re-download deps if pom.xml changes)
COPY backend/pom.xml ./pom.xml
COPY backend/.mvn ./.mvn
COPY backend/mvnw ./mvnw

# Download dependencies (offline cache layer)
RUN mvn dependency:go-offline -B --no-transfer-progress || true

# Copy backend Java source
COPY backend/src ./src

# Copy frontend into Spring Boot's static resources directory.
# This causes Spring Boot to serve the frontend at / when the JAR runs.
COPY frontend ./src/main/resources/static

# Build the fat JAR, skipping tests for speed
RUN mvn -DskipTests clean package -B --no-transfer-progress

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Pre-create directories that the app writes to at runtime.
# On Render free tier these are ephemeral (reset on restart/redeploy).
# That is acceptable for a college/demo deployment.
RUN mkdir -p /app/uploads /app/data

# Expose port — Render will override this via the PORT environment variable.
# The app reads server.port=${PORT:8080} from application.properties.
EXPOSE 8080

# Run the Spring Boot application.
# The JVM opts below reduce memory footprint suitable for Render's free 512MB RAM.
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
