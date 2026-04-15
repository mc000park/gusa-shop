FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Gradle wrapper + 의존성 캐시 레이어
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon -q

# 소스 빌드 (테스트 제외)
COPY src src
RUN ./gradlew build -x test --no-daemon

# ── Runtime ──────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
