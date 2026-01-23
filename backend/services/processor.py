from typing import Dict, List, Any
import pandas as pd
from backend.parsers.xml_parser import parse_di_xml
from backend.parsers.xlsx_parser import parse_mapping_xlsx
from backend.formatters.txt_builder import build_txt_content

def process_file_data(xml_content: bytes, xlsx_content: bytes) -> str:
    """
    Orchestrates the conversion process.
    1. Parse XML
    2. Parse XLSX
    3. Merge Data
    4. Generate TXT
    """
    
    # 1. Parse Inputs
    xml_header, xml_items = parse_di_xml(xml_content)
    mapping, xlsx_header = parse_mapping_xlsx(xlsx_content)
    
    processed_items = []
    errors = []
    
    # 2. Merge Loop
    for idx, item in enumerate(xml_items):
        ncm = item.get('ncm')
        # Try exact match first
        mapped_info = mapping.get(ncm)
        
        if not mapped_info:
            errors.append(f"Item {idx+1} (Adicao {item.get('adicao_number')}): NCM {ncm} not found in Excel mapping.")
            continue
            
        internal_code = mapped_info.get('internal_code')
        if not internal_code or internal_code == 'nan':
             errors.append(f"Item {idx+1}: NCM {ncm} found, but 'Codigo Produto Interno' is empty.")
             continue
             
        # Enrich item
        item['internal_code'] = internal_code
        item['output_unit'] = mapped_info.get('output_unit') or item.get('unit_commercial')
        item['cfop'] = mapped_info.get('cfop')
        
        processed_items.append(item)
        
    if errors:
        raise ValueError("Mapping Errors:\n" + "\n".join(errors))

    # 3. Build TXT
    # Header data is a mix from XML and the XLSX header part
    header_data = {
        'di_number': xml_header.get('di_number'),
        'di_date': xml_header.get('di_date'),
        'exporter_name': xml_header.get('exporter_name'),
        'valor_total_frete': xml_header.get('frete_total'),
        'valor_total_seguro': xml_header.get('seguro_total'),
        
        # These still come from the Excel file
        'numero_nota': xlsx_header.get('numero_nota'),
        'data_emissao': xlsx_header.get('data_emissao'),
        'data_entrada': xlsx_header.get('data_entrada'),
    }
    
    txt_content = build_txt_content(header_data, processed_items)
    return txt_content
