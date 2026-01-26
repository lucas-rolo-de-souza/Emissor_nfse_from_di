# Project Overview: Emissor NFSe from DI

## 1. Introduction

**Emissor NFSe from DI** is a specialized automation tool designed to streamline the issuance of Import Notes (Notas Fiscais de Entrada de Importação). It bridges the gap between federal import documents (Declaração de Importação - DI) and the internal ERP/Accounting systems that require a specific fixed-width text format for ingestion (SIGAEIC / Nota Fiscal 2 layout).

## 2. The Problem

Import processes involve complex federal documents (DI) containing hundreds of fields (taxes, freight, merchandise details). Manually typing this data into an ERP to generate a Nota Fiscal is error-prone and time-consuming. Additionally, the federal PDF/XML often lacks internal company data (like internal Product Codes or specific CFOPs) required by the target ERP.

## 3. The Solution

This application provides a simple web interface to:

1.  **Parse** the official DI XML file to extract all relevant import data.
2.  **Enrich** the data using an Excel template, allowing the user to map federal NCM codes to internal Item Codes and define logic for fields absent in the XML.
3.  **Generate** a strictly formatted TXT file (Layout Nota Fiscal 2) ready for immediate import into the ERP.

## 4. Key Workflows

- **Upload**: Drag-and-drop the DI XML and the Mapping XLSX.
- **Validation**: parsing logic checks for consistency and missing mappings.
- **Export**: Generates a standard `.txt` file with "Header" and "Item" records formatted to the exact character width required by the legacy import system.

## 5. Target Audience

- Import/Export Analysts.
- Accounting Departments handling Import processes.
- Developers maintaining ERP integrations.

## 6. Official References

This project relies on the official file specifications provided by Receita Federal for **Siscomex Importação Web**.

- **Main Documentation Page**: [Links para Arquivos - Siscomex Importação](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos)

### Key Specifications used:

1.  **Input Format (XML)**:
    - [Esquema (XSD) do XML da Consulta](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/esquema-xsd-do-xml-da-consulta.pdf)
    - [Dicionário de Dados do XML da Consulta](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/dicionario-de-dados-do-xml-da-consulta)

2.  **Data Definitions**:
    - [Dicionário de Dados da DI](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/dicionario-de-dados-da-di.doc)
    - [Dicionário de Dados da Adição](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/dicionario-de-dados-da-adicao.doc)
