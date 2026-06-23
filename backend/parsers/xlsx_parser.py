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
            
        def get_col_val(col_names: list) -> str:
            for col in col_names:
                if col in row:
                    val = row[col]
                    return str(val).strip() if pd.notna(val) else ""
            return ""

        mapping[ncm] = {
            "internal_code": get_col_val(["Codigo Produto Interno (Obrigatorio)", "Codigo Produto Interno"]),
            "output_unit": get_col_val(["Unidade Saida (Opcional)", "Unidade Saida"]),
            "cfop": get_col_val(["CFOP (Obrigatorio)", "CFOP"])
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
                "cfop": get_val("CFOP Predominante (Obrigatorio)"),
                "numero_po": get_val("Numero do PO (Opcional)"),
                "numero_pedido": get_val("Numero do Pedido Easy (Opcional)"),
                "especie": get_val("Especie NF (Opcional)"),
                "serie": get_val("Serie NF (Opcional)"),
                "perc_reducao": get_val("Perc Reducao ICMS (Opcional)"),
                "cod_importador": get_val("Codigo Importador (Opcional)"),
                "cod_transportador": get_val("Codigo Transportador (Opcional)"),
                "cod_exportador": get_val("Codigo Exportador (Opcional)"),
                "mv_eic0010_source": get_val("MV_EIC0010 Origem ICMS (HEADER/ITEMS)") or "ITEMS",
                "aliq_icms_capa": get_val("Aliq ICMS CAPA (Opcional)"),
                "mv_eic0076_mode": get_val("MV_EIC0076 Modo (STANDARD_15/FIELD_WIDTH)") or "STANDARD_15",
                "uf_emitente": get_val("UF Emitente (Opcional)") or "AM",
                # Compat with older template versions if needed, but we prioritize the new names
                "valor_frete": get_val("Valor Frete Total (Opcional)"),
                "valor_seguro": get_val("Valor Seguro Total (Opcional)"),
                "nome_exportador": get_val("Nome Exportador (Opcional)")
            }

    return mapping, header_data
