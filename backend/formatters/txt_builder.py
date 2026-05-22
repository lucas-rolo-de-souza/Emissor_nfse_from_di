from typing import Dict, List, Any
from datetime import datetime


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
        """Left-aligned alphanumeric with trailing spaces."""
        s = str(value if value is not None else "")
        return s[:width].ljust(width)

    @staticmethod
    def format_int(value: Any, width: int) -> str:
        """Zero-padded integer string."""
        return str(value).zfill(width)[:width]

    @staticmethod
    def sanitize_date(value: Any, default: str) -> str:
        """Normalize date to DDMMYYYY (8 digits). Accepts DD/MM/AAAA or DDMMYYYY."""
        digits = ''.join(filter(str.isdigit, str(value)))
        return digits if len(digits) == 8 else default

    @staticmethod
    def safe_float(value: Any) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0


def _build_header_line(header_data: Dict, items_data: List[Dict]) -> str:
    fw = FixedWidth
    now_dt = datetime.now()
    default_date = now_dt.strftime("%d%m%Y")

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

    # Field 39: full invoice total = merchandise + all taxes + freight + insurance
    total_nota = (
        total_merc
        + total_val_ii
        + total_val_ipi
        + total_val_pis
        + total_val_cofins
        + total_val_icms
        + fw.safe_float(header_data.get('valor_total_frete', 0))
        + fw.safe_float(header_data.get('valor_total_seguro', 0))
    )

    cfop = header_data.get('cfop') or '3101'

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
    line += fw.format_num(0, 7, 2)
    # 07 CFOP (N, 6) — pos 028-033
    line += fw.format_int(cfop, 6)
    # 08 CFP (A, 5) — pos 034-038
    line += fw.format_alpha("", 5)
    # 09 CGC - Emitente (N, 14) — pos 039-052
    line += fw.format_int(header_data.get('cod_importador', ''), 14)
    # 10 Código do IPI (A, 3) — pos 053-055
    line += fw.format_alpha("", 3)
    # 11 Número do Processo (A, 17) — pos 056-072
    line += fw.format_alpha(header_data.get('numero_processo', ''), 17)
    # 12 Quantidade de Itens (N, 2) — pos 073-074
    line += fw.format_int(len(items_data), 2)
    # 13 Data de Referência (N, 6) — pos 075-080
    line += fw.format_int(now_dt.strftime("%m%Y"), 6)
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
    line += fw.format_alpha("NFE", 3)
    # 21 Flag Cancelada (A, 1) — pos 117
    line += fw.format_alpha(" ", 1)
    # 22 Filler (A, 1) — pos 118
    line += fw.format_alpha("", 1)
    # 23 Flag Entrada (A, 1) — pos 119
    line += fw.format_alpha("I", 1)
    # 24 Número da DI (A, 10) — pos 120-129
    line += fw.format_alpha(header_data.get('di_number', ''), 10)
    # 25 Série (A, 3) — pos 130-132
    line += fw.format_alpha("1", 3)
    # 26 Código de Sit. Tributária (A, 2) — pos 133-134
    line += fw.format_alpha("", 2)
    # 27 Situação Tributária - E (A, 5) — pos 135-139
    line += fw.format_alpha("", 5)
    # 28 Situação Tributária - F (A, 5) — pos 140-144
    line += fw.format_alpha("", 5)
    # 29 UF do Emitente (A, 2) — pos 145-146
    line += fw.format_alpha("EX", 2)
    # 30 Via de Transporte (A, 1) — pos 147
    line += fw.format_int("1", 1)
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
    line += fw.format_alpha(header_data.get('numero_po', ''), 17)
    # 45 Perc. Redução Base ICMS (N, 6, 2) — pos 375-380
    line += fw.format_num(header_data.get('perc_reducao', 0), 6, 2)
    # 46 Número da DUIMP (A, 15) — pos 381-395  [NEW]
    line += fw.format_alpha(header_data.get('duimp_number', ''), 15)
    # 47 Versão do Registro (A, 4) — pos 396-399  [NEW]
    line += fw.format_alpha(header_data.get('versao_registro') or '0001', 4)

    return line


def _build_item_line(item: Dict, note_num: str) -> str:
    fw = FixedWidth

    ncm      = ''.join(filter(str.isdigit, str(item.get('ncm', ''))))
    internal = str(item.get('internal_code', '')).strip()
    qty      = item.get('qty_commercial', 0)
    tval     = item.get('total_value', 0)
    frete    = item.get('frete_item', 0)
    seguro   = item.get('seguro_item', 0)
    desc     = str(item.get('description', '')).split('\n')[0].strip()
    unit     = str(item.get('output_unit', 'UN'))[:3].upper()
    li_num   = item.get('li_number', '')

    line = ""
    # 01 Tipo (A, 1) — pos 001
    line += fw.format_alpha("2", 1)
    # 02 Código da Empresa (N, 2) — pos 002-003
    line += fw.format_int("01", 2)
    # 03 Código da Filial (N, 2) — pos 004-005
    line += fw.format_int("01", 2)
    # 04 Número da Nota (N, 9) — pos 006-014
    line += fw.format_int(note_num, 9)
    # 05 Número do Lançamento (N, 6) — pos 015-020
    line += fw.format_int("", 6)
    # 06 Classificação Fiscal / NCM (N, 10) — pos 021-030
    line += fw.format_int(ncm[:8], 10)
    # 07 Código do Produto (A, 20) — pos 031-050
    line += fw.format_alpha(internal, 20)
    # 08 Código - Trib. - ICMS (N, 1) — pos 051
    line += fw.format_alpha("", 1)
    # 09 Código - Trib. - IPI (N, 1) — pos 052
    line += fw.format_alpha("", 1)
    # 10 Número do Item (N, 2) — pos 053-054
    line += fw.format_int(item.get("item_sequence", ""), 2)
    # 11 Quantidade (N, 11, 4) — pos 055-065
    line += fw.format_num(qty, 11, 4)
    # 12 Unidade (A, 3) — pos 066-068
    line += fw.format_alpha(unit, 3)
    # 13 Vlr. - IPI (N, 15, 2) — pos 069-083
    line += fw.format_num(item.get('valor_ipi', 0), 15, 2)
    # 14 Valor Mercadoria (CIF+II) (N, 15, 2) — pos 084-098
    line += fw.format_num(tval, 15, 2)
    # 15 Flag de Entrada (A, 1) — pos 099
    line += fw.format_alpha("I", 1)
    # 16 Quantidade do Recebimento (N, 11, 4) — pos 100-110
    line += fw.format_num(qty, 11, 4)
    # 17 Descrição do Produto (A, 150) — pos 111-260
    line += fw.format_alpha(f"{internal} - {desc}", 150)
    # 18 Valor Fob R$ (N, 15, 2) — pos 261-275
    line += fw.format_num(item.get('fob_reais', 0), 15, 2)
    # 19 Valor Frete R$ (N, 15, 2) — pos 276-290
    line += fw.format_num(frete, 15, 2)
    # 20 Valor do Seguro R$ (N, 15, 2) — pos 291-305
    line += fw.format_num(seguro, 15, 2)
    # 21 Valor II R$ (N, 15, 2) — pos 306-320
    line += fw.format_num(item.get('valor_ii', 0), 15, 2)
    # 22 Alíquota IPI (N, 5, 2) — pos 321-325
    line += fw.format_num(item.get('aliq_ipi', 0), 5, 2)
    # 23 Valor Despesas (N, 15, 2) — pos 326-340
    line += fw.format_num(0, 15, 2)
    # 24 Nro Processo no Easy (A, 17) — pos 341-357
    line += fw.format_alpha(item.get('numero_processo', ''), 17)
    # 25 Numero da EX da NCM (A, 3) — pos 358-360
    line += fw.format_alpha("", 3)
    # 26 Numero da Invoice (A, 15) — pos 361-375
    line += fw.format_alpha(item.get('invoice_number', ''), 15)
    # 27 Valor do ICMS a recolher (N, 15, 2) — pos 376-390
    line += fw.format_num(item.get('valor_icms_recolher', 0), 15, 2)
    # 28 Peso Líquido do item (N, 11, 4) — pos 391-401
    line += fw.format_num(item.get('net_weight', 0), 11, 4)
    # 29 Item do Pedido de Compra (C, 4) — pos 402-405
    line += fw.format_alpha(item.get('item_pedido_compra', ''), 4)
    # 30 Alíquota de II (N, 5, 2) — pos 406-410
    line += fw.format_num(item.get('aliq_ii', 0), 5, 2)
    # 31 Numero do pedido (C, 17) — pos 411-427
    line += fw.format_alpha(item.get('numero_pedido', ''), 17)
    # 32 Nro do Pedido de Licenciamento (C, 10) — pos 428-437
    line += fw.format_alpha(li_num, 10)
    # 33 Série da Nota Fiscal (C, 3) — pos 438-440
    line += fw.format_alpha("1", 3)
    # 34 Base de ICMS por item (N, 15, 2) — pos 441-455
    line += fw.format_num(item.get('base_icms', 0), 15, 2)
    # 35 Valor FOB na moeda de Origem (N, 15, 7) — pos 456-470
    line += fw.format_num(item.get('fob_currency', 0), 15, 7)
    # 36 Alíquota do PIS (N, 6, 2) — pos 471-476
    line += fw.format_num(item.get('aliq_pis', 0), 6, 2)
    # 37 Vlr por qtde do PIS (N, 9, 2) — pos 477-485
    line += fw.format_num(0, 9, 2)
    # 38 Base de cálculo do PIS (N, 15, 2) — pos 486-500
    line += fw.format_num(item.get('base_pis', 0), 15, 2)
    # 39 Valor do PIS (N, 15, 2) — pos 501-515
    line += fw.format_num(item.get('valor_pis', 0), 15, 2)
    # 40 Alíquota do COFINS (N, 6, 2) — pos 516-521
    line += fw.format_num(item.get('aliq_cofins', 0), 6, 2)
    # 41 Vlr por qtde do COFINS (N, 9, 2) — pos 522-530
    line += fw.format_num(0, 9, 2)
    # 42 Base de cálculo do COFINS (N, 15, 2) — pos 531-545
    line += fw.format_num(item.get('base_cofins', 0), 15, 2)
    # 43 Valor do COFINS (N, 15, 2) — pos 546-560
    line += fw.format_num(item.get('valor_cofins', 0), 15, 2)
    # 44 Número da adição (C, 3) — pos 561-563
    line += fw.format_int(item.get('adicao_number', '0'), 3)
    # 45 Sequencia do item da adição (C, 3) — pos 564-566
    line += fw.format_int(item.get('item_sequence', '0'), 3)
    # 46 Valor do desconto (N, 15, 2) — pos 567-581
    line += fw.format_num(item.get('valor_desconto', 0), 15, 2)
    # 47 Valor do IOF (N, 15, 2) — pos 582-596
    line += fw.format_num(item.get('valor_iof', 0), 15, 2)
    # 48 Despesas Aduaneiras (N, 15, 2) — pos 597-611
    line += fw.format_num(item.get('despesas_aduaneiras', 0), 15, 2)
    # 49 Alíquota específica do IPI (N, 15, 4) — pos 612-626
    line += fw.format_num(item.get('aliq_esp_ipi', 0), 15, 4)
    # 50 Qtde total - IPI (N, 11, 4) — pos 627-637
    line += fw.format_num(item.get('qtde_ipi', 0), 11, 4)
    # 51 Qtde total - PIS (N, 11, 4) — pos 638-648
    line += fw.format_num(item.get('qtde_pis', 0), 11, 4)
    # 52 Qtde total - COFINS (N, 11, 4) — pos 649-659
    line += fw.format_num(item.get('qtde_cofins', 0), 11, 4)
    # 53 Lote (C, 10) — pos 660-669
    line += fw.format_alpha(item.get('lote', ''), 10)
    # 54 Validade (D, 8) — pos 670-677 (AAAAMMDD)
    line += fw.format_alpha(item.get('validade', '19691231'), 8)
    # 55 Aliq ICMS - ICMS (N, 5, 2) — pos 678-682
    line += fw.format_num(item.get('aliq_icms', 0), 5, 2)
    # 56 Alíquota de Majoração de COFINS (N, 6, 2) — pos 683-688
    line += fw.format_num(item.get('aliq_maj_cofins', 0), 6, 2)
    # 57 Percentual Diferimento de ICMS (N, 8, 4) — pos 689-696
    line += fw.format_num(item.get('perc_dif_icms', 0), 8, 4)
    # 58 Código da LI (C, 10) — pos 697-706  [NEW]
    line += fw.format_alpha(item.get('codigo_li', ''), 10)
    # 59 Código da LI Substitutiva (C, 10) — pos 707-716  [NEW]
    line += fw.format_alpha(item.get('codigo_li_substitutiva', ''), 10)

    return line


def build_txt_content(header_data: Dict, items_data: List[Dict]) -> str:
    note_num = ''.join(filter(str.isdigit, str(header_data.get('numero_nota') or header_data.get('di_number', '0'))))[:9].zfill(9)

    lines = [_build_header_line(header_data, items_data)]
    for item in items_data:
        lines.append(_build_item_line(item, note_num))

    # CHR(13) = \r terminates each record per TOTVS SIGAEIC spec
    return "\r".join(lines) + "\r"
