import xmltodict
import os
from typing import List, Dict, Any, Tuple
from lxml import etree
import re

# --- DEFAULT CONFIGURATION ---
ICMS_DEFAULTS = {
    '85044090': 25.0,
    '85176272': 35.0,
    '85367000': 42.5,
    '90283031': 25.0
}


def sanitize_decimal(value: Any, decimals: int = 5) -> float:
    """
    Parse fixed-width numeric strings from DI XML.
    
    Common precisions:
    - Quantities/Weights: 5 decimals
    - Freight/Insurance: 2 decimals
    - Merchandise Values: 7 decimals
    """
    if value is None:
        return 0.0
    try:
        # Remove any non-numeric characters except minus
        s = str(value).strip()
        if not s:
            return 0.0
        # Already has decimal point? Just parse it
        if '.' in s or ',' in s:
            return float(s.replace(',', '.'))
        # Otherwise, implies decimals based on spec
        # Handle empty or purely whitespace strings
        if not s.replace('-', '').isdigit():
            return 0.0
            
        val = int(s)
        return val / (10 ** decimals)
    except (ValueError, TypeError):
        return 0.0


def validate_with_xsd(xml_content: bytes, xsd_path: str = None) -> None:
    """
    Validates the XML content against the official Siscomex XSD (Consulta format).
    Reference: https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/sistemas/siscomex-importacao-web/declaracao-de-importacao/funcionalidades/links-para-arquivos/esquema-xsd-do-xml-da-consulta.pdf
    """
    if xsd_path is None:
        # Default to relative path in format_guidelines
        # Assuming we are running from backend/ or similar, adjust relative path logic
        # For now, let's try to locate it relative to project root or use an absolute path ref if possible
        # Robust way: use relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # parser is in backend/parsers/, XSD is in format_guidelines/
        xsd_path = os.path.join(current_dir, '..', '..', 'format_guidelines', 'DI_SCHEMA.xsd')
    
    if not os.path.exists(xsd_path):
        # Fallback or warning if XSD not found (e.g. in prod env without src docs)
        print(f"Warning: XSD Schema not found at {xsd_path}. Skipping validation.")
        return

    try:
        xmlschema_doc = etree.parse(xsd_path)
        xmlschema = etree.XMLSchema(xmlschema_doc)
        
        # Parse xml content to element tree
        xml_root = etree.fromstring(xml_content)
        
        xmlschema.assertValid(xml_root)
    except etree.DocumentInvalid as e:
        raise ValueError(f"XML Validation Failed: {e}")
    except Exception as e:
        raise ValueError(f"XML Validation Error: {e}")


def parse_di_xml(xml_content: bytes) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Parses the DI XML content (Consulta format), extracting comprehensive data from Header, Adicoes, and Items.
    Validates against strict XSD schema before parsing.
    """
    try:
        # 1. Validate against XSD
        validate_with_xsd(xml_content)

        xml_str = xml_content.decode('utf-8', errors='ignore')
        start_idx = xml_str.find('<')
        if start_idx == -1:
             raise ValueError("No XML tag found")
        xml_str = xml_str[start_idx:]
        
        parsed = xmltodict.parse(xml_str)
    except Exception as e:
        raise ValueError(f"Failed to parse XML: {e}")

    root = parsed.get('ListaDeclaracoes', {}).get('declaracaoImportacao', {})
    # Fallback if structure is slightly different (direct root)
    if not root:
        root = parsed.get('declaracaoImportacao', {})
    
    if not root:
        raise ValueError("Invalid DI XML structure: 'declaracaoImportacao' not found.")

    adicoes_raw = root.get('adicao', [])
    if isinstance(adicoes_raw, dict):
        adicoes_raw = [adicoes_raw]

    # --- helper to get text even if None ---
    def get_text(node, key):
        return node.get(key) or ''

    # --- Header Extraction ---
    # Try to find header generic info from root or first adicao
    first_adicao = adicoes_raw[0] if adicoes_raw else {}
    
    header_info = {
        'di_number': get_text(root, 'numeroDI'),
        'di_date': get_text(root, 'dataRegistro'),
        'frete_total': sanitize_decimal(root.get('freteTotalReais'), 2),
        'seguro_total': sanitize_decimal(root.get('seguroTotalReais'), 2),
        'total_additions': len(adicoes_raw),
        # Importer
        'importer_code': get_text(root, 'importadorNumero'), 
        'importer_name': get_text(root, 'importadorNome'),
        # Exporter (Assume from first adicao if not in root, usually DI has one exporter per DI)
        'exporter_name': get_text(first_adicao, 'fornecedorNome'),
        'exporter_city': get_text(first_adicao, 'fornecedorCidade'),
        'exporter_state': get_text(first_adicao, 'fornecedorEstado'),
        'exporter_country': get_text(first_adicao, 'fornecedorPaisNome'), # Logic to find country name? XML usually has code/name pair
        # Logistics
        'urf_entry': get_text(root, 'dadosCargaUrfEntradaCodigo') or get_text(first_adicao, 'dadosCargaUrfEntradaCodigo'),
        'transport_via': get_text(root, 'dadosCargaViaTransporteCodigo') or get_text(first_adicao, 'dadosCargaViaTransporteCodigo'),
        'provenance_country_code': get_text(root, 'dadosCargaPaisProcedenciaCodigo') or get_text(first_adicao, 'dadosCargaPaisProcedenciaCodigo'),
        'duimp_number': get_text(root, 'numeroDUIMP') or get_text(root, 'numeroDeclaracaoUnica'),
        'transport_code': get_text(root, 'viaTransportePaisTransportadorCodigo') or get_text(first_adicao, 'viaTransportePaisTransportadorCodigo'), 
    }

    # --- Invoice Extraction ---
    # Look for documentoInstrucaoDespacho with type '01' (Fatura Comercial)
    docs = root.get('documentoInstrucaoDespacho', [])
    if isinstance(docs, dict):
        docs = [docs]
    
    invoice_number = ''
    for doc in docs:
        code = get_text(doc, 'codigoTipoDocumentoDespacho')
        if code == '01': # Fatura Comercial
            invoice_number = get_text(doc, 'numeroDocumentoDespacho')
            break
            
    header_info['invoice_number'] = invoice_number

    parsed_adicoes = []
    
    for adicao in adicoes_raw:
        adicao_number = get_text(adicao, 'numeroAdicao')
        
        # --- Supplier (Fornecedor) ---
        supplier = {
            'name': get_text(adicao, 'fornecedorNome'),
            'address': get_text(adicao, 'fornecedorLogradouro'),
            'number': get_text(adicao, 'fornecedorNumero'),
            'complement': get_text(adicao, 'fornecedorComplemento'),
            'city': get_text(adicao, 'fornecedorCidade'),
            'state': get_text(adicao, 'fornecedorEstado'),
            'country_name': get_text(adicao, 'paisOrigemMercadoriaNome') # Usually 'fornecedorPaisNome' isn't explicitly 'fornecedor' pre-fixed in some versions, checking sample...
            # Sample has: fornecedorNome, fornecedorLogradouro, fornecedorCidade, fornecedorEstado. 
            # Country usually comes from 'paisAquisicaoMercadoriaNome' or 'paisOrigemMercadoriaNome'
        }
        
        # --- Incoterm & Condition ---
        incoterm = {
            'term': get_text(adicao, 'condicaoVendaIncoterm'),
            'local': get_text(adicao, 'condicaoVendaLocal'),
            'method_val_code': get_text(adicao, 'condicaoVendaMetodoValoracaoCodigo'),
            'method_val_name': get_text(adicao, 'condicaoVendaMetodoValoracaoNome'),
        }

        # --- Currency ---
        currency = {
            'code': get_text(adicao, 'condicaoVendaMoedaCodigo'),
            'name': get_text(adicao, 'condicaoVendaMoedaNome'),
            'rate': sanitize_decimal(adicao.get('dadosCambiaisValorRealCambio'), 5) # Not always present directly if multiple rates?
        }
        
        # --- Taxes ---
        # Helper to extract tax block handling flat or nested structure
        def extract_tax(prefix_candidates: List[str]):
            # usage: extract_tax(['pisPasep', 'pis'])
            
            # Find the first existing node match
            node = {}
            found_prefix = None
            
            for p in prefix_candidates:
                # 1. Try finding nested node <pisPasep>...</pisPasep>
                if p in adicao and isinstance(adicao[p], dict):
                    node = adicao[p]
                    found_prefix = "" # Keys inside are just 'AliquotaAdValorem' usually
                    break
                
                # 2. Try identifying flat keys <pisPasepAliquotaAdValorem> by heuristic
                # We check if any key starts with this prefix
                matches = [k for k in adicao.keys() if k.startswith(p)]
                if matches:
                    node = adicao # The adicao itself has the keys
                    found_prefix = p # Keys are 'pisPasepAliquotaAdValorem'
                    break
            
            if found_prefix is None:
                # Default empty
                return {
                    'base_calc': 0.0, 'rate': 0.0, 'rate_reduced': 0.0, 
                    'value_due': 0.0, 'value_collect': 0.0, 
                    'regime_code': '', 'regime_name': ''
                }

            # Helper to get value with prefix or direct
            def get_val(key_suffix):
                # If found_prefix is "", we look for CamelCase key? 
                # Usually: <pisPasep><aliquotaAdValorem>
                # or <pisPasepBaseCalculo>
                
                # Case A: Nested with specific keys. Usually lowercase start or simply 'aliquotaAdValorem'?
                # XML to Dict usually preserves case. 
                # Let's try constructing the key.
                
                candidates = []
                if found_prefix == "":
                     # Indirect node access
                     # Likely keys: 'aliquotaAdValorem', 'AliquotaAdValorem', 'valorRecolher', etc.
                     # We try capitalized and uncapitalized
                     candidates.append(key_suffix) # BaseCalculo
                     candidates.append(key_suffix[0].lower() + key_suffix[1:]) # baseCalculo
                else:
                     # Flat access on adicao
                     # prefix + key_suffix
                     full = found_prefix + key_suffix
                     candidates.append(full)
                
                for c in candidates:
                    val = node.get(c)
                    if val is not None:
                        return val
                return None

            return {
                'base_calc': sanitize_decimal(get_val('BaseCalculo'), 2),
                'rate': sanitize_decimal(get_val('AliquotaAdValorem'), 2), 
                'rate_reduced': sanitize_decimal(get_val('AliquotaReduzida'), 2),
                'value_due': sanitize_decimal(get_val('ValorDevido') or get_val('AliquotaValorDevido'), 2),
                'value_collect': sanitize_decimal(get_val('ValorRecolher') or get_val('AliquotaValorRecolher'), 2),
                'regime_code': get_text(node, found_prefix + 'RegimeTributacaoCodigo' if found_prefix else 'regimeTributacaoCodigo') or get_text(node, found_prefix + 'RegimeTributacaoCodigo'), 
                # This text extraction is tricky with variable nesting, simplified for values primarily
            }

        icms_data = extract_tax(['icms', 'pisCofinsBaseCalculoAliquotaICMS'])
        
        # --- Apply Defaults if ICMS Rate is 0 ---
        current_ncm = get_text(adicao, 'dadosMercadoriaCodigoNcm')
        # Clean NCM just in case (remove dots)
        clean_ncm = ''.join(filter(str.isdigit, current_ncm))
        
        if icms_data['rate'] == 0.0 and clean_ncm in ICMS_DEFAULTS:
            icms_data['rate'] = ICMS_DEFAULTS[clean_ncm]
            # Likely we should assume base_calc is the merchandise value + taxes if not provided, 
            # but for now we only inject the Rate as requested.

        taxes = {
            'ii': extract_tax(['ii', 'impostoImportacao']),
            'ipi': extract_tax(['ipi']),
            'pis': extract_tax(['pisPasep', 'pis']), # Try pisPasep first (standard)
            'cofins': extract_tax(['cofins']),
            'icms': icms_data,
        }

        # --- NVEs ---
        nves = []
        nves_raw = adicao.get('nomenclaturaValorAduaneiro', [])
        if isinstance(nves_raw, dict):
            nves_raw = [nves_raw]
        for nve in nves_raw:
            nves.append({
                'attr': get_text(nve, 'atributo'),
                'spec': get_text(nve, 'especificacao'),
                'level': get_text(nve, 'nivelNome')
            })

        # --- Mercadorias (Items) ---
        items = []
        mercadorias = adicao.get('mercadoria', [])
        if isinstance(mercadorias, dict):
            mercadorias = [mercadorias]
            
        for mercadoria in mercadorias:
            desc = get_text(mercadoria, 'descricaoMercadoria')
            # Extract Internal Code from Description regex: (REF. <CODE>)
            # Matches "(REF. 123)" or "(REF.123)" or "(REF 123)" loosely if needed, user said "(REF. 3012103890)"
            # Regex: \(REF\.?\s*([\w\d]+)\)
            internal_code_match = re.search(r'\(REF\.?\s*([\w\d]+)\)', desc, re.IGNORECASE)
            extracted_code = internal_code_match.group(1) if internal_code_match else ''
            
            items.append({
                'sequence': get_text(mercadoria, 'numeroSequencialItem'),
                'description': desc,
                'qty': sanitize_decimal(mercadoria.get('quantidade'), 5),
                'unit': get_text(mercadoria, 'unidadeMedida'),
                'unit_value': sanitize_decimal(mercadoria.get('valorUnitario'), 7),
                'generated_internal_code': extracted_code # Store for later usage
            })

        # --- Construct Adicao Data ---
        adicao_data = {
            'number': adicao_number,
            'ncm': get_text(adicao, 'dadosMercadoriaCodigoNcm'),
            'li_number': get_text(adicao, 'numeroLI'),
            'net_weight': sanitize_decimal(adicao.get('dadosMercadoriaPesoLiquido'), 5),
            'gross_weight': 0.0, # Not explicit in Adicao usually
            
            # Money values
            'fob_currency': sanitize_decimal(adicao.get('condicaoVendaValorMoeda'), 2),
            'fob_reais': sanitize_decimal(adicao.get('condicaoVendaValorReais'), 2),
            'freight_reais': sanitize_decimal(adicao.get('freteValorReais'), 2),
            'insurance_reais': sanitize_decimal(adicao.get('seguroValorReais'), 2),
            
            # Complex Objects
            'logistics': {
                'origin_country_code': get_text(adicao, 'paisOrigemMercadoriaCodigo'),
                'origin_country_name': get_text(adicao, 'paisOrigemMercadoriaNome'),
                'acquisition_country_code': get_text(adicao, 'paisAquisicaoMercadoriaCodigo'),
                'acquisition_country_name': get_text(adicao, 'paisAquisicaoMercadoriaNome'),
            },
            'supplier': supplier,
            'incoterm': incoterm,
            'currency': currency,
            'taxes': taxes,
            'nves': nves,
            'items': items
        }
        
        parsed_adicoes.append(adicao_data)
            
    return header_info, parsed_adicoes
