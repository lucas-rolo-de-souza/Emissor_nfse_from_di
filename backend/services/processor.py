from typing import Dict, List, Any
import pandas as pd
from backend.parsers.xml_parser import parse_di_xml
from backend.parsers.xlsx_parser import parse_mapping_xlsx
from backend.formatters.txt_builder import build_txt_content

def _flatten_item(adicao: dict, item: dict, header_data: dict) -> dict:
    qty = float(item.get('qty') or 0.0)
    unit_val = float(item.get('unit_value') or 0.0)
    fob_reais = float(adicao.get('fob_reais') or 0.0)
    frete_item = float(adicao.get('freight_reais') or 0.0)
    seguro_item = float(adicao.get('insurance_reais') or 0.0)
    valor_ii = float(adicao['taxes']['ii']['value_due'] or 0.0)
    valor_ipi = float(adicao['taxes']['ipi']['value_due'] or 0.0)
    valor_pis = float(adicao['taxes']['pis']['value_collect'] or 0.0)
    valor_cofins = float(adicao['taxes']['cofins']['value_collect'] or 0.0)
    aliq_icms = float(adicao['taxes']['icms']['rate'] or 0.0)

    # Field 14 spec: Valor Mercadoria = CIF + II
    cif = fob_reais + frete_item + seguro_item
    total_value = cif + valor_ii

    # ICMS base "por dentro": (CIF+II+IPI+PIS+COFINS) / (1 - aliq%)
    pre_icms = cif + valor_ii + valor_ipi + valor_pis + valor_cofins
    base_icms = 0.0 if aliq_icms == 0 else pre_icms / (1 - aliq_icms / 100)

    return {
        'adicao_number': adicao.get('number', ''),
        'ncm': adicao.get('ncm', ''),
        'description': item.get('description', ''),
        'qty_commercial': qty,
        'unit_commercial': item.get('unit', ''),
        'unit_value': unit_val,
        'total_value': total_value,
        'item_sequence': item.get('sequence', ''),
        'net_weight': float(adicao.get('net_weight') or 0.0),
        'li_number': adicao.get('li_number', ''),
        'frete_item': frete_item,
        'seguro_item': seguro_item,
        'invoice_number': item.get('invoice_number') or header_data.get('invoice_number', ''),
        'di_number': header_data.get('di_number', ''),
        'numero_processo': header_data.get('numero_processo', ''),
        'fob_reais': fob_reais,
        'fob_currency': float(adicao.get('fob_currency') or 0.0),
        'item_pedido_compra': str(item.get('sequence', '')).zfill(4)[:4],
        'numero_pedido': header_data.get('numero_pedido', '') or header_data.get('numero_po', ''),
        # II
        'aliq_ii': float(adicao['taxes']['ii']['rate'] or 0.0),
        'valor_ii': valor_ii,
        'base_ii': float(adicao['taxes']['ii']['base_calc'] or 0.0),
        # PIS
        'aliq_pis': float(adicao['taxes']['pis']['rate'] or 0.0),
        'base_pis': float(adicao['taxes']['pis']['base_calc'] or 0.0),
        'valor_pis': valor_pis,
        'qtde_pis': qty,
        # COFINS
        'aliq_cofins': float(adicao['taxes']['cofins']['rate'] or 0.0),
        'base_cofins': float(adicao['taxes']['cofins']['base_calc'] or 0.0),
        'valor_cofins': valor_cofins,
        'qtde_cofins': qty,
        # IPI
        'aliq_ipi': float(adicao['taxes']['ipi']['rate'] or 0.0),
        'valor_ipi': valor_ipi,
        'base_ipi': float(adicao['taxes']['ipi']['base_calc'] or 0.0),
        'aliq_esp_ipi': 0.0,
        'qtde_ipi': qty,
        # ICMS
        'aliq_icms': aliq_icms,
        'base_icms': base_icms,
        'valor_icms_recolher': float(adicao['taxes']['icms']['value_collect'] or 0.0),
        # Costs
        'valor_desconto': 0.0,
        'valor_iof': 0.0,
        'despesas_aduaneiras': 0.0,
        # Logistics
        'lote': '',
        'validade': '',
        'perc_dif_icms': 0.0,
        # LI codes
        'codigo_li': adicao.get('codigo_li', ''),
        'codigo_li_substitutiva': adicao.get('codigo_li_substitutiva', ''),
        # User-provided
        'internal_code': item.get('internal_code', ''),
        'output_unit': item.get('output_unit', ''),
        'cfop': item.get('cfop') or header_data.get('cfop'),
    }

def process_file_data(xml_content: bytes, xlsx_content: bytes) -> str:
    """
    Orchestrates the conversion process.
    1. Parse XML
    2. Parse XLSX
    3. Merge Data
    4. Generate TXT
    """
    # 1. Parse Inputs
    xml_header, xml_adicoes = parse_di_xml(xml_content)
    mapping, xlsx_header = parse_mapping_xlsx(xlsx_content)
    
    # Header data is a mix from XML and the XLSX header part
    header_data = {
        'di_number': xml_header.get('di_number'),
        'di_date': xml_header.get('di_date'),
        'exporter_name': xml_header.get('exporter_name'),
        'valor_total_frete': xml_header.get('frete_total'),
        'valor_total_seguro': xml_header.get('seguro_total'),
        'importer_uf': xml_header.get('importer_uf'),
        
        # These come from the Excel file
        'numero_nota': xlsx_header.get('numero_nota'),
        'data_emissao': xlsx_header.get('data_emissao'),
        'data_entrada': xlsx_header.get('data_entrada'),
        'cfop': xlsx_header.get('cfop'),
        'numero_po': xlsx_header.get('numero_po'),
        'perc_reducao': xlsx_header.get('perc_reducao'),
        'cod_importador': xlsx_header.get('cod_importador') or xml_header.get('importer_code'),
        'cod_transportador': xlsx_header.get('cod_transportador') or xml_header.get('transport_code'),
        'cod_exportador': xlsx_header.get('cod_exportador') or xml_header.get('exporter_name'),
        'numero_processo': xlsx_header.get('numero_processo') or '',
        'numero_pedido': xlsx_header.get('numero_pedido', ''),
        'especie': xlsx_header.get('especie', ''),
        'serie': xlsx_header.get('serie', ''),
        'via_transporte': xml_header.get('transport_via', '1'),
        'mv_eic0010_source': xlsx_header.get('mv_eic0010_source', 'ITEMS') or 'ITEMS',
        'aliq_icms_capa': xlsx_header.get('aliq_icms_capa'),
        'mv_eic0076_mode': xlsx_header.get('mv_eic0076_mode', 'STANDARD_15') or 'STANDARD_15',
        'uf_emitente': xlsx_header.get('uf_emitente', 'AM') or 'AM',
    }
    
    processed_items = []
    errors = []
    
    # 2. Merge Loop
    for idx_ad, adicao in enumerate(xml_adicoes):
        ncm = adicao.get('ncm')
        # Try exact match first
        mapped_info = mapping.get(ncm)
        
        if not mapped_info:
            errors.append(f"Adicao {adicao.get('number')}: NCM {ncm} not found in Excel mapping.")
            continue
            
        internal_code = mapped_info.get('internal_code')
        if not internal_code or internal_code == 'nan':
            errors.append(f"Adicao {adicao.get('number')}: NCM {ncm} found, but 'Codigo Produto Interno' is empty.")
            continue
            
        for item in adicao.get('items', []):
            item_enriched = {
                **item,
                'internal_code': internal_code,
                'output_unit': mapped_info.get('output_unit') or item.get('unit'),
                'cfop': mapped_info.get('cfop') or header_data.get('cfop'),
            }
            flat_item = _flatten_item(adicao, item_enriched, header_data)
            processed_items.append(flat_item)
        
    if errors:
        raise ValueError("Mapping Errors:\n" + "\n".join(errors))

    # 3. Build TXT
    txt_content = build_txt_content(header_data, processed_items)
    return txt_content
