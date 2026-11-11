# Neural Speech

Neural Speech is a web application for AI voice generation and conversion. It combines a Next.js application with two Python inference APIs:

- **Text to speech:** StyleTTS 2 generates speech from text.
- **Speech to speech:** Seed-VC converts an uploaded MP3 or WAV recording to a selected target voice.

The web app handles accounts, audio history, and uploads. Audio files are stored in S3-compatible AWS S3 storage. Generation runs asynchronously through Inngest and the selected Python API.

## Contents

- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Run locally](#run-locally)
- [Run the inference APIs with Docker](#run-the-inference-apis-with-docker)
- [Models and voice reference files](#models-and-voice-reference-files)
- [Common issues](#common-issues)
- [Related documentation](#related-documentation)
- [Licensing and voice use](#licensing-and-voice-use)

## Architecture

```text
Browser
  │
  ▼
Next.js frontend ─── Prisma / SQLite (users, credits, generation history)
  │                         │
  ├── uploads source audio ─┴──► AWS S3
  │
  └── queues generation request ─► Inngest
                                       │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
                 StyleTTS 2 API                   Seed-VC API
                   text → speech                 speech → speech
                       └───────────────┬───────────────┘
                                       ▼
                                  AWS S3 output
```

The APIs return generated audio to S3. The frontend stores generation metadata in SQLite and creates short-lived signed URLs when audio is played or downloaded. Inngest retries failed jobs; the app reports a failed generation in its history.

## Repository layout

| Path                   | Contents                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `frontend/`          | Next.js 15, React, authentication, Prisma data model, UI, S3 helpers, and Inngest job handler                  |
| `StyleTTS2/`         | StyleTTS 2 implementation, inference API, Dockerfile, and model/configuration directory                        |
| `seed-vc/`           | Seed-VC implementation, inference API, Dockerfile, fine-tuned model/configuration directory, and example audio |
| `StyleTTS2FineTune/` | Separate StyleTTS 2 fine-tuning code, dataset tools, and documentation                                         |
| `docker-compose.yml` | Local GPU-enabled containers for the StyleTTS 2 and Seed-VC APIs                                               |

## Requirements

- Node.js and npm (the frontend package declares npm 10.2.4).
- Python 3.10 is recommended for running the model projects outside Docker. Docker is the documented way to run the APIs alongside the frontend.
- Docker Compose v2.
- An NVIDIA GPU and NVIDIA Container Toolkit for the provided inference containers. The Compose file reserves an NVIDIA GPU for each API.
- An AWS account (or compatible S3 service) and a bucket accessible to the frontend and both APIs.
- The model checkpoints, configuration files, and target voice recording described under [Models and voice reference files](#models-and-voice-reference-files).

Model inference is resource intensive. The first API image build can take a while because it installs Python dependencies and copies model files.

## Configuration

Create `frontend/.env` for the Next.js app and local Compose configuration. Keep credentials private; `.env` files should not be committed. Use the same bucket, AWS region, and backend API key for the frontend and both inference APIs.

Required variables:

| Variable                  | Purpose                                                        | Example shape             |
| ------------------------- | -------------------------------------------------------------- | ------------------------- |
| `DATABASE_URL`          | Prisma SQLite connection                                       | `file:./db.sqlite`      |
| `AUTH_SECRET`           | NextAuth session/authentication secret; required in production | a long random secret      |
| `AWS_REGION`            | AWS region for the S3 bucket                                   | `us-east-1`             |
| `AWS_ACCESS_KEY_ID`     | AWS credentials used by the app and APIs                       | your access key           |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials used by the app and APIs                       | your secret key           |
| `S3_BUCKET_NAME`        | S3 bucket used for source and generated audio                  | your bucket name          |
| `BACKEND_API_KEY`       | Shared key sent by the frontend to authenticate with both APIs | a long random secret      |
| `STYLETTS2_API_ROUTE`   | Base URL of StyleTTS 2 API, without `/generate`              | `http://localhost:8000` |
| `SEED_VC_API_ROUTE`     | Base URL of Seed-VC API, without `/convert`                  | `http://localhost:8001` |

The following Compose variables are optional; defaults are shown:

| Variable                     | Default                                                                     | Purpose                                                  |
| ---------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| `STYLETTS2_IMAGE`          | `neural-speech-styletts2:local`                                           | StyleTTS 2 image name                                    |
| `SEEDVC_IMAGE`             | `neural-speech-seedvc:local`                                              | Seed-VC image name                                       |
| `STYLETTS2_S3_PREFIX`      | `styletts2-output`                                                        | S3 key prefix for generated StyleTTS 2 audio             |
| `SEEDVC_S3_PREFIX`         | `seedvc-outputs`                                                          | S3 key prefix for generated Seed-VC audio                |
| `SEEDVC_CHECKPOINT`        | `./runs/shubham_voice/ft_model.pth`                                       | Checkpoint path inside the Seed-VC container             |
| `SEEDVC_CONFIG`            | `./runs/shubham_voice/config_dit_mel_seed_uvit_whisper_small_wavenet.yml` | Model config path inside the Seed-VC container           |
| `SEEDVC_SHUBHAM_REFERENCE` | `./examples/reference/shubham1.wav`                                       | Target voice reference path inside the Seed-VC container |

Docker Compose does not automatically read `frontend/.env` when run from the repository root. Pass it explicitly with `--env-file frontend/.env` to Compose commands. Next.js loads `frontend/.env` when you run its commands from `frontend/`.

## Run locally

### 1. Configure the environment

Create `frontend/.env` with the required values above. For `AUTH_SECRET`, generate a private random value, for example with `openssl rand -base64 32`. Do not reuse the example URLs or placeholder values in production.

### 2. Install frontend dependencies and initialize the database

```bash
cd frontend
npm ci
npm run db:push
```

`db:push` applies the Prisma schema to the configured SQLite database. The database URL must use a SQLite path supported by Prisma.

### 3. Start the model APIs

From the repository root, build and start both GPU inference APIs:

```bash
docker compose --env-file frontend/.env up --build -d
```

The APIs are exposed at `http://localhost:8000` (StyleTTS 2) and `http://localhost:8001` (Seed-VC). Each exposes an authenticated `/health` endpoint. The Compose health check supplies `BACKEND_API_KEY`.

### 4. Start the frontend and Inngest

In one terminal:

```bash
cd frontend
npm run dev
```

In a second terminal:

```bash
cd frontend
npm run inngest-dev
```

The site is available at `http://localhost:3000`. The Inngest development dashboard is usually available at `http://localhost:8288`; its CLI connects to the app's `/api/inngest` endpoint. Keep both processes running while generating audio.

Register an account in the app, then use the text-to-speech or speech-to-speech page. New accounts receive the initial credit balance configured in the Prisma `User` model. The generation worker currently deducts 50 credits per successful job and throttles requests per user.

To stop the inference APIs:

```bash
docker compose --env-file frontend/.env down
```

## Run the inference APIs with Docker

The Compose services build from `StyleTTS2/Dockerfile.api` and `seed-vc/Dockerfile.api`. The container ports are mapped to host ports 8000 and 8001, respectively. They require the model files copied into each image at build time. See the next section.

To start just one API, use its service name:

```bash
docker compose --env-file frontend/.env up --build -d styletts2-api
docker compose --env-file frontend/.env up --build -d seedvc-api
```

If a model file or reference recording changes after an image is built, rebuild that service so Docker copies the updated file:

```bash
docker compose --env-file frontend/.env build seedvc-api
docker compose --env-file frontend/.env up -d seedvc-api
```

## Models and voice reference files

The model weights and personal audio assets are large and may be excluded from Git. Check that these paths exist before building the API images:

- StyleTTS 2: `StyleTTS2/Models/LibriTTS/config.yml` and `StyleTTS2/Models/LibriTTS/epoch_2nd_00074.pth` (the Dockerfile sets these as defaults).
- Seed-VC: `seed-vc/runs/shubham_voice/ft_model.pth` and `seed-vc/runs/shubham_voice/config_dit_mel_seed_uvit_whisper_small_wavenet.yml` (the Compose defaults).
- Seed-VC target voice recording: `seed-vc/examples/reference/shubham1.wav` (the Compose default).

The uploaded MP3/WAV is the **source** recording to convert. `shubham1.wav` is a separate **target/reference** recording used to define the output voice. A missing reference file causes `/convert` to return HTTP 500 with a `No such file or directory` error. Provide a recording you have permission to use, or set `SEEDVC_SHUBHAM_REFERENCE` to another existing path inside the container. The Dockerfile copies `seed-vc/examples/` into the image, so a changed reference requires rebuilding the Seed-VC image.

The StyleTTS 2 API also expects its target speaker reference, `shubham_demo.wav`, in its working directory. The API currently maps the `shubham` target voice to that filename. Ensure the API image has the file available at `/app/shubham_demo.wav` (for example, add it to the StyleTTS 2 API image or mount it there in your deployment).

## Common issues

### Generation stays queued or never starts

Confirm the frontend and `npm run inngest-dev` are running, the Inngest CLI is connected to `http://localhost:3000/api/inngest`, and the frontend API route variables point to reachable APIs. Check the Next.js, Inngest, and API logs for the underlying error.

### API health check is unhealthy or model loading fails

Check the model/checkpoint paths, NVIDIA Container Toolkit and GPU visibility, then inspect logs:

```bash
docker compose --env-file frontend/.env logs -f styletts2-api seedvc-api
```

### S3 upload or download errors

Check that AWS credentials, region, and bucket are correct and that the IAM identity can read and write the required objects. The frontend and APIs must use the same bucket and region. If using an S3-compatible service, endpoint configuration may need to be added to the S3 clients.

## Related documentation

- [StyleTTS 2 model and training documentation](StyleTTS2/README.md)
- [Seed-VC model and inference documentation](seed-vc/README.md)
- [StyleTTS 2 fine-tuning project](StyleTTS2FineTune/README.md)
- [Frontend package scripts](frontend/package.json)

## Licensing and voice use

This repository combines upstream projects that may have different code and model terms. Review the license and model-use terms in the relevant subproject documentation before distributing or deploying them. Obtain permission to use a person's voice as a reference and disclose synthesized speech where required by applicable terms or law.
