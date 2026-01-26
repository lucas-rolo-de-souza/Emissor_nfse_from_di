# DI/XML Context Documentation

## 1. Overview

This document details the structure and processing of the Declaração de Importação (DI) XML file used within the application. The DI XML contains crucial information about imported goods, including header details, item specifics, and various tax and cost components. Understanding this structure is vital for accurate data extraction and processing.

## 2. Schema Definition (XSD)

The structure of the DI XML is defined by the official **Siscomex** documentation.

- **XSD Schema**: [Esquema (XSD) do XML da Consulta](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/esquema-xsd-do-xml-da-consulta.pdf)
- **Data Dictionaries**:
  - [Dicionário de Dados do XML da Consulta](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/dicionario-de-dados-do-xml-da-consulta)
  - [Dicionário de Dados da DI](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/dicionario-de-dados-da-di.doc)
  - [Dicionário de Dados da Adição](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/dicionario-de-dados-da-adicao.doc)

An extracted local copy is preserved as [`DI_SCHEMA.xsd`](file:///z:/Github/My%20Projects/Emissor_nfse_from_di/format_guidelines/DI_SCHEMA.xsd). Since the application parses the "Consulta" format, these documents are the primary source of truth.

**Official XSD Structure:**

- **`ListaDeclaracoes`**: Root element.
  - **`declaracaoImportacao`**: Main element for DI information (Type: `declaracaoImportacaoConsulta`).
    - **Header Level Elements:** Includes extensive details such as:
      - `numeroDI`, `dataRegistro`, `dataDesembaraco`.
      - `importador...` (Group of fields for importer details).
      - `carga...` (Group of fields for cargo/freight details).
      - `conhecimentoCarga...` (Bill of Lading details).
      - `armazenamento...`, `armazem`.
      - `frete...`, `seguro...` (Values in Reais and negotiated currency).
      - `pagamento`, `icms`, `processoVinculado`.
    - **`adicao`**: Represents an addition (Type: `adicao`). Can appear multiple times.
      - **Item Specifics:**
        - `numeroAdicao`, `numeroDI`, `numeroLI`.
        - `mercadoria` (Type: `detalheMercadoria`): Contains `descricaoMercadoria`, `quantidade`, `unidadeMedida`, `valorUnitario`.
        - `dadosMercadoria...`: NCM code (`dadosMercadoriaCodigoNcm`), Net weight, Application, Condition, etc.
        - `fornecedor...` & `fabricante...`: Details about the supplier and manufacturer.
        - `condicaoVenda...`: Incoterms, valuation method, currency.
      - **Tax & Cost Elements:**
        - `ii...` (Import Duty), `ipi...`, `pisPasep...`, `cofins...`, `antidumping...`, `cide...`
        - Each tax group typically includes rate (`AliquotaAdValorem`), calculation base (`BaseCalculo` or `AliquotaBaseCalculo`), and amounts (`ValorDevido`, `ValorRecolher`).
      - **Other Components:**
        - `acrescimo`, `deducao`, `destaqueNcm`, `documentoVinculado`.
    - **Header Level Elements:**
      - `numeroDI`: Import Declaration Number (e.g., `2513556886`).
      - `dataRegistro`: Registration Date (e.g., `20250620`).
      - `freteTotalReais`: Total freight cost in BRL (e.g., `000000002838244`).
      - `seguroTotalReais`: Total insurance cost in BRL (e.g., `000000000078191`).
      - `importadorNome`: Importer's name.
      - `fornecedorNome` (within `adicao`): Supplier/Exporter name.
      - `pagamento`: Payment details (multiple entries possible).
      - `icms`: ICMS specific details.
      - `canalSelecaoParametrizada`: Channel selection code.
      - `cargaPesoBruto`, `cargaPesoLiquido`: Gross and Net Weight.
      - ...and many others (see `Eletra.xml` for full details).
    - **`adicao`**: Represents an addition or item group within the DI. Can appear multiple times.
      - `numeroAdicao`: Addition Number (e.g., `001`).
      - `dadosMercadoriaCodigoNcm`: NCM code (e.g., `85044090`).
      - `mercadoria`: Details about the specific good.
        - `descricaoMercadoria`: Product description.
        - `quantidade`: Commercial quantity.
        - `unidadeMedida`: Commercial unit.
        - `valorUnitario`: Unit value.
        - `valorTotalCondicaoVenda`: Total value for this specific item/addition.
      - Tax-related elements for the addition (e.g., `iiAliquotaAdValorem`, `ipiAliquotaValorDevido`, `cofinsAliquotaValorDevido`, `freteValorReais`, `seguroValorReais`).
      - `fornecedorNome`: Supplier name for this addition.

## 3. Namespaces

The XSD defines the namespace `xmlns:xs="http://www.w3.org/2001/XMLSchema"` for schema definitions but does not enforce a specific target namespace for the XML instance documents. The `Eletra.xml` example is namespace-less, which aligns with the XSD (unless `elementFormDefault` was set, which defaults to "unqualified").

## 4. Element/Attribute Mapping

The XSD provides a comprehensive list of available fields. Below is an updated mapping of key fields, including new ones identified in the official schema.

The following table maps key XML elements to the application's internal data model fields. This is based on the current `xmltodict` parsing and the intended output.

| XML Element Path                                             | Application Data Model Field | Description                                                                                                         | Current Parser Logic |
| :----------------------------------------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------ | :------------------- |
| `declaracaoImportacao/numeroDI`                              | `di_number`                  | Import Declaration Number.                                                                                          | Extracted to header. |
| `declaracaoImportacao/dataRegistro`                          | `di_date`                    | DI Registration Date.                                                                                               | Extracted to header. |
| `declaracaoImportacao/dataDesembaraco`                       | `clearance_date`             | Clearance Date (New).                                                                                               | **Not parsed.**      |
| `declaracaoImportacao/freteTotalReais`                       | `frete_total`                | Total freight cost in Reais.                                                                                        | Extracted to header. |
| `declaracaoImportacao/seguroTotalReais`                      | `seguro_total`               | Total insurance cost in Reais.                                                                                      | Extracted to header. |
| `declaracaoImportacao/importadorNome`                        | `importer_name`              | Importer Name.                                                                                                      | **Not parsed.**      |
| `declaracaoImportacao/adicao[0]/fornecedorNome`              | `exporter_name`              | Supplier/Exporter name (from the first addition - _Note: Schema defines `fornecedor` inside `adicao`, not header_). | Extracted to header. |
| `declaracaoImportacao/adicao/numeroAdicao`                   | `adicao_number`              | Addition number within the DI.                                                                                      | Extracted to item.   |
| `declaracaoImportacao/adicao/dadosMercadoriaCodigoNcm`       | `ncm`                        | NCM code for the item.                                                                                              | Extracted to item.   |
| `declaracaoImportacao/adicao/mercadoria/descricaoMercadoria` | `description`                | Product description.                                                                                                | Extracted to item.   |
| `declaracaoImportacao/adicao/mercadoria/quantidade`          | `qty_commercial`             | Commercial quantity.                                                                                                | Extracted to item.   |
| `declaracaoImportacao/adicao/mercadoria/unidadeMedida`       | `unit_commercial`            | Commercial unit of measure.                                                                                         | Extracted to item.   |
| `declaracaoImportacao/adicao/mercadoria/valorUnitario`       | `unit_value`                 | Unit value.                                                                                                         | Extracted to item.   |
| `declaracaoImportacao/adicao/valorTotalCondicaoVenda`        | `total_value`                | Total value for this addition.                                                                                      | Extracted to item.   |
| `declaracaoImportacao/adicao/dadosMercadoriaPesoLiquido`     | `net_weight`                 | Net weight of the addition.                                                                                         | **Not parsed.**      |
| `declaracaoImportacao/adicao/iiAliquotaAdValorem`            | `import_duty_aliquot`        | Import Duty Rate.                                                                                                   | **Not parsed.**      |
| `declaracaoImportacao/adicao/ipiAliquotaAdValorem`           | `ipi_aliquot`                | IPI Rate.                                                                                                           | **Not parsed.**      |
| `declaracaoImportacao/adicao/pisPasepAliquotaAdValorem`      | `pis_aliquot`                | PIS Rate.                                                                                                           | **Not parsed.**      |
| `declaracaoImportacao/adicao/cofinsAliquotaAdValorem`        | `cofins_aliquot`             | COFINS Rate.                                                                                                        | **Not parsed.**      |
| `declaracaoImportacao/adicao/antidumpingAliquotaAdValorem`   | `antidumping_aliquot`        | Antidumping Rate (New).                                                                                             | **Not parsed.**      |

## 5. Current Parsing Logic

The `backend/parsers/xml_parser.py` module uses the `xmltodict` library to parse the XML content.

- It converts the XML structure into nested Python dictionaries.
- It navigates through the dictionary to extract specific header-level information (`numeroDI`, `dataRegistro`) and item-level information within `adicao` and `mercadoria` elements.
- It flattens the structure by including DI and Adicao details in each item dictionary.
- It performs basic error handling for XML parsing failures and structural issues.

## 6. Proposed Improvements

To enhance robustness, maintainability, and enable more advanced features like tax calculation validation, consider the following improvements:

### 6.1. Schema Validation

- **Define XSD:** Obtain or create a formal XML Schema Definition (XSD) that precisely defines the structure, elements, attributes, and data types of the DI XML.
- **Implement Validation:** Use a library like `lxml` with `etree.XMLSchema` to validate the input XML against the XSD _before_ or _during_ parsing. This ensures the XML conforms to the expected standard, catching errors early.

### 6.2. Namespace Resolution

- If the DI XML structure evolves to include namespaces (e.g., `xmlns="http://www.example.com"`), ensure the parser can correctly handle them. Libraries like `lxml` and `xmltodict` (with appropriate configuration) support namespace resolution.

### 6.3. Element/Attribute Mapping with Data Classes

- **Implement Mappers:** Instead of relying solely on dictionary lookups from `xmltodict`, define Python classes (e.g., using `pydantic`) to represent the structure of the header and item data.
- **Benefits:**
  - **Type Safety:** Ensures data types are correctly handled.
  - **Clear Structure:** Makes the code more readable and maintainable.
  - **Built-in Validation:** `pydantic` models offer powerful data validation capabilities.
  - **Reduced Errors:** Maps XML elements directly to typed attributes, reducing errors from key typos or missing fields.

### 6.4. Develop Robust Parser

- **Transition to `lxml`:** Consider migrating from `xmltodict` to `lxml` for parsing. `lxml` is generally faster, more memory-efficient, and offers superior support for XSD validation and XPath querying, which is more robust for navigating complex XML structures than dictionary key access.
- **XPath for Extraction:** Use XPath expressions with `lxml` to precisely target and extract data, making the parser more resilient to minor structural changes in the XML.

By implementing these suggestions, the XML parsing and data extraction process will become more robust, secure, and easier to maintain, especially as the complexity of the DI XML or the application's requirements grow.
