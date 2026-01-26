"""Test the TXT parser with the example file."""
import sys
sys.path.insert(0, r'z:\Github\My Projects\Emissor_nfse_from_di')

from backend.parsers.txt_parser import parse_txt_content

with open(r'z:\Github\My Projects\Emissor_nfse_from_di\format_guidelines\021C-2025 - ESPELHO DE NF txt.txt', 'rb') as f:
    content = f.read()

header, items = parse_txt_content(content)
print('=== HEADER ===')
print(f"Numero Nota: {header['numero_nota']}")
print(f"CFOP: {header['cfop']}")
print(f"Data Emissao: {header['data_emissao']}")
print(f"Exportador: {header['nome_exportador']}")
print(f"Total Items: {len(items)}")
print()
print('=== FIRST ITEM ===')
print(f"NCM: {items[0]['ncm']}")
print(f"Cod Produto: {items[0]['cod_produto']}")
print(f"Descricao: {items[0]['descricao'][:50]}...")
print(f"Quantidade: {items[0]['quantidade']}")
