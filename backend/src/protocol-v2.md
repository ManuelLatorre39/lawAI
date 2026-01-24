### `documents` — Documento (metadatos)

Esta colección representa **la existencia del documento**, independientemente
de si tiene archivo, texto o análisis.

#### Ejemplo de esquema

```json
{
  "_id": "ObjectId",
  "guid": "string | null",
  "filename": "string | null",
  "file_path": "string | null",

  "source_type": "upload | saij | other",
  "source_id": "string | null",

  "title": "string | null",
  "visibility": "public | private",

  "status_chunks": "PENDING | READY | ERROR",
  "status_analysis": "PENDING | READY | ERROR",

  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Colección - content

```json
{
  "_id": "ObjectId",
  "document_id": "ObjectId",

  "full_text": "string",

  "created_at": "datetime"
}
```

### Colección - Análisis

```json
{
  "_id": "ObjectId",
  "document_id": "ObjectId",
  "kind": "fallo | sumario | contrato | otro",

  "metadata": {
    "title": "string",
    "materia": "string",
    "jurisdiction": "string",
    "court": "string",
    "date": "date"
  },

  "parties": {
    "actor": "string",
    "demandado": "string"
  },

  "descriptors": {
    "keywords": ["string"],
    "preferred_terms": ["string"],
    "synonyms": ["string"]
  },

  "relationships": {
    "norms_cited": ["string"],
    "related_documents": ["string"]
  },

  "created_at": "datetime"
}
```

### GET /documents/{document_id}
Devuelve info de Documento obtenida de las distintas colecciones.
Además, info de la disponibilidad del archivo asociado ("file")

```json
{
  "document": {
    ///
  },
  "content": "Cabe hacer lugar a la demanda...",
  "analysis": {
    ///
  },
  "file":{
    "available":false,
    "download_url":null // O bien la url de download por ej. "/documents/6975444cf80e279dfc5eb057/file"
 }
}
```

### GET /documents/{document_id}/file
Devuelve el archivo asociado al documento