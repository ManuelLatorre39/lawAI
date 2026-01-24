import json
from src.db.mongo import documents_col, chunks_col, analysis_col, content_col
from src.services.processing_service import process_document_content
from src.helpers.datetime import now, parse_date
from pathlib import Path
import asyncio
from src.helpers.logger import logger
from bson import ObjectId

def detect_document_kind(record):
    if "numero-sumario" in record:
        return "sumario"
    if "numero-fallo" in record:
        return "fallo"
    return "unknown"

def build_analysis(record, doc_id, kind):
    analysis = {
        "document_id": doc_id,
        "analysis_version": "v1",
        "document_kind": kind,
        "source": "saij",
        "created_at": now(),

        "core": {
            "title": record.get("titulo"),
            "date": record.get("fecha"),
            "jurisdiction": {
                "code": record.get("jurisdiccion", {}).get("codigo"),
                "province": record.get("provincia"),
                "country": record.get("pais", "Argentina")
            },
            "court": {
                "type": record.get("tipo-tribunal"),
                "instance": record.get("instancia"),
                "name": record.get("tribunal")
            }
        },

        "legal": {},
        "procedural": {},
        "relationships": {},
        "raw_refs": {
            "saij": {
                "guid": record.get("guid"),
                "id_infojus": record.get("id-infojus")
            }
        }
    }
    
    if "descriptores" in record:
        analysis["legal"] = {
            "area": [record.get("materia")],
            "descriptors": [
                {
                    "preferred": d["preferido"]["termino"],
                    "synonyms": d.get("sinonimos", {}).get("termino", [])
                }
                for d in record["descriptores"].get("descriptor", [])
            ]
        }
        
    if kind == "fallo":
        analysis["procedural"] = {
            "case": {
                "actor": record.get("actor"),
                "defendant": record.get("demandado"),
                "subject": record.get("sobre")
            },
            "judges": record.get("magistrados"),
            "decision_type": record.get("tipo-fallo")
        }
        
    refs = record.get("referencias-normativas", {}).get("referencia-normativa", [])

    if isinstance(refs, dict):
        refs = [refs]

    analysis["relationships"] = {
        "norms_cited": [
            r["ref"]
            for r in refs
            if isinstance(r, dict) and r.get("ref")
        ]
    }

    if "sumarios-relacionados" in record:
        analysis.setdefault("relationships", {})["related_sumarios"] = [
            record["sumarios-relacionados"]["sumario-relacionado"]
        ]
        
    return analysis
        
def build_content(record, doc_id):
    content = {}
    if "texto" in record:
        content = {
            "document_id": doc_id,
            "full_text": record["texto"],
            "language": "es"
        }
    return content

def build_document(record):    
    doc = {
        # "_id": ObjectId(),
        "guid": record.get("guid"),  # use guid as stable ID
        "filename": None,
        "file_path": None,
        "source_type": "saij",
        "source_id": record.get("id-infojus"),
        "title": record.get("titulo"),
        "visibility": "public",
        "status_chunks": "PENDING",
        "status_analysis": "READY",
        "created_at": parse_date(record.get("fecha-alta")),
        "updated_at": parse_date(record.get("fecha-mod"))
    }
    
    return doc
    
def migrate():
    base_dir = Path(__file__).resolve().parent
    dataset_path = base_dir / "dataset.jsonl"
    with dataset_path.open("r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= 5:
                break

            record = json.loads(line)
            kind = detect_document_kind(record)

            doc = build_document(record)
            documents_col.update_one(
                {"guid": doc["guid"]},
                {"$setOnInsert": doc},
                upsert=True
            )
            
            doc_mongo = documents_col.find_one(
                {"guid": doc["guid"]},
                {
                    "_id": 1,
                    "guid": 1
                },
            )

            if "texto" in record:
                content = build_content(record, doc_mongo["_id"])

                content_col.update_one(
                    {"document_id": doc_mongo["_id"]},
                    {"$setOnInsert": content},
                    upsert=True
                )

            analysis = build_analysis(record, doc_mongo["_id"], kind)

            analysis_col.update_one(
                {
                    "document_id": doc_mongo["_id"],
                    "kind": kind
                },
                {"$setOnInsert": analysis},
                upsert=True
            )
            
            already_processed = chunks_col.count_documents(
                {"document_id": doc_mongo["_id"]},
                limit=1
            ) > 0
            
            logger.info(already_processed)
            
            if not already_processed:
                asyncio.create_task(
                    process_document_content(doc_mongo["_id"])
                )