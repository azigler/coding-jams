# ANTM Hackathon Agent Implementation Plan

## Project Organization

### Directory Structure

```
agent-antm-hackathon/
├── antm-agent/              # New clean implementation
│   ├── src/
│   │   ├── __init__.py
│   │   ├── agent/           # Main agent orchestration
│   │   │   ├── __init__.py
│   │   │   ├── workflow.py  # LangGraph workflow
│   │   │   └── state.py     # Agent state management
│   │   ├── data/            # Data access layer
│   │   │   ├── __init__.py
│   │   │   ├── duckdb_client.py  # DuckDB connection & queries
│   │   │   └── lancedb_client.py # LanceDB vector search
│   │   ├── ingestion/       # Data ingestion pipeline
│   │   │   ├── __init__.py
│   │   │   ├── parquet_loader.py  # Load parquet into DuckDB
│   │   │   ├── pdf_parser.py      # Parse PDFs to markdown
│   │   │   ├── pdf_ingester.py    # Ingest PDFs into LanceDB
│   │   │   └── log_loader.py      # Load logs into DuckDB
│   │   ├── modules/         # DSPy modules
│   │   │   ├── __init__.py
│   │   │   ├── planner.py   # NL → SQL planner
│   │   │   ├── critic.py    # SQL error repair
│   │   │   └── extractor.py # PDF extraction (if needed)
│   │   ├── models/          # Pydantic models for retail schema
│   │   │   ├── __init__.py
│   │   │   └── retail.py    # Store, Item, Sale, etc. models
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── config.py    # Configuration management
│   ├── eval/
│   │   ├── __init__.py
│   │   ├── harness.py       # Eval harness runner
│   │   ├── scorer.py        # Answer scoring logic
│   │   └── submission.py    # CSV submission generator
│   ├── scripts/
│   │   ├── ingest_data.py   # Run full data ingestion
│   │   └── run_eval.py      # Run evaluation
│   ├── data/                # Local data storage
│   │   ├── duckdb/          # DuckDB database file
│   │   └── lancedb/        # LanceDB vector store
│   ├── requirements.txt
│   └── README.md
├── dataset/                 # Hackathon dataset (existing)
├── rounds/                  # Questions (existing)
├── antm/                    # Git submodule (existing)
└── agent-context/          # Reference implementation (existing)
```

## Implementation Steps

### Phase 1: Project Setup & Data Ingestion

**1.1 Create Project Structure**

- [ ] Create `antm-agent/` directory
- [ ] Create subdirectories: `src/agent/`, `src/data/`, `src/ingestion/`, `src/modules/`, `src/models/`, `src/utils/`, `eval/`, `scripts/`, `data/duckdb/`, `data/lancedb/`
- [ ] Create `__init__.py` files in all Python packages
- [ ] Create `requirements.txt` with all dependencies
- [ ] Create `README.md` with setup instructions

**1.2 DuckDB Client**

- [ ] Create `src/data/duckdb_client.py` with connection manager
- [ ] Implement `load_parquet_files()` to scan `dataset/data/*.parquet` and create tables
- [ ] Implement `load_logs()` to load JSONL files from `dataset/data/logs/` into `logs` schema
- [ ] Implement `get_schema_summary()` to return table/column descriptions
- [ ] Implement `execute_query(sql)` with error handling
- [ ] Add method to list all tables

**1.3 PDF Parser**

- [ ] Create `src/ingestion/pdf_parser.py` based on `antm/example/pdf_parser.py`
- [ ] Add batch processing to handle all PDF directories
- [ ] Create `data/parsed_pdfs/` output directory
- [ ] Implement progress tracking for large PDF sets
- [ ] Add error handling for corrupted PDFs

**1.4 PDF Ingester**

- [ ] Create `src/ingestion/pdf_ingester.py`
- [ ] Implement `chunk_markdown()` function (adapt from example)
- [ ] Implement `embed_chunks()` using OpenAI or sentence-transformers
- [ ] Implement `ingest_to_lancedb()` to store chunks with metadata
- [ ] Add category metadata (annual_reports, product_catalogs, etc.)
- [ ] Create separate LanceDB tables per category OR unified table with category field

**1.5 Data Ingestion Script**

- [ ] Create `scripts/ingest_data.py`
- [ ] Add CLI arguments for selective ingestion (--parquet-only, --pdf-only, etc.)
- [ ] Implement progress bars/logging
- [ ] Add verification step to check ingestion success
- [ ] Create `data/ingestion_status.json` to track what's been ingested

### Phase 2: Core Agent Modules

**2.1 MCP Client Integration**

- [ ] Create `src/data/mcp_client.py` for MCP server access
- [ ] Implement `MCPClient` class with execute_query, list_tables, get_schema_summary
- [ ] Add fallback to DuckDB when MCP unavailable
- [ ] Integrate MCP into workflow for SQL execution
- [ ] Document MCP server URL and setup

**2.2 Retail Domain Models**

- [ ] Create `src/models/retail.py`
- [ ] Define `Store` model (store_sk, store_name, etc.)
- [ ] Define `Item` model (item_sk, item_name, category, etc.)
- [ ] Define `Sale` model (sale fields from store_sales/catalog_sales/web_sales)
- [ ] Define `Warehouse`, `Inventory`, `Customer` models
- [ ] Add docstrings matching hackathon schema

**2.3 DSPy Planner Module**

- [ ] Create `src/modules/planner.py`
- [ ] Define `NLToSQLSignature` with schema_summary, question, sql fields
- [ ] Implement `PlannerModule` class using `dspy.ChainOfThought` with examples in `demos` attribute
- [ ] Add correct SQL examples from manual traces as `dspy.Example` objects
- [ ] Set `predictor.demos = [example]` to show LLM correct patterns
- [ ] Show LLM correct patterns (CTEs, FULL OUTER JOINs, inventory→warehouse→item relationships)
- [ ] Add `get_default_lm()` function (OpenAI or Anthropic)
- [ ] Implement `forward()` method that generates SQL
- [ ] Add automatic LIMIT enforcement
- [ ] Add schema context injection
- [ ] **Key Principle**: Examples teach better than rules - show LLM what correct SQL looks like

**2.4 DSPy Critic Module**

- [ ] Create `src/modules/critic.py`
- [ ] Define `RepairSQLSignature` with failed_sql, error_message, schema_summary, repaired_sql
- [ ] Implement `CriticModule` class
- [ ] Add error message parsing to extract useful context
- [ ] Implement repair logic

**2.5 LanceDB Client**

- [ ] Create `src/data/lancedb_client.py`
- [ ] Implement connection manager
- [ ] Add `search(query, top_k, category_filter)` method
- [ ] Return results with metadata (source, score, chunk_index)
- [ ] Add method to list available tables/categories

**2.6 Configuration Module**

- [ ] Create `src/utils/config.py`
- [ ] Add environment variable loading (.env support)
- [ ] Define default config (DB paths, model names, etc.)
- [ ] Add config validation

### Phase 3: LangGraph Workflow

**3.1 Agent State**

- [ ] Create `src/agent/state.py`
- [ ] Define `AgentState` TypedDict with all required fields
- [ ] Add type hints for all state fields
- [ ] Document state transitions

**3.2 Workflow Nodes**

- [ ] Create `src/agent/workflow.py`
- [ ] Implement `route_question()` node - analyze question to determine data sources needed
- [ ] Implement `plan_sql()` node - use planner module
- [ ] Implement `execute_sql()` node - run query via DuckDB client
- [ ] Implement `repair_sql()` node - use critic on errors
- [ ] Implement `search_pdfs()` node - use LanceDB client
- [ ] Implement `synthesize_answer()` node - combine SQL + PDF results
- [ ] Implement `format_answer()` node - convert to 5-column format
- [ ] Add error handling in each node

**3.3 Build Graph**

- [ ] Create `build_workflow()` function
- [ ] Add all nodes to StateGraph
- [ ] Define conditional edges from START based on routing
- [ ] Add edges between nodes (plan → execute → repair if needed)
- [ ] Add edges for PDF search when needed
- [ ] Connect to END node
- [ ] Compile graph

**3.4 Agent Entry Point**

- [ ] Create `src/agent/__init__.py` with `run_agent(question)` function
- [ ] Initialize workflow graph
- [ ] Create initial state from question
- [ ] Invoke graph and return result

### Phase 4: Evaluation & Submission

**4.1 Question Parser**

- [ ] Create `eval/harness.py`
- [ ] Implement `parse_questions_file(file_path)` to read markdown
- [ ] Extract question text from markdown headers
- [ ] Parse Observations JSON blocks for expected answers
- [ ] Handle multiple answer formats (numeric, string, boolean, float)
- [ ] Support questions without answers (for test rounds)

**4.2 Round Support**

- [ ] Modify question parser to accept any markdown file path
- [ ] Update eval harness to work with or without answer keys
- [ ] Add `--round` CLI argument to specify round file
- [ ] Support `rounds/training-questions.md`, `rounds/round1-questions.md`, etc.

**4.3 Eval Harness**

- [ ] Implement `run_eval(questions_file, output_dir)` function
- [ ] Iterate through each question
- [ ] Call agent for each question
- [ ] Compare answers if expected answers available
- [ ] Calculate accuracy metrics (exact match, tolerance-based for floats)
- [ ] Generate detailed report with per-question results
- [ ] Save report to `output_dir/eval_report.json` and `.md`

**4.4 Submission Generator**

- [ ] Create `eval/submission.py`
- [ ] Implement `generate_submission(questions_file, answers_dict, output_path)`
- [ ] Format as CSV matching `antm/sample_submission.csv`
- [ ] Handle row_index (0-indexed)
- [ ] Map answers to col_1 through col_5
- [ ] Fill empty columns with empty strings
- [ ] Validate CSV format

**4.5 Eval Script**

- [ ] Create `scripts/run_eval.py`
- [ ] Add CLI with arguments:
  - `--round` or `--questions` (path to questions file)
  - `--output` (output directory)
  - `--generate-submission` (flag to create CSV)
- [ ] Run eval harness
- [ ] Generate submission CSV if flag set
- [ ] Print summary statistics

### Phase 5: Optimization & Testing

**5.1 DSPy Optimization Setup**

- [ ] Create `scripts/optimize_planner.py`
- [ ] **CRITICAL**: Use examples, not just rules! Show LLM correct SQL patterns
- [ ] Collect successful SQL examples from manual traces (e.g., `CORRECT_LOGIC_Q1.md`)
- [ ] Format as DSPy training examples using `dspy.Example`
- [ ] Add examples to `ChainOfThought.predict.demos = [example]` (direct approach)
- [ ] For advanced optimization: Use `dspy.BootstrapFewShot` teleprompter to find best examples
- [ ] Integrate examples directly into module initialization
- [ ] Save optimized config to `configs/planner_optimized.json`
- [ ] Create similar script for critic optimization
- [ ] **Key Insight**: Examples > Rules - LLM learns better from seeing correct SQL than reading rules

**5.2 Error Handling**

- [ ] Add SQL syntax error detection
- [ ] Implement critic retry logic (max 2 attempts)
- [ ] Add timeout for long queries (30s default)
- [ ] Handle PDF search failures gracefully
- [ ] Add fallback to SQL-only when PDF search fails
- [ ] Log all errors for debugging

**5.3 Testing**

- [ ] Test on first 3 training questions manually
- [ ] Verify SQL generation quality
- [ ] Verify PDF retrieval returns relevant chunks
- [ ] Test answer formatting matches submission format
- [ ] Test with questions requiring only SQL
- [ ] Test with questions requiring only PDFs
- [ ] Test with questions requiring both
- [ ] Test error recovery (bad SQL → repair)

**5.4 Documentation**

- [ ] Update README with setup instructions
- [ ] Add example usage for running eval
- [ ] Document configuration options
- [ ] Add troubleshooting section

## Key Design Decisions

1. **MCP Server Integration**: Use MCP server (<https://antm-hack-example.fastmcp.app/mcp>) for SQL execution when available, with DuckDB fallback. MCP provides direct MotherDuck access which may handle SQL better than direct DuckDB queries.
2. **DuckDB Fallback**: Use local DuckDB as fallback when MCP is unavailable or for local development
3. **Batch PDF Processing**: Parse all PDFs upfront, not on-demand
4. **Separate Implementation**: Clean `antm-agent/` separate from `agent-context/`
5. **Retail Schema**: New models matching hackathon data structure
6. **Hybrid Approach**: SQL for structured queries, LanceDB for PDF content
7. **DSPy Optimization**: Use teleprompt for prompt improvement
8. **LangGraph Orchestration**: Multi-step reasoning with error recovery
9. **Multi-Round Support**: System accepts any questions file path, works with or without answer keys

## Dependencies

Core:

- `duckdb>=0.10.0` - SQL queries on parquet/logs (fallback)
- `mcp` or MCP SDK - MCP server integration (optional, for MotherDuck access)
- `lancedb>=0.5.0` - Vector search for PDFs
- `langgraph>=1.0.0` - Agent orchestration
- `dspy-ai>=3.0.0` - Prompt optimization
- `pandas>=2.0.0`, `pyarrow>=14.0.0` - Data handling

PDF Processing:

- `pypdf>=6.0.0`, `pdfplumber>=0.10.0`, `PyMuPDF>=1.23.0`

Embeddings:

- `openai>=1.0.0` OR `sentence-transformers>=2.0.0`

Utilities:

- `pydantic>=2.0.0` - Data validation
- `python-dotenv>=1.0.0` - Config management

## Success Criteria

1. ✅ All parquet files loaded into DuckDB
2. ✅ All PDFs parsed and ingested into LanceDB
3. ✅ Agent answers training questions with >70% accuracy
4. ✅ Eval harness generates submission CSV
5. ✅ Agent handles multi-hop questions (SQL + PDF)
6. ✅ DSPy optimization improves performance
7. ✅ System supports multiple rounds (training, round1, round2, round3)

## Question Format

Questions are provided in markdown files with the following structure:

```markdown
## question-title

**Question:** [Natural language question text]

**Observations:**
```json
{
  "question": "...",
  "answer_field_1": value1,
  "answer_field_2": value2,
  "difficulty": 1
}
```

```

The system must:
- Parse questions from any markdown file path
- Extract question text from `**Question:**` lines
- Parse JSON from `**Observations:**` blocks (if present) for expected answers
- Support questions without Observations blocks (test rounds)
- Generate answers in submission format: `row_index,col_1,col_2,col_3,col_4,col_5`

## Submission Format

Matches `antm/sample_submission.csv`:
- `row_index`: 0-indexed question number
- `col_1` through `col_5`: Up to 5 answer values per question
- Empty strings for unused columns
- Types: numeric, boolean, float, string, string (as per sample)

## Data Sources

### Structured Data (DuckDB)
- Parquet files: `dataset/data/*.parquet`
  - `store_sales.parquet`, `catalog_sales.parquet`, `web_sales.parquet`
  - `item.parquet`, `store.parquet`, `warehouse.parquet`
  - `customer.parquet`, `customer_address.parquet`, `customer_demographics.parquet`
  - `inventory.parquet`, `store_returns.parquet`
  - `date_dim.parquet`, `promotion.parquet`, `reason.parquet`
  - And more...

### Logs (DuckDB)
- JSONL files: `dataset/data/logs/*.jsonl`
  - `customer_service.jsonl`, `app_events.jsonl`, `clickstream.csv`
  - `experiment_events.jsonl`, `transaction_logs.txt`
  - And more...

### Unstructured Data (LanceDB)
- PDFs from multiple categories:
  - `dataset/annual_reports/pdf/` - Annual reports FY2018-2023
  - `dataset/product_catalogs/pdf/` - Seasonal catalogs 2018-2023
  - `dataset/promotional_flyers/pdf/` - Promotional materials
  - `dataset/purchase_orders/pdf/` - Purchase orders
  - `dataset/quarterly_reports/pdf/` - Quarterly reports
  - `dataset/sales_receipts/pdf/` - Sales receipts
  - `dataset/shipping_manifests/pdf/` - Shipping manifests
  - `dataset/store_reports/pdf/` - Store reports
  - `dataset/warehouse_picking_slips/pdf/` - Picking slips
  - `dataset/inventory_receiving/pdf/` - Inventory receiving docs

## Agent Workflow

1. **Route Question**: Determine if question needs SQL, PDF search, or both
2. **Plan SQL**: Generate SQL query using DSPy planner
3. **Execute SQL**: Run query via DuckDB, catch errors
4. **Repair SQL**: Use critic module if SQL fails
5. **Search PDFs**: Use LanceDB for semantic search if needed
6. **Synthesize Answer**: Combine SQL results + PDF context
7. **Format Answer**: Convert to 5-column submission format

## Evaluation Workflow

1. Parse questions file (any markdown path)
2. For each question:
   - Run agent to get answer
   - Compare with expected answer (if available)
   - Record result
3. Calculate metrics (accuracy, per-question scores)
4. Generate report (JSON + Markdown)
5. Generate submission CSV (if flag set)

## MCP Server Integration

The agent uses the MCP (Model Context Protocol) server for SQL execution when available:

- **MCP Server URL**: https://antm-hack-example.fastmcp.app/mcp
- **Setup**: Visit https://antm-hack-example.fastmcp.app for integration instructions
- **Features**: 
  - Execute SQL queries on hackathon dataset via MotherDuck
  - List all tables in the database
  - Access DuckDB SQL syntax reference
  - Read-only access with query timeouts and result limits
- **Fallback**: If MCP is unavailable, falls back to local DuckDB
- **Benefits**: MCP server may handle SQL execution better, especially for complex queries

## Notes

- Use MCP server when available for better SQL execution, DuckDB as fallback
- Use hackathon example patterns (DuckDB, LanceDB) not agent-context patterns (MotherDuck)
- Only implement what's needed to win - keep it focused
- Support multiple rounds by accepting any questions file path
- Questions may or may not have answer keys (training vs test rounds)

