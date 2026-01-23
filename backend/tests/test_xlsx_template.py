
import sys
import os
import io
import pandas as pd
from openpyxl import load_workbook

# Add project root to path to allow 'from backend.services ...'
sys.path.append(os.getcwd())

from backend.services.generator import generate_template
from backend.services.processor import process_file_data

def test_template_flow():
    print("1. Generating Template...")
    template_buffer = generate_template()
    
    # Save for manual inspection if needed
    with open("test_template.xlsx", "wb") as f:
        f.write(template_buffer.getbuffer())
    
    print("2. Filling Template Mock Data...")
    wb = load_workbook(template_buffer)
    
    # Fill Header
    ws_header = wb['Cabecalho']
    # Headers are in row 1, data in row 2
    ws_header.append([
        "123456",           # Numero da Nota
        "22/01/2026",       # Data Emissao
        "23/01/2026",       # Data Entrada
        "150.00",           # Frete
        "50.50",            # Seguro
        "TEST EXPORTER LTD" # Exportador
    ])
    
    # Fill Items (Mapping)
    ws_items = wb['Itens']
    # NCM "85044021" is a common one, ensure it matches xml
    ws_items.append([
        "85044021",         # NCM
        "Desc Test", 
        "PROD-001",         # Internal Code
        "UN",               # Unit
        "3102"              # CFOP
    ])
    
    # Save populated xlsx
    input_xlsx = io.BytesIO()
    wb.save(input_xlsx)
    input_xlsx.seek(0)
    
    print("3. Creating Mock XML...")
    xml_content = b"""
    <ListaDeclaracoes>
        <declaracaoImportacao>
            <numeroDI>2200000001</numeroDI>
            <dataRegistro>20/01/2025</dataRegistro>
            <adicao>
                <numeroAdicao>001</numeroAdicao>
                <dadosMercadoriaCodigoNcm>85044021</dadosMercadoriaCodigoNcm>
                <dadosMercadoriaMedidaEstatisticaQuantidade>10</dadosMercadoriaMedidaEstatisticaQuantidade>
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
    
    print("4. Processing...")
    try:
        txt_output = process_file_data(xml_content, input_xlsx.getvalue())
        print("   Success! Output length:", len(txt_output))
        
        print("5. Validating Output Content...")
        lines = txt_output.split('\n')
        header_line = lines[0]
        
        # Check Note Number (Pos 006-014 -> index 5-14)
        note_num = header_line[5:14]
        print(f"   Note Number: '{note_num}' (Expected '000123456')")
        assert note_num == "000123456"
        
        # Check Exporter (Pos 298-357 -> index 297-357)
        # 43 Nome Exportador
        # Pos is 298. 298-1 = 297 index.
        exporter = header_line[297:357].strip()
        print(f"   Exporter: '{exporter}' (Expected 'TEST EXPORTER LTD')")
        assert "TEST EXPORTER LTD" in exporter
        
        # Check Dates (Emissao 14: 081-088 -> 80-88)
        # Entry 15: 089-096 -> 88-96
        dt_emissao = header_line[80:88]
        print(f"   Dt Emissao: '{dt_emissao}' (Expected '22012026')")
        assert dt_emissao == "22012026"

        print("   \nAll checks passed!")
        
        with open("test_output.txt", "w") as f:
            f.write(txt_output)
            
    except Exception as e:
        print(f"   FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_template_flow()
