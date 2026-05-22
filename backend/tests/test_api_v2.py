
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
        "di_date": "20/01/2025",
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
