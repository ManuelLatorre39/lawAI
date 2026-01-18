# Protocolo de Envío de Mensajes

## 1. Identificación y Trazabilidad

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `message_id` | UUID | Identificador único para cada mensaje |
| `session_id` | string | Mantiene el hilo de conversación |
| `timestamp` | number | Marca temporal del mensaje |
| `user_id` | string | Identificador del usuario |

## 2. Contexto Mejorado

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `document_ids` | string[] | IDs de documentos relevantes |
| `highlighted_texts` | array | Textos resaltados con metadata |
| `source_document_id` | string | De qué documento proviene |
| `start_position` | number | Ubicación inicial en el documento |
| `end_position` | number | Ubicación final en el documento |
| `page_number` | number | Número de página (si aplica) |
| `surrounding_context` | string | Contexto adicional alrededor del texto |
| `context_priority` | array | Array ordenado si hay múltiples contextos |
| `max_context_tokens` | number | Límite de tokens para el contexto |

## 3. Configuración de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `temperature` | number | Control de aleatoriedad (0-1) |
| `max_tokens` | number | Longitud máxima de respuesta |
| `model` | string | Versión del modelo a usar |
| `response_format` | string | Formato esperado (texto, JSON, markdown) |
| `language` | string | Idioma de respuesta |

## 4. Manejo de Estado

| Campo | Tipo | Valores |
|-------|------|--------|
| `status` | enum | `pending` \| `processing` \| `completed` \| `error` |
| `retry_count` | number | Contador de reintentos |
| `parent_message_id` | string | Para respuestas anidadas o follow-ups |

## 5. Metadatos del Sistema

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `client_version` | string | Versión del frontend |
| `protocol_version` | string | Para compatibilidad futura |

## Estructura Completa del Mensaje

```typescript
msg: {
    message_id: string,
    session_id: string,
    timestamp: number,
    type: 'user' | 'bot' | 'system',
    prompt: string,
    context: {
        document_ids: string[],
        chunks_ids:string[],
        highlighted_texts: [{
            text: string,
            document_id: string,
            position: { start: number, end: number },
            page?: number
        }]
    },
    config?: {
        temperature?: number,
        max_tokens?: number,
        model?: string
    },
    metadata?: {
        user_id?: string,
        client_version?: string
    }
}
```
