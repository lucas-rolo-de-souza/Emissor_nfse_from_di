
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

MOCK_XML = b"""
<ListaDeclaracoes>
    <declaracaoImportacao>
        <numeroDI>2200000001</numeroDI>
        <dataRegistro>20/01/2025</dataRegistro>
        <freteTotalReais>150.00</freteTotalReais>
        <seguroTotalReais>50.50</seguroTotalReais>
        <adicao>
            <numeroAdicao>001</numeroAdicao>
            <dadosMercadoriaCodigoNcm>85044021</dadosMercadoriaCodigoNcm>
            <fornecedorNome>TEST EXPORTER LTD</fornecedorNome>
            <mercadoria>
                <descricaoMercadoria>SENSOR INDUCTIVE</descricaoMercadoria>
                <quantidade>10</quantidade>
                <unidadeMedida>UN</unidadeMedida>
                <valorUnitario>5.00</valorUnitario>
                <valorTotalCondicaoVenda>50.00</valorTotalCondicaoVenda>
            </mercadoria>
        </adicao>
    </declaracaoImportacao>
</ListaDeclaracoes>
"""

def _make_adicao(ncm="85044021", internal_code="PROD-001"):
    return {
        "number": "001",
        "ncm": ncm,
        "net_weight": 1.0,
        "gross_weight": 1.0,
        "fob_currency": 50.0,
        "fob_reais": 50.0,
        "freight_reais": 0.0,
        "insurance_reais": 0.0,
        "supplier": {"name": "TEST EXPORTER LTD"},
        "incoterm": {"term": "FOB", "local": "", "method_val_code": "", "method_val_name": ""},
        "logistics": {
            "origin_country_code": "",
            "origin_country_name": "",
            "acquisition_country_code": "",
            "acquisition_country_name": "",
        },
        "taxes": {
            "ii":     {"base_calc": 0, "rate": 0, "rate_reduced": 0, "value_due": 0, "value_collect": 0},
            "ipi":    {"base_calc": 0, "rate": 0, "rate_reduced": 0, "value_due": 0, "value_collect": 0},
            "pis":    {"base_calc": 0, "rate": 0, "rate_reduced": 0, "value_due": 0, "value_collect": 0},
            "cofins": {"base_calc": 0, "rate": 0, "rate_reduced": 0, "value_due": 0, "value_collect": 0},
            "icms":   {"base_calc": 0, "rate": 0, "rate_reduced": 0, "value_due": 0, "value_collect": 0},
        },
        "nves": [],
        "items": [
            {
                "sequence": "001",
                "description": "SENSOR INDUCTIVE",
                "qty": 10.0,
                "unit": "UN",
                "unit_value": 5.0,
                "internal_code": internal_code,
                "output_unit": "UN",
            }
        ],
    }


def _make_header(**overrides):
    base = {
        "di_number": "2200000001",
        "di_date": "20250120",
        "numero_processo": "PROC-001",
        "exporter_name": "TEST EXPORTER LTD",
        "valor_total_frete": 150.0,
        "valor_total_seguro": 50.5,
        "numero_nota": "000123",
        "data_emissao": "20260201",
        "data_entrada": "20260202",
        "cfop": "3102",
    }
    base.update(overrides)
    return base


@patch("backend.parsers.xml_parser.validate_with_xsd", return_value=None)
def test_extract_endpoint(mock_validate):
    response = client.post(
        "/extract",
        files={"xml_file": ("test.xml", MOCK_XML, "text/xml")}
    )
    assert response.status_code == 200
    data = response.json()

    assert "header" in data
    assert data["header"]["di_number"] == "2200000001"
    assert data["header"]["numero_nota"] == ""

    assert "adicoes" in data
    assert len(data["adicoes"]) == 1
    assert data["adicoes"][0]["ncm"] == "85044021"


def test_generate_endpoint_success():
    payload = {
        "header": _make_header(),
        "adicoes": [_make_adicao()],
    }

    response = client.post("/generate", json=payload)

    if response.status_code != 200:
        print("\nAPI Error:", response.json())

    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]

    content = response.content.decode("latin-1")
    assert "000123" in content
    assert "PROD-001" in content


def test_generate_endpoint_validation_error():
    payload = {
        "header": {
            "numero_nota": "",
            "data_emissao": "",
            "data_entrada": "",
            "cfop": "",
        },
        "adicoes": [],
    }

    response = client.post("/generate", json=payload)
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, (list, dict))


def test_generate_no_warning_when_complete():
    payload = {
        "header": _make_header(total_additions=1),
        "adicoes": [_make_adicao()],
    }
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    assert "x-warnings" not in response.headers


def test_generate_warns_when_additions_left_out():
    import json
    payload = {
        "header": _make_header(total_additions=2),
        "adicoes": [_make_adicao()],
    }
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    warnings = json.loads(response.headers["x-warnings"])
    assert len(warnings) == 1
    assert "2 adi" in warnings[0] and "1 foram enviadas" in warnings[0]


def test_parse_txt_warns_when_item_count_mismatch():
    payload = {"header": _make_header(), "adicoes": [_make_adicao()]}
    txt = client.post("/generate", json=payload).content
    assert client.post("/parse-txt", files={"txt_file": ("a.txt", txt)}).json()["warnings"] == []

    # Header declares 1 item (positions 73-74); claim 2 while the file keeps 1 item line
    lines = txt.decode("utf-8").split("\r\n")
    lines[0] = lines[0][:72] + "02" + lines[0][74:]
    tampered = "\r\n".join(lines).encode("utf-8")
    body = client.post("/parse-txt", files={"txt_file": ("a.txt", tampered)}).json()
    assert len(body["warnings"]) == 1
    assert "2 itens" in body["warnings"][0] and "1 linhas" in body["warnings"][0]


def _generate_lines(header_overrides=None):
    payload = {
        "header": _make_header(**(header_overrides or {})),
        "adicoes": [_make_adicao()],
    }
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    return response.content.decode("utf-8").split("\r\n")


def test_client_styling_ncm_cfop_lancamento_and_unit():
    header, item = _generate_lines()[:2]
    assert header[27:33] == "  3102"          # CFOP right-aligned, space-padded
    assert item[14:20] == "      "            # Número do Lançamento blank
    assert item[20:30] == "85044021  "        # NCM left-aligned, space-padded
    assert item[66:69] == "UN "


def test_unit_name_is_normalized():
    from backend.formatters.txt_builder import normalize_unit
    assert normalize_unit("UNIDADE             ") == "UN"
    assert normalize_unit("kg") == "KG"


def test_header_cnpj_comes_from_importer_code():
    header = _generate_lines({"importer_code": "12115480000387"})[0]
    assert header[38:52] == "12115480000387"


def test_tax_suspension_zeroes_ipi_pis_cofins():
    adicao = _make_adicao()
    adicao["taxes"]["ipi"].update(rate=9.75, base_calc=100.0, value_due=9.75, value_collect=9.75)
    adicao["taxes"]["pis"].update(rate=2.1, base_calc=100.0, value_due=2.1, value_collect=2.1)
    adicao["taxes"]["cofins"].update(rate=10.45, base_calc=100.0, value_due=10.45, value_collect=10.45)

    def item_line(suspend):
        payload = {"header": _make_header(suspensao_ipi_pis_cofins=suspend), "adicoes": [adicao]}
        return client.post("/generate", json=payload).content.decode("utf-8").split("\r\n")[1]

    on, off = item_line(True), item_line(False)
    # Alíq. IPI (322-326), Alíq. PIS (472-477), Valor PIS (502-516), Alíq. COFINS (517-522)
    assert on[321:326] == "00.00" and off[321:326] == "09.75"
    assert on[471:477] == "000.00" and off[471:477] == "002.10"
    assert on[501:516] == "000000000000.00"
    assert on[516:522] == "000.00" and off[516:522] == "010.45"
