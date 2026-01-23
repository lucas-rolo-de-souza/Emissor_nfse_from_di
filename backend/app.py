from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io

# Import Services
from backend.services.generator import generate_template
from backend.services.processor import process_file_data

app = FastAPI(title="Gerador de NFSE", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API Online"}

@app.get("/template")
def get_template():
    """Download the blank Excel template."""
    buffer = generate_template()
    filename = "Modelo_Importacao.xlsx"
    return StreamingResponse(
        buffer, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/process")
async def process_files(
    xml_file: UploadFile = File(...), 
    xlsx_file: UploadFile = File(...)
):
    """
    Upload XML + XLSX to generate TXT.
    """
    if not xml_file.filename.endswith('.xml'):
        raise HTTPException(status_code=400, detail="Invalid XML file")
    if not xlsx_file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Invalid Excel file")
        
    try:
        # Read contents
        xml_content = await xml_file.read()
        xlsx_content = await xlsx_file.read()
        
        # Process
        txt_output = process_file_data(xml_content, xlsx_content)
        
        # Return as downloadable file
        buffer = io.BytesIO(txt_output.encode('utf-8'))
        filename = f"Processado_{xml_file.filename}.txt"
        
        return StreamingResponse(
            buffer, 
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        # Business Logic / Validation Error
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Unexpected Error
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
