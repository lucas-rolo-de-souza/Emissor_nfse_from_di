from typing import Dict, List, Any
from datetime import datetime
import unicodedata


def clean_ascii(value: Any) -> str:
    """Normalize accented characters to base ASCII and strip non-printable ASCII."""
    if value is None:
        return ""
    s = str(value)
    # Normalize unicode to NFD (decomposes accented chars into letter + accent)
    nfd = unicodedata.normalize('NFD', s)
    cleaned = []
    for c in nfd:
        # Skip combining characters (accent marks)
        if unicodedata.combining(c):
            continue
        o = ord(c)
        # Keep printable ASCII (32-126)
        if 32 <= o <= 126:
            cleaned.append(c)
        else:
            # Replace other special non-ASCII characters with space
            cleaned.append(' ')
    return "".join(cleaned)


class FixedWidth:
    @staticmethod
    def format_num(value: Any, width: int, decimals: int) -> str:
        """Right-aligned numeric with leading zeros and mandatory dot separator."""
        try:
            val_float = float(value)
        except (TypeError, ValueError):
            val_float = 0.0

        s = f"{val_float:.{decimals}f}"
        integer_part, decimal_part = s.split('.') if '.' in s else (s, '0' * decimals)

        max_int_len = width - 1 - decimals
        integer_part = integer_part.zfill(max_int_len)
        decimal_part = decimal_part[:decimals].ljust(decimals, '0')

        result = f"{integer_part}.{decimal_part}"
        return result[-width:]

    @staticmethod
    def format_alpha(value: Any, width: int) -> str:
        """Left-aligned alphanumeric with trailing spaces, cleaned of special characters."""
        s = clean_ascii(value)
        return s[:width].ljust(width)


    @staticmethod
    def format_int_spaced(value: Any, width: int) -> str:
        """Right-aligned digits padded with spaces (client styling, e.g. CFOP)."""
        return str(value).strip().rjust(width)[:width]

    @staticmethod
    def format_int(value: Any, width: int) -> str:
        """Zero-padded integer string."""
        return str(value).zfill(width)[:width]

    @staticmethod
    def sanitize_date(value: Any, default: str) -> str:
        """Normalize date to AAAAMMDD (8 digits) as required by TOTVS SIGAEIC spec."""
        if not value:
            return default
        s = str(value).strip()
        # If it has format DD/MM/YYYY or DD-MM-YYYY or YYYY/MM/DD
        if len(s) == 10:
            if s[2] in ('/', '-') and s[5] in ('/', '-'):
                # DD/MM/YYYY to YYYYMMDD
                return s[6:] + s[3:5] + s[0:2]
            elif s[4] in ('/', '-') and s[7] in ('/', '-'):
                # YYYY/MM/DD to YYYYMMDD
                return s[0:4] + s[5:7] + s[8:]
        
        digits = ''.join(filter(str.isdigit, s))
        if len(digits) == 8:
            # Check if it is already AAAAMMDD: year at start, month 1-12, day 1-31
            val_aaaammdd = False
            try:
                year_a = int(digits[0:4])
                month_a = int(digits[4:6])
                day_a = int(digits[6:8])
                if 1900 <= year_a <= 2100 and 1 <= month_a <= 12 and 1 <= day_a <= 31:
                    val_aaaammdd = True
            except ValueError:
                pass

            # Check if it is DDMMAAAA: day 1-31, month 1-12, year at end
            val_ddmmaaaa = False
            try:
                day_d = int(digits[0:2])
                month_d = int(digits[2:4])
                year_d = int(digits[4:8])
                if 1900 <= year_d <= 2100 and 1 <= month_d <= 12 and 1 <= day_d <= 31:
                    val_ddmmaaaa = True
            except ValueError:
                pass

            if val_aaaammdd:
                return digits  # Keep already correct AAAAMMDD format
            elif val_ddmmaaaa:
                # Convert DDMMAAAA to AAAAMMDD
                return digits[4:] + digits[2:4] + digits[0:2]
            
            return digits
        return default

    @staticmethod
    def safe_float(value: Any) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0


# Constants
ICMS_SOURCE_HEADER = "HEADER"
ICMS_SOURCE_ITEMS = "ITEMS"
MV_EIC0076_STANDARD_15 = "STANDARD_15"
MV_EIC0076_FIELD_WIDTH = "FIELD_WIDTH"
VALID_ESPECIES = {"NFC", "NFE", "NFM", "NFF", "NFU", "NFT"}


def get_icms_source(header_data: Dict) -> str:
    raw = str(header_data.get('mv_eic0010_source') or ICMS_SOURCE_ITEMS).strip().upper()
    return ICMS_SOURCE_HEADER if raw == ICMS_SOURCE_HEADER else ICMS_SOURCE_ITEMS


def get_mv_eic0076_mode(header_data: Dict) -> str:
    raw = str(header_data.get('mv_eic0076_mode') or MV_EIC0076_STANDARD_15).strip().upper()
    return MV_EIC0076_FIELD_WIDTH if raw == MV_EIC0076_FIELD_WIDTH else MV_EIC0076_STANDARD_15


def get_po_input_max_length(mode: str) -> int:
    return 15 if mode == MV_EIC0076_STANDARD_15 else 17


def get_invoice_input_max_length(mode: str) -> int:
    return 15


def is_valid_aaaammdd(value: Any) -> bool:
    s = str(value).strip()
    if len(s) != 8 or not s.isdigit():
        return False
    try:
        datetime.strptime(s, "%Y%m%d")
        return True
    except ValueError:
        return False


def resolve_header_icms_rate(header_data: Dict, items_data: List[Dict]) -> float:
    aliq_capa = header_data.get('aliq_icms_capa')
    if aliq_capa is not None and str(aliq_capa).strip() != "":
        try:
            val = float(aliq_capa)
            if val != 0:
                return val
        except (TypeError, ValueError):
            pass

    if not items_data:
        return 0.0

    item_rates = set()
    for item in items_data:
        try:
            rate = round(float(item.get('aliq_icms', 0) or 0), 4)
            item_rates.add(rate)
        except (TypeError, ValueError):
            item_rates.add(0.0)

    if len(item_rates) == 1:
        return float(item_rates.pop())
    return 0.0


def _build_header_line(header_data: Dict, items_data: List[Dict]) -> str:
    fw = FixedWidth
    now_dt = datetime.now()
    default_date = now_dt.strftime("%Y%m%d")

    note_num = ''.join(filter(str.isdigit, str(header_data.get('numero_nota') or header_data.get('di_number', '0'))))[:9].zfill(9)

    dt_emissao = fw.sanitize_date(header_data.get('data_emissao'), default_date)
    dt_entrada = fw.sanitize_date(header_data.get('data_entrada'), default_date)
    dt_di      = fw.sanitize_date(header_data.get('di_date'), default_date)

    total_merc      = sum(fw.safe_float(i.get('total_value')) for i in items_data)
    total_base_icms = sum(fw.safe_float(i.get('base_icms')) for i in items_data)
    total_val_icms  = sum(fw.safe_float(i.get('valor_icms_recolher')) for i in items_data)
    total_val_ipi   = sum(fw.safe_float(i.get('valor_ipi')) for i in items_data)
    total_base_ipi  = sum(fw.safe_float(i.get('base_ipi')) for i in items_data)
    total_val_ii    = sum(fw.safe_float(i.get('valor_ii')) for i in items_data)
    total_val_pis   = sum(fw.safe_float(i.get('valor_pis')) for i in items_data)
    total_val_cofins = sum(fw.safe_float(i.get('valor_cofins')) for i in items_data)

    # Field 39: full invoice total = merchandise (CIF+II) + IPI + PIS + COFINS + ICMS
    total_nota = (
        total_merc
        + total_val_ipi
        + total_val_pis
        + total_val_cofins
        + total_val_icms
    )

    cfop = header_data.get('cfop') or '3101'
    especie = str(header_data.get('especie') or 'NFE').upper()
    if especie not in VALID_ESPECIES:
        raise ValueError(f"Invalid espécie: {especie}")

    serie = str(header_data.get('serie') or '1').strip()

    line = ""
    # 01 Tipo (A, 1) — pos 001
    line += fw.format_alpha("1", 1)
    # 02 Código da Empresa (N, 2) — pos 002-003
    line += fw.format_int("01", 2)
    # 03 Código da Filial (N, 2) — pos 004-005
    line += fw.format_int("01", 2)
    # 04 Número da Nota (N, 9) — pos 006-014
    line += fw.format_int(note_num, 9)
    # 05 Filler (A, 6) — pos 015-020
    line += fw.format_alpha("", 6)
    # 06 Aliq. ICMS (N, 7, 2) — pos 021-027
    aliq_icms_capa_val = 0.0
    if get_icms_source(header_data) == ICMS_SOURCE_HEADER:
        aliq_icms_capa_val = resolve_header_icms_rate(header_data, items_data)
    line += fw.format_num(aliq_icms_capa_val, 7, 2)
    # 07 CFOP (N, 6) — pos 028-033 (right-aligned, space-padded)
    line += fw.format_int_spaced(cfop, 6)
    # 08 CFP (A, 5) — pos 034-038
    line += fw.format_alpha("", 5)
    # 09 CGC - Emitente (N, 14) — pos 039-052 (importer CNPJ from the DI when available)
    cnpj = ''.join(filter(str.isdigit, str(header_data.get('importer_code') or '')))
    line += fw.format_int(cnpj if len(cnpj) == 14 else "0", 14)
    # 10 Código do IPI (A, 3) — pos 053-055
    line += fw.format_alpha("", 3)
    # 11 Número do Processo (A, 17) — pos 056-072
    line += fw.format_alpha(header_data.get('numero_processo', ''), 17)
    # 12 Quantidade de Itens (N, 2) — pos 073-074
    line += fw.format_int(len(items_data), 2)
    # 13 Data de Referência (N, 6) — pos 075-080 (NOT_USED per spec)
    line += fw.format_int("", 6)
    # 14 Data de Emissão (N, 8) — pos 081-088 (AAAAMMDD)
    line += fw.format_int(dt_emissao, 8)
    # 15 Data de Entrada (N, 8) — pos 089-096 (AAAAMMDD)
    line += fw.format_int(dt_entrada, 8)
    # 16 Filler (A, 6) — pos 097-102
    line += fw.format_alpha("", 6)
    # 17 Data de Registro DI (N, 8) — pos 103-110
    line += fw.format_int(dt_di, 8)
    # 18 Filler (A, 2) — pos 111-112
    line += fw.format_alpha("", 2)
    # 19 Entrada / Saída (A, 1) — pos 113
    line += fw.format_alpha("E", 1)
    # 20 Espécie (A, 3) — pos 114-116
    line += fw.format_alpha(especie, 3)
    # 21 Flag Cancelada (A, 1) — pos 117
    line += fw.format_alpha(" ", 1)
    # 22 Filler (A, 1) — pos 118
    line += fw.format_alpha("", 1)
    # 23 Flag Entrada (A, 1) — pos 119
    line += fw.format_alpha("I", 1)
    # 24 Número da DI (A, 10) — pos 120-129
    line += fw.format_alpha(header_data.get('di_number', ''), 10)
    # 25 Série (A, 3) — pos 130-132
    line += fw.format_alpha(serie, 3)
    # 26 Código de Sit. Tributária (A, 2) — pos 133-134
    line += fw.format_alpha("", 2)
    # 27 Situação Tributária - E (A, 5) — pos 135-139
    line += fw.format_alpha("", 5)
    # 28 Situação Tributária - F (A, 5) — pos 140-144
    line += fw.format_alpha("", 5)
    # 29 UF do Emitente (A, 2) — pos 145-146
    uf_val = str(header_data.get('uf_emitente') or '').strip().upper()
    line += fw.format_alpha(uf_val or "AM", 2)
    # 30 Via de Transporte (A, 1) — pos 147
    via_trans = header_data.get('via_transporte') or '1'
    line += fw.format_alpha(via_trans, 1)
    # 31 Valor do Frete (N, 15, 2) — pos 148-162
    line += fw.format_num(header_data.get('valor_total_frete', 0), 15, 2)
    # 32 Valor do ICMS (N, 15, 2) — pos 163-177
    line += fw.format_num(total_val_icms, 15, 2)
    # 33 Valor da Base do ICMS (N, 15, 2) — pos 178-192
    line += fw.format_num(total_base_icms, 15, 2)
    # 34 Código do Importador (A, 4) — pos 193-196
    line += fw.format_alpha(header_data.get('cod_importador', ''), 4)
    # 35 Código do Transportador (A, 20) — pos 197-216
    line += fw.format_alpha(header_data.get('cod_transportador', ''), 20)
    # 36 Valor do Seguro (N, 15, 2) — pos 217-231
    line += fw.format_num(header_data.get('valor_total_seguro', 0), 15, 2)
    # 37 Valor do IPI (N, 15, 2) — pos 232-246
    line += fw.format_num(total_val_ipi, 15, 2)
    # 38 Valor Total da Mercadoria (N, 15, 2) — pos 247-261
    line += fw.format_num(total_merc, 15, 2)
    # 39 Valor Total da Nota (N, 15, 2) — pos 262-276
    line += fw.format_num(total_nota, 15, 2)
    # 40 Valor Base do IPI (N, 15, 2) — pos 277-291
    line += fw.format_num(total_base_ipi, 15, 2)
    # 41 Filler (A, 2) — pos 292-293
    line += fw.format_alpha("", 2)
    # 42 Código do Exportador (A, 4) — pos 294-297
    line += fw.format_alpha(header_data.get('cod_exportador', ''), 4)
    # 43 Nome do Exportador (A, 60) — pos 298-357
    line += fw.format_alpha(header_data.get('exporter_name', ''), 60)
    # 44 Numero do PO (A, 17) — pos 358-374
    po_mode = get_mv_eic0076_mode(header_data)
    po_max = get_po_input_max_length(po_mode)
    po_val = str(header_data.get('numero_po', '') or '')[:po_max]
    line += fw.format_alpha(po_val, 17)
    # 45 Perc. Redução Base ICMS (N, 6, 2) — pos 375-380
    line += fw.format_num(header_data.get('perc_reducao', 0), 6, 2)

    # Only append fields 46 & 47 if document_type is DUIMP
    if header_data.get('document_type') == 'DUIMP':
        # 46 Número da DUIMP (A, 15) — pos 381-395
        line += fw.format_alpha(header_data.get('duimp_number', ''), 15)
        # 47 Versão do Registro (A, 4) — pos 396-399
        line += fw.format_alpha(header_data.get('versao_registro') or '0001', 4)

    return line


UNIT_ALIASES = {"UNIDADE": "UN", "QUILOGRAMA LIQUIDO": "KG", "QUILOGRAMA": "KG", "PECA": "PC"}


def normalize_unit(unit: Any) -> str:
    """Map Siscomex unit names (e.g. 'UNIDADE') to the short code Easy expects (e.g. 'UN')."""
    text = str(unit or '').strip().upper()
    return UNIT_ALIASES.get(text, text)[:3]


def apply_tax_suspension(items: List[Dict]) -> None:
    """Zero IPI, PIS and COFINS (rates, bases, values, quantities) on every item, in place."""
    for item in items:
        for key in ('aliq_ipi', 'valor_ipi', 'base_ipi', 'qtde_ipi',
                    'aliq_pis', 'valor_pis', 'base_pis', 'qtde_pis',
                    'aliq_cofins', 'valor_cofins', 'base_cofins', 'qtde_cofins'):
            item[key] = 0.0


def _build_item_line(item: Dict, note_num: str, header_data: Dict) -> str:
    fw = FixedWidth

    ncm      = ''.join(filter(str.isdigit, str(item.get('ncm', ''))))
    internal = str(item.get('internal_code', '')).strip()
    qty      = item.get('qty_commercial', 0)
    tval     = item.get('total_value', 0)
    frete    = item.get('frete_item', 0)
    seguro   = item.get('seguro_item', 0)
    desc     = str(item.get('description', '')).split('\n')[0].strip()
    unit     = normalize_unit(item.get('output_unit') or 'UN')
    li_num   = item.get('li_number') or ''

    processo = item.get('numero_processo') or header_data.get('numero_processo', '')
    invoice_mode = get_mv_eic0076_mode(header_data)
    invoice_max = get_invoice_input_max_length(invoice_mode)
    invoice_val = str(item.get('invoice_number', '') or header_data.get('invoice_number', ''))[:invoice_max]
    serie = str(header_data.get('serie') or '1').strip()

    line = ""
    # 01 Tipo (A, 1) — pos 001
    line += fw.format_alpha("2", 1)
    # 02 Código da Empresa (N, 2) — pos 002-003
    line += fw.format_int("01", 2)
    # 03 Código da Filial (N, 2) — pos 004-005
    line += fw.format_int("01", 2)
    # 04 Número da Nota (N, 9) — pos 006-014
    line += fw.format_int(note_num, 9)
    # 05 Número do Lançamento (N, 6) — pos 015-020 (NOT_USED, left blank)
    line += fw.format_alpha("", 6)
    # 06 Classificação Fiscal / NCM (N, 10) — pos 021-030 (left-aligned, space-padded)
    line += fw.format_alpha(ncm[:8], 10)
    # 07 Código do Produto (A, 20) — pos 031-050
    line += fw.format_alpha(internal, 20)
    # 08 Código - Trib. - ICMS (N, 1) — pos 051
    line += fw.format_alpha("", 1)
    # 09 Código - Trib. - IPI (N, 1) — pos 052
    line += fw.format_alpha("", 1)
    # 10 Número do Item (N, 2) — pos 053-054
    line += fw.format_int(item.get("item_sequence", ""), 2)
    # 11 Quantidade (N, 12, 4) — pos 055-066
    line += fw.format_num(qty, 12, 4)
    # 12 Unidade (A, 3) — pos 067-069
    line += fw.format_alpha(unit, 3)
    # 13 Vlr. - IPI (N, 15, 2) — pos 070-084
    line += fw.format_num(item.get('valor_ipi', 0), 15, 2)
    # 14 Valor Mercadoria (CIF+II) (N, 15, 2) — pos 085-099
    line += fw.format_num(tval, 15, 2)
    # 15 Flag de Entrada (A, 1) — pos 100
    line += fw.format_alpha("I", 1)
    # 16 Quantidade do Recebimento (N, 11, 4) — pos 101-111 (NOT_USED per spec)
    line += fw.format_num(0, 11, 4)
    # 17 Descrição do Produto (A, 150) — pos 112-261
    line += fw.format_alpha(f"{internal} - {desc}", 150)
    # 18 Valor Fob R$ (N, 15, 2) — pos 262-276
    line += fw.format_num(item.get('fob_reais', 0), 15, 2)
    # 19 Valor Frete R$ (N, 15, 2) — pos 277-291
    line += fw.format_num(frete, 15, 2)
    # 20 Valor do Seguro R$ (N, 15, 2) — pos 292-306
    line += fw.format_num(seguro, 15, 2)
    # 21 Valor II R$ (N, 15, 2) — pos 307-321
    line += fw.format_num(item.get('valor_ii', 0), 15, 2)
    # 22 Alíquota IPI (N, 5, 2) — pos 322-326
    line += fw.format_num(item.get('aliq_ipi', 0), 5, 2)
    # 23 Valor Despesas (N, 15, 2) — pos 327-341
    line += fw.format_num(0, 15, 2)
    # 24 Nro Processo no Easy (A, 17) — pos 342-358
    line += fw.format_alpha(processo, 17)
    # 25 Numero da EX da NCM (A, 3) — pos 359-361
    line += fw.format_alpha("", 3)
    # 26 Numero da Invoice (A, 15) — pos 362-376
    line += fw.format_alpha(invoice_val, 15)
    # 27 Valor do ICMS a recolher (N, 15, 2) — pos 377-391
    line += fw.format_num(item.get('valor_icms_recolher', 0), 15, 2)
    # 28 Peso Líquido do item (N, 11, 4) — pos 392-402
    line += fw.format_num(item.get('net_weight', 0), 11, 4)
    # 29 Item do Pedido de Compra (C, 4) — pos 403-406
    line += fw.format_alpha(item.get('item_pedido_compra', ''), 4)
    # 30 Alíquota de II (N, 5, 2) — pos 407-411
    line += fw.format_num(item.get('aliq_ii', 0), 5, 2)
    # 31 Numero do pedido (C, 17) — pos 412-428
    line += fw.format_alpha(item.get('numero_pedido', '') or header_data.get('numero_po', ''), 17)
    # 32 Nro do Pedido de Licenciamento (C, 10) — pos 429-438
    line += fw.format_alpha(li_num.replace('*', ''), 10)
    # 33 Série da Nota Fiscal (C, 3) — pos 439-441
    line += fw.format_alpha(serie, 3)
    # 34 Base de ICMS por item (N, 15, 2) — pos 442-456
    line += fw.format_num(item.get('base_icms', 0), 15, 2)
    # 35 Valor FOB na moeda de Origem (N, 15, 7) — pos 457-471
    line += fw.format_num(item.get('fob_currency', 0), 15, 7)
    # 36 Alíquota do PIS (N, 6, 2) — pos 472-477
    line += fw.format_num(item.get('aliq_pis', 0), 6, 2)
    # 37 Vlr por qtde do PIS (N, 9, 2) — pos 478-486
    line += fw.format_num(0, 9, 2)
    # 38 Base de cálculo do PIS (N, 15, 2) — pos 487-501
    line += fw.format_num(item.get('base_pis', 0), 15, 2)
    # 39 Valor do PIS (N, 15, 2) — pos 502-516
    line += fw.format_num(item.get('valor_pis', 0), 15, 2)
    # 40 Alíquota do COFINS (N, 6, 2) — pos 517-522
    line += fw.format_num(item.get('aliq_cofins', 0), 6, 2)
    # 41 Vlr por qtde do COFINS (N, 9, 2) — pos 523-531
    line += fw.format_num(0, 9, 2)
    # 42 Base de cálculo do COFINS (N, 15, 2) — pos 532-546
    line += fw.format_num(item.get('base_cofins', 0), 15, 2)
    # 43 Valor do COFINS (N, 15, 2) — pos 547-561
    line += fw.format_num(item.get('valor_cofins', 0), 15, 2)
    # 44 Número da adição (C, 3) — pos 562-564
    line += fw.format_int(item.get('adicao_number', '0'), 3)
    # 45 Sequencia do item da adição (C, 3) — pos 565-567
    line += fw.format_int(item.get('item_sequence', '0'), 3)
    # 46 Valor do desconto (N, 15, 2) — pos 568-582
    line += fw.format_num(item.get('valor_desconto', 0), 15, 2)
    # 47 Valor do IOF (N, 15, 2) — pos 583-597
    line += fw.format_num(item.get('valor_iof', 0), 15, 2)
    # 48 Despesas Aduaneiras (N, 15, 2) — pos 598-612
    line += fw.format_num(item.get('despesas_aduaneiras', 0), 15, 2)
    # 49 Alíquota específica do IPI (N, 15, 4) — pos 613-627
    line += fw.format_num(item.get('aliq_esp_ipi', 0), 15, 4)
    # 50 Qtde total - IPI (N, 11, 4) — pos 628-638
    line += fw.format_num(item.get('qtde_ipi', 0), 11, 4)
    # 51 Qtde total - PIS (N, 11, 4) — pos 639-649
    line += fw.format_num(item.get('qtde_pis', 0), 11, 4)
    # 52 Qtde total - COFINS (N, 11, 4) — pos 650-660
    line += fw.format_num(item.get('qtde_cofins', 0), 11, 4)
    # 53 Lote (C, 10) — pos 661-670
    # 54 Validade (D, 8) — pos 671-678 (AAAAMMDD)
    lote_val = str(item.get('lote', '')).strip()
    if not lote_val:
        line += fw.format_alpha("", 10)
        line += fw.format_alpha("", 8)
    else:
        line += fw.format_alpha(lote_val, 10)
        line += fw.format_alpha(fw.sanitize_date(item.get('validade', ''), '00000000'), 8)
    # 55 Aliq ICMS - ICMS (N, 5, 2) — pos 679-683
    aliq_icms_val = 0.0
    if get_icms_source(header_data) == ICMS_SOURCE_ITEMS:
        aliq_icms_val = fw.safe_float(item.get('aliq_icms', 0))
    line += fw.format_num(aliq_icms_val, 5, 2)
    # 56 Alíquota de Majoração de COFINS (N, 6, 2) — pos 684-689
    line += fw.format_num(item.get('aliq_maj_cofins', 0), 6, 2)
    # 57 Percentual Diferimento de ICMS (N, 8, 4) — pos 690-697
    line += fw.format_num(item.get('perc_dif_icms', 0), 8, 4)
    # 58 Código da LI (C, 10) — pos 698-707  [NEW]
    line += fw.format_alpha((item.get('codigo_li') or '').replace('*', ''), 10)
    # 59 Código da LI Substitutiva (C, 10) — pos 708-717  [NEW]
    line += fw.format_alpha((item.get('codigo_li_substitutiva') or '').replace('*', ''), 10)

    return line


def build_txt_content(header_data: Dict, items_data: List[Dict]) -> str:
    note_num = ''.join(filter(str.isdigit, str(header_data.get('numero_nota') or header_data.get('di_number', '0'))))[:9].zfill(9)

    lines = [_build_header_line(header_data, items_data)]
    for item in items_data:
        lines.append(_build_item_line(item, note_num, header_data))

    # Use CRLF (\r\n) line endings as required
    return "\r\n".join(lines) + "\r\n"
