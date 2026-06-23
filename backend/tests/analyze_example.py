"""Analyze the example output file to understand the format."""

from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
example_path = root_dir / 'format_guidelines' / '021C-2025 - ESPELHO DE NF txt.txt'

with open(example_path, 'rb') as f:
    content = f.read()

# According to layout: Line Delimiter is CR (CHR(13) only)
lines = content.split(b'\r')  
print(f'Total lines (CR split): {len(lines)}')
print()

for idx, line in enumerate(lines):
    # Remove any leading \n from previous CR
    clean_line = line.lstrip(b'\n')
    if clean_line:
        first_char = chr(clean_line[0])
        print(f'Line {idx+1}: length={len(clean_line)}, type={first_char}')
