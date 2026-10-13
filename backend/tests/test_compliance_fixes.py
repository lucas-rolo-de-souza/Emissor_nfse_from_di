"""
Compliance regression tests for the 10 SIGAEIC layout fixes.
Each test is numbered to match the issue in the audit report.
"""
import pytest
from backend.formatters.txt_builder import build_txt_content
from backend.parsers.txt_parser import parse_txt_content, parse_item

pytestmark = pytest.mark.compliance


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

def _make_header(**overrides):
    base = {
        "document_type": "DI",
        "di_number": "2500000001",
        "di_date": "20260101",
        "exporter_name": "TEST EXPORTER",
        "valor_total_frete": 0.0,
        "valor_total_seguro": 0.0,
        "numero_nota": "000000001",
        "data_emissao": "20260101",
        "data_entrada": "20260101",
        "cfop": "3101",
        "numero_processo": "PROC-001",
        "especie": "NFE",
        "serie": "1",
        "numero_po": "PO-EXT-001",
        "numero_pedido": "",
        "perc_reducao": "0",
    }
    base.update(overrides)
    return base


def _make_item(**overrides):
    base = {
        "adicao_number": "001",
        "ncm": "85044021",
        "description": "TEST PRODUCT",
        "qty_commercial": 10.0,
        "output_unit": "UN",
        "unit_value": 100.0,
        "item_sequence": "01",
        "net_weight": 5.0,
        "li_number": "",
        "fob_reais": 1000.0,
        "fob_currency": 200.0,
        "frete_item": 100.0,
        "seguro_item": 20.0,
        "invoice_number": "INV-001",
        "numero_processo": "PROC-001",
        "item_pedido_compra": "0001",
        "numero_pedido": "PED-EASY-001",
        "total_value": 0.0,        # overridden in each test
        "aliq_ii": 10.0,
        "valor_ii": 110.0,
        "base_ii": 1120.0,
        "aliq_pis": 2.1,
        "base_pis": 1120.0,
        "valor_pis": 23.52,
        "aliq_cofins": 9.65,
        "base_cofins": 1120.0,
        "valor_cofins": 108.08,
        "aliq_ipi": 5.0,
        "valor_ipi": 61.5,
        "base_ipi": 1230.0,
        "aliq_icms": 12.0,
        "base_icms": 0.0,
        "valor_icms_recolher": 0.0,
        "internal_code": "PROD-001",
        "cfop": "3101",
        "perc_dif_icms": 0.0,
        "valor_desconto": 0.0,
        "valor_iof": 0.0,
        "despesas_aduaneiras": 0.0,
        "codigo_li": "",
        "codigo_li_substitutiva": "",
    }
    base.update(overrides)
    return base


def _build_and_split(header, items):
    txt = build_txt_content(header, items)
    lines = txt.splitlines()
    return txt, lines


# ---------------------------------------------------------------------------
# Issue 1 — DI ITENS must always be 717 chars
# ---------------------------------------------------------------------------

def test_issue1_di_itens_always_717():
    header = _make_header(document_type="DI")
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    assert len(lines[1]) == 717, f"DI ITENS should be 717, got {len(lines[1])}"


def test_issue1_duimp_itens_also_717():
    header = _make_header(
        document_type="DUIMP",
        duimp_number="220000000000001",
        versao_registro="0001",
    )
    item = _make_item(total_value=1230.0, codigo_li="LI0000001 ", codigo_li_substitutiva="          ")
    _, lines = _build_and_split(header, [item])
    assert len(lines[1]) == 717, f"DUIMP ITENS should be 717, got {len(lines[1])}"


def test_issue1_di_and_duimp_item_lengths_are_equal():
    h_di = _make_header(document_type="DI")
    h_du = _make_header(document_type="DUIMP", duimp_number="220000000000002", versao_registro="0001")
    item = _make_item(total_value=1230.0)
    _, lines_di = _build_and_split(h_di, [item])
    _, lines_du = _build_and_split(h_du, [item])
    assert len(lines_di[1]) == len(lines_du[1]) == 717


# ---------------------------------------------------------------------------
# Issue 2 — ITENS field 14 must be CIF+II; total_nota must not double-count
# ---------------------------------------------------------------------------

def test_issue2_total_value_is_cif_plus_ii():
    fob = 1000.0
    frete = 100.0
    seguro = 20.0
    valor_ii = 110.0
    expected_total_value = fob + frete + seguro + valor_ii  # 1230.0

    item = _make_item(
        fob_reais=fob,
        frete_item=frete,
        seguro_item=seguro,
        valor_ii=valor_ii,
        total_value=expected_total_value,
    )
    header = _make_header()
    _, lines = _build_and_split(header, [item])
    parsed_header, parsed_items = parse_txt_content(("\r\n".join(lines) + "\r\n").encode())

    # Field 38 CAPA = Valor Total Mercadoria (sum of CIF+II)
    assert float(parsed_header["valor_total_mercadoria"]) == pytest.approx(expected_total_value, rel=1e-3)


def test_issue2_total_nota_no_double_count():
    fob, frete, seguro, ii = 1000.0, 100.0, 20.0, 110.0
    ipi, pis, cofins, icms = 61.5, 23.52, 108.08, 0.0
    total_merc = fob + frete + seguro + ii  # 1230.0
    expected_nota = total_merc + ipi + pis + cofins + icms  # 1423.10

    item = _make_item(
        fob_reais=fob, frete_item=frete, seguro_item=seguro, valor_ii=ii,
        valor_ipi=ipi, valor_pis=pis, valor_cofins=cofins, valor_icms_recolher=icms,
        total_value=total_merc,
    )
    header = _make_header(valor_total_frete=frete, valor_total_seguro=seguro)
    _, lines = _build_and_split(header, [item])
    parsed_header, _ = parse_txt_content(("\r\n".join(lines) + "\r\n").encode())

    assert float(parsed_header["valor_total_nota"]) == pytest.approx(expected_nota, rel=1e-3)


# ---------------------------------------------------------------------------
# Issue 3 — ICMS base "por dentro" cascading formula
# ---------------------------------------------------------------------------

def test_issue3_icms_base_cascading_formula():
    cif = 1120.0   # FOB+Frete+Seguro
    ii = 110.0
    ipi = 61.5
    pis = 23.52
    cofins = 108.08
    aliq_icms = 12.0
    pre_icms = cif + ii + ipi + pis + cofins   # 1423.10
    expected_base = pre_icms / (1 - aliq_icms / 100)  # ≈ 1617.16

    # The base_icms in the item dict is the pre-computed value from processor.py
    item = _make_item(base_icms=expected_base, aliq_icms=aliq_icms)
    header = _make_header()
    _, lines = _build_and_split(header, [item])
    parsed_header, parsed_items = parse_txt_content(("\r\n".join(lines) + "\r\n").encode())

    assert float(parsed_items[0]["base_icms"]) == pytest.approx(expected_base, rel=1e-3)


def test_issue3_icms_base_zero_when_rate_zero():
    # When aliq_icms == 0, base_icms must be 0 (not divide-by-zero result)
    item = _make_item(aliq_icms=0.0, base_icms=0.0, valor_icms_recolher=0.0)
    header = _make_header()
    _, lines = _build_and_split(header, [item])
    _, parsed_items = parse_txt_content(("\r\n".join(lines) + "\r\n").encode())
    assert float(parsed_items[0]["base_icms"]) == pytest.approx(0.0, abs=0.01)


# ---------------------------------------------------------------------------
# Issue 4 — CAPA field 09 (CGC Emitente) must be zeros, not cod_importador
# ---------------------------------------------------------------------------

def test_issue4_cgc_emitente_is_zeros():
    header = _make_header(cod_importador="ACME")
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    capa = lines[0]
    # pos 039-052 = indices 38:52 = 14 chars
    cgc_field = capa[38:52]
    assert cgc_field == "0" * 14, f"CGC Emitente should be zeros, got '{cgc_field}'"


# ---------------------------------------------------------------------------
# Issue 5 — Espécie configurable (not hardcoded NFE)
# ---------------------------------------------------------------------------

def test_issue5_especie_configurable():
    for especie in ("NFM", "NFU", "NFC", "NFT"):
        header = _make_header(especie=especie)
        item = _make_item(total_value=1230.0)
        _, lines = _build_and_split(header, [item])
        capa = lines[0]
        # pos 114-116 = indices 113:116
        field = capa[113:116]
        assert field == especie, f"Espécie should be '{especie}', got '{field}'"


def test_issue5_especie_defaults_to_nfe_when_absent():
    header = _make_header()
    del header["especie"]
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    assert lines[0][113:116] == "NFE"


# ---------------------------------------------------------------------------
# Issue 6 — Série must be consistent and configurable
# ---------------------------------------------------------------------------

def test_issue6_serie_propagates_to_capa_and_itens():
    header = _make_header(serie="2")
    item = _make_item(total_value=1230.0)
    txt, lines = _build_and_split(header, [item])
    parsed_header, parsed_items = parse_txt_content((txt + "\r\n").encode()
                                                    if not txt.endswith("\r\n") else txt.encode())
    # CAPA field 25 (pos 130-132) and ITENS field 33 (pos 439-441) must both be "2  "
    assert parsed_header["serie"].strip() == "2"
    assert parsed_items[0]["serie"].strip() == "2"


def test_issue6_serie_defaults_to_1():
    header = _make_header()
    del header["serie"]
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    # CAPA pos 130-132 = indices 129:132
    assert lines[0][129:132] == "1  "


# ---------------------------------------------------------------------------
# Issue 7 — numero_pedido distinct from numero_po
# ---------------------------------------------------------------------------

def test_issue7_numero_pedido_distinct_from_po():
    header = _make_header(numero_po="PO-EXT-123", numero_pedido="PED-EASY-456")
    item = _make_item(total_value=1230.0, numero_pedido="PED-EASY-456")
    _, lines = _build_and_split(header, [item])
    parsed_header, parsed_items = parse_txt_content(("\r\n".join(lines) + "\r\n").encode())

    # ITENS field 31 (pos 412-428) = num_pedido
    assert parsed_items[0]["num_pedido"].strip() == "PED-EASY-456"
    # CAPA field 44 (pos 358-374) = numero_po
    assert parsed_header["numero_po"].strip() == "PO-EXT-123"
    # They must differ
    assert parsed_items[0]["num_pedido"].strip() != parsed_header["numero_po"].strip()


# ---------------------------------------------------------------------------
# Issue 8 — strict TXT parser length guard
# ---------------------------------------------------------------------------

def test_issue8_parser_rejects_short_item_line():
    short_line = "2" + " " * 648   # 649 chars — below 650 minimum
    with pytest.raises(ValueError, match="too short"):
        parse_item(short_line, index=0)


def test_issue8_strict_parser_rejects_697_char_line():
    header = _make_header()
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    line_717 = lines[1]
    assert len(line_717) == 717
    line_697 = line_717[:697]
    with pytest.raises(ValueError, match="expected exactly 717"):
        parse_item(line_697, index=0, strict=True)


def test_issue8_strict_parser_rejects_688_char_line():
    header = _make_header()
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    line_717 = lines[1]
    assert len(line_717) == 717
    line_688 = line_717[:688]
    with pytest.raises(ValueError, match="expected exactly 717"):
        parse_item(line_688, index=0, strict=True)


# ---------------------------------------------------------------------------
# Issue 9 — Via de Transporte from header_data
# ---------------------------------------------------------------------------

def test_issue9_via_transporte_configurable():
    header = _make_header(via_transporte="4")
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    # CAPA field 30 (pos 147) = index 146
    assert lines[0][146] == "4"


def test_issue9_via_transporte_defaults_to_1():
    header = _make_header()
    header.pop("via_transporte", None)
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    assert lines[0][146] == "1"


# ---------------------------------------------------------------------------
# Issue 10 — Número do Item (field 10) is a sequential NF counter
# ---------------------------------------------------------------------------

def test_issue10_item_counter_sequential():
    header = _make_header()
    items = [_make_item(total_value=100.0, item_sequence=str(i).zfill(2)) for i in range(1, 4)]
    _, lines = _build_and_split(header, items)
    # ITENS field 10 (pos 053-054) = indices 52:54
    for idx, line in enumerate(lines[1:], start=1):
        field = line[52:54]
        assert field == str(idx).zfill(2), f"Item {idx}: field 10 should be '{str(idx).zfill(2)}', got '{field}'"


# ---------------------------------------------------------------------------
# Issue 11 — MV_EIC0010 must control whether ICMS rate is emitted in CAPA or ITENS
# ---------------------------------------------------------------------------

def test_issue11_mv_eic0010_header_source_puts_icms_rate_in_capa_only():
    header = _make_header(mv_eic0010_source="HEADER", aliq_icms_capa=12.0)
    item = _make_item(total_value=1230.0, aliq_icms=18.0)
    _, lines = _build_and_split(header, [item])

    capa = lines[0]
    item_line = lines[1]

    assert capa[20:27] == "0012.00"
    assert item_line[678:683] == "00.00"


def test_issue11_mv_eic0010_items_source_puts_icms_rate_in_items_only():
    header = _make_header(mv_eic0010_source="ITEMS")
    item = _make_item(total_value=1230.0, aliq_icms=18.0)
    _, lines = _build_and_split(header, [item])

    capa = lines[0]
    item_line = lines[1]

    assert capa[20:27] == "0000.00"
    assert item_line[678:683] == "18.00"


# ---------------------------------------------------------------------------
# Issue 12 — MV_EIC0076 must constrain PO / Invoice input lengths
# ---------------------------------------------------------------------------

def test_issue12_mv_eic0076_standard_15_trims_po_and_invoice_inputs():
    header = _make_header(
        mv_eic0076_mode="STANDARD_15",
        numero_po="PO-12345678901234567",
    )
    item = _make_item(
        total_value=1230.0,
        invoice_number="INV-12345678901234567",
    )
    _, lines = _build_and_split(header, [item])

    assert lines[0][357:374] == "PO-123456789012  "
    assert lines[1][361:376] == "INV-12345678901"


def test_issue12_mv_eic0076_field_width_allows_17_char_po():
    header = _make_header(
        mv_eic0076_mode="FIELD_WIDTH",
        numero_po="PO-12345678901234",
    )
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])

    assert lines[0][357:374] == "PO-12345678901234"


def test_reference_date_field_defaults_to_zeros():
    header = _make_header()
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    assert lines[0][74:80] == "000000"


def test_discount_and_iof_default_to_zero_not_blank():
    header = _make_header()
    item = _make_item(total_value=1230.0)
    _, lines = _build_and_split(header, [item])
    item_line = lines[1]
    assert item_line[567:582] == "000000000000.00"
    assert item_line[582:597] == "000000000000.00"


def test_lote_blank_forces_validade_blank():
    header = _make_header()
    item = _make_item(total_value=1230.0, lote="", validade="20260131")
    _, lines = _build_and_split(header, [item])
    item_line = lines[1]
    assert item_line[660:670] == " " * 10
    assert item_line[670:678] == " " * 8


def test_asterisks_kept_in_pli_and_stripped_from_li_codes():
    header = _make_header()
    item = _make_item(
        total_value=1230.0,
        li_number="*00000318*",
        codigo_li="*123456*",
        codigo_li_substitutiva="*789012*",
    )
    _, lines = _build_and_split(header, [item])
    item_line = lines[1]
    
    # Field 32: num_pli (428:438) keeps the asterisks, as the client's files do
    assert item_line[428:438] == "*00000318*"
    # Fields 58/59 still have the asterisks stripped
    # Field 58: codigo_li is at 697:707 (length 10)
    assert item_line[697:707] == "123456    "
    # Field 59: codigo_li_substitutiva is at 707:717 (length 10)
    assert item_line[707:717] == "789012    "

    # Verify parse_item strips the asterisks when parsing
    parsed_item = parse_item(item_line, 1)
    assert parsed_item["num_pli"] == "00000318"
    assert parsed_item["codigo_li"] == "123456"
    assert parsed_item["codigo_li_substitutiva"] == "789012"


def test_special_characters_ascii_cleaning():
    header = _make_header(exporter_name="MÖBEL & CO. LTDA - FILIAL BRASIL")
    item = _make_item(
        total_value=1200.0,
        description="Parafuso para Terminais de Fixação com Cabeça de Latão - nº 5"
    )
    _, lines = _build_and_split(header, [item])
    
    # 1. Header exporter name (Field 43: indices 297:357)
    # "MÖBEL & CO. LTDA - FILIAL BRASIL" should normalize 'Ö' to 'O' and keep other ASCII.
    # Note that 'º' is replaced with ' '.
    exporter_field = lines[0][297:357]
    assert "MOBEL & CO. LTDA - FILIAL BRASIL" in exporter_field
    
    # 2. Item description (Field 17: indices 111:261)
    # "Parafuso para Terminais de Fixação com Cabeça de Latão - nº 5"
    # 'ç' -> 'c', 'ã' -> 'a', 'ê' -> 'e', 'ã' -> 'a', 'º' -> ' '
    desc_field = lines[1][111:261]
    assert "Parafuso para Terminais de Fixacao com Cabeca de Latao - n  5" in desc_field


