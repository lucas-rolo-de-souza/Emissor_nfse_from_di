"""
TXT Parser for Nota Fiscal 2 Layout.
Parses fixed-width TXT files back to structured data.
"""

from typing import Dict, List, Any, Tuple


def parse_header(line: str) -> Dict[str, Any]:
    """Parse header record (type 1, 380 chars)."""
    if len(line) < 380:
        raise ValueError(f"Header line too short: {len(line)} chars, expected 380")
    
    return {
        'tipo': line[0:1].strip(),
        'empresa': line[1:3].strip(),
        'filial': line[3:5].strip(),
        'numero_nota': line[5:14].strip().lstrip('0') or '0',
        'aliq_icms': line[20:27].strip(),
        'cfop': line[27:33].strip().lstrip('0') or '',
        'cgc_emitente': line[38:52].strip(),
        'numero_processo': line[55:72].strip(),
        'qtd_itens': line[72:74].strip().lstrip('0') or '0',
        'data_referencia': line[74:80].strip(),
        'data_emissao': line[80:88].strip(),
        'data_entrada': line[88:96].strip(),
        'data_di': line[102:110].strip(),
        'entrada_saida': line[112:113].strip(),
        'especie': line[113:116].strip(),
        'flag_entrada': line[118:119].strip(),
        'numero_di': line[119:129].strip(),
        'serie': line[129:132].strip(),
        'uf_emitente': line[144:146].strip(),
        'via_transporte': line[146:147].strip(),
        'valor_frete': line[147:162].strip(),
        'valor_icms': line[162:177].strip(),
        'valor_base_icms': line[177:192].strip(),
        'cod_importador': line[192:196].strip(),
        'cod_transportador': line[196:216].strip(),
        'valor_seguro': line[216:231].strip(),
        'valor_ipi': line[231:246].strip(),
        'valor_total_mercadoria': line[246:261].strip(),
        'valor_total_nota': line[261:276].strip(),
        'valor_base_ipi': line[276:291].strip(),
        'cod_exportador': line[293:297].strip(),
        'nome_exportador': line[297:357].strip(),
        'numero_po': line[357:374].strip(),
        'perc_reducao': line[374:380].strip(),
    }


def parse_item(line: str, index: int) -> Dict[str, Any]:
    """Parse item record (type 2, 696 chars)."""
    if len(line) < 688:
        raise ValueError(f"Item line {index} too short: {len(line)} chars, expected 688+")
    
    return {
        'tipo': line[0:1].strip(),
        'empresa': line[1:3].strip(),
        'filial': line[3:5].strip(),
        'numero_nota': line[5:14].strip().lstrip('0') or '0',
        'num_lancamento': line[14:20].strip(),
        'ncm': line[20:30].strip(),
        'cod_produto': line[30:50].strip(),
        'trib_icms': line[50:51].strip(),
        'trib_ipi': line[51:52].strip(),
        'num_item': line[52:54].strip(),
        'quantidade': line[54:65].strip(),
        'unidade': line[65:68].strip(),
        'valor_ipi': line[68:83].strip(),
        'valor_mercadoria': line[83:98].strip(),
        'flag_entrada': line[98:99].strip(),
        'qtd_recebimento': line[99:110].strip(),
        'descricao': line[110:260].strip(),
        'valor_fob': line[260:275].strip(),
        'valor_frete': line[275:290].strip(),
        'valor_seguro': line[290:305].strip(),
        'valor_ii': line[305:320].strip(),
        'aliq_ipi': line[320:325].strip(),
        'valor_despesas': line[325:340].strip(),
        'num_processo_easy': line[340:357].strip(),
        'ex_ncm': line[357:360].strip(),
        'num_invoice': line[360:375].strip(),
        'icms_recolher': line[375:390].strip(),
        'peso_liquido': line[390:401].strip(),
        'item_pedido': line[401:405].strip(),
        'aliq_ii': line[405:410].strip(),
        'num_pedido': line[410:427].strip(),
        'num_pli': line[427:437].strip(),
        'serie': line[437:440].strip(),
        'base_icms': line[440:455].strip(),
        'valor_fob_origem': line[455:470].strip(),
        'aliq_pis': line[470:476].strip(),
        'vlr_qtde_pis': line[476:485].strip(),
        'base_pis': line[485:500].strip(),
        'valor_pis': line[500:515].strip(),
        'aliq_cofins': line[515:521].strip(),
        'vlr_qtde_cofins': line[521:530].strip(),
        'base_cofins': line[530:545].strip(),
        'valor_cofins': line[545:560].strip(),
        'num_adicao': line[560:563].strip(),
        'seq_item': line[563:566].strip(),
        'valor_desconto': line[566:581].strip(),
        'valor_iof': line[581:596].strip(),
        'despesas_aduaneiras': line[596:611].strip(),
        'aliq_esp_ipi': line[611:626].strip(),
        'qtde_ipi': line[626:637].strip(),
        'qtde_pis': line[637:648].strip(),
        'qtde_cofins': line[648:659].strip(),
        'lote': line[659:669].strip(),
        'validade': line[669:677].strip(),
        'aliq_icms': line[677:682].strip(),
        'aliq_maj_cofins': line[682:688].strip(),
    }


def parse_txt_content(content: bytes) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Parse TXT file content into header and items.
    
    Args:
        content: Raw bytes of the TXT file
        
    Returns:
        Tuple of (header_dict, list_of_item_dicts)
    """
    # Decode and split by CR (per specification)
    text = content.decode('utf-8', errors='replace')
    lines = text.split('\r')
    
    header = None
    items = []
    
    for idx, line in enumerate(lines):
        # Clean up any leading newlines from previous CR
        line = line.lstrip('\n')
        if not line:
            continue
            
        record_type = line[0] if line else ''
        
        if record_type == '1':
            header = parse_header(line)
        elif record_type == '2':
            items.append(parse_item(line, idx))
    
    if header is None:
        raise ValueError("No header record (type 1) found in file")
    
    return header, items
