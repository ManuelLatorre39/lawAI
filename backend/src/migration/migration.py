import json
from src.db.mongo import documents_col, chunks_col, analysis_col, content_col
from src.helpers.datetime import now, parse_date
from pathlib import Path

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
        "_id": record.get("guid"),  # use guid as stable ID
        "source_type": "saij",
        "source_id": record.get("id-infojus"),
        "title": record.get("titulo"),
        "visibility": "public",
        "status": "READY",
        "created_at": parse_date(record.get("fecha-alta")),
        "updated_at": parse_date(record.get("fecha-mod"))
    }
    
    return doc
    
def migrate():
    base_dir = Path(__file__).resolve().parent
    dataset_path = base_dir / "dataset.jsonl"
    with dataset_path.open("r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= 100:
                break

            record = json.loads(line)
            kind = detect_document_kind(record)

            doc = build_document(record)
            documents_col.update_one(
                {"_id": doc["_id"]},
                {"$setOnInsert": doc},
                upsert=True
            )

            if "texto" in record:
                content_col.insert_one(build_content(record, doc["_id"]))
                """
                for chunk in create_chunks(doc["_id"], record["texto"]):
                    chunks_col.insert_one(chunk)
                """

            analysis_col.insert_one(build_analysis(record, doc["_id"], kind))