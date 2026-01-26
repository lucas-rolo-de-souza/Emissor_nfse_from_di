from typing import Dict, List, Any
from datetime import datetime

class FixedWidth:
    @staticmethod
    def format_num(value, width, decimals):
        """Right-aligned numeric with leading zeros and dot."""
        try:
            val_float = float(value)
        except:
            val_float = 0.0
        
        # Format string
        s = f"{val_float:.{decimals}f}"
        
        # Split
        if '.' in s:
            parts = s.split('.')
            integer_part = parts[0]
            decimal_part = parts[1]
        else:
            integer_part = s
            decimal_part = "0" * decimals
        
        # Max Integer Length = Width - 1 (dot) - decimals
        max_int_len = width - 1 - decimals
        
        integer_part = integer_part.zfill(max_int_len)
        decimal_part = decimal_part[:decimals].ljust(decimals, '0')
        
        # Strict truncation to width if needed (though zfill handles left)
        res = f"{integer_part}.{decimal_part}"
        return res[-width:] # Ensure we don't exceed width if overflow

    @staticmethod
    def format_alpha(value, width):
        """Left-aligned string with trailing spaces."""
        s = str(value if value is not None else "")
        return s[:width].ljust(width)

def build_txt_content(header_data: Dict, items_data: List[Dict]) -> str:
    lines = []
    
    # Defaults / Extraction
    now_dt = datetime.now()
    default_date_8 = now_dt.strftime("%d%m%Y") # DDMMYYYY
    
    # --- HEADER (RECORD 1) ---
    # Mappings from spec
    rec_type = "1"
    emp = "01"
    fil = "01"
    
    # Note Number: 
    # Validates input, keeps digits, max 9.
    note_num_raw = header_data.get('numero_nota') or header_data.get('di_number', '000000325')
    note_num = ''.join(filter(str.isdigit, str(note_num_raw)))[:9].zfill(9) 
    
    # Helper for Int strings
    def fmt_int(v, w): return str(v).zfill(w)
    def fmt_str(v, w): return str(v)[:w].ljust(w)
    def fmt_val(v, w, d): return FixedWidth.format_num(v, w, d)
    
    def sanitize_date(val, default):
        # Expects DD/MM/AAAA or DDMMYYYY. Returns DDMMYYYY
        s = ''.join(filter(str.isdigit, str(val)))
        if len(s) == 8:
            return s
        return default

    # Dates
    dt_emissao = sanitize_date(header_data.get('data_emissao'), default_date_8)
    dt_entrada = sanitize_date(header_data.get('data_entrada'), default_date_8)
    dt_di      = sanitize_date(header_data.get('di_date'), default_date_8)

    h_line = ""
    # 01 Tipo (A, 1)
    h_line += fmt_str("1", 1)  
    # 02 Emp (N, 2)
    h_line += fmt_int("01", 2)
    # 03 Filial (N, 2)
    h_line += fmt_int("01", 2)
    # 04 Nota (N, 9)
    h_line += fmt_int(note_num, 9)
    # 05 Filler (A, 6)
    h_line += fmt_str("", 6)
    # 06 Aliq ICMS (N, 7, 2)
    h_line += fmt_val(0, 7, 2)
    # 07 CFOP (N, 6)
    # Use explicit header field if available, else default to '3101'
    cfop_val = header_data.get('cfop') or '3101'
    h_line += fmt_int(cfop_val, 6)
    # 08 CFP (A, 5)
    h_line += fmt_str("", 5)
    # 09 CGC Emitente (N, 14)
    h_line += fmt_int(header_data.get('cod_importador', ''), 14)
    # 10 Cod IPI (A, 3)
    h_line += fmt_str("", 3)
    # 11 Processo/Desembaraco (A, 17) -> Mandatory field in layout
    h_line += fmt_str("", 17)
    # 12 Qty Itens (N, 2)
    h_line += fmt_int(len(items_data), 2)
    # 13 Data Ref (N, 6)
    h_line += fmt_int(now_dt.strftime("%m%Y"), 6)
    # 14 Data Emissao (N, 8)
    h_line += fmt_int(dt_emissao, 8)
    # 15 Data Entrada (N, 8)
    h_line += fmt_int(dt_entrada, 8)
    # 16 Filler (A, 6)
    h_line += fmt_str("", 6)
    # 17 Data DI (N, 8)
    h_line += fmt_int(dt_di, 8)
    # 18 Filler (A, 2)
    h_line += fmt_str("", 2)
    # 19 Ent/Sai (A, 1)
    h_line += fmt_str("E", 1)
    # 20 Especie (A, 3)
    h_line += fmt_str("NFE", 3)
    # 21 Flag Canc (A, 1) - Blank per request
    h_line += fmt_str(" ", 1)
    # 22 Filler (1)
    h_line += fmt_str("", 1)
    # 23 Flag Ent (A, 1)
    h_line += fmt_str("I", 1)
    # 24 Num DI (A, 10)
    h_line += fmt_str(header_data.get('di_number', ''), 10)
    # 25 Serie (A, 3)
    h_line += fmt_str("1", 3)
    # 26 CST (2)
    h_line += fmt_str("", 2) 
    # 27 Sit Trib E (5)
    h_line += fmt_str("", 5)
    # 28 Sit Trib F (5)
    h_line += fmt_str("", 5)
    # 29 UF (2)
    h_line += fmt_str("EX", 2)
    # 30 Via (1)
    h_line += fmt_int("1", 1)
    # 31 Frete (15, 2)
    h_line += fmt_val(header_data.get('valor_total_frete', 0), 15, 2)
    # 32 ICMS (15, 2)
    h_line += fmt_val(0, 15, 2)
    # 33 Base ICMS (15, 2)
    h_line += fmt_val(0, 15, 2)
    # 34 Cod Importador (A, 4) -> New
    h_line += fmt_str(header_data.get('cod_importador', ''), 4)
    # 35 Cod Transportador (A, 20) -> New
    h_line += fmt_str(header_data.get('cod_transportador', ''), 20)
    # 36 Seguro (15, 2)
    h_line += fmt_val(header_data.get('valor_total_seguro', 0), 15, 2)
    # 37 IPI (15, 2)
    h_line += fmt_val(0, 15, 2)
    # 38 Total Merc (15, 2)
    def safe_float(x):
        try:
            return float(x)
        except:
            return 0.0

    total_merc = sum(safe_float(i.get('total_value')) for i in items_data)
    h_line += fmt_val(total_merc, 15, 2)
    # 39 Valor Total Nota (15, 2)
    h_line += fmt_val(total_merc, 15, 2)
    # 40 Base IPI (15, 2)
    h_line += fmt_val(total_merc, 15, 2)
    # 41 Filler (2)
    h_line += fmt_str("", 2)
    # 42 Cod Exportador (A, 4) -> New
    h_line += fmt_str(header_data.get('cod_exportador', ''), 4)
    # 43 Nome Exportador (A, 60)
    h_line += fmt_str(header_data.get('exporter_name', 'EXPORTADOR'), 60)
    # 44 Numero PO (A, 17) -> New (Pos 358-374)
    h_line += fmt_str(header_data.get('numero_po', ''), 17)
    # 45 Reducao Base ICMS (N, 6, 2) -> New (Pos 375-380)
    h_line += fmt_val(header_data.get('perc_reducao', 0), 6, 2)

    lines.append(h_line)
    
    # --- ITEM (RECORD 2) ---
    for idx, item in enumerate(items_data):
        i_line = ""
        # Common prefix
        i_line += fmt_str("2", 1)
        i_line += fmt_int("01", 2)
        i_line += fmt_int("01", 2)
        i_line += fmt_int(note_num, 9)
        
        # 05 Num Lancamento (N, 6)
        i_line += fmt_int("", 6)
        
        # 06 NCM (N, 10). Layout: 21-30.
        ncm = ''.join(filter(str.isdigit, str(item.get('ncm', ''))))
        i_line += fmt_str(ncm[:8], 10)
        
        # 07 Codigo Produto/Internal (A, 20)
        internal = str(item.get('internal_code', '')).strip()
        i_line += fmt_str(internal, 20)
        
        # 08 Trib ICMS (1)
        i_line += fmt_str("", 1)
        # 09 Trib IPI (1)
        i_line += fmt_str("", 1)
        # 10 Num Item (2)
        i_line += fmt_int(item.get("item_sequence", ""), 2)

        # 11 Quantidade (N, 11, 4)
        qty = item.get('qty_commercial', 0)
        i_line += fmt_val(qty, 11, 4)
        
        # 12 Unidade (A, 3)
        unit = str(item.get('output_unit', 'UN'))[:3].upper()
        i_line += fmt_str(unit, 3)
        
        # 13 Vlr IPI (15, 2)
        i_line += fmt_val(0, 15, 2)
        
        # 14 Valor Mercadoria (15, 2) (CIF+II or Customs Value)
        uval = item.get('unit_value', 0)
        tval = item.get('total_value', 0)
        i_line += fmt_val(tval, 15, 2)
        
        # 15 Flag Ent (1)
        i_line += fmt_str("I", 1)
        
        # 16 Qty Rec (11, 4)
        i_line += fmt_val(0, 11, 4)
        
        # 17 Descricao (150)
        desc = str(item.get('description', '')).split('\n')[0].strip()
        i_line += fmt_str(f"{internal} - {desc}", 150)
        
        # 18 Valor FOB (15, 2)
        i_line += fmt_val(tval, 15, 2)
        
        # 19 Valor Frete (15, 2)
        frete = item.get('frete_item', 0)
        i_line += fmt_val(frete, 15, 2)
        
        # 20 Valor Seguro (15, 2)
        seguro = item.get('seguro_item', 0)
        i_line += fmt_val(seguro, 15, 2)
        
        # 21 Valor II (15, 2)
        i_line += fmt_val(0, 15, 2)
        # 22 Aliq IPI (5, 2)
        i_line += fmt_val(0, 5, 2)
        # 23 Despesas (15, 2)
        i_line += fmt_val(0, 15, 2)
        
        # 24 Num Processo Easy (17)
        i_line += fmt_str(header_data.get('di_number', ''), 17)
        
        # 25 EX NCM (3)
        i_line += fmt_str("", 3)
        
        # 26 Invoice (15) - Mapped from Header Extraction
        i_line += fmt_str(item.get('invoice_number', ''), 15)
        
        # 27 ICMS Recolher (15, 2)
        i_line += fmt_val(0, 15, 2)
        
        # 28 Peso Liquido (11, 4) - New extraction
        peso = item.get('net_weight', 0)
        i_line += fmt_val(peso, 11, 4)
        
        # 29 Item Pedido Compra (C, 4)
        i_line += fmt_str("", 4)
        
        # 30 Aliq II (5, 2)
        i_line += fmt_val(0, 5, 2)
        
        # 31 Num Pedido (C, 17)
        i_line += fmt_str("", 17)
        
        # 32 PLI / Licenc (C, 10)
        li_num = item.get('li_number', '')
        i_line += fmt_str(li_num, 10)
        
        # 33 Serie (3)
        i_line += fmt_str("1", 3)
        
        # 34 Base ICMS (15, 2) (Item)
        i_line += fmt_val(0, 15, 2)
        
        # 35 Valor FOB Origem (15, 7) - High precision
        i_line += fmt_val(tval, 15, 7)
        
        # 36-43 Taxes (PIS/COFINS) (Fill 0/Empty)
        # 36 Aliq PIS (6, 2)
        i_line += fmt_val(0, 6, 2)
        # 37 Vlr Qtde PIS (9, 2)
        i_line += fmt_val(0, 9, 2)
        # 38 Base PIS (15, 2)
        i_line += fmt_val(0, 15, 2)
        # 39 Valor PIS (15, 2)
        i_line += fmt_val(0, 15, 2)
        # 40 Aliq COFINS (6, 2)
        i_line += fmt_val(0, 6, 2)
        # 41 Vlr Qtde COFIN (9, 2)
        i_line += fmt_val(0, 9, 2)
        # 42 Base COFINS (15, 2)
        i_line += fmt_val(0, 15, 2)
        # 43 Valor COFINS (15, 2)
        i_line += fmt_val(0, 15, 2)
        
        # 44 Numero Adicao (3) - New
        adi_num = item.get('adicao_number', '0')
        i_line += fmt_int(adi_num, 3)
        
        # 45 Seq Item (3) - Enriched xml extracted
        seq_num = item.get('item_sequence', '0')
        i_line += fmt_int(seq_num, 3)
        
        # 46 Valor do desconto (N, 15, 2) - Pos 567-581
        i_line += fmt_val(item.get('valor_desconto', 0), 15, 2)
        
        # 47 Valor do IOF (N, 15, 2) - Pos 582-596
        i_line += fmt_val(item.get('valor_iof', 0), 15, 2)
        
        # 48 Despesas Aduaneiras (N, 15, 2) - Pos 597-611
        i_line += fmt_val(item.get('despesas_aduaneiras', 0), 15, 2)
        
        # 49 Aliquota especifica IPI (N, 15, 4) - Pos 612-626
        i_line += fmt_val(item.get('aliq_esp_ipi', 0), 15, 4)
        
        # 50 Qtde total - IPI (N, 11, 4) - Pos 627-637
        i_line += fmt_val(item.get('qtde_ipi', 0), 11, 4)
        
        # 51 Qtde total - PIS (N, 11, 4) - Pos 638-648
        i_line += fmt_val(item.get('qtde_pis', 0), 11, 4)
        
        # 52 Qtde total - COFINS (N, 11, 4) - Pos 649-659
        i_line += fmt_val(item.get('qtde_cofins', 0), 11, 4)
        
        # 53 Lote (C, 10) - Pos 660-669
        i_line += fmt_str(item.get('lote', ''), 10)
        
        # 54 Validade (C, 8) - Pos 670-677 (DDMMAAAA format) - Default: 31121969
        i_line += fmt_str(item.get('validade', '31121969'), 8)
        
        # 55 Aliq ICMS (N, 5, 2) - Pos 678-682
        i_line += fmt_val(item.get('aliq_icms', 0), 5, 2)
        
        # 56 Aliquota de Majoracao COFINS (N, 6, 2) - Pos 683-688
        i_line += fmt_val(item.get('aliq_maj_cofins', 0), 6, 2)
        
        # 57 Percentual Rateio (N, 8, 4) - Pos 689-696 - Default: 100.0000
        i_line += fmt_val(item.get('perc_rateio', 100), 8, 4)
        
        lines.append(i_line)
    
    # Use CRLF as line delimiter for Windows Standard
    return "\r\n".join(lines)

