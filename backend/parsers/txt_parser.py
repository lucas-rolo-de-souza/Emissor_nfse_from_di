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


def parse_item(line: str, index: int, strict: bool = False) -> Dict[str, Any]:
    """Parse item record (type 2, 717 chars)."""
    if strict and len(line) != 717:
        raise ValueError(f"Item line {index} invalid length: {len(line)} chars, expected exactly 717")

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
        'quantidade': line[54:66].strip(),
        'unidade': line[66:69].strip(),
        'valor_ipi': line[69:84].strip(),
        'valor_mercadoria': line[84:99].strip(),
        'flag_entrada': line[99:100].strip(),
        'qtd_recebimento': line[100:111].strip(),
        'descricao': line[111:261].strip(),
        'valor_fob': line[261:276].strip(),
        'valor_frete': line[276:291].strip(),
        'valor_seguro': line[291:306].strip(),
        'valor_ii': line[306:321].strip(),
        'aliq_ipi': line[321:326].strip(),
        'valor_despesas': line[326:341].strip(),
        'num_processo_easy': line[341:358].strip(),
        'ex_ncm': line[358:361].strip(),
        'num_invoice': line[361:376].strip(),
        'icms_recolher': line[376:391].strip(),
        'peso_liquido': line[391:402].strip(),
        'item_pedido': line[402:406].strip(),
        'aliq_ii': line[406:411].strip(),
        'num_pedido': line[411:428].strip(),
        'num_pli': line[428:438].strip().replace('*', ''),
        'serie': line[438:441].strip(),
        'base_icms': line[441:456].strip(),
        'valor_fob_origem': line[456:471].strip(),
        'aliq_pis': line[471:477].strip(),
        'vlr_qtde_pis': line[477:486].strip(),
        'base_pis': line[486:501].strip(),
        'valor_pis': line[501:516].strip(),
        'aliq_cofins': line[516:522].strip(),
        'vlr_qtde_cofins': line[522:531].strip(),
        'base_cofins': line[531:546].strip(),
        'valor_cofins': line[546:561].strip(),
        'num_adicao': line[561:564].strip(),
        'seq_item': line[564:567].strip(),
        'valor_desconto': line[567:582].strip(),
        'valor_iof': line[582:597].strip(),
        'despesas_aduaneiras': line[597:612].strip(),
        'aliq_esp_ipi': line[612:627].strip(),
        'qtde_ipi': line[627:638].strip(),
        'qtde_pis': line[638:649].strip(),
        'qtde_cofins': line[649:660].strip(),
        'lote': line[660:670].strip(),
        'validade': line[670:678].strip(),
        'aliq_icms': line[678:683].strip(),
        'aliq_maj_cofins': line[683:689].strip(),
        'perc_dif_icms': line[689:697].strip() if len(line) >= 697 else '',
        'codigo_li': (line[697:707].strip() if len(line) >= 707 else '').replace('*', ''),
        'codigo_li_substitutiva': (line[707:717].strip() if len(line) >= 717 else '').replace('*', ''),
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
