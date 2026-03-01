#!/bin/bash
# This script will build JAR files, then create respective Docker images for all 3 microservices and then push them to Docker Hub

set -e # Exit immediately if any command fails

ROOT_DIR="$(pwd)"
echo "Current directory: $ROOT_DIR"

# Remove the default builder and create a new one for multiplatform build
docker buildx rm multiplatform 2>/dev/null || true
docker buildx create --name multiplatform --driver docker-container --use
docker buildx ls

# Build the frontend
cd "$ROOT_DIR/frontend"
npm run build

# Copy dist folder contents to static folder
cp -r "$ROOT_DIR/frontend/dist/"* "$ROOT_DIR/backend/main-application/src/main/resources/static/"

# Build main-application
cd "$ROOT_DIR/backend/main-application"
mvn clean install -DskipTests
docker build -f dev.dockerfile -t main-application:v0.0.1 .
docker buildx build --platform linux/amd64,linux/arm64 -f dev.dockerfile -t niharikadutta/main-application:v0.0.1 --push .

# Build processor-service
cd "$ROOT_DIR/backend/processor-service"
mvn clean install -DskipTests
docker build -f dev.dockerfile -t processor-service:v0.0.1 .
docker buildx build --platform linux/amd64,linux/arm64 -f dev.dockerfile -t niharikadutta/processor-service:v0.0.1 --push .

# Build email-service
cd "$ROOT_DIR/backend/email-service"
mvn clean install -DskipTests
docker build -f dev.dockerfile -t email-service:v0.0.1 .
docker buildx build --platform linux/amd64,linux/arm64 -f dev.dockerfile -t niharikadutta/email-service:v0.0.1 --push .

echo ""
echo "Deployment complete!"

# mvn clean install -DskipTests && mvn clean package
# docker build -f dev.dockerfile -t main-application:v0.0.1 .
# docker build -f dev.dockerfile -t processor-service:v0.0.1 .
# docker build -f dev.dockerfile -t email-service:v0.0.1 .

# docker run -p 4040:4040 main-application:v0.0.1

# Push to Docker Hub:
# docker push niharikadutta/main-application:v0.0.1
# docker push niharikadutta/processor-service:v0.0.1
# docker push niharikadutta/email-service:v0.0.1

# Pull images from Docker Hub
# docker pull niharikadutta/main-application:v0.0.1
# docker pull niharikadutta/processor-service:v0.0.1
# docker pull niharikadutta/email-service:v0.0.1

# Steps to deploy the application using Docker (For Production)

# 1. Update all environment variables in .env files
# 2. Run build script ./buildx-multiarch-build-and-push.sh
# 3. Upload the deployment setup (./deployment) in the server(VM) using scp
#       scp -r ./deployment niharika@bihan-prod:/home/niharika/
#       scp -r /Users/niharika/Workspace/Personal/deployment_setup/final_deployment/videohub niharika@bihan-prod:/home/niharika/
# 4. SSH into the server and Pull the latest image from the docker hub
#       docker pull <username>/<image_name>:<tag>
#       docker pull niharikadutta/main-application:v0.0.1
# 5. Run the docker compose file in the remote server
#       docker compose up -d
# 6. Check docker logs to verify the deployment
#       docker logs <container_name> -f
#       docker logs main-application -f


# scp -r /Users/niharika/Workspace/Personal/deployment_setup/final_deployment/videohub niharika@bihan-prod:/home/niharika/
# docker run -p 4040:4040 -v $(pwd)/src/main/resources/application-docker.yml:/app/config/application.yml:ro main-application:v0.0.1
# docker build -f <dockerfile> -t <image_name>:<tag> --build-arg AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
# java -jar main-application/target/main-application-1.0.0.jar --spring.config.location=file:main-application/src/main/resources/application-docker.yml
