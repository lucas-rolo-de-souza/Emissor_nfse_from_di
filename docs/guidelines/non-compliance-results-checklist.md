# Non-Compliance Results Checklist

Updated: 2026-06-22 (third audit pass — all gaps closed)

Scope reviewed:

- `docs/guidelines/layout-for-ai.md`
- `docs/guidelines/checklist-nf-despachante.md`
- `backend/formatters/txt_builder.py`
- `backend/app.py`
- `backend/tests/` (all test files)
- `frontend/src/lib/fieldSchema.ts`
- `frontend/src/components/` (TxtViewerStep, ReviewStep, audit/*)

---

## Summary

**No open non-compliances or coverage gaps remain.**

All findings from earlier audit passes have been resolved. The table below records the
full history for traceability.

---

## All Resolved Findings

### R-1 — DI item length shown as 697 in frontend UI

- **Audit pass:** 2 (previously open)
- **Was:** `LAYOUT_LENGTHS.v3_DI.item = 697`; UI labels showed "DI (Layout 380/697)".
- **Fixed:** `LAYOUT_LENGTHS.v3_DI.item = 717`; all labels now show "DI (Layout 380/717)".
- **Verified by:** `frontend/src/lib/__tests__/fieldSchema.test.ts` — `LAYOUT_LENGTHS` suite.

### R-2 — Audit/export conversion truncated DI item lines to 697

- **Audit pass:** 2 (previously open)
- **Was:** `padLineToLayout` used the wrong 697 target for DI items.
- **Fixed:** `LAYOUT_LENGTHS` corrected; `padLineToLayout` now targets 717 for both DI and DUIMP.
- **Verified by:** `frontend/src/lib/__tests__/fieldSchema.test.ts` — `padLineToLayout` suite.

### R-3 — Item fields 57/58/59 incorrectly marked DUIMP-only

- **Audit pass:** 2 (previously open)
- **Was:** `perc_dif_icms`, `codigo_li`, and `codigo_li_substitutiva` had `isDUIMPOnly: true`.
- **Fixed:** Flags removed; all three fields visible and editable for both DI and DUIMP.
- **Verified by:** `fieldSchema.test.ts` — "no item field has isDUIMPOnly" test.

### R-4 — Frontend date labels showed DDMMAAAA for 8-char date fields

- **Audit pass:** 2 (previously open)
- **Was:** `data_emissao`, `data_entrada`, `data_di` had `dateFormat: "DDMMAAAA"`.
- **Fixed:** All three carry `dateFormat: "AAAAMMDD"` as required by spec §2.2.

### R-5 — MV\_EIC0010 not implemented

- **Audit pass:** 2 (previously open)
- **Was:** ICMS alíquota always placed in ITENS; no code read the parameter.
- **Fixed:** `get_icms_source()` reads `mv_eic0010_source`; CAPA field 06 and item field 55
  are conditionally populated. API validates the setting and enforces `aliq_icms_capa` when
  needed.
- **Verified by:** `test_compliance_fixes.py` — Issue 11 tests; `test_api_v2.py` —
  `test_generate_endpoint_rejects_header_icms_source_without_capa_rate_when_item_rates_differ`.

### R-6 — MV\_EIC0076 not implemented

- **Audit pass:** 2 (previously open)
- **Was:** PO and Invoice field widths always fixed regardless of mode.
- **Fixed:** `get_po_input_max_length(mode)` returns 15 (STANDARD\_15) or 17 (FIELD\_WIDTH);
  API validates PO length. Invoice is always 15 chars because the TXT field is physically 15
  chars wide (spec pos 362–376) — this is not a bug.
- **Note on `get_invoice_input_max_length`:** This function correctly returns 15 in all
  modes. The invoice TXT field is always 15 chars; MV\_EIC0076 does not change the physical
  layout width for the invoice field. Flagging this as non-compliant in the second audit
  was incorrect.
- **Verified by:** `test_compliance_fixes.py` — Issue 12 tests;
  `test_api_v2.py` — `test_generate_endpoint_rejects_po_longer_than_standard_15_mode`.

### R-7 — `test_format.py` contained no assertions

- **Audit pass:** 2 (previously open)
- **Fixed:** File rewritten as a proper pytest test asserting CAPA=380, ITENS=717.

### R-8 — `test_xlsx_template.py` swallowed failures

- **Audit pass:** 2 (previously open)
- **Fixed:** Broad try/except replaced with plain assertions; failures now propagate.

### R-9 — `test_manual.py` was diagnostic script code

- **Audit pass:** 2 (previously open)
- **Fixed:** Rewritten as pytest functions with explicit assertions on record lengths,
  tipo values, and round-trip parse integrity.

### R-10 — API tests verified transport success only, not layout compliance (Gap A)

- **Audit pass:** 3 (this pass)
- **Was:** `test_api_v2.py` only checked HTTP 200 and content substrings.
- **Fixed:** Added 10 new compliance-asserting tests in `test_api_v2.py`:
  - `test_generate_di_capa_is_380_chars`
  - `test_generate_di_item_is_717_chars`
  - `test_generate_uses_crlf_line_endings`
  - `test_generate_duimp_capa_is_399_chars`
  - `test_generate_capa_fixed_literals` (pos 1/2-3/4-5/113/119)
  - `test_generate_item_fixed_literals` (pos 1/2-3/4-5/100)
  - `test_generate_numero_nota_consistent_across_records`
  - `test_generate_qtd_itens_matches_actual_item_count`
  - `test_generate_rejects_invalid_especie`
  - `test_generate_rejects_over_99_items`
- **Verified:** `pytest backend/tests/test_api_v2.py` — 15 passed.

### R-11 — No frontend automated tests for compliance-sensitive schema logic (Gap B)

- **Audit pass:** 3 (this pass)
- **Was:** No test framework installed; `fieldSchema.ts` transforms had zero coverage.
- **Fixed:** Added Vitest 3 to `frontend/package.json`; configured `vite.config.ts`;
  created `frontend/src/lib/__tests__/fieldSchema.test.ts` with 34 tests covering:
  - `LAYOUT_LENGTHS` values for DI and DUIMP (4 tests)
  - `getSchemaForLine` header schema, item quantity correction, position shift logic,
    field-end positions, and DUIMP-only flags (11 tests)
  - `detectLayoutVersion` heuristic from header line length (4 tests)
  - `padLineToLayout` padding and truncation for all record types (6 tests)
  - `convertLinesToLayout` CRLF output and line-length correctness (6 tests)
- **Verified:** `npx vitest run` — 34 passed.

### R-12 — Espécie not validated in builder (Gap C)

- **Audit pass:** 3 (this pass)
- **Was:** `build_txt_content` silently defaulted to `NFE` for absent or invalid values;
  a direct caller bypassing the API could inject any string.
- **Fixed:** `build_txt_content` in `backend/formatters/txt_builder.py` now raises
  `ValueError` immediately if the resolved espécie is not in `VALID_ESPECIES`.
- **Verified by:** `test_api_v2.py::test_generate_rejects_invalid_especie` — passes.

### R-13 — Qtd Itens > 99 not enforced (Gap D)

- **Audit pass:** 3 (this pass — finding was incorrect in second-pass checklist)
- **Status:** `app.py:351–352` already validated this before the second audit was written.
  The checklist entry claiming this was missing was a false finding.
- **Verified by:** `test_api_v2.py::test_generate_rejects_over_99_items` — passes.

---

## Current Test Coverage

| Suite | Command | Count | Status |
| --- | --- | --- | --- |
| Backend compliance regression | `pytest backend/tests/test_compliance_fixes.py` | 22 | ✓ pass |
| Backend API compliance | `pytest backend/tests/test_api_v2.py` | 15 | ✓ pass |
| Backend layout / format | `pytest backend/tests/test_format.py test_manual.py test_xlsx_template.py test_txt_parser.py` | 10 | ✓ pass |
| Frontend schema | `npx vitest run` | 34 | ✓ pass |

Last full run: 2026-06-22 — all 81 tests pass.

---

## Validated Compliant Areas

| Area | Evidence |
| --- | --- |
| CRLF line endings | `txt_builder.py:397` and `test_generate_uses_crlf_line_endings` |
| DI CAPA = 380 chars | `_build_header_line` + `test_generate_di_capa_is_380_chars` |
| DUIMP CAPA = 399 chars | DUIMP fields appended only when `document_type == "DUIMP"` + `test_generate_duimp_capa_is_399_chars` |
| Item records = 717 chars (DI and DUIMP) | `test_compliance_fixes.py` Issue 1 tests + `test_generate_di_item_is_717_chars` |
| Fixed literals (CAPA 01/19/23, ITENS 01/15) | `test_generate_capa_fixed_literals`, `test_generate_item_fixed_literals` |
| Número da Nota consistent CAPA ↔ ITENS | `test_generate_numero_nota_consistent_across_records` |
| Qtd Itens reflects actual count and capped at 99 | `test_generate_qtd_itens_matches_actual_item_count`, `test_generate_rejects_over_99_items` |
| Espécie validated at API and builder layers | `app.py:333` + `txt_builder.py:build_txt_content` + `test_generate_rejects_invalid_especie` |
| Numeric fields: leading-zero integer + mandatory `.` + trailing-zero decimal | `FixedWidth.format_num` |
| 8-char dates normalized to AAAAMMDD | `FixedWidth.sanitize_date` |
| CAPA field 13 (Data Referência) sends `000000` when absent | `txt_builder.py:160` |
| Item fields 46/47 (Desconto/IOF) zero-filled when absent | `txt_builder.py:346–348` |
| Item field 54 (Validade) in spaces when field 53 (Lote) is blank | `txt_builder.py:363` |
| NCM zero-padded to 10 digits | `txt_builder.py:266` |
| MV\_EIC0010 ICMS source conditional in header + item | `test_compliance_fixes.py` Issue 11 |
| MV\_EIC0076 PO width mode-sensitive | `test_compliance_fixes.py` Issue 12 |
| Frontend item schema positions correct after shift | `fieldSchema.test.ts` — position tests |
| Frontend layout lengths correct for DI and DUIMP | `fieldSchema.test.ts` — LAYOUT\_LENGTHS suite |
| Frontend CRLF output from convertLinesToLayout | `fieldSchema.test.ts` — convertLinesToLayout suite |
