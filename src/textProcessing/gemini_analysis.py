import json
import time
from typing import List, Dict, Any
import os
from google import genai

from .utils import clean_llm_json, extract_json_block, deep_merge
from .config import (
    JSON_SCHEMA,
    INITIAL_INSTRUCTIONS,
    REFINE_INSTRUCTIONS,
    GENERATION_CONFIG,
)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def process_chunks(chunks: List[str]) -> Dict[str, Any]:
    """
    Procesa chunks usando Gemini y devuelve el análisis final en JSON.
    Reemplaza la función process_chunks anterior.
    """

    # Seguridad: solo los primeros 4
    chunks = chunks[:4]

    # ===== Primer chunk (fill) =====
    first_prompt = (
        INITIAL_INSTRUCTIONS
        + "\n\n**JSON SCHEMA:**\n"
        + json.dumps(JSON_SCHEMA, ensure_ascii=False, indent=2)
        + "\n\n**DOCUMENT:**\n"
        + chunks[0]
    )

    '''
    response = send_to_llm_initial(
        model=model,
        prompt=first_prompt,
        generation_config=GENERATION_CONFIG,
    )
    '''
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=first_prompt
    )

    result = json.loads(extract_json_block(clean_llm_json(response)))

    # ===== Refinamiento =====
    for chunk in chunks[1:]:
        refine_prompt = (
            REFINE_INSTRUCTIONS
            + "\n\n**EXISTING JSON:**\n"
            + json.dumps(result, ensure_ascii=False, indent=2)
            + "\n\n**NEW CHUNK:**\n"
            + chunk
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=refine_prompt
        )
        
        partial = json.loads(extract_json_block(clean_llm_json(response)))
        result = deep_merge(result, partial)

        time.sleep(1)  # throttle simple (evita rate limit)

    return result