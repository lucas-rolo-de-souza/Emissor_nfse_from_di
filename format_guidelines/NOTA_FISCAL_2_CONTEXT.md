# Nota Fiscal de Entrada — Layout de Integração (SIGAEIC)

**Source:** TOTVS TDN — [Integração de dados da Nota Fiscal de Entrada](https://tdn.totvs.com/pages/releaseview.action?pageId=394220238)

> **Important:** This layout is specific to the TOTVS SIGAEIC integration (ERP Protheus). It is **not** the same as the official [Leiaute do TXT da DI](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/leiaute-do-txt-da-di.doc) provided by Siscomex.

## 1. File Structure

- **Format:** ASCII Text (Fixed Width).
- **Line Delimiter:** CHR(13) — CR only (Carriage Return, `\r`).
- **Separators:** None (Continuous fields).
- **Record Types:**
  - **Header (Capa):** Identified by `Tipo = "1"` at position 1. **Total length: 399 characters.**
  - **Item (Detalhe):** Identified by `Tipo = "2"` at position 1. **Total length: 716 characters.**

## 2. Formatting Rules

### 2.1 Numeric Fields (N)

- **Padding:** Zero-padded to the left.
- **Decimal Separator:** Mandatory DOT (`.`).
- **Format:** Integers to the left, decimals to the right of the dot.
- **TAM note:** `TAM = 15, DEC = 2` → 12 integer digits + dot + 2 decimal digits = 15 total.
- **Example:** Value `5.762,31` in field `TAM 15, DEC 2`: `000005762.31`.

### 2.2 Alphanumeric / Character Fields (A / C)

- **Padding:** Space-padded to the right.
- **Handling:** Unused fields should be filled with spaces.

### 2.3 Date Fields (D)

- **Format:** `AAAAMMDD` (e.g., 2025-08-20 → `20250820`).
- Date fields send as zero-padded numeric string.

## 3. Layout Definitions

### 3.1 Header (Capa) — Type "1" — 399 characters

| Seq | Description                    | Type | Size | Dec | Position | Notes                          |
| :-: | :----------------------------- | :--: | :--: | :-: | :------: | :----------------------------- |
| 01  | Tipo                           |  A   | 001  |  -  | 001-001  | Fixed "1"                      |
| 02  | Código da Empresa              |  N   | 002  |  -  | 002-003  | Fixed "01"                     |
| 03  | Código da Filial               |  N   | 002  |  -  | 004-005  | Fixed "01"                     |
| 04  | Número da Nota                 |  N   | 009  |  -  | 006-014  | Mandatory                      |
| 05  | Filler                         |  A   | 006  |  -  | 015-020  | Spaces                         |
| 06  | Aliq. ICMS                     |  N   | 007  |  2  | 021-027  |                                |
| 07  | CFOP                           |  N   | 006  |  -  | 028-033  | Must exist in Easy             |
| 08  | CFP                            |  A   | 005  |  -  | 034-038  | Unused                         |
| 09  | CGC - Emitente                 |  N   | 014  |  -  | 039-052  | CNPJ emitente (unused)         |
| 10  | Código do IPI                  |  A   | 003  |  -  | 053-055  | Unused                         |
| 11  | Número do Processo             |  A   | 017  |  -  | 056-072  | Mandatory (Desembaraço)        |
| 12  | Quantidade de Itens            |  N   | 002  |  -  | 073-074  | Max 99. Mandatory.             |
| 13  | Data de Referência             |  N   | 006  |  -  | 075-080  | MMAAAA (unused)                |
| 14  | Data de Emissão                |  N   | 008  |  -  | 081-088  | **AAAAMMDD** mandatory         |
| 15  | Data de Entrada                |  N   | 008  |  -  | 089-096  | **AAAAMMDD** mandatory         |
| 16  | Filler                         |  A   | 006  |  -  | 097-102  | Spaces                         |
| 17  | Data de Registro DI            |  N   | 008  |  -  | 103-110  | AAAAMMDD (unused)              |
| 18  | Filler                         |  A   | 002  |  -  | 111-112  | Spaces                         |
| 19  | Entrada / Saída                |  A   | 001  |  -  | 113-113  | Fixed "E"                      |
| 20  | Espécie                        |  A   | 003  |  -  | 114-116  | NFC,NFE,NFM,NFF,NFU or NFT     |
| 21  | Flag Cancelada                 |  A   | 001  |  -  | 117-117  | Unused                         |
| 22  | Filler                         |  A   | 001  |  -  | 118-118  | Space                          |
| 23  | Flag Entrada                   |  A   | 001  |  -  | 119-119  | Fixed "I"                      |
| 24  | Número da DI                   |  A   | 010  |  -  | 120-129  | Recorded if not empty          |
| 25  | Série                          |  A   | 003  |  -  | 130-132  | Same as items                  |
| 26  | Código de Sit. Tributária      |  A   | 002  |  -  | 133-134  | Unused                         |
| 27  | Situação Tributária - E        |  A   | 005  |  -  | 135-139  | Unused                         |
| 28  | Situação Tributária - F        |  A   | 005  |  -  | 140-144  | Unused                         |
| 29  | UF do Emitente                 |  A   | 002  |  -  | 145-146  | Unused                         |
| 30  | Via de Transporte              |  A   | 001  |  -  | 147-147  | Unused                         |
| 31  | Valor do Frete                 |  N   | 015  | 02  | 148-162  | Unused                         |
| 32  | Valor do ICMS                  |  N   | 015  | 02  | 163-177  | Unused                         |
| 33  | Valor da Base do ICMS          |  N   | 015  | 02  | 178-192  | Unused                         |
| 34  | Código do Importador           |  A   | 004  |  -  | 193-196  | Unused                         |
| 35  | Código do Transportador        |  A   | 020  |  -  | 197-216  | Unused                         |
| 36  | Valor do Seguro                |  N   | 015  | 02  | 217-231  | Unused                         |
| 37  | Valor do IPI                   |  N   | 015  | 02  | 232-246  | Unused                         |
| 38  | Valor Total da Mercadoria      |  N   | 015  | 02  | 247-261  | Mandatory                      |
| 39  | Valor Total da Nota            |  N   | 015  | 02  | 262-276  | Mandatory                      |
| 40  | Valor Base do IPI              |  N   | 015  | 02  | 277-291  | Unused                         |
| 41  | Filler                         |  A   | 002  |  -  | 292-293  | Spaces                         |
| 42  | Código do Exportador           |  A   | 004  |  -  | 294-297  | Unused                         |
| 43  | Nome do Exportador             |  A   | 060  |  -  | 298-357  | Unused                         |
| 44  | Numero do PO                   |  A   | 017  |  -  | 358-374  | Unused                         |
| 45  | Perc. Redução Base ICMS        |  N   | 006  | 02  | 375-380  |                                |
| **46** | **Número da DUIMP**         |**A** |**015**|**-**|**381-395**| **NEW** — não obrigatório    |
| **47** | **Versão do Registro**      |**A** |**004**|**-**|**396-399**| **NEW** — não obrigatório    |

### 3.2 Items (Detalhe) — Type "2" — 716 characters

| Seq | Description                    | Type | Size | Dec | Position | Notes                          |
| :-: | :----------------------------- | :--: | :--: | :-: | :------: | :----------------------------- |
| 01  | Tipo                           |  A   | 001  |  -  | 001-001  | Fixed "2"                      |
| 02  | Código da Empresa              |  N   | 002  |  -  | 002-003  | Fixed "01"                     |
| 03  | Código da Filial               |  N   | 002  |  -  | 004-005  | Fixed "01"                     |
| 04  | Número da Nota                 |  N   | 009  |  -  | 006-014  |                                |
| 05  | Número do Lançamento           |  N   | 006  |  -  | 015-020  | Unused                         |
| 06  | Classificação Fiscal (NCM)     |  N   | 010  |  -  | 021-030  | Must exist in Easy             |
| 07  | Código do Produto              |  A   | 020  |  -  | 031-050  | Part of Desembaraço            |
| 08  | Código - Trib. - ICMS          |  N   | 001  |  -  | 051-051  | Unused                         |
| 09  | Código - Trib. - IPI           |  N   | 001  |  -  | 052-052  | Unused                         |
| 10  | Número do Item                 |  N   | 002  |  -  | 053-054  | Unused                         |
| 11  | Quantidade                     |  N   | 011  | 04  | 055-065  | Mandatory                      |
| 12  | Unidade                        |  A   | 003  |  -  | 066-068  | Unused (uses Easy unit)        |
| 13  | Vlr. - IPI                     |  N   | 015  | 02  | 069-083  |                                |
| 14  | Valor Mercadoria (CIF+II)      |  N   | 015  | 02  | 084-098  | Mandatory                      |
| 15  | Flag de Entrada                |  A   | 001  |  -  | 099-099  | Fixed "I"                      |
| 16  | Quantidade do Recebimento      |  N   | 011  | 04  | 100-110  | Unused                         |
| 17  | Descrição do Produto           |  A   | 150  |  -  | 111-260  |                                |
| 18  | Valor Fob R$                   |  N   | 015  | 02  | 261-275  | Mandatory                      |
| 19  | Valor Frete R$                 |  N   | 015  | 02  | 276-290  | Item freight                   |
| 20  | Valor do Seguro R$             |  N   | 015  | 02  | 291-305  | Item insurance                 |
| 21  | Valor II R$                    |  N   | 015  | 02  | 306-320  | Import Duty value              |
| 22  | Alíquota IPI                   |  N   | 005  | 02  | 321-325  |                                |
| 23  | Valor Despesas                 |  N   | 015  | 02  | 326-340  | Other expenses                 |
| 24  | Nro Processo no Easy           |  A   | 017  |  -  | 341-357  | Mandatory                      |
| 25  | Numero da EX da NCM            |  A   | 003  |  -  | 358-360  | NCM exception                  |
| 26  | Numero da Invoice              |  A   | 015  |  -  | 361-375  |                                |
| 27  | Valor do ICMS a recolher       |  N   | 015  | 02  | 376-390  |                                |
| 28  | Peso Liquido do item           |  N   | 011  | 04  | 391-401  | Mandatory                      |
| 29  | Item do Pedido de Compra       |  C   | 004  |  -  | 402-405  | Mandatory in Easy              |
| 30  | Alíquota de II                 |  N   | 005  |  2  | 406-410  |                                |
| 31  | Numero do pedido               |  C   | 017  |  -  | 411-427  | Mandatory in Easy              |
| 32  | Nro do Pedido de Licenc.       |  C   | 010  |  -  | 428-437  | PLI Number                     |
| 33  | Série da Nota Fiscal           |  C   | 003  |  -  | 438-440  | Match header                   |
| 34  | Base de ICMS (por item)        |  N   | 015  | 02  | 441-455  |                                |
| 35  | Valor FOB na moeda de Origem   |  N   | 015  | 07  | 456-470  | Unit FOB value                 |
| 36  | Alíquota do PIS                |  N   | 006  | 02  | 471-476  |                                |
| 37  | Vlr por qtde do PIS            |  N   | 009  | 02  | 477-485  |                                |
| 38  | Base de cálculo do PIS         |  N   | 015  | 02  | 486-500  |                                |
| 39  | Valor do PIS                   |  N   | 015  | 02  | 501-515  |                                |
| 40  | Alíquota do COFINS             |  N   | 006  | 02  | 516-521  |                                |
| 41  | Vlr por qtde do COFINS         |  N   | 009  | 02  | 522-530  |                                |
| 42  | Base de cálculo do COFINS      |  N   | 015  | 02  | 531-545  |                                |
| 43  | Valor do COFINS                |  N   | 015  | 02  | 546-560  |                                |
| 44  | Número da adição               |  C   | 003  |  -  | 561-563  |                                |
| 45  | Sequencia do item da adição    |  C   | 003  |  -  | 564-566  |                                |
| 46  | Valor do desconto              |  N   | 015  | 02  | 567-581  |                                |
| 47  | Valor do IOF                   |  N   | 015  | 02  | 582-596  |                                |
| 48  | Despesas Aduaneiras            |  N   | 015  | 02  | 597-611  |                                |
| 49  | Alíquota específica do IPI     |  N   | 015  | 04  | 612-626  |                                |
| 50  | Qtde total - IPI               |  N   | 011  | 04  | 627-637  |                                |
| 51  | Qtde total - PIS               |  N   | 011  | 04  | 638-648  |                                |
| 52  | Qtde total - COFINS            |  N   | 011  | 04  | 649-659  |                                |
| 53  | Lote                           |  C   | 010  | 00  | 660-669  |                                |
| 54  | Validade                       |  D   | 008  | 00  | 670-677  | AAAAMMDD                       |
| 55  | Aliq ICMS - ICMS               |  N   | 005  | 02  | 678-682  |                                |
| 56  | Alíquota de Majoração COFINS   |  N   | 006  | 02  | 683-688  |                                |
| **57** | **Percentual Diferimento de ICMS** |**N**|**008**|**04**|**689-696**| Renamed from "Perc. Rateio" |
| **58** | **Código da LI**            |**C** |**010**|**-** |**697-706**| **NEW** — WP_REGIST (Siscomex) |
| **59** | **Código da LI Substitutiva** |**C**|**010**|**-**|**707-716**| **NEW** — WP_SUBST          |

## 4. Important Notes

- **CBS / IBS (Reforma Tributária):** These new tributes are NOT included in the TXT layout. Calculation is done internally by the system based on NCM registration data.
- **MV_EIC0076:** When activated (`.T.`), field 11 (Número do Processo) in the "Dicionário de dados" variant expands to 20 characters, shifting positions. The **standard layout** (Leiaute Padrão) keeps 17 characters.
- **Validade (field 54):** Format changed from C to D (date `AAAAMMDD`). The field remains 8 characters.
