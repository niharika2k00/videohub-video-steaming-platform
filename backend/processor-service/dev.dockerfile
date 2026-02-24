# Start with a JDK base image
FROM eclipse-temurin:17-jre-jammy

# Install FFmpeg and curl
RUN apt-get update && \
    apt-get install -y ffmpeg curl unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2
# RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
# unzip awscliv2.zip && \
# ./aws/install && \
# rm -rf awscliv2.zip aws/

RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip

# Set working directory inside the container
WORKDIR /app

# Copy the built JAR file into the container
COPY target/*.jar app.jar
COPY src/main/resources/email-templates/video-process-success-email.md /app/email-templates/video-process-success-email.md

# Set JVM options that work on ALL platforms (Raspberry Pi, Linux, Mac, etc.)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+DisableAttachMechanism -Djava.security.egd=file:/dev/./urandom -Djava.awt.headless=true -Dfile.encoding=UTF-8"

# Run JAR with default config
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
CMD ["--spring.config.location=file:/app/config/application.yml"]
