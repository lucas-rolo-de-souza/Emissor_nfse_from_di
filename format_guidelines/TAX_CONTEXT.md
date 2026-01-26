# Brazilian Taxes Context for NFSe Generation

## 1. Overview & Purpose

This document provides a comprehensive overview of the Brazilian tax system as it pertains to the NFSe (Nota Fiscal de Serviço Eletrônica) and import declaration (DI) process. Its purpose is to serve as a technical and business guide for developers to understand, implement, and maintain the tax calculation logic within this application.

**Disclaimer:** This is a simplified guide for development purposes. The Brazilian tax system is highly complex and subject to frequent changes. Always consult with a qualified tax professional for definitive legal and financial guidance.

## 2. Tax Definitions

Here are the primary taxes involved. Their specific fields and codes in the XML are defined in the [Dicionário de Dados da Adição](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/dicionario-de-dados-da-adicao.doc).

- **II (Imposto de Importação):** A federal tax levied on the importation of foreign goods. Its primary purpose is to regulate foreign trade.
- **IPI (Imposto sobre Produtos Industrializados):** A federal tax on manufactured goods, both domestic and imported.
- **PIS (Programa de Integração Social):** A federal social contribution tax.
- **COFINS (Contribuição para o Financiamento da Seguridade Social):** Another federal social contribution tax, often calculated alongside PIS.
- **ICMS (Imposto sobre Circulação de Mercadorias e Serviços):** A state-level value-added tax (VAT) on the movement of goods and services. This is one of the most complex taxes due to varying state-level regulations.

_Note: ISS (Imposto Sobre Serviços) is a municipal tax on services, but it is less relevant in this context, which focuses on the import of goods (mercadorias)._

## 3. Calculation Logic & Dependencies

Taxes in Brazil are often cascading, meaning one tax can form part of the calculation base for another.

### 3.1. General Calculation Base (Valor Aduaneiro)

The starting point for most import tax calculations is the **Valor Aduaneiro** (Customs Value).

`Valor Aduaneiro = Valor do Produto (FOB) + Frete Internacional + Seguro Internacional`

### 3.2. Tax Formulas

1.  **II (Imposto de Importação)**
    - **Formula:** `II = Valor Aduaneiro * Alíquota do II`
    - **Dependencies:** None. It is the first tax calculated.
    - **XML Tags:** `iiAliquotaAdValorem`, `iiAliquotaValorDevido`

2.  **IPI (Imposto sobre Produtos Industrializados)**
    - **Formula:** `IPI = (Valor Aduaneiro + II) * Alíquota do IPI`
    - **Dependencies:** Depends on the value of II.
    - **XML Tags:** `ipiAliquotaAdValorem`, `ipiAliquotaValorDevido`

3.  **PIS/COFINS de Importação**
    - **Formula (PIS):** `PIS = Valor Aduaneiro * Alíquota do PIS`
    - **Formula (COFINS):** `COFINS = Valor Aduaneiro * Alíquota da COFINS`
    - **Dependencies:** These are generally calculated on the Valor Aduaneiro, but regulations can change.
    - **XML Tags:** `pisPasepAliquotaAdValorem`, `cofinsAliquotaAdValorem`

4.  **ICMS (Imposto sobre Circulação de Mercadorias e Serviços)**
    - This is the most complex one. The calculation base typically includes the value of the goods, other taxes, and customs expenses.
    - **Formula (Simplified):** `Base de Cálculo ICMS = (Valor Aduaneiro + II + IPI + PIS + COFINS + Taxa Siscomex)`
    - **Formula (Final):** `ICMS = Base de Cálculo ICMS / (1 - Alíquota do ICMS) * Alíquota do ICMS` (This "cálculo por dentro" is a common requirement).
    - **Dependencies:** Depends on all other federal import taxes.

## 4. Interaction Matrix

| Tax        | Calculation Base Includes...                                          |
| :--------- | :-------------------------------------------------------------------- |
| **II**     | `Valor Aduaneiro` (Produto FOB + Frete + Seguro)                      |
| **IPI**    | `Valor Aduaneiro` + `II`                                              |
| **PIS**    | `Valor Aduaneiro`                                                     |
| **COFINS** | `Valor Aduaneiro`                                                     |
| **ICMS**   | `Valor Aduaneiro` + `II` + `IPI` + `PIS` + `COFINS` + Outras Despesas |

## 5. Data Model

### Input Data (from XML)

- `valorTotalCondicaoVenda`: Value of the product.
- `freteTotalReais`: Total freight value.
- `seguroTotalReais`: Total insurance value.
- `iiAliquotaAdValorem`: II aliquot.
- `ipiAliquotaAdValorem`: IPI aliquot.
- `pisPasepAliquotaAdValorem`: PIS aliquot.
- `cofinsAliquotaAdValorem`: COFINS aliquot.
- State-level ICMS aliquot (often needs to be provided externally based on destination state).

### Output Structure (for one item)

```json
{
  "ncm": "85044090",
  "valorAduaneiro": 1043.34,
  "baseCalculoII": 1043.34,
  "aliquotaII": 12.0,
  "valorII": 125.2,
  "baseCalculoIPI": 1168.54, // valorAduaneiro + valorII
  "aliquotaIPI": 9.75,
  "valorIPI": 113.93
  // ... and so on for PIS, COFINS, ICMS
}
```

## 6. Validation Rules

- Aliquots (tax rates) must be a positive percentage (e.g., 0-100).
- The `Valor Aduaneiro` must be a positive number.
- All component values for the ICMS base calculation must be present before calculating it.
- If a tax value is provided directly in the XML (e.g., `iiAliquotaValorDevido`), it can be used for validation against the calculated value.

## 7. Example Calculation (Simplified)

Let's assume:

- Valor Aduaneiro = R$ 1000.00
- Alíquota II = 10%
- Alíquota IPI = 15%
- Alíquota ICMS = 18% (and no other expenses for simplicity)

1.  **II Calculation:**
    - `Valor II = 1000.00 * 0.10 = R$ 100.00`

2.  **IPI Calculation:**
    - `Base de Cálculo IPI = 1000.00 (Valor Aduaneiro) + 100.00 (II) = R$ 1100.00`
    - `Valor IPI = 1100.00 * 0.15 = R$ 165.00`

3.  **ICMS Calculation:**
    - `Base de Cálculo ICMS (parcial) = 1000.00 (VA) + 100.00 (II) + 165.00 (IPI) = R$ 1265.00`
    - `Base Final ICMS = 1265.00 / (1 - 0.18) = 1265.00 / 0.82 = R$ 1542.68`
    - `Valor ICMS = 1542.68 * 0.18 = R$ 277.68`

This example illustrates the cascading nature of the taxes.

## 8. Application Implementation Details

### 8.1. Automatic Calculation Fallback

In many DI XML files (especially Consultation formats), the explicit tax values (`ValorDevido`, `ValorRecolher`, `BaseCalculo`) might be zero, with only the Rate (`Aliquota`) provided.

To handle this, the parsing engine implements the following fallback logic for **all taxes** (II, IPI, PIS, COFINS, ICMS):

1.  **Base Calculation Default**:
    - If `BaseCalculo` is missing (0.00), the system defaults it to the **Merchandise Value** of the Adição (Sum of `Quantity` \* `Unit Value` for all items in that addition).
    - _Note: This is a simplification; theoretically IPI/ICMS bases are larger (cascading), but this ensures a non-zero base is available for estimation._

2.  **Value Calculation Default**:
    - If `ValorDevido` or `ValorRecolher` is missing (0.00) but a `Rate` (> 0) exists, calculation is performed as:
    - `Value = Base * (Rate / 100)`

### 8.2. Header Totals Calculation

For the generation of the `NOTA FISCAL 2` TXT file, the application calculates the Document Header tax totals by summing the computed components of all individual items:

- `Total Base ICMS` = Sum of (Item Unit Value \* Qty)
- `Total Value ICMS` = Sum of Item ICMS Values (mapped from DI or defaulted)
- `Total Base IPI` = Sum of Item IPI Bases
- `Total Value IPI` = Sum of Item IPI Values
