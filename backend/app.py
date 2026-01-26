from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import io

# Import Services
from backend.parsers.xml_parser import parse_di_xml
from backend.parsers.txt_parser import parse_txt_content
from backend.formatters.txt_builder import build_txt_content

app = FastAPI(title="Gerador de NFSE", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

class AdicaoData(BaseModel):
    number: Optional[str] = None
    ncm: str
    li_number: Optional[str] = None
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
    di_number: Optional[str] = None
    duimp_number: Optional[str] = None
    di_date: Optional[str] = None
    exporter_name: Optional[str] = None
    exporter_city: Optional[str] = None
    exporter_country: Optional[str] = None
    importer_code: Optional[str] = None
    importer_name: Optional[str] = None
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
    numero_po: Optional[str] = None
    perc_reducao: Optional[str] = None
    cod_importador: Optional[str] = None
    cod_transportador: Optional[str] = None
    cod_exportador: Optional[str] = None
    invoice_number: Optional[str] = None

class ExtractedData(BaseModel):
    header: HeaderData
    adicoes: List[AdicaoData]

class GenerateRequest(BaseModel):
    header: HeaderData
    adicoes: List[AdicaoData]


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
            'valor_total_frete': header.get('frete_total', 0.0),
            'valor_total_seguro': header.get('seguro_total', 0.0),
            'numero_nota': '',
            'data_emissao': '',
            'data_entrada': '',
            'cfop': '',
            'numero_po': '',
            'perc_reducao': '',
            'cod_importador': header.get('importer_code', ''),
            'cod_importador': header.get('importer_code', ''),
            'cod_transportador': header.get('transport_code', ''),
            'cod_exportador': header.get('exporter_name', ''),
            'invoice_number': header.get('invoice_number', ''),
            'duimp_number': header.get('duimp_number', ''),
            'provenance_country_code': header.get('provenance_country_code', ''),
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
        
        items_flat = []
        for a_idx, adicao in enumerate(adicoes_data):
            # Check for missing internal codes
            for i_idx, item in enumerate(adicao['items']):
                if not item.get('internal_code'):
                    errors.append(f"Adição {adicao['number']} - Item {item['sequence']}: Internal Code is required")
                
                # Flatten Structure for the TXT Builder
                flattened_item = {
                    'adicao_number': adicao['number'],
                    'ncm': adicao['ncm'],
                    'description': item['description'],
                    'qty_commercial': item['qty'],
                    'unit_commercial': item['unit'],
                    'unit_value': item['unit_value'],
                    'total_value': item['unit_value'] * item['qty'], 
                    
                    'item_sequence': item['sequence'],
                    'net_weight': adicao['net_weight'], # Sharing weight across items? Or leave as adicao level
                    'li_number': adicao['li_number'],
                    'frete_item': adicao['freight_reais'], 
                    'seguro_item': adicao['insurance_reais'],
                    'invoice_number': header_data.get('invoice_number', ''),
                    
                    # --- Tax & Extra Fields ---
                    # II
                    'aliq_ii': adicao['taxes']['ii']['rate'],
                    'valor_ii': adicao['taxes']['ii']['value_due'],
                    
                    # PIS
                    'aliq_pis': adicao['taxes']['pis']['rate'],
                    'base_pis': adicao['taxes']['pis']['base_calc'],
                    'valor_pis': adicao['taxes']['pis']['value_collect'],
                    'qtde_pis': 0.0,
                    
                    # COFINS
                    'aliq_cofins': adicao['taxes']['cofins']['rate'],
                    'base_cofins': adicao['taxes']['cofins']['base_calc'],
                    'valor_cofins': adicao['taxes']['cofins']['value_collect'],
                    'qtde_cofins': 0.0,
                    
                    # IPI
                    'aliq_ipi': adicao['taxes']['ipi']['rate'],
                    'valor_ipi': adicao['taxes']['ipi']['value_due'],
                    'aliq_esp_ipi': 0.0, # Specific rate
                    'qtde_ipi': 0.0,
                    
                    # Costs
                    'valor_desconto': 0.0,
                    'valor_iof': 0.0,
                    'despesas_aduaneiras': 0.0,
                    
                    # Logistics
                    'lote': '',
                    'validade': '',
                    
                    # ICMS
                    # Base ICMS per item = Merchandise Value (Unit Value * Qty)
                    'aliq_icms': adicao['taxes']['icms']['rate'], 
                    'base_icms': item['unit_value'] * item['qty'],
                    'valor_icms_recolher': adicao['taxes']['icms']['value_collect'],
                    
                    # User fields
                    'internal_code': item['internal_code'],
                    'output_unit': item['output_unit'],
                    'cfop': item.get('cfop') or header_data.get('cfop')
                }
                items_flat.append(flattened_item)
        
        if errors:
            raise HTTPException(status_code=422, detail={"errors": errors})
        
        # Generate TXT
        txt_content = build_txt_content(header_data, items_flat)
        
        # Return as downloadable file
        buffer = io.BytesIO(txt_content.encode('utf-8'))
        di_number = header_data.get('di_number', 'output')
        filename = f"NF_{di_number}.txt"
        
        return StreamingResponse(
            buffer,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
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
        
        return JSONResponse(content={
            "header": header,
            "items": items,
            "filename": txt_file.filename
        })
        
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing TXT: {str(e)}")
