import re
import sys
from collections import defaultdict

# Force UTF-8 output if possible, otherwise print safe characters
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\souza\Downloads\AUDITADO_v3_DI_ARQUIVO_LMAO_OK4_CRLF (1).txt_error.log"

errors = []
with open(log_path, 'r', encoding='utf-8', errors='replace') as f:
    for line in f:
        if line.startswith("Line "):
            errors.append(line.strip())

print(f"Total error lines found: {len(errors)}")

# Group by field/error type
grouped_errors = defaultdict(list)
for err in errors:
    # Pattern to extract: Line X | Cols Y | Field: Z | Expected: ... | Found: ...
    match = re.match(r"Line (\d+) \| Cols ([^|]+) \| Field: ([^|]+) \| Expected: (.*) \| Found: (.*)", err)
    if match:
        line_num, cols, field, expected, found = match.groups()
        # Clean up field name to prevent print issues
        field = field.replace('\u00e7\u00e3', 'ca').replace('\ufffd', '?')
        grouped_errors[field].append({
            'line': line_num,
            'cols': cols,
            'expected': expected,
            'found': found
        })
    else:
        grouped_errors['Other'].append({'raw': err})

for field, occurrences in grouped_errors.items():
    safe_field = field.encode('ascii', errors='replace').decode('ascii')
    print(f"\n=== Field: {safe_field} (Occurrences: {len(occurrences)}) ===")
    if len(occurrences) > 0:
        first = occurrences[0]
        if 'raw' in first:
            for occ in occurrences[:5]:
                safe_raw = occ['raw'].encode('ascii', errors='replace').decode('ascii')
                print(f"  Raw: {safe_raw}")
            if len(occurrences) > 5:
                print(f"  ... and {len(occurrences) - 5} more")
        else:
            safe_expected = first['expected'].encode('ascii', errors='replace').decode('ascii')
            safe_found = first['found'].encode('ascii', errors='replace').decode('ascii')
            print(f"  Expected: {safe_expected}")
            print(f"  Sample Found (Line {first['line']}, Cols {first['cols']}): {safe_found}")
            # List some affected lines
            lines_list = [occ['line'] for occ in occurrences]
            print(f"  Affected Lines: {', '.join(lines_list[:15])}" + ("..." if len(lines_list) > 15 else ""))
