# Plan: Align Layout Documentation with True Specification and Guidelines

This plan outlines the steps to update the layout documentation and the system architecture definitions to match the official despachante specifications ([layout_despachante_nf_ajustado.docx](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/docs/guidelines/layout_despachante_nf_ajustado.docx)), the validation [checklist.md](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/docs/guidelines/checklist.md), and the meeting feedback [issues.md](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/docs/guidelines/issues.md).

---

## 1. Context & Verification

Our technical diffing of the test files ([ARQUIVO_LMAO_OK4_CRLF.txt](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/docs/files/ARQUIVO_LMAO_OK4_CRLF.txt) and [AUDITADO_V2_nota_fiscal_teste_eletra (1).txt](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/docs/files/AUDITADO_V2_nota_fiscal_teste_eletra%20(1).txt)) against the project guidelines confirms:
*   **The 12-char Quantity Shift is Official:** The despachante specification mandates **`Quantidade` as size 12 (positions 55-66)**. The old layout of size 11 in `AUDITADO_V2` was incorrect and caused a shift.
*   **Line Endings:** Must be **CRLF (`\r\n`)**, which matches `ARQUIVO_LMAO_OK4_CRLF.txt`. `AUDITADO_V2` incorrectly used CR only.
*   **Unit of Measure:** Must be padded with spaces on the right (e.g. `'UN '`), occupying exactly 3 positions.
*   **Emitter State (UF):** Must be a valid Brazilian state (e.g., `'MA'`, `'AM'`, `'CE'`) rather than `'EX'` (which was incorrectly used as a mock value in `AUDITADO_V2`).
*   **Encoding & Character Sanitization:** 
    *   No accented characters (e.g., `á`, `ç`, `ê` -> mapped to `a`, `c`, `e`).
    *   Text fields (especially `Descrição do Produto`) must contain only clean, ASCII-compatible text ("texto bem limpinho") to prevent DB or SQL query injection/malformation.
    *   Encoding must be **UTF-8 (without BOM)**.

---

## 2. Proposed Documentation Updates

### 2.1. Update NOTA_FISCAL_2_CONTEXT.md
Adjust the layout specification tables in [format_guidelines/NOTA_FISCAL_2_CONTEXT.md](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/format_guidelines/NOTA_FISCAL_2_CONTEXT.md) to:
1.  **Correct Item (Detalhe) Positions:**
    *   Set `Quantidade` (Seq 11) to size **12** (pos 55-66).
    *   Shift subsequent fields `Seq 12` to `Seq 56` by **+1** character.
    *   Set `Percentual Diferimento de ICMS` (Seq 57) to size **8** (pos 690-697).
    *   Update `Código da LI` (Seq 58) to pos **698-707** and `Código da LI Substitutiva` (Seq 59) to pos **708-717**.
    *   Update the documented record length for Items to **717 characters**.
2.  **Define Compatibility/Alternative Modes:**
    *   Explicitly document that older systems or files omitting the non-mandatory DUIMP fields (Capa pos 381-399) will result in a **380-character Capa**.
    *   Explicitly document that omitting non-mandatory LI fields (Item pos 698-717) will result in a **697-character Item**.

### 2.2. Update new-totvs-layout-nota-fiscal-de-entrada.html
Update the Javascript layout arrays to match the corrected offsets:
*   In `ITEMS_LAYOUT`, change `Quantidade` size to 12, adjust pos range, and increment start/end positions for all subsequent fields by +1. Update `Percentual Diferimento de ICMS` positions to 690-697.
*   Remove or label optional fields so the live validation badge correctly validates both the full-width (399 Capa, 717 Item) and legacy-width (380 Capa, 697 Item) files.

### 2.3. Update ARCHITECTURE.md
*   Update references to record lengths to explain the 380/399 Capa and 697/717 Item variants.

### 2.4. Sanitization and Encoding Guidelines
Add a section detailing the strict character conversion logic:
*   ASCII transliteration for Latin-1 accents (e.g. `unicodedata.normalize('NFKD', val).encode('ASCII', 'ignore').decode('ASCII')`).
*   Line separator enforcement (`\r\n`).
*   Strict output formatting in UTF-8.

---

## 3. Implementation Steps

1.  **Step 1 [COMPLETED]:** Modify [NOTA_FISCAL_2_CONTEXT.md](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/format_guidelines/NOTA_FISCAL_2_CONTEXT.md) to update the record length limits, resize field 11 (`Quantidade`), shift all item fields by +1, and resize field 57 (`Diferimento`).
2.  **Step 2 [COMPLETED]:** Modify the Javascript array definitions `HEADER_LAYOUT` and `ITEMS_LAYOUT` inside [new-totvs-layout-nota-fiscal-de-entrada.html](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/format_guidelines/new-totvs-layout-nota-fiscal-de-entrada.html) to match the adjusted rules.
3.  **Step 3 [COMPLETED]:** Update the record size references in [ARCHITECTURE.md](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/ARCHITECTURE.md) and [CLAUDE.md](file:///E:/Github/My%20Projects/Emissor_nfse_from_di/CLAUDE.md).
4.  **Step 4 [COMPLETED]:** Define string sanitization filters in the formatters/validators to guarantee pure ASCII output encoded as UTF-8 (without BOM) and CRLF line endings, update parser and formatters to support shifted layout indexes, and fix/environment-harden verification tests.

---

## 4. Next Step
*   Please review and approve this plan. Upon approval, we will proceed to edit the documentation.
