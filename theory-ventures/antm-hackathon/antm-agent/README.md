# ANTM Hackathon Agent

A clean implementation of a context agent for the America's Next Top Modeler hackathon, built with DuckDB, LanceDB, DSPy, and LangGraph.

## Setup

1. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**

   Create a `.env` file in the project root:

   ```bash
   # Option 1: OpenRouter (recommended - supports all models)
   OPENROUTER_API_KEY=your_key_here
   
   # Option 2: Direct API keys
   OPENAI_API_KEY=your_key_here
   # OR
   ANTHROPIC_API_KEY=your_key_here
   ```

3. **Ingest data:**

   ```bash
   python scripts/ingest_data.py
   ```

4. **Run evaluation:**

   ```bash
   python scripts/run_eval.py --round rounds/training-questions.md --output submissions/
   ```

## Project Structure

- `src/agent/` - LangGraph workflow and state management
- `src/data/` - DuckDB and LanceDB clients
- `src/ingestion/` - Data ingestion pipeline
- `src/modules/` - DSPy modules (planner, critic)
- `src/models/` - Pydantic models for retail schema
- `eval/` - Evaluation harness and submission generation
- `scripts/` - CLI scripts for ingestion and evaluation

## Usage

### Ingest Data

```bash
# Ingest everything
python scripts/ingest_data.py

# Ingest only parquet files
python scripts/ingest_data.py --parquet-only

# Ingest only PDFs
python scripts/ingest_data.py --pdf-only
```

### Run Evaluation

```bash
# Run on training questions with answer key
python scripts/run_eval.py --round rounds/training-questions.md --output submissions/

# Run on test round and generate submission CSV
python scripts/run_eval.py --round rounds/round1-questions.md --output submissions/ --generate-submission
```

## Configuration

The agent uses environment variables for configuration:

- `OPENROUTER_API_KEY` (recommended) or `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` - LLM and embedding provider
- `DSPY_MODEL` - Model to use for LLM (default: `openai/gpt-4o-mini`)
- `DUCKDB_PATH` - Path to DuckDB database (default: `data/duckdb/retail.duckdb`)
- `LANCEDB_PATH` - Path to LanceDB directory (default: `data/lancedb/`)

### MCP Server Integration (Optional)

The agent can use the MCP (Model Context Protocol) server for SQL execution, which provides direct access to the hackathon dataset via MotherDuck. This may improve SQL accuracy.

- **MCP Server URL**: <https://antm-hack-example.fastmcp.app/mcp>
- **Setup**: Visit <https://antm-hack-example.fastmcp.app> for integration instructions
- **Fallback**: If MCP is unavailable, the agent automatically falls back to local DuckDB

The agent will automatically try MCP first and fall back to DuckDB if needed. Currently, the MCP client architecture is in place but needs full HTTP/SDK integration based on the FastMCP server's API structure.

## Why No MotherDuck Token?

This implementation uses **local DuckDB** instead of MotherDuck (cloud DuckDB). The hackathon example uses local DuckDB, which:

- Works offline
- Is faster for local development
- Doesn't require cloud credentials
- Stores data in `data/duckdb/retail.duckdb` file

If you want to use MotherDuck later, you can modify `src/data/duckdb_client.py` to connect to `md:database_name` instead.
