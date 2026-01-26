
import pytest
from fastapi.testclient import TestClient
from backend.app import app
import json

client = TestClient(app)

# Mock XML Data
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

def test_extract_endpoint():
    response = client.post(
        "/extract",
        files={"xml_file": ("test.xml", MOCK_XML, "text/xml")}
    )
    assert response.status_code == 200
    data = response.json()
    
    # Check Header
    assert "header" in data
    header = data["header"]
    assert header["di_number"] == "2200000001"
    assert header["exporter_name"] == "TEST EXPORTER LTD"
    assert header["numero_nota"] == "" # Should be empty for user input
    
    # Check Items
    assert "items" in data
    items = data["items"]
    assert len(items) == 1
    item = items[0]
    assert item["ncm"] == "85044021"
    assert item["internal_code"] == "" # Should be empty

def test_generate_endpoint_success():
    # 1. Prepare Request Payload
    payload = {
        "header": {
            "di_number": "2200000001",
            "di_date": "20/01/2025",
            "exporter_name": "TEST EXPORTER LTD",
            "valor_total_frete": "150.00",
            "valor_total_seguro": "50.50",
            # User inputs
            "numero_nota": "000123",
            "data_emissao": "01/02/2026",
            "data_entrada": "02/02/2026",
            "cfop": "3102",
            "numero_po": "",
            "perc_reducao": "",
            "cod_importador": "",
            "cod_transportador": "",
            "cod_exportador": ""
        },
        "items": [
            {
                "adicao_number": "001",
                "ncm": "85044021",
                "description": "SENSOR INDUCTIVE",
                "qty_commercial": "10",
                "unit_commercial": "UN",
                "unit_value": "5.00",
                "total_value": "50.00",
                "item_sequence": "1",
                # User inputs
                "internal_code": "PROD-001",
                "output_unit": "UN"
            }
        ]
    }
    
    # 2. Call Generate
    response = client.post("/generate", json=payload)
    
    if response.status_code != 200:
        print("\nAPI Error:", response.json())
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/plain; charset=utf-8"
    assert "attachment; filename=NF_2200000001.txt" in response.headers["content-disposition"]
    
    content = response.content.decode('utf-8')
    assert "000123" in content # Note number
    assert "PROD-001" in content # Internal Code

def test_generate_endpoint_validation_error():
    # Missing required fields
    payload = {
        "header": {
            "numero_nota": "", # Missing
            "data_emissao": "", # Missing
            "data_entrada": "", # Missing
            "cfop": "" # Missing
        },
        "items": []
    }
    
    response = client.post("/generate", json=payload)
    assert response.status_code == 422
    assert "errors" in response.json()["detail"]
