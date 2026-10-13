from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import io
import json

# Import Services
from backend.parsers.xml_parser import parse_di_xml
from backend.parsers.txt_parser import parse_txt_content
from backend.formatters.txt_builder import (
    build_txt_content,
    get_icms_source,
    get_mv_eic0076_mode,
    get_po_input_max_length,
    get_invoice_input_max_length,
    is_valid_aaaammdd,
    resolve_header_icms_rate,
    ICMS_SOURCE_HEADER,
    ICMS_SOURCE_ITEMS,
    MV_EIC0076_STANDARD_15,
    MV_EIC0076_FIELD_WIDTH,
    VALID_ESPECIES,
)

app = FastAPI(title="Gerador de NFSE", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Warnings"],
)

# --- Pydantic Models for /generate ---
# --- Pydantic Models for /generate ---

class DetailedTax(BaseModel):
    base_calc: float
    rate: float
    rate_reduced: float = 0.0
    value_due: float
    value_collect: float
    regime_code: Optional[str] = None
    regime_name: Optional[str] = None

class TaxBreakdown(BaseModel):
    ii: DetailedTax
    ipi: DetailedTax
    pis: DetailedTax
    cofins: DetailedTax
    icms: DetailedTax

class SupplierData(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country_name: Optional[str] = None

class IncotermData(BaseModel):
    term: Optional[str] = None
    local: Optional[str] = None
    method_val_code: Optional[str] = None
    method_val_name: Optional[str] = None

class LogisticsData(BaseModel):
    origin_country_code: Optional[str] = None
    origin_country_name: Optional[str] = None
    acquisition_country_code: Optional[str] = None
    acquisition_country_name: Optional[str] = None

class NVEData(BaseModel):
    attr: Optional[str] = None
    spec: Optional[str] = None
    level: Optional[str] = None

class ItemData(BaseModel):
    sequence: Optional[str] = None
    description: Optional[str] = None
    qty: float
    unit: Optional[str] = None
    unit_value: float
    # User-provided fields
    internal_code: str
    output_unit: Optional[str] = None
    cfop: Optional[str] = None
    invoice_number: Optional[str] = None
    lote: Optional[str] = None
    validade: Optional[str] = None

class AdicaoData(BaseModel):
    number: Optional[str] = None
    ncm: str
    li_number: Optional[str] = None
    codigo_li: Optional[str] = None
    codigo_li_substitutiva: Optional[str] = None
    net_weight: float
    gross_weight: float = 0.0

    # Values
    fob_currency: float
    fob_reais: float
    freight_reais: float
    insurance_reais: float

    # Complex Nested Data
    supplier: SupplierData
    incoterm: IncotermData
    logistics: LogisticsData
    taxes: TaxBreakdown
    nves: List[NVEData]

    items: List[ItemData]

class HeaderData(BaseModel):
    document_type: str = "DI"
    di_number: Optional[str] = None
    duimp_number: Optional[str] = None
    versao_registro: Optional[str] = None
    di_date: Optional[str] = None
    exporter_name: Optional[str] = None
    exporter_city: Optional[str] = None
    exporter_country: Optional[str] = None
    importer_code: Optional[str] = None
    importer_name: Optional[str] = None
    importer_uf: Optional[str] = None
    urf_entry: Optional[str] = None
    transport_via: Optional[str] = None
    provenance_country_code: Optional[str] = None
    valor_total_frete: float = 0.0
    valor_total_seguro: float = 0.0
    total_additions: int = 0
    # User-provided fields
    numero_nota: str
    data_emissao: str
    data_entrada: str
    cfop: str
    numero_processo: Optional[str] = None
    numero_po: Optional[str] = None
    numero_pedido: Optional[str] = None
    especie: Optional[str] = None
    serie: Optional[str] = None
    perc_reducao: Optional[str] = None
    cod_importador: Optional[str] = None
    cod_transportador: Optional[str] = None
    cod_exportador: Optional[str] = None
    invoice_number: Optional[str] = None
    mv_eic0010_source: str = ICMS_SOURCE_ITEMS
    aliq_icms_capa: Optional[float] = None
    mv_eic0076_mode: str = MV_EIC0076_STANDARD_15
    uf_emitente: str = "AM"

class ExtractedData(BaseModel):
    header: HeaderData
    adicoes: List[AdicaoData]

class GenerateRequest(BaseModel):
    header: HeaderData
    adicoes: List[AdicaoData]


def _flatten_item(adicao: dict, item: dict, header_data: dict) -> dict:
    fob_reais = adicao['fob_reais']
    frete_item = adicao['freight_reais']
    seguro_item = adicao['insurance_reais']
    valor_ii = adicao['taxes']['ii']['value_due']
    valor_ipi = adicao['taxes']['ipi']['value_due']
    valor_pis = adicao['taxes']['pis']['value_collect']
    valor_cofins = adicao['taxes']['cofins']['value_collect']
    aliq_icms = adicao['taxes']['icms']['rate']

    # Field 14 spec: Valor Mercadoria = CIF + II
    cif = fob_reais + frete_item + seguro_item
    total_value = cif + valor_ii

    # ICMS base "por dentro": (CIF+II+IPI+PIS+COFINS) / (1 - aliq%)
    pre_icms = cif + valor_ii + valor_ipi + valor_pis + valor_cofins
    base_icms = 0.0 if aliq_icms == 0 else pre_icms / (1 - aliq_icms / 100)

    return {
        'adicao_number': adicao['number'],
        'ncm': adicao['ncm'],
        'description': item['description'],
        'qty_commercial': item['qty'],
        'unit_commercial': item['unit'],
        'unit_value': item['unit_value'],
        'total_value': total_value,
        'item_sequence': item['sequence'],
        'net_weight': adicao['net_weight'],
        'li_number': adicao['li_number'],
        'frete_item': frete_item,
        'seguro_item': seguro_item,
        'invoice_number': item.get('invoice_number') or header_data.get('invoice_number', ''),
        'di_number': header_data.get('di_number', ''),
        'numero_processo': header_data.get('numero_processo', ''),
        'fob_reais': fob_reais,
        'fob_currency': adicao['fob_currency'],
        'item_pedido_compra': str(item.get('sequence', '')).zfill(4)[:4],
        'numero_pedido': header_data.get('numero_pedido', '') or header_data.get('numero_po', ''),
        # II
        'aliq_ii': adicao['taxes']['ii']['rate'],
        'valor_ii': valor_ii,
        'base_ii': adicao['taxes']['ii']['base_calc'],
        # PIS
        'aliq_pis': adicao['taxes']['pis']['rate'],
        'base_pis': adicao['taxes']['pis']['base_calc'],
        'valor_pis': valor_pis,
        'qtde_pis': item['qty'],
        # COFINS
        'aliq_cofins': adicao['taxes']['cofins']['rate'],
        'base_cofins': adicao['taxes']['cofins']['base_calc'],
        'valor_cofins': valor_cofins,
        'qtde_cofins': item['qty'],
        # IPI
        'aliq_ipi': adicao['taxes']['ipi']['rate'],
        'valor_ipi': valor_ipi,
        'base_ipi': adicao['taxes']['ipi']['base_calc'],
        'aliq_esp_ipi': 0.0,
        'qtde_ipi': item['qty'],
        # ICMS
        'aliq_icms': aliq_icms,
        'base_icms': base_icms,
        'valor_icms_recolher': adicao['taxes']['icms']['value_collect'],
        # Costs
        'valor_desconto': 0.0,
        'valor_iof': 0.0,
        'despesas_aduaneiras': 0.0,
        # Logistics
        'lote': '',
        'validade': '',
        'perc_dif_icms': 0.0,
        # LI codes
        'codigo_li': adicao.get('codigo_li', ''),
        'codigo_li_substitutiva': adicao.get('codigo_li_substitutiva', ''),
        # User-provided
        'internal_code': item['internal_code'],
        'output_unit': item['output_unit'],
        'cfop': item.get('cfop') or header_data.get('cfop'),
    }


def collect_generation_warnings(header_data: dict, adicoes_data: list, items_flat: list) -> List[str]:
    """Non-blocking checks that flag content possibly left out of the generated TXT."""
    warnings = []
    declared = int(header_data.get('total_additions') or 0)
    if declared and declared != len(adicoes_data):
        warnings.append(
            f"A DI declara {declared} adições, mas apenas {len(adicoes_data)} foram enviadas para geração."
        )
    for adicao in adicoes_data:
        if not adicao.get('items'):
            warnings.append(f"Adição {adicao.get('number')}: sem itens, nenhuma linha será gerada.")
    if not items_flat:
        warnings.append("Nenhum item será gerado no arquivo.")
    return warnings


@app.get("/")
def read_root():
    return {"message": "API Online", "version": "2.0.0"}


@app.post("/extract")
async def extract_data(xml_file: UploadFile = File(...)):
    """
    Upload DI XML to extract structured data for review.
    Returns JSON with header and adicoes (hierarchical) for user editing.
    """
    if not xml_file.filename.endswith('.xml'):
        raise HTTPException(status_code=400, detail="Invalid XML file. Expected .xml extension.")
    
    try:
        xml_content = await xml_file.read()
        header, adicoes = parse_di_xml(xml_content)
        
        # Add empty user-fillable fields and ensure floats
        invoice_num = header.get('invoice_number', '')
        for adicao in adicoes:
            for item in adicao['items']:
                item['internal_code'] = item.get('generated_internal_code', '')
                item['cfop'] = ''
                item['output_unit'] = item.get('unit', '')
                item['invoice_number'] = invoice_num
        
        # Prepare header with empty user-fillable fields
        response_header = {
            **header,
            'document_type': "DUIMP" if header.get('duimp_number') else "DI",
            'valor_total_frete': header.get('frete_total', 0.0),
            'valor_total_seguro': header.get('seguro_total', 0.0),
            'numero_nota': '',
            'data_emissao': '',
            'data_entrada': '',
            'cfop': '',
            'numero_processo': '',
            'numero_po': '',
            'numero_pedido': '',
            'especie': 'NFE',
            'serie': '1',
            'perc_reducao': '',
            'cod_importador': header.get('importer_code', ''),
            'cod_transportador': header.get('transport_code', ''),
            'cod_exportador': header.get('exporter_name', ''),
            'invoice_number': header.get('invoice_number', ''),
            'duimp_number': header.get('duimp_number', ''),
            'versao_registro': '',
            'provenance_country_code': header.get('provenance_country_code', ''),
            'importer_uf': header.get('importer_uf', ''),
            'mv_eic0010_source': ICMS_SOURCE_ITEMS,
            'aliq_icms_capa': None,
            'mv_eic0076_mode': MV_EIC0076_STANDARD_15,
            'uf_emitente': 'AM',
        }
        
        return JSONResponse(content={
            "header": response_header,
            "adicoes": adicoes
        })
        
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting data: {str(e)}")


@app.post("/generate")
async def generate_txt(request: GenerateRequest):
    """
    Generate TXT file from user-reviewed data.
    Accepted JSON with hierarchal structure, flattens it for TXT generation.
    """
    try:
        # Convert Pydantic models to dicts
        header_data = request.header.model_dump()
        adicoes_data = [a.model_dump() for a in request.adicoes]
        
        # Validate required fields
        errors = []
        if not header_data.get('numero_nota'):
            errors.append("Número da Nota is required")
        if not header_data.get('data_emissao'):
            errors.append("Data Emissão is required")
        if not header_data.get('data_entrada'):
            errors.append("Data Entrada is required")
        if not header_data.get('cfop'):
            errors.append("CFOP is required")
        if not header_data.get('numero_processo'):
            errors.append("Número do Processo is required")
        if header_data.get('especie') and str(header_data['especie']).upper() not in VALID_ESPECIES:
            errors.append("Espécie must be one of NFC, NFE, NFM, NFF, NFU or NFT")
        if header_data.get('data_emissao') and not is_valid_aaaammdd(header_data['data_emissao']):
            errors.append("Data Emissão must be a valid AAAAMMDD date")
        if header_data.get('data_entrada') and not is_valid_aaaammdd(header_data['data_entrada']):
            errors.append("Data Entrada must be a valid AAAAMMDD date")
        if header_data.get('di_date') and not is_valid_aaaammdd(header_data['di_date']):
            errors.append("Data Registro/DI must be a valid AAAAMMDD date")

        doc_type = header_data.get('document_type', 'DI')
        if doc_type == "DUIMP":
            if not header_data.get('duimp_number'):
                errors.append("Número da DUIMP is required for DUIMP layouts")
        else:
            if not header_data.get('di_number'):
                errors.append("Número da DI is required for DI layouts")
        
        items_flat = []
        for adicao in adicoes_data:
            for item in adicao['items']:
                if not item.get('internal_code'):
                    errors.append(f"Adição {adicao['number']} - Item {item['sequence']}: Internal Code is required")
                lote = str(adicao.get('lote') or item.get('lote') or '').strip()
                validade = str(adicao.get('validade') or item.get('validade') or '').strip()
                if lote and not validade:
                    errors.append(
                        f"Adição {adicao['number']} - Item {item['sequence']}: Validade is required when Lote is provided"
                    )
                if validade and not lote:
                    errors.append(
                        f"Adição {adicao['number']} - Item {item['sequence']}: Validade must be blank when Lote is empty"
                    )
                if validade and not is_valid_aaaammdd(validade):
                    errors.append(
                        f"Adição {adicao['number']} - Item {item['sequence']}: Validade must be a valid AAAAMMDD date"
                    )

                flattened = _flatten_item(adicao, item, header_data)
                if lote:
                    flattened['lote'] = lote
                if validade:
                    flattened['validade'] = validade
                items_flat.append(flattened)

        if len(items_flat) > 99:
            errors.append("Quantidade de Itens exceeds layout maximum of 99")

        raw_icms_source = str(header_data.get('mv_eic0010_source') or ICMS_SOURCE_ITEMS).strip().upper()
        if raw_icms_source not in {ICMS_SOURCE_HEADER, ICMS_SOURCE_ITEMS}:
            errors.append("MV_EIC0010 source must be HEADER or ITEMS")
        icms_source = get_icms_source(header_data)
        if icms_source == ICMS_SOURCE_HEADER:
            resolved_rate = resolve_header_icms_rate(header_data, items_flat)
            if resolved_rate == 0 and not header_data.get('aliq_icms_capa'):
                item_rates = {round(float(item.get('aliq_icms', 0) or 0), 4) for item in items_flat}
                if len(item_rates) > 1:
                    errors.append("Alíq. ICMS CAPA is required when MV_EIC0010 uses HEADER and item rates differ")

        raw_mv_eic0076_mode = str(header_data.get('mv_eic0076_mode') or MV_EIC0076_STANDARD_15).strip().upper()
        if raw_mv_eic0076_mode not in {MV_EIC0076_STANDARD_15, MV_EIC0076_FIELD_WIDTH}:
            errors.append("MV_EIC0076 mode must be STANDARD_15 or FIELD_WIDTH")
        mv_eic0076_mode = get_mv_eic0076_mode(header_data)

        po_max = get_po_input_max_length(mv_eic0076_mode)
        numero_po = str(header_data.get('numero_po') or '')
        if len(numero_po) > po_max:
            errors.append(f"Número do PO exceeds MV_EIC0076 limit of {po_max} characters")

        invoice_max = get_invoice_input_max_length(mv_eic0076_mode)
        header_invoice = str(header_data.get('invoice_number') or '')
        if len(header_invoice) > invoice_max:
            errors.append(f"Número da Invoice exceeds MV_EIC0076 limit of {invoice_max} characters")
        for index, item in enumerate(items_flat, start=1):
            invoice_number = str(item.get('invoice_number') or '')
            if len(invoice_number) > invoice_max:
                errors.append(f"Item {index}: Número da Invoice exceeds MV_EIC0076 limit of {invoice_max} characters")

        if errors:
            raise HTTPException(status_code=422, detail={"errors": errors})
        
        # Generate TXT
        txt_content = build_txt_content(header_data, items_flat)
        
        # Return as downloadable file
        buffer = io.BytesIO(txt_content.encode('utf-8'))
        di_number = header_data.get('di_number', 'output')
        filename = f"NF_{di_number}.txt"

        response_headers = {"Content-Disposition": f"attachment; filename={filename}"}
        warnings = collect_generation_warnings(header_data, adicoes_data, items_flat)
        if warnings:
            # ASCII-safe JSON so it survives the HTTP header encoding
            response_headers["X-Warnings"] = json.dumps(warnings, ensure_ascii=True)

        return StreamingResponse(
            buffer,
            media_type="text/plain",
            headers=response_headers
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating TXT: {str(e)}")


@app.post("/parse-txt")
async def parse_txt(txt_file: UploadFile = File(...)):
    """
    Upload TXT file to parse and view its content.
    Returns JSON with header and items for display.
    """
    if not txt_file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Invalid file. Expected .txt extension.")
    
    try:
        txt_content = await txt_file.read()
        header, items = parse_txt_content(txt_content)

        warnings = []
        try:
            declared = int(header.get('qtd_itens') or 0)
        except ValueError:
            declared = None
        if declared is not None and declared != len(items):
            warnings.append(
                f"O cabeçalho declara {declared} itens, mas o arquivo contém {len(items)} linhas de item."
            )

        return JSONResponse(content={
            "header": header,
            "items": items,
            "filename": txt_file.filename,
            "warnings": warnings,
        })
        
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing TXT: {str(e)}")
