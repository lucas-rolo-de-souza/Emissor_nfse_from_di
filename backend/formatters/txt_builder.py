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
    note_num_raw = header_data.get('numero_nota') or header_data.get('numero_di', '000000325')
    note_num = ''.join(filter(str.isdigit, str(note_num_raw)))[:9].zfill(9) 
    
    h_line = ""
    h_line += FixedWidth.format_alpha(rec_type, 1)      # 01 Tipo
    h_line += FixedWidth.format_num(emp, 2, 0).replace('.', '') # 02 Emp 
    # Using string padding for Integer-only N fields
    h_line = "" # Reset
    
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
    h_line += fmt_int(header_data.get('cfop', '3101'), 6)
    # 08 CFP (A, 5)
    h_line += fmt_str("", 5)
    # 09 CGC Emitente (N, 14)
    h_line += fmt_int("", 14)
    # 10 Cod IPI (A, 3)
    h_line += fmt_str("", 3)
    # 11 Processo (A, 17)
    h_line += fmt_str("", 17)
    # 12 Qty Itens (N, 2)
    h_line += fmt_int(len(items_data), 2)
    # 13 Data Ref (N, 6)
    h_line += fmt_int(now_dt.strftime("%m%Y"), 6) # MMYYYY
    # 14 Data Emissao (N, 8)
    h_line += fmt_int(dt_emissao, 8)
    # 15 Data Entrada (N, 8)
    h_line += fmt_int(dt_entrada, 8)
    # 16 Filler (A, 6)
    h_line += fmt_str("", 6)
    # 17 Data DI (N, 8)
    h_line += fmt_int(dt_di, 8)
    # 18 Filler (2)
    h_line += fmt_str("", 2)
    # 19 Ent/Sai (A, 1)
    h_line += fmt_str("E", 1)
    # 20 Especie (A, 3)
    h_line += fmt_str("NFE", 3)
    # 21 Flag Canc (A, 1)
    h_line += fmt_str("F", 1)
    # 22 Filler (1)
    h_line += fmt_str("", 1)
    # 23 Flag Ent (A, 1)
    h_line += fmt_str("I", 1)
    # 24 Num DI (A, 10)
    h_line += fmt_str(header_data.get('numero_di', ''), 10)
    # 25 Serie (A, 3)
    h_line += fmt_str("1", 3)
    # 26-30 ... Minimal fill for now
    h_line += fmt_str("", 2) # 26 CST
    h_line += fmt_str("", 5) # 27
    h_line += fmt_str("", 5) # 28
    h_line += fmt_str("EX", 2) # 29 UF (Emitente External?)
    h_line += fmt_str("1", 1) # 30 Via
    # 31 Frete (15, 2)
    h_line += fmt_val(header_data.get('valor_total_frete', 0), 15, 2)
    # 32 ICMS (15, 2)
    h_line += fmt_val(0, 15, 2) # Calc needed?
    # 33 Base ICMS (15, 2)
    h_line += fmt_val(0, 15, 2)
    # 34 Imp (A, 4)
    h_line += fmt_str("", 4)
    # 35 Transp (A, 20)
    h_line += fmt_str("", 20)
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
    # 39 Total Nota (15, 2)
    h_line += fmt_val(total_merc, 15, 2) # + frete + seguro?
    # 40 Base IPI (15, 2)
    h_line += fmt_val(total_merc, 15, 2)
    # 41 Filler (2)
    h_line += fmt_str("", 2)
    # 42 Cod Exp (4)
    h_line += fmt_str("", 4)
    # 43 Nome Exp (60)
    h_line += fmt_str(header_data.get('exporter_name', 'EXPORTADOR'), 60)
    
    # Ensure length matches spec (approx 380 chars)
    
    lines.append(h_line)
    
    # --- ITEM (RECORD 2) ---
    # Based on inferred sample `021C` and matching Header context
    # Prefix: 2 (Type) + 01 (Emp) + 01 (Fil) + Nota (9) ...
    
    for idx, item in enumerate(items_data):
        i_line = ""
        # Common prefix
        i_line += fmt_str("2", 1)
        i_line += fmt_int("01", 2)
        i_line += fmt_int("01", 2)
        i_line += fmt_int(note_num, 9)
        
        # Filler? Sample had spacer `      ` (6).
        # Sample line start: `20101000000325      `. 
        # My Record 1 breakdown was: 1 (Type) 01 (Emp) 01 (Fil) ...
        # Sample `021C` started `201...`. 
        # Actually `2` is type. `01` emp. `01` fil?
        # `20101000000325`. 2 (1) + 01 (2) + 01 (2) + 000000325 (9) = 14 chars.
        # This matches the prefix.
        
        # Then Sample had `      ` (6 space). 
        i_line += fmt_str("", 6)
        
        # NCM (8)
        ncm = ''.join(filter(str.isdigit, str(item.get('ncm', ''))))
        i_line += fmt_str(ncm[:8], 8)
        
        i_line += "  " # Spacer
        
        # Internal Code (22)
        internal = str(item.get('internal_code', '')).strip()
        i_line += fmt_str(internal, 22)
        
        # Qty (13, 3) - Note: Image 1 doesn't show Item format. 
        # We assume 9.3 based on Step 454.
        qty = item.get('qty_commercial', 0)
        i_line += fmt_val(qty, 13, 3)
        
        # Unit (2)
        unit = str(item.get('output_unit', 'UN'))[:2].upper()
        i_line += fmt_str(unit, 2)
        
        i_line += " "
        
        # Unit Val (15, 5) - Based on Step 454
        uval = item.get('unit_value', 0)
        i_line += fmt_val(uval, 15, 5)
        
        # Total Val (15, 5) - Assuming match
        tval = item.get('total_value', 0)
        i_line += fmt_val(tval, 15, 5)
        
        i_line += "I"
        i_line += "0" * 11
        
        desc = str(item.get('description', '')).split('\n')[0].strip()
        i_line += fmt_str(f"{internal} - {desc}", 100)
        
        lines.append(i_line)
        
    return "\n".join(lines)
