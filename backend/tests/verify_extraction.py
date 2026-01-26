
import sys
import os
import json
from pathlib import Path

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.parsers.xml_parser import parse_di_xml

def verify():
    # Path to Eletra.xml under format_guidelines
    base_dir = Path(__file__).parent.parent.parent
    xml_path = base_dir / "format_guidelines" / "Eletra.xml"
    
    if not xml_path.exists():
        print(f"Error: {xml_path} not found.")
        return

    print(f"Testing extraction from: {xml_path}")
    
    with open(xml_path, 'rb') as f:
        content = f.read()
        
    try:
        header, adicoes = parse_di_xml(content)
        
        print("\n--- HEADER ---")
        print(json.dumps(header, indent=2, default=str))
        
        if not adicoes:
            print("Error: No Adicoes found!")
            return

        print(f"\nFound {len(adicoes)} Adicoes.")
        
        first_adicao = adicoes[0]
        print("\n--- FIRST ADICAO (Sample) ---")
        print(f"Number: {first_adicao['number']}")
        print(f"Targeting Invoice Number (Item 1): {first_adicao['items'][0].get('invoice_number', 'N/A')}") # Might be at header level in app.py logic, but let's check basic parser output
        
        print("Taxes:")
        print(json.dumps(first_adicao['taxes'], indent=2))
        
        print("Logistics:")
        print(json.dumps(first_adicao['logistics'], indent=2))
        
        print("Supplier:")
        print(json.dumps(first_adicao['supplier'], indent=2))
        
        # Check specific new fields
        print("\n--- VERIFICATION CHECKS ---")
        checks = {
            "DI Number": bool(header.get('di_number')),
            "Importer Code": bool(header.get('importer_code')),
            "Provenance Country": bool(header.get('provenance_country_code')),
            "ICMS in Taxes": 'icms' in first_adicao['taxes'],
            "Incoterm Extracted": bool(first_adicao['incoterm'].get('term')),
        }
        
        for key, passed in checks.items():
            status = "PASS" if passed else "FAIL (Might be missing in XML)"
            print(f"{key}: {status}")

    except Exception as e:
        print(f"Extraction Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify()
