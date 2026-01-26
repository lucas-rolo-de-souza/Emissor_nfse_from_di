"""Test the txt_builder output format matches example."""

import sys
sys.path.insert(0, r'z:\Github\My Projects\Emissor_nfse_from_di')

from backend.formatters.txt_builder import build_txt_content

# Create test data matching the example header
header_data = {
    'numero_nota': '000000325',
    'cfop': '3101',
    'data_emissao': '12082025',
    'data_entrada': '20250825',
    'di_date': '20250825',
    'numero_di': '2518807267',
    'exporter_name': 'HEXING ELECTRICAL (NINGBO)., LTD',
    'numero_po': '021C/2025',
    'valor_total_frete': 0,
    'valor_total_seguro': 0,
    'perc_reducao': 0,
}

# Create test items (matching example structure)
items_data = [
    {
        'ncm': '73181500',
        'internal_code': '3030109480',
        'qty_commercial': 3434000.000,
        'output_unit': 'UN',
        'unit_value': 20853.75,
        'total_value': 320826.91,
        'description': 'Parafuso para Terminais',
        'frete_item': 28219.22,
        'seguro_item': 193.16,
        'net_weight': 11919.84,
        'li_number': '*00000318*',
        'adicao_number': '001',
        'item_sequence': '001',
    }
]

# Build the txt content
result = build_txt_content(header_data, items_data)

# Split by CR to get lines
lines = result.split('\r')

print(f"Total lines: {len(lines)}")
print()

for idx, line in enumerate(lines):
    print(f"Line {idx+1}: length={len(line)}, type={line[0] if line else 'empty'}")

print()
print("Expected: Header=380, Item=696")
print()

# Validate lengths
header_ok = len(lines[0]) == 380
item_ok = all(len(line) == 696 for line in lines[1:] if line)

print(f"Header length OK: {header_ok} (got {len(lines[0])})")
if lines[1:]:
    print(f"Item length OK: {item_ok} (got {len(lines[1])})")
