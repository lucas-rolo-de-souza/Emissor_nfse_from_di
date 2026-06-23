import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from backend.parsers.xml_parser import parse_di_xml

with open(root_dir / 'format_guidelines' / 'Eletra.xml', 'rb') as f:
    xml_content = f.read()

header, adicoes = parse_di_xml(xml_content)
print('CHECKING DATA EXTRACTION:')
print(f"Header Frete Total: '{header.get('frete_total')}'")
print(f"Header Seguro Total: '{header.get('seguro_total')}'")
print(f"Total Adicoes: {len(adicoes)}")

if adicoes:
    first_adicao = adicoes[0]
    print(f"Adicao 1 Number: {first_adicao.get('number')}")
    print(f"Adicao 1 Supplier: {first_adicao.get('supplier', {}).get('name')}")
    print(f"Adicao 1 Incoterm: {first_adicao.get('incoterm', {}).get('term')}")
    print(f"Adicao 1 Tax II Base: {first_adicao.get('taxes', {}).get('ii', {}).get('base_calc')}")
    print(f"Adicao 1 Tax II Rate: {first_adicao.get('taxes', {}).get('ii', {}).get('rate')}")
    print(f"Adicao 1 Tax II Value Due: {first_adicao.get('taxes', {}).get('ii', {}).get('value_due')}")
    
    if first_adicao['items']:
        item = first_adicao['items'][0]
        print(f"Item 1 Sequence: {item.get('sequence')}")
        print(f"Item 1 Desc: {item.get('description')[:50]}...")
        print(f"Item 1 Unit Value: {item.get('unit_value')}")
