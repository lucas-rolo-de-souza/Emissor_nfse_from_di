import pandas as pd
import io
from typing import Dict, Any, Tuple

def parse_mapping_xlsx(xlsx_content: bytes) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Any]]:
    """
    Parses the Excel mapping file.
    Expects sheets named 'Itens' and 'Cabecalho'.
    
    Returns:
        Tuple containing:
        1. Mapping Dict: Key = 'Codigo NCM (XML)', Value = Item Data
        2. Header Dict: Global Invoice Data (Dates, Exporter, etc.)
    """
    try:
        # Load the whole workbook to check sheets
        xls = pd.ExcelFile(io.BytesIO(xlsx_content))
    except ValueError:
        raise ValueError("Invalid Excel file.")

    # --- Parse Items ---
    if 'Itens' not in xls.sheet_names:
        raise ValueError("Missing sheet 'Itens' in Excel file.")
        
    df_items = pd.read_excel(xls, sheet_name='Itens')
    mapping = {}
    
    if "Codigo NCM (XML)" not in df_items.columns:
        raise ValueError("Missing column 'Codigo NCM (XML)' in sheet 'Itens'.")

    for _, row in df_items.iterrows():
        ncm = str(row["Codigo NCM (XML)"]).strip()
        if not ncm or ncm.lower() == 'nan':
            continue
            
        mapping[ncm] = {
            "internal_code": str(row.get("Codigo Produto Interno (Obrigatorio)", "")).strip(),
            "output_unit": str(row.get("Unidade Saida (Opcional)", "")).strip(),
            "cfop": str(row.get("CFOP (Obrigatorio)", "")).strip()
        }

    # --- Parse Header ---
    header_data = {}
    if 'Cabecalho' in xls.sheet_names:
        df_header = pd.read_excel(xls, sheet_name='Cabecalho')
        if not df_header.empty:
            # Assume first row has data
            row = df_header.iloc[0]
            
            # Helper to safe get string
            def get_val(col):
                val = row.get(col)
                return str(val).strip() if pd.notna(val) else ""

            header_data = {
                "numero_nota": get_val("Numero da Nota (Obrigatorio)"),
                "data_emissao": get_val("Data Emissao (DD/MM/AAAA)"),
                "data_entrada": get_val("Data Entrada (DD/MM/AAAA)"),
                "valor_frete": get_val("Valor Frete Total (Opcional)"),
                "valor_seguro": get_val("Valor Seguro Total (Opcional)"),
                "nome_exportador": get_val("Nome Exportador (Opcional)")
            }

    return mapping, header_data
