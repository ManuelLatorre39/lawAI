from PyPDF2 import PdfReader
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter # División de texto
from google import genai
import re
from pathlib import Path
import os
from dotenv import load_dotenv
import json

def load_prompts_and_schema():
    base_dir = Path(__file__).parent
    dir_jsons = Path(__file__).parent.parent.parent

    # Build paths safely
    schema_path = dir_jsons / "JSONS" / "baseSchemaMongo.json" # "baseSchema.json" DEPRECATED - reemplazo por schema Mongo
    fill_prompt_path = base_dir / "jsonFillPrompt.txt"
    refine_prompt_path = base_dir / "jsonRefinePrompt.txt"

    # Load schema JSON
    with open(schema_path, 'r', encoding='utf-8') as f:
        json_schema = json.load(f)

    # Load prompt texts
    with open(fill_prompt_path, 'r', encoding='utf-8') as f:
        initial_instructions = f.read()

    with open(refine_prompt_path, 'r', encoding='utf-8') as f:
        refine_instructions = f.read()

    return json_schema, initial_instructions, refine_instructions

'''
def extract_text(file_path: str) -> str:
    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        return "\n".join(page.extract_text() for page in reader.pages)
    elif file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        raise ValueError("Unsupported file type")
'''
    
def extract_text_with_pages(file_path: str) -> list[dict]:
    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        pages = []

        for page_number, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if text and text.strip():
                pages.append({
                    "page": page_number,
                    "text": text
                })

        return pages

    elif file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            return [{
                "page": None,
                "text": f.read()
            }]

    else:
        raise ValueError("Unsupported file type")

'''
def chunk_text(texto):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = splitter.split_text(texto)
    return chunks
'''

def chunk_pages(pages: list[dict]) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    chunks = []

    for page_obj in pages:
        page_number = page_obj["page"]
        page_text = page_obj["text"]

        page_chunks = splitter.split_text(page_text)

        for chunk_text in page_chunks:
            chunks.append({
                "page": page_number,
                "text": chunk_text
            })

    return chunks

def process_one_chunk(refined_json_dict, response, i):
    # Parse JSON safely
    try:
        refined_json_dict = json.loads(response.text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            refined_json_dict = json.loads(match.group(0))
        else:
            print(f"Warning: Chunk {i} returned invalid JSON, skipping update")
            
    return refined_json_dict

def process_chunks(legal_doc_chunks):
    
    api_key = os.getenv("GEMINI_API_KEY")
    # genai.configure(api_key=api_key)
    
    json_schema, initial_instructions, refine_instructions = load_prompts_and_schema()
    
    first_chunk_prompt = (
        initial_instructions +
        "\n\n**JSON SCHEMA:**\n" +
        json.dumps(json_schema, indent=2) +
        "\n\n**DOCUMENT:**\n" +
        legal_doc_chunks[0]["text"]
    )
    
    refined_json_dict = {}
    
    # opcion gemini
    print("Procesando chunk 1...")
    
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=first_chunk_prompt
    )
    
    refined_json_dict = process_one_chunk(refined_json_dict, response, 0)
    
    # PASO 2: Refinar con chunks restantes (SIN enviar el schema completo)
    for i, chunk in enumerate(legal_doc_chunks[1:], start=2):
        print(f"Procesando chunk {i}/{len(legal_doc_chunks)}...")
        
        chunk_text = chunk["text"]
        
        # Prompt simplificado: instrucciones + JSON actual + nuevo chunk
        refine_prompt = (
            refine_instructions +
            "\n\n**EXISTING JSON:**\n" +
            json.dumps(refined_json_dict, ensure_ascii=False) +
            "\n\n**NEW CHUNK:**\n" +
            chunk_text
        )
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=refine_prompt
        )
        
        refined_json_dict = process_one_chunk(refined_json_dict, response, i)
                
    return refined_json_dict
    