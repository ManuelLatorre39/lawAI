my_assistant/
│
├── agents/                   # 🧩 Todos los agentes viven acá
│   ├── base_agent.py          # Superclase / interfaz abstracta
│   ├── lector_agent.py        # Clase concreta: Lector
│   ├── escritor_agent.py      # Clase concreta: Escritor
│   ├── coordinador_agent.py   # Clase concreta: Coordinador
│   └── comparador_agent.py    # Clase concreta: Comparador
│
├── core/                     # ⚙️ Infraestructura y utilidades del framework
│   ├── __init__.py
│   ├── embeddings.py          # Funciones de embeddings / vector DB
│   ├── retrieval.py           # Métodos de búsqueda (FAISS, Chroma, etc.)
│   ├── prompts.py             # Plantillas de prompts
│   └── utils.py               # Funciones utilitarias comunes
│
├── data/                     # 📚 Datos de entrada/salida
│   ├── raw/                   # Documentos crudos (ej: PDFs, TXT, etc.)
│   ├── processed/             # Chunks o embeddings guardados
│   └── external/              # Base de datos externa descargada
│
├── configs/                  # ⚙️ Configuraciones (YAML/JSON/env)
│   ├── settings.yaml          # Config general (paths, parámetros)
│   └── agents.yaml            # Config específica de cada agente (roles, tools)
│
├── tests/                    # ✅ Unit tests por agente/módulo
│   ├── test_lector.py
│   ├── test_escritor.py
│   └── ...
│
├── main.py                   # 🚀 Entry point: arranca el sistema de agentes
├── requirements.txt           # Dependencias del proyecto
└── README.md                  # Documentación inicial
