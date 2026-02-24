FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR file into the container
COPY target/*.jar app.jar

# Set JVM options that work on ALL platforms (Raspberry Pi, Linux, Mac, etc.)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+DisableAttachMechanism -Djava.security.egd=file:/dev/./urandom -Djava.awt.headless=true -Dfile.encoding=UTF-8"

# Run JAR with default config
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
CMD ["--spring.config.location=file:/app/config/application.yml"]
