# 🔄 MCP → OpenAPI Proxy (Reference)

This folder contains a minimal Python reference implementation demonstrating how to expose MCP tool servers as OpenAPI-compatible REST APIs.

⚠️ This is a REFERENCE implementation and is not actively maintained. It exists for educational purposes or for those needing direct customization.

✅ For a production-ready, feature-rich solution, we strongly recommend using the maintained `mcpo` tool instead:

👉 https://github.com/open-webui/mcpo — Contributions welcome!

## 🔧 Quick Start

Make sure uvx is installed and available.

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
python main.py --host 0.0.0.0 --port 8000 -- uvx mcp-server-time --local-timezone=America/New_York
```

Your MCP server will now be available as an OpenAPI-compatible API.

## 📝 License

MIT