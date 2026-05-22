# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This tool converts Brazilian federal import documents (Declaração de Importação — DI XML from Siscomex) into a fixed-width text file format (Layout Nota Fiscal 2) for direct ingestion into SIGAEIC legacy ERP systems. It is a stateless file-transformation pipeline with a step-based React wizard UI.

## Development Commands

### Backend
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start API server (from repo root)
python -m uvicorn backend.app:app --reload --port 8005
# Runs at http://localhost:8005
```

### Frontend
```bash
cd frontend
npm install       # first-time setup
npm run dev       # dev server at http://localhost:5173
npm run build     # TypeScript compile + Vite bundle
npm run lint      # ESLint
npm run preview   # preview production build
```

### Run both together
```
run_dev_testing_user_launcher.bat   # Windows batch: starts backend + frontend + opens browser
```

### Tests
```bash
python -m pytest backend/tests/
```

## Architecture

**Data flow (happy path):**
1. User uploads DI XML → `POST /extract` → backend parses XML (with XSD validation against `format_guidelines/DI_SCHEMA.xsd`) and returns structured JSON
2. User reviews/edits data in React wizard (adds internal product codes, invoice numbers, dates, CFOP)
3. User submits → `POST /generate` → backend validates, builds fixed-width TXT, returns file for download
4. Optional: user uploads existing TXT → `POST /parse-txt` → reverse-parses for inspection

**Backend layers** (`backend/`):
- `app.py` — FastAPI app, 3 endpoints (`/extract`, `/generate`, `/parse-txt`), CORS enabled for `*`
- `parsers/xml_parser.py` — DI XML → dict (xmltodict, XSD validation via lxml)
- `parsers/xlsx_parser.py` — Excel mapping template → product code/CFOP lookups
- `parsers/txt_parser.py` — Reverse-parse existing TXT files
- `formatters/txt_builder.py` — Fixed-width TXT generation (all field positions, padding rules)
- `services/processor.py` — Orchestrates XML + XLSX merge and tax calculations

**Frontend layers** (`frontend/src/`):
- `App.tsx` — Top-level step state machine (`landing → upload → review → report | viewer`)
- `types.ts` — All data interfaces and field-level validation logic
- `components/ReviewStep.tsx` — Main editing UI (most complex component; handles header + per-item fields)
- API base URL is hard-coded as `http://localhost:8005` in `App.tsx`

## Key Domain Knowledge

### Tax Calculation Order (cascading)
Taxes must be calculated in this exact order — each depends on the previous:
1. **Valor Aduaneiro** = FOB + Freight + Insurance
2. **II** = Valor Aduaneiro × II rate
3. **IPI** = (Valor Aduaneiro + II) × IPI rate
4. **PIS/COFINS** = Valor Aduaneiro × respective rates
5. **ICMS** = (Valor Aduaneiro + II + IPI + PIS + COFINS) / (1 − ICMS rate) × ICMS rate ← calculated *por dentro* (cascading)

When the DI XML contains zero values for taxes, the backend recalculates from rates + merchandise values. Full reference: `format_guidelines/TAX_CONTEXT.md`.

### Fixed-Width TXT Layout
The output TXT has exactly two record types:
- **Header record**: 380 characters
- **Item record**: 688 characters

Field positions, numeric formatting (with `.`), alphanumeric padding (spaces), and date formats (`DDMMAA` vs `AAAAMMDD`) vary per field. Full spec: `format_guidelines/NOTA_FISCAL_2_CONTEXT.md`.

### DI XML Structure
The XML is hierarchically nested: `declaracaoImportacao → adicoes[] → mercadorias[]`. Each *adição* (addition) represents one product line with its own NCM code and tax rates. Full reference: `format_guidelines/DI_XML_CONTEXT.md` and `format_guidelines/DI_SCHEMA.xsd`.

## Important Files for Context

| File | Purpose |
|------|---------|
| `format_guidelines/TAX_CONTEXT.md` | Complete Brazilian import tax calculation formulas |
| `format_guidelines/NOTA_FISCAL_2_CONTEXT.md` | Fixed-width layout field-by-field spec |
| `format_guidelines/DI_XML_CONTEXT.md` | DI XML structure reference |
| `format_guidelines/DI_SCHEMA.xsd` | Official Siscomex XSD for validation |
| `ARCHITECTURE.md` | Mermaid diagram of system components |
| `PROJECT_OVERVIEW.md` | Business context and problem statement |
