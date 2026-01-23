# DI/XML Context Documentation

## 1. Overview

This document details the structure and processing of the Declaração de Importação (DI) XML file used within the application. The DI XML contains crucial information about imported goods, including header details, item specifics, and various tax and cost components. Understanding this structure is vital for accurate data extraction and processing.

## 2. Schema Definition (XSD)

While an official XML Schema Definition (XSD) for this specific DI XML format is not provided in the current codebase, a hierarchical structure can be inferred from the example `Eletra.xml`. A formal XSD is highly recommended for robust validation and to ensure data integrity.

**Inferred Structure:**

*   **`ListaDeclaracoes`**: Root element.
    *   **`declaracaoImportacao`**: Main element for DI information.
        *   **Header Level Elements:**
            *   `numeroDI`: Import Declaration Number (e.g., `2513556886`).
            *   `dataRegistro`: Registration Date (e.g., `20250620`).
            *   `freteTotalReais`: Total freight cost in BRL (e.g., `000000002838244`).
            *   `seguroTotalReais`: Total insurance cost in BRL (e.g., `000000000078191`).
            *   `importadorNome`: Importer's name.
            *   `fornecedorNome` (within `adicao`): Supplier/Exporter name.
            *   `pagamento`: Payment details (multiple entries possible).
            *   `icms`: ICMS specific details.
            *   `canalSelecaoParametrizada`: Channel selection code.
            *   `cargaPesoBruto`, `cargaPesoLiquido`: Gross and Net Weight.
            *   ...and many others (see `Eletra.xml` for full details).
        *   **`adicao`**: Represents an addition or item group within the DI. Can appear multiple times.
            *   `numeroAdicao`: Addition Number (e.g., `001`).
            *   `dadosMercadoriaCodigoNcm`: NCM code (e.g., `85044090`).
            *   `mercadoria`: Details about the specific good.
                *   `descricaoMercadoria`: Product description.
                *   `quantidade`: Commercial quantity.
                *   `unidadeMedida`: Commercial unit.
                *   `valorUnitario`: Unit value.
                *   `valorTotalCondicaoVenda`: Total value for this specific item/addition.
            *   Tax-related elements for the addition (e.g., `iiAliquotaAdValorem`, `ipiAliquotaValorDevido`, `cofinsAliquotaValorDevido`, `freteValorReais`, `seguroValorReais`).
            *   `fornecedorNome`: Supplier name for this addition.

## 3. Namespaces

The provided `Eletra.xml` example does not explicitly define or use XML namespaces (e.g., `xmlns="..."`). Therefore, namespace resolution is not a critical concern for the current parsing logic.

## 4. Element/Attribute Mapping

The following table maps key XML elements to the application's internal data model fields. This is based on the current `xmltodict` parsing and the intended output.

| XML Element Path                                 | Application Data Model Field | Description                                                               | Current Parser Logic                                      |
| :----------------------------------------------- | :--------------------------- | :------------------------------------------------------------------------ | :-------------------------------------------------------- |
| `declaracaoImportacao/numeroDI`                  | `di_number`                  | Import Declaration Number.                                                | Extracted to header.                                      |
| `declaracaoImportacao/dataRegistro`              | `di_date`                    | DI Registration Date.                                                     | Extracted to header.                                      |
| `declaracaoImportacao/freteTotalReais`           | `frete_total`                | Total freight cost in Reais.                                              | Extracted to header.                                      |
| `declaracaoImportacao/seguroTotalReais`          | `seguro_total`               | Total insurance cost in Reais.                                            | Extracted to header.                                      |
| `declaracaoImportacao/adicao[0]/fornecedorNome`  | `exporter_name`              | Supplier/Exporter name (from the first addition).                         | Extracted to header.                                      |
| `declaracaoImportacao/adicao/numeroAdicao`       | `adicao_number`              | Addition number within the DI.                                            | Extracted to item.                                        |
| `declaracaoImportacao/adicao/dadosMercadoriaCodigoNcm` | `ncm`                        | NCM code for the item.                                                    | Extracted to item.                                        |
| `declaracaoImportacao/adicao/mercadoria/descricaoMercadoria` | `description`                | Product description.                                                      | Extracted to item.                                        |
| `declaracaoImportacao/adicao/mercadoria/quantidade` | `qty_commercial`             | Commercial quantity of the item.                                          | Extracted to item.                                        |
| `declaracaoImportacao/adicao/mercadoria/unidadeMedida` | `unit_commercial`            | Commercial unit of measure.                                               | Extracted to item.                                        |
| `declaracaoImportacao/adicao/mercadoria/valorUnitario` | `unit_value`                 | Unit value of the item.                                                   | Extracted to item.                                        |
| `declaracaoImportacao/adicao/valorTotalCondicaoVenda` | `total_value`                | Total value for this addition/item group.                                 | Extracted to item.                                        |
| `declaracaoImportacao/adicao/dadosMercadoriaMedidaEstatisticaQuantidade` | `qty_stat`                   | Statistical quantity (might be different from commercial quantity).       | Extracted to item (currently unused in TXT output).     |
| `declaracaoImportacao/adicao/dadosMercadoriaMedidaEstatisticaUnidade` | `unit_stat`                  | Statistical unit of measure.                                              | Extracted to item (currently unused in TXT output).     |
| `declaracaoImportacao/adicao/iiAliquotaAdValorem` | `import_duty_aliquot`        | Ad valorem aliquot for Import Duty.                                        | Present in XML, but not currently parsed or used.       |
| `declaracaoImportacao/adicao/ipiAliquotaAdValorem` | `ipi_aliquot`                | Ad valorem aliquot for IPI.                                               | Present in XML, but not currently parsed or used.       |
| `declaracaoImportacao/adicao/pisPasepAliquotaAdValorem` | `pis_aliquot`                | Ad valorem aliquot for PIS.                                               | Present in XML, but not currently parsed or used.       |
| `declaracaoImportacao/adicao/cofinsAliquotaAdValorem` | `cofins_aliquot`             | Ad valorem aliquot for COFINS.                                            | Present in XML, but not currently parsed or used.       |
| `declaracaoImportacao/adicao/icms`               | `icms_details`               | ICMS specific details (complex structure, not parsed).                    | Present in XML, but not currently parsed or used.       |

## 5. Current Parsing Logic

The `backend/parsers/xml_parser.py` module uses the `xmltodict` library to parse the XML content.
*   It converts the XML structure into nested Python dictionaries.
*   It navigates through the dictionary to extract specific header-level information (`numeroDI`, `dataRegistro`) and item-level information within `adicao` and `mercadoria` elements.
*   It flattens the structure by including DI and Adicao details in each item dictionary.
*   It performs basic error handling for XML parsing failures and structural issues.

## 6. Proposed Improvements

To enhance robustness, maintainability, and enable more advanced features like tax calculation validation, consider the following improvements:

### 6.1. Schema Validation

*   **Define XSD:** Obtain or create a formal XML Schema Definition (XSD) that precisely defines the structure, elements, attributes, and data types of the DI XML.
*   **Implement Validation:** Use a library like `lxml` with `etree.XMLSchema` to validate the input XML against the XSD *before* or *during* parsing. This ensures the XML conforms to the expected standard, catching errors early.

### 6.2. Namespace Resolution

*   If the DI XML structure evolves to include namespaces (e.g., `xmlns="http://www.example.com"`), ensure the parser can correctly handle them. Libraries like `lxml` and `xmltodict` (with appropriate configuration) support namespace resolution.

### 6.3. Element/Attribute Mapping with Data Classes

*   **Implement Mappers:** Instead of relying solely on dictionary lookups from `xmltodict`, define Python classes (e.g., using `pydantic`) to represent the structure of the header and item data.
*   **Benefits:**
    *   **Type Safety:** Ensures data types are correctly handled.
    *   **Clear Structure:** Makes the code more readable and maintainable.
    *   **Built-in Validation:** `pydantic` models offer powerful data validation capabilities.
    *   **Reduced Errors:** Maps XML elements directly to typed attributes, reducing errors from key typos or missing fields.

### 6.4. Develop Robust Parser

*   **Transition to `lxml`:** Consider migrating from `xmltodict` to `lxml` for parsing. `lxml` is generally faster, more memory-efficient, and offers superior support for XSD validation and XPath querying, which is more robust for navigating complex XML structures than dictionary key access.
*   **XPath for Extraction:** Use XPath expressions with `lxml` to precisely target and extract data, making the parser more resilient to minor structural changes in the XML.

By implementing these suggestions, the XML parsing and data extraction process will become more robust, secure, and easier to maintain, especially as the complexity of the DI XML or the application's requirements grow.
