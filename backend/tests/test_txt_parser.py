"""Test the TXT parser with the example file."""
from pathlib import Path
import pytest
from backend.parsers.txt_parser import parse_txt_content

def test_parse_example_file():
    root_dir = Path(__file__).resolve().parent.parent.parent
    example_path = root_dir / 'format_guidelines' / '021C-2025 - ESPELHO DE NF txt.txt'
    
    if not example_path.exists():
        pytest.skip(f"Example file {example_path} does not exist")
        
    with open(example_path, 'rb') as f:
        content = f.read()

    header, items = parse_txt_content(content)
    assert header['numero_nota'] is not None
    assert len(items) > 0
