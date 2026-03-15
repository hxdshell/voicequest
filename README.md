# VoiceQuest

**Manage tasks, Hands free**

## 🚀 Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm (for the web folder)

---

0. **Create `.env` file in this root folder**

```env
# JWT Secret — generate with:
# openssl rand -hex 32
SECRET_KEY=your_generated_secret_here

# Mistral AI API Key
# Get it from: https://console.mistral.ai/api-keys
MISTRAL_API_KEY=your_mistral_api_key_here

# ElevenLabs API Key
# Get it from: https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Python Setup

#### Option A: Using `uv` (Recommended)

1. **Install uv** (if not already installed):

```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. **Create and activate virtual environment:**

```bash
   uv venv
   source .venv/bin/activate        # macOS/Linux
   .venv\Scripts\activate           # Windows
```

3. **Install dependencies:**

```bash
   uv sync
```

---

#### Option B: Using `pip`

1. **Create and activate virtual environment:**

```bash
   python -m venv .venv
   source .venv/bin/activate        # macOS/Linux
   .venv\Scripts\activate           # Windows
```

2. **Install dependencies:**

```bash
   pip install -r requirements.txt
```

> **Note:** If a `requirements.txt` doesn't exist, you can generate one from the uv lockfile:
>
> ```bash
> uv export --format requirements-txt > requirements.txt
> ```

---

### Web Setup

> Note : Please run it on port 5173

1. **Navigate to the web folder:**

```bash
   cd web
```

2. **Install dependencies:**

```bash
   npm install
```

3. **Start the development server:**

```bash
   npm run dev
```
