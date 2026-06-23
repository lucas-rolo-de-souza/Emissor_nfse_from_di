"""Compare two TXT files to find layout differences."""

from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
file1_path = root_dir / 'format_guidelines' / '021C-2025 - ESPELHO DE NF txt.txt'
file2_path = root_dir / 'format_guidelines' / 'nota_fiscal_1.txt'

with open(file1_path, 'rb') as f:
    content1 = f.read()
with open(file2_path, 'rb') as f:
    content2 = f.read()

# Split by CR (0x0D)
lines1 = content1.split(b'\x0d')
lines2 = content2.split(b'\x0d')

print("=== FILE STRUCTURE ===")
print(f"File1 lines: {len(lines1)}")
print(f"File2 lines: {len(lines2)}")

# Check header length  
h1 = lines1[0]
h2 = lines2[0]
print(f"\nHeader lengths: F1={len(h1)}, F2={len(h2)}")

# Check first item length
if len(lines1) > 1:
    i1 = lines1[1].lstrip(b'\x0a')
    print(f"File1 Item1 length: {len(i1)}")
if len(lines2) > 1:
    i2 = lines2[1].lstrip(b'\x0a')
    print(f"File2 Item1 length: {len(i2)}")

# Decode and compare
h1_str = h1.decode('utf-8', errors='replace')
h2_str = h2.decode('utf-8', errors='replace')

print("\n=== KEY HEADER FIELD COMPARISON ===")
fields = [
    ("04 Nota", 5, 14),
    ("06 Aliq ICMS", 20, 27),
    ("12 Qtd Itens", 72, 74),
    ("24 Num DI", 119, 129),
    ("43 Nome Exportador", 297, 357),
]
for name, s, e in fields:
    v1 = h1_str[s:e] if len(h1_str) >= e else "SHORT"
    v2 = h2_str[s:e] if len(h2_str) >= e else "SHORT"
    print(f"{name}: F1=[{v1.strip()}], F2=[{v2.strip()}]")

# Item comparison - decode
if len(lines1) > 1 and len(lines2) > 1:
    i1_str = lines1[1].lstrip(b'\x0a').decode('utf-8', errors='replace')
    i2_str = lines2[1].lstrip(b'\x0a').decode('utf-8', errors='replace')
    
    print("\n=== KEY ITEM FIELD COMPARISON ===")
    item_fields = [
        ("06 NCM", 20, 30),
        ("07 Cod Prod", 30, 50),
        ("11 Quantidade", 54, 65),
        ("17 Descricao", 110, 160),
        ("54 Validade", 669, 677),
        ("Extra 689-696", 688, 696),
    ]
    for name, s, e in item_fields:
        v1 = i1_str[s:e] if len(i1_str) >= e else "SHORT"
        v2 = i2_str[s:e] if len(i2_str) >= e else "SHORT"
        if v1 != v2:
            print(f"{name}: F1=[{v1}], F2=[{v2}]")
        else:
            print(f"{name}: SAME=[{v1}]")
