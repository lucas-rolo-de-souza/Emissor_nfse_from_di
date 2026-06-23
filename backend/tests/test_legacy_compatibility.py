from pathlib import Path

import pytest

from backend.formatters.txt_builder import build_txt_content
from backend.parsers.txt_parser import parse_item, parse_txt_content

pytestmark = pytest.mark.legacy


def _make_header():
    return {
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
        "perc_reducao": "0",
    }


def _make_item():
    return {
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
        "total_value": 1230.0,
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


def test_parser_accepts_697_char_legacy_line_in_non_strict_mode():
    txt = build_txt_content(_make_header(), [_make_item()])
    line_717 = txt.splitlines()[1]
    result = parse_item(line_717[:697], index=0)
    assert result["tipo"] == "2"


def test_parser_accepts_688_char_legacy_line_in_non_strict_mode():
    txt = build_txt_content(_make_header(), [_make_item()])
    line_717 = txt.splitlines()[1]
    result = parse_item(line_717[:688], index=0)
    assert result["tipo"] == "2"


def test_reference_txt_files_parse_in_non_strict_mode():
    docs_dir = Path(__file__).resolve().parent.parent.parent / "docs" / "files"
    sample_paths = [
        docs_dir / "ARQUIVO_LMAO_OK4_CRLF.txt",
        docs_dir / "AUDITADO_V1_ARQUIVO_LMAO_OK4_CRLF.txt",
    ]

    existing_paths = [path for path in sample_paths if path.exists()]
    assert existing_paths, "Expected at least one reference TXT file under docs/files"

    for path in existing_paths:
        header, items = parse_txt_content(path.read_bytes())
        assert header["tipo"] == "1"
        assert items
