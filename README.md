# <div align="center"> 🎥 VideoHub — Video Streaming Platform </div>

A full-stack microservices-based video streaming platform built with React.js frontend and Spring Boot backend, featuring video upload, multi-resolution transcoding via FFmpeg, HLS adaptive bitrate streaming, JWT authentication, and async email notifications via Kafka.

## 🌐 Live Demo

**Website**: https://videohub.raspberryip.com/

## 📸 Screenshots

<details>
   <summary><span style="font-size: 1rem; font-weight: bold">✨ Visual Tour | Screenshots</span></summary>

   ### ✍🏻 Register
   ![a](screenshots/1.png)
   ![a](screenshots/2.png)

   ### 🏠 Homepage
   ![a](screenshots/3.png)
   ![a](screenshots/4.png)
   ![a](screenshots/14.png)
   ![a](screenshots/15.png)
   ![a](screenshots/16.png)

   ### 📊 Dashboard
   ![a](screenshots/7.png)
   ![a](screenshots/17.png)
   ![a](screenshots/8.png)
   ![a](screenshots/9.png)

   ### 🎬 Video Player

   ![a](screenshots/11.png)
   ![a](screenshots/12.png)

   ### 📤 Upload
   ![a](screenshots/4.png)

   ### 👤 Profile
   ![a](screenshots/6.png)
   ![a](screenshots/13.png)
</details>

## 🌟 Features

- **Video Streaming**: Upload videos, automatic multi-resolution transcoding (240p–1080p), HLS adaptive bitrate streaming, Video.js player with quality selector, thumbnail generation.
- **Sharing & Embedding**: Generate external shareable links, copy embed code for any website, reverse-proxied S3 URLs for cross-origin playback.
- **Authentication & Security**: JWT-based auth with token blacklisting, role-based access control (User, Admin, Developer, Editor), BCrypt password hashing, protected routes.
- **Email Notifications**: Welcome emails on signup, contact form acknowledgements, markdown-based email templates, async processing via Kafka.
- **User Management**: Sign up with profile image, bio, location, age, gender and phone. Editable profile, personal video dashboard.
- **Production-Ready Infrastructure**: Complete Docker Compose setup with MySQL, Kafka, and Nginx

## 🏗️ System Architecture

<details>
   <summary><span style="font-size: 1rem; font-weight: bold">📐 High-Level Architecture Overview</span></summary>

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT                                        │
│                                                                                 │
│                  React 19  ·  Vite  ·  Tailwind CSS  ·  Video.js                │
│                  React Router v7  ·  Axios  ·  React Hook Form + Zod            │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │  HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             NGINX REVERSE PROXY                                 │
│                                                                                 │
│         /api/*  ──────────► Main Application         (backend:4040)             │
│         /s01/video/*  ────► AWS S3 Bucket            (proxy + CORS)             │
│         /nginx-health  ──► Health Check              (200 OK)                   │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MAIN APPLICATION SERVICE                               │
│                        Spring Boot 3.4.1  ·  Port 4040                          │
│                                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│   │  Auth (JWT)  │  │  Video API  │  │  User API   │  │  Contact API        │   │
│   │  + Security  │  │  Upload     │  │  CRUD       │  │  + Email Trigger    │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘    │
└──────────┬───────────────────┬──────────────────────────────┬───────────────────┘
           │                   │                              │
           ▼                   ▼                              ▼
┌────────────────────┐  ┌──────────────────────────────────────────────────┐
│    MySQL 9.0       │  │              APACHE KAFKA                        │
│                    │  │         Confluent 7.9.4 + Zookeeper              │
│  users             │  │                                                  │
│  videos            │  │  ┌──────────────────┐  ┌──────────────────────┐  │
│  video_variants    │  │  │  video-processor  │  │  email-notification │  │
│  roles             │  │  │  (4 partitions)   │  │  (4 partitions)     │  │
│  user_roles        │  │  └────────┬─────────┘  └──────────┬───────────┘  │
│                    │  │           │                        │             │
│  HikariCP Pool     │  └───────────┼────────────────────────┼─────────────┘
│  (min 2 / max 10)  │             │                        │
└────────────────────┘             │                        │
                                   ▼                        ▼
                   ┌──────────────────────────┐  ┌──────────────────────┐
                   │   PROCESSOR SERVICE ×5   │  │    EMAIL SERVICE     │
                   │                          │  │                      │
                   │  240p  ─► consumer group1│  │  Kafka Consumer      │
                   │  360p  ─► consumer group2│  │  Spring Mail (SMTP)  │
                   │  480p  ─► consumer group3│  │  Markdown Templates  │
                   │  720p  ─► consumer group4│  │                      │
                   │  1080p ─► consumer group5│  │  • Welcome Email     │
                   │                          │  │  • Contact ACK       │
                   │  FFmpeg Transcoding      │  │  • Notifications     │
                   │  HLS Segmentation (.ts)  │  └──────────────────────┘
                   │  Playlist Gen (.m3u8)    │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌─────────────────────────────────── ┐
                   │            AWS S3                  │
                   │                                    │
                   │  videos/{userId}/{videoId}/        │
                   │    ├── master.m3u8                 │
                   │    ├── thumbnail.jpg               │
                   │    ├── manifests/                  │
                   │    │   ├── rendition_240p.m3u8     │
                   │    │   ├── rendition_360p.m3u8     │
                   │    │   └── ...                     │
                   │    └── segments/                   │
                   │        ├── 240p/                   │
                   │        │   ├── 00001.ts            │
                   │        │   ├── 00002.ts            │
                   │        │   └── ...                 │
                   │        ├── 720p/                   │
                   │        │   └── ...                 │
                   │        └── 1080p/                  │
                   │            └── ...                 │
                   └─────────────────────────────────── ┘
```

### Microservices

| Service | Responsibility |
|---------|---------------|
| **Main Application** | REST API, JWT auth, video upload, serves static frontend |
| **Processor Service ×5** | FFmpeg transcoding to 5 resolutions (240p–1080p), HLS segment generation |
| **Email Service** | Transactional emails — welcome, contact acknowledgement, notifications |
| **Core Utils** | Shared library — JPA entities, repositories, utilities (non-deployable) |

### Kafka Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `video-processor` | Main Application | Processor Service ×5 | Video transcoding task dispatch |
| `email-notification` | Main Application | Email Service | Async email delivery |

</details>

## 🔀 Sequence Diagrams

<details>
   <summary><span style="font-size: 1rem; font-weight: bold">🎬 Video Processing & Email Notification Flows</span></summary>

#### Video Processing Pipeline

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend<br/>(React + Video.js)
    participant API as Main Application<br/>(Spring Boot)
    participant DB as MySQL
    participant MQ as Kafka<br/>(video-processor)
    participant PS as Processor Service ×5<br/>(FFmpeg)
    participant S3 as AWS S3

    User->>FE: Upload video file
    FE->>API: POST /api/video/upload
    API->>API: Save original file to disk
    API->>DB: Insert video metadata<br/>status = PROCESSING
    API->>MQ: Publish transcoding task
    API-->>FE: 202 Accepted

    par 240p | 360p | 480p | 720p | 1080p
        MQ->>PS: Consume task (per resolution)
        PS->>PS: FFmpeg transcode<br/>→ HLS segments (.ts)<br/>→ Playlist (.m3u8)
        PS->>S3: Upload HLS segments + playlist
        PS->>DB: Update variant status = COMPLETED
    end

    PS->>PS: Generate master.m3u8
    PS->>S3: Upload master playlist
    PS->>DB: Update video status = AVAILABLE

    User->>FE: Play video
    FE->>S3: Request master.m3u8 (via Nginx proxy)
    S3-->>FE: Return master playlist
    FE->>FE: Video.js selects quality<br/>based on bandwidth
    FE->>S3: Stream HLS segments (.ts)
```

#### Email Notification Flow

```mermaid
sequenceDiagram
    actor User
    participant API as Main Application
    participant MQ as Kafka<br/>(email-notification)
    participant ES as Email Service<br/>(Spring Mail)
    participant SMTP as Gmail SMTP

    User->>API: POST /api/auth/register
    API->>MQ: Publish welcome email event
    MQ->>ES: Consume email event
    ES->>ES: Render Markdown template → HTML
    ES->>SMTP: Send email
    SMTP-->>User: Welcome email delivered
```

</details>

## 📦 Class Diagram

<details>
   <summary><span style="font-size: 1rem; font-weight: bold">🗂️ Entity Relationship Diagram</span></summary>

```mermaid
classDiagram
    direction TB

    class User {
        -int id
        -String name
        -String email
        -String password
        -String profileImage
        -String age
        -GenderType gender
        -String location
        -String bio
        -String phoneNumber
        -Set~Role~ roles
    }

    class Role {
        -int id
        -String roleName
        -Set~User~ users
    }

    class Video {
        -int id
        -int authorId
        -String title
        -String description
        -String category
        -String thumbnailUrl
        -String uploadedAt
        -String videoDirectoryPath
        -StorageType storageType
        -Set~VideoVariant~ videoVariantList
    }

    class VideoVariant {
        -VideoVariantId id
        -Video video
        -int height
        -int width
        -VideoStatus status
    }

    class VideoVariantId {
        &lt;&lt;Embeddable&gt;&gt;
        -int videoId
        -VideoResolution resolution
        +equals(Object) boolean
        +hashCode() int
    }

    class VideoStatus {
        &lt;&lt;enum&gt;&gt;
        PENDING
        PROCESSING
        AVAILABLE
        FAILED
    }

    class VideoResolution {
        &lt;&lt;enum&gt;&gt;
        P240
        P360
        P480
        P720
        P1080
        -String label
        +fromLabel(String) VideoResolution
    }

    class StorageType {
        &lt;&lt;enum&gt;&gt;
        LOCAL
        AWS_S3
        CLOUDINARY
    }

    class GenderType {
        &lt;&lt;enum&gt;&gt;
        MALE
        FEMALE
        PREFER_NOT_TO_SAY
    }

    User "* " -- "* " Role : ManyToMany(user_role join table)
    Video "1" -- "*" VideoVariant : OneToMany
    VideoVariant "*" --> "1" Video : ManyToOne
    VideoVariant *-- VideoVariantId : composite PK
    VideoVariantId --> VideoResolution : resolution
    VideoVariant --> VideoStatus : status
    Video --> StorageType : storageType
    User --> GenderType : gender
```

</details>

## 🛠️ Tech Stack

- 🖥️ **Frontend**: React.js 19, Vite, Tailwind CSS, Video.js (HLS), React Router v7, React Hook Form, Zod, Radix UI, Axios, React Toastify, Google Analytics.
- ⚙️ **Backend**: Java 17, Spring Boot 3.4.1, Spring Security (JWT), Spring Data JPA, Spring Kafka, Spring Mail, FFmpeg, Thumbnailator, AWS SDK v2.
- 🗄️ **Database**: MySQL 9.0 with HikariCP connection pooling.
- 📨 **Message Broker**: Apache Kafka 7.9.4 with Zookeeper.
- ☁️ **Cloud**: AWS S3, Cloudflare (DNS/CDN).
- 🐳 **DevOps**: Docker, Docker Compose, Nginx reverse proxy, multi-platform builds (linux/amd64 + linux/arm64), Nginx Proxy Manager (SSL).

## 📂 Project Structure

```
video-hub/
├── frontend/                        # React.js frontend (Vite)
│   └── src/
│       ├── components/              # Reusable UI components
│       ├── pages/                   # Route pages (Home, Dashboard, VideoPage, etc.)
│       └── utils/                   # API client, analytics
├── backend/
│   ├── core-utils/                  # Shared library (entities, services, utilities)
│   ├── main-application/            # REST API + auth + video upload
│   ├── processor-service/           # FFmpeg transcoding (240p–1080p) + HLS generation
│   └── email-service/               # Email notifications via SMTP
├── deployment/
│   ├── docker-deploy/               # Production docker-compose + .env
│   ├── docker-local/                # Local development docker-compose
│   ├── docker-kafka/                # Kafka + Zookeeper setup
│   ├── docker-mysql/                # MySQL setup
│   └── docker-nginx/                # Nginx reverse proxy config
└── buildx-multiarch-build-and-push.sh  # Build + push multi-arch Docker images
```

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 16+
- Maven
- FFmpeg
- Docker & Docker Compose

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/niharika2k00/video-hub.git
   cd video-hub
   ```

2. **Start infrastructure (MySQL + Kafka)**

   ```bash
   cd deployment/docker-mysql && docker compose up -d
   cd deployment/docker-kafka && docker compose up -d
   ```

3. **Environment Setup**

   Both `backend/.env` and `frontend/.env` are included in the repo with dummy values. Update them with your own credentials before running the application.

4. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

6. **Build the backend**

   ```bash
   cd backend
   mvn clean install -DskipTests
   ```

### Running the Application

#### Development Mode (Locally)

```bash
# Terminal 1: Main Application
cd backend/main-application && mvn spring-boot:run

# Terminal 2: Processor Service
cd backend/processor-service && mvn spring-boot:run

# Terminal 3: Email Service
cd backend/email-service && mvn spring-boot:run

# Terminal 4: Frontend
cd frontend && npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4040
- MySQL: localhost:3306
- Kafka: localhost:9093

## 🐳 Docker Deployment

### Build and Deploy

1. **Build everything and push multi-arch images**

   ```bash
   ./buildx-multiarch-build-and-push.sh
   ```

   This script builds the frontend, packages all microservices into JARs, creates Docker images for `linux/amd64` and `linux/arm64`, and pushes to Docker Hub.

2. **Deploy on the server**

   ```bash
   # Copy deployment files to server
   scp -r ./deployment niharika@bihan-prod:/home/niharika/videohub

   # SSH into server and start services
   cd deployment/docker-deploy && docker compose up -d
   ```

### Manual Docker Commands

```bash
# Build individual images
docker build -f dev.dockerfile -t main-application:v0.0.1 .
docker build -f dev.dockerfile -t processor-service:v0.0.1 .
docker build -f dev.dockerfile -t email-service:v0.0.1 .

# Run container
docker run -p 4040:4040 main-application:v0.0.1
docker run processor-service:v0.0.1
docker run email-service:v0.0.1

# Pull from Docker Hub
docker pull niharikadutta/main-application:v0.0.1
docker pull niharikadutta/processor-service:v0.0.1
docker pull niharikadutta/email-service:v0.0.1
```

## 🔧 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | User registration |
| POST | `/api/auth/login` | No | User login |
| POST | `/api/users/logout` | Yes | User logout |
| GET | `/api/users` | Yes | Get all users |
| GET | `/api/users/{id}` | Yes | Get user by ID |
| PUT | `/api/users/{id}` | Yes | Update user |
| DELETE | `/api/users/{id}` | Admin | Delete user |
| POST | `/api/video/upload` | Yes | Upload video |
| GET | `/api/videos` | Yes | Get all videos |
| GET | `/api/videos?authorId={id}` | Yes | Get user's videos |
| GET | `/api/videos/{id}` | Yes | Get video details |
| DELETE | `/api/videos/{id}` | Yes | Delete video |
| POST | `/api/contact` | No | Submit contact form |
| GET | `/api/test` | No | Health check |

## 🔒 Security

- JWT-based stateless authentication with configurable expiration
- Token blacklisting on logout
- BCrypt password hashing
- Role-based access control: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_DEVELOPER`, `ROLE_EDITOR`, `ROLE_MANAGER`
- CORS configured for frontend origin
- CSRF disabled (stateless REST API)

## 👨‍💻 Author

Niharika Dutta

[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/niharika2k00)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/niharika2k00/)

If you found this project helpful, please consider giving it a star ⭐️ !


## 📚 References

- [How Video Works — Playback](https://howvideo.works/#playback)
- [System Design Interview — Design YouTube](https://bytebytego.com/courses/system-design-interview/design-youtube)
- https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/BeanUtils.html
