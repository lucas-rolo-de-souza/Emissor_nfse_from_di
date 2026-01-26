
from backend.parsers.xml_parser import parse_di_xml, ICMS_DEFAULTS
import unittest
from unittest.mock import patch, MagicMock

class TestIcmsCalculation(unittest.TestCase):
    
    @patch('backend.parsers.xml_parser.validate_with_xsd')
    def test_icms_calculation_logic(self, mock_validate):
        mock_validate.return_value = None
        
        # Test Case 1: XML has NCM in DEFAULTS list (e.g. 85044090 -> 25%)
        # XML has Quantity 2, Unit Value 100 -> Merchandise Value 200.
        # XML has NO ICMS val provided.
        # Expected: Rate 25%, Base 200, Value 50.
        
        xml_content = b"""<?xml version="1.0" encoding="UTF-8"?>
        <ListaDeclaracoes>
            <declaracaoImportacao>
                <numeroDI>DI_CALC_TEST</numeroDI>
                <adicao>
                    <numeroAdicao>1</numeroAdicao>
                    <dadosMercadoriaCodigoNcm>8504.40.90</dadosMercadoriaCodigoNcm>
                    <mercadoria>
                         <descricaoMercadoria>Item 1</descricaoMercadoria>
                         <quantidade>2</quantidade>
                         <valorUnitario>100.00</valorUnitario>
                    </mercadoria>
                </adicao>
            </declaracaoImportacao>
        </ListaDeclaracoes>
        """
        
        header, adicoes = parse_di_xml(xml_content)
        icms = adicoes[0]['taxes']['icms']
        
        self.assertEqual(icms['rate'], 25.0)
        self.assertEqual(icms['base_calc'], 200.0) # 2 * 100
        self.assertEqual(icms['value_collect'], 50.0) # 200 * 0.25
        
        print("Success: ICMS Calculated correctly from defaults and merch value!")

if __name__ == '__main__':
    unittest.main()
