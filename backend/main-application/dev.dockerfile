# Start with a JDK base image
FROM eclipse-temurin:17-jre-jammy

# Set working directory inside the container
WORKDIR /app

# Set JVM options that work on ALL platforms (Raspberry Pi, Linux, Mac, etc.)
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+DisableAttachMechanism -Djava.security.egd=file:/dev/./urandom -Djava.awt.headless=true -Dfile.encoding=UTF-8"

# Copy the built JAR file into the container
COPY target/*.jar app.jar
COPY src/main/resources/email-templates/contact-form-acknowledgement-email.md /app/email-templates/contact-form-acknowledgement-email.md
COPY src/main/resources/email-templates/new-contact-form-submission-email.md /app/email-templates/new-contact-form-submission-email.md
COPY src/main/resources/email-templates/user-welcome-email.md /app/email-templates/user-welcome-email.md

# Serving the static files(frontend react app)
COPY src/main/resources/static /app/static

# Copy config from local repository when running in local machine 👇🏻, OR pass config directly using mount volume in docker compose
# COPY src/main/resources/application.yml /app/config/application.yml

# Expose the port app runs on (default port)
EXPOSE 4040

# Run JAR  java -jar <jar_file_path>
ENTRYPOINT ["java", "-jar", "app.jar"]

# Default arguments to ENTRYPOINT
CMD ["--spring.config.location=file:/app/config/application.yml"]

# Configuration Override Strategy:
# 1. Default config: src/main/resources/application.yml (built into JAR)
# 2. Volume override: Mount external config to override default (refer deployment/docker-compose.yml)
# 3. CMD override: Use spring.config.location to specify external config path

# Note: Cannot mount volume during building JAR, so use external config directory
# Example volume mount: ./config/application.yml:/app/config/application.yml:ro
# Then use: java -jar app.jar --spring.config.location=classpath:/application.yml,file:/app/config/application.yml

# -XX:+UseContainerSupport -> Enable JVM container's memory/CPU limits (for better performance)
# -XX:-UseContainerSupport -> Disable JVM container's memory/CPU limits (may use hosts machine full RAM/CPU 16GB/8CPU) -> not recommended
