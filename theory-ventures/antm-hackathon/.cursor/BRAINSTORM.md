# BRAINSTORM.md

## Premise
Build a **Context Agent** that is objectively useful in ~10 hours. It must reliably **ingest**, **normalize**, and **reason** over a **disparate web of enterprise data sources** (structured + unstructured) and show measurable improvement on a provided **training set** with final scoring on a **hidden holdout**. The organizers mentioned custom datasets, evaluations, and **connectors** — expect a federated “enterprise-like” environment rather than a single CSV.

**Judging emphasis:** correctness on unseen evals, engineering quality (traceability, determinism), and clarity of the system’s reasoning. No points for flashy UIs.

---

## Minimal, practical architecture (kept intentionally simple)

**Keep:** LangGraph (orchestration), LlamaIndex (+ LanceDB) for semantic retrieval, MotherDuck (DuckDB Cloud) for structured storage & SQL reasoning, DSPy for optimization of modules, **LangSmith** for tracing/evals.  
**Intentionally excluded:** Weights & Biases (W&B) and cost tracking dashboards (out of scope/time).

```
             ┌───────────────────────────────────────────────────────────┐
             │                 Disparate Enterprise Web                  │
             │  PDFs / HTML / TXT  |  CSV / JSON  | APIs | DBs (DuckDB) │
             └──────────────┬──────────────┬─────────────┬──────────────┘
                            │              │             │
                      LlamaIndex      File Loaders     API/DB readers
                            │              │             │
                            └─────► LanceDB (vectors) ◄─┘
                                         │
                                 ┌───────▼────────┐
                                 │  LangGraph DAG │
                                 │  (deterministic) 
                                 └───────┬────────┘
                                         │
            ┌───────────┬───────────────┴───────────────┬───────────────┐
            │ Retrieve  │  Extract (DSPy)  →  Normalize │   Plan (DSPy) │
            │ (RAG)     │   text → JSON                 │  NL → SQL     │
            └─────┬─────┴───────────────┬───────────────┴───────┬───────┘
                  │                     │                       │
                  │                 JSON Schema                 │
                  │                   validate                  │
                  │                     │                       │
                  ▼                     ▼                       ▼
                             MotherDuck (tables)       SQL Exec (DuckDB)
                                         │
                                      Critic (DSPy, single-pass)
                                         │
                                       Report
```

### State (single source of truth)
```python
state = {
  "run_id": "...",
  "inputs": {"blob": Any, "content_type": "pdf|text|html|csv|json|query|api"},
  "artifacts": {"chunks": [], "extractions": [], "sql": "", "sql_result": None},
  "context": {"schema_summary": "", "sources": [{"id": "", "uri": "", "score": 0.0}]},
  "telemetry": {"latency_ms": 0, "events": []},
  "answer": None,
  "errors": []
}
```

---

## Roles (what each piece does)

### Router (deterministic, rule-based)
- Route by MIME/intent:
  - `pdf|text|html` → **Retrieve** → **Extract** → **Store**
  - `csv|json` → **Normalize** → **Store**
  - `api|db` → **Fetch** → **Normalize** → **Store**
  - `query` → **Plan** (NL→SQL) → **SQL Exec**
- No LLM in the router. Keep it predictable.

### Retrieve (LlamaIndex + LanceDB)
- Ingest multi-source docs: PDFs/HTML/TXT; also attach metadata (system, path, timestamps).
- Retrieve top‑k passages with scores; return chunk IDs, URIs for citations.

### Extract (DSPy: text → JSON, schema-aware)
- Emit strict JSON rows aligned to minimal target tables.
- Validate with JSON Schema; on fail → one **Critic** pass; then stop.

### Normalize (deterministic transforms)
- Types, enums, dates, dedupe, ID normalization (e.g., `INV-001` vs `INV001`).

### Store & SQL Exec (MotherDuck)
- Upsert rows, then answer questions with SQL.
- Track basic execution facts: rows returned, ms (for debugging).

### Planner (DSPy: NL → SQL)
- Input: NL question + schema summary (cached via `DESCRIBE`).
- Output: **safe SQL** (deny destructive verbs, auto-`LIMIT`).

### Critic (DSPy, single pass)
- Repair JSON that fails schema; rewrite SQL when empty/error is detected (bounded changes).

### Report
- Final answer as table/JSON; add citations if RAG was used.

---

## Schema strategy (don’t overthink)
Design **Schema v0** from the *questions you must answer*, not from every possible field.
Typical minimal tables for enterprise‑like sims:
```sql
CREATE TABLE invoices(
  invoice_id TEXT PRIMARY KEY,
  customer   TEXT NOT NULL,
  amount     DOUBLE NOT NULL CHECK(amount >= 0),
  currency   TEXT,
  issued_on  DATE,
  dept       TEXT
);

CREATE TABLE contracts(
  contract_id TEXT PRIMARY KEY,
  customer    TEXT NOT NULL,
  start_on    DATE,
  end_on      DATE,
  value       DOUBLE
);

CREATE TABLE tickets(
  ticket_id   TEXT PRIMARY KEY,
  customer    TEXT,
  opened_on   TIMESTAMP,
  status      TEXT,       -- e.g., open/closed/pending
  severity    TEXT
);
```
**JSON Schemas** mirror these tables; only include fields that downstream queries require. Expand if a new required question appears.

---

## Metrics (simple & objective)
- **Extractor (text→JSON):** fieldwise **F1** on *labeled* training/dev.  
- **Planner (NL→SQL):** **Execution‑match** (resultset equality of predicted vs gold SQL on same DB).  
- **Critic:** failure‑rate reduction (schema or SQL errors).  
- **Runtime health (unlabeled/eval):** schema‑valid %, SQL success %, latency.

All of this can be logged via **LangSmith traces** + simple JSON logs; **no W&B** or cost tracking needed for the hackathon.

---

## DSPy (what is “learned”)
- Use teleprompters like `BootstrapFewShot` or `MIPROv2`.  
- Compile and save **configs** (not weights):  
  - `extractor_optimized.json`  
  - `planner_optimized.json`  
  - `critic_optimized.json`

Illustrative signatures:
```python
import dspy

class ExtractRecord(dspy.Signature):
    text = dspy.InputField()
    json = dspy.OutputField()  # validated later

class NLtoSQL(dspy.Signature):
    schema = dspy.InputField()
    question = dspy.InputField()
    sql = dspy.OutputField()
```

---

## Telemetry & tracing (lean)
- **LangSmith** for node spans, inputs/outputs digests, retries, exceptions.  
- Minimal JSON logs for: retrieval hits, schema‑valid %, SQL success %, per‑node latency.  
- Optional “SQL fingerprint” for grouping similar queries via simple normalization+hash.  
- Skip W&B and token‑cost accounting to stay focused.

---

## Build order for practice (incremental)
1) **Hello‑world spine:** one doc → one table → one SQL answer.  
2) **Schema v0 from labels**; JSON Schemas aligned.  
3) **Extractor v0 + Store + Planner v0** (hardcoded templates).  
4) Add **Retrieval (LlamaIndex+LanceDB)** only where needed.  
5) Add **metrics** (F1, exec‑match) and **LangSmith**.  
6) **DSPy compile** Extractor/Planner; freeze configs.  
7) Add **Critic** single‑pass + Router + Report.  

---

## Handy snippets

**Exec‑match (behavioral equality)**
```python
import duckdb, pandas as pd
con = duckdb.connect("md:agent_db")

def _df(sql):
    df = con.execute(sql).fetch_df()
    return df.sort_index(axis=1).sort_values(by=list(df.columns)) if not df.empty else df

def exec_match(pred_sql, gold_sql):
    try:
        return _df(pred_sql).equals(_df(gold_sql))
    except Exception:
        return False
```

**Fieldwise F1 (normalized)**
```python
import re
def norm(v):
    if v is None: return None
    if isinstance(v, str):
        v = re.sub(r"\s+", " ", v.strip().lower())
    return v

def f1_fields(pred: dict, gold: dict):
    keys = set(pred) | set(gold)
    tp=fp=fn=0
    for k in keys:
        pv, gv = norm(pred.get(k)), norm(gold.get(k))
        if pv == gv and pv is not None: tp += 1
        elif pv is not None and gv is None: fp += 1
        elif pv is None and gv is not None: fn += 1
        elif pv != gv: fp, fn = fp+1, fn+1
    prec = tp/(tp+fp) if tp+fp else 0
    rec  = tp/(tp+fn) if tp+fn else 0
    return 2*prec*rec/(prec+rec) if prec+rec else 0
```

**SQL fingerprint (group similar queries)**
```python
import hashlib, re
def sql_fingerprint(sql: str) -> str:
    no_literals = re.sub(r"'[^']*'|\\b\\d+\\b", "?", sql)
    canonical = re.sub(r"\\s+", " ", no_literals.strip().lower())
    return hashlib.sha1(canonical.encode()).hexdigest()[:16]
```
