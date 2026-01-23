import xmltodict
from typing import List, Dict, Any, Tuple

def parse_di_xml(xml_content: bytes) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Parses the DI XML content, separating header info from the list of items.
    
    Returns:
        A tuple containing:
        - A dictionary with header-level information.
        - A list of dictionaries, each representing a single 'Mercadoria' (Item).
    """
    try:
        xml_str = xml_content.decode('utf-8', errors='ignore')
        start_idx = xml_str.find('<')
        if start_idx == -1:
             raise ValueError("No XML tag found")
        xml_str = xml_str[start_idx:]
        
        parsed = xmltodict.parse(xml_str)
    except Exception as e:
        raise ValueError(f"Failed to parse XML: {e}")

    root = parsed.get('ListaDeclaracoes', {}).get('declaracaoImportacao', {})
    if not root:
        root = parsed.get('declaracaoImportacao', {})
    
    if not root:
        raise ValueError("Invalid DI XML structure: 'declaracaoImportacao' not found.")

    adicoes = root.get('adicao', [])
    if isinstance(adicoes, dict):
        adicoes = [adicoes]

    # Extract header-level info
    header_info = {
        'di_number': root.get('numeroDI'),
        'di_date': root.get('dataRegistro'),
        'frete_total': root.get('freteTotalReais'),
        'seguro_total': root.get('seguroTotalReais'),
        # Assume exporter is the 'fornecedor' of the first 'adicao'
        'exporter_name': adicoes[0].get('fornecedorNome') if adicoes else None
    }
    
    items = []
    for adicao in adicoes:
        adicao_number = adicao.get('numeroAdicao')
        ncm = adicao.get('dadosMercadoriaCodigoNcm')
        
        mercadorias = adicao.get('mercadoria', [])
        if isinstance(mercadorias, dict):
            mercadorias = [mercadorias]
            
        for mercadoria in mercadorias:
            item = {
                'adicao_number': adicao_number,
                'ncm': ncm,
                'description': mercadoria.get('descricaoMercadoria'),
                'qty_commercial': mercadoria.get('quantidade'),
                'unit_commercial': mercadoria.get('unidadeMedida'),
                'unit_value': mercadoria.get('valorUnitario'),
                'total_value': adicao.get('valorTotalCondicaoVenda'),
            }
            items.append(item)
            
    return header_info, items
