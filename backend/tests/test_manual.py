import sys
import os
import pandas as pd
import io

# No sys.path hacks needed if run as module from root
from backend.services.processor import process_file_data

def test_manual():
    # 1. Load Real XML
    # Path relative to where we run the command (project root)
    with open('format_guidelines/Eletra.xml', 'rb') as f:
        xml_content = f.read()
        
    # 2. Create Mock Excel
    # We need to map the NCMs found in Eletra.xml
    # Sample NCMs from view_file: 85044090, 85364100, etc.
    
    data = [
        {"Codigo NCM (XML)": "85044090", "Codigo Produto Interno (Obrigatorio)": "PROD-001", "Unidade Saida (Opcional)": "UN", "CFOP (Obrigatorio)": "3101"},
        {"Codigo NCM (XML)": "85364100", "Codigo Produto Interno (Obrigatorio)": "PROD-002", "Unidade Saida (Opcional)": "", "CFOP (Obrigatorio)": "3102"},
        {"Codigo NCM (XML)": "85369090", "Codigo Produto Interno (Obrigatorio)": "PROD-003", "Unidade Saida (Opcional)": "PC", "CFOP (Obrigatorio)": "3103"},
        {"Codigo NCM (XML)": "85414111", "Codigo Produto Interno (Obrigatorio)": "PROD-004", "Unidade Saida (Opcional)": "", "CFOP (Obrigatorio)": "3101"},
        {"Codigo NCM (XML)": "85444200", "Codigo Produto Interno (Obrigatorio)": "PROD-005", "Unidade Saida (Opcional)": "", "CFOP (Obrigatorio)": "3101"},
        {"Codigo NCM (XML)": "90289010", "Codigo Produto Interno (Obrigatorio)": "PROD-006", "Unidade Saida (Opcional)": "", "CFOP (Obrigatorio)": "3101"},
        {"Codigo NCM (XML)": "85176272", "Codigo Produto Interno (Obrigatorio)": "PROD-007", "Unidade Saida (Opcional)": "", "CFOP (Obrigatorio)": "3101"},
        {"Codigo NCM (XML)": "85367000", "Codigo Produto Interno (Obrigatorio)": "PROD-008", "Unidade Saida (Opcional)": "", "CFOP (Obrigatorio)": "3101"},
        {"Codigo NCM (XML)": "90283031", "Codigo Produto Interno (Obrigatorio)": "PROD-009", "Unidade Saida (Opcional)": "", "CFOP (Obrigatorio)": "3101"}
    ]
    
    df = pd.DataFrame(data)
    
    # Save to bytes
    xlsx_buffer = io.BytesIO()
    with pd.ExcelWriter(xlsx_buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Itens', index=False)
        
    xlsx_content = xlsx_buffer.getvalue()
    
    print(">>> Starting Process...")
    try:
        result = process_file_data(xml_content, xlsx_content)
        print(">>> SUCCESS! Result Preview (First 500 chars):")
        print(result[:500])
        print("...")
    except Exception as e:
        print(f">>> ERROR: {e}")

if __name__ == "__main__":
    test_manual()
