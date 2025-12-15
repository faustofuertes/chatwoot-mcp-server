# kommo-mcp-server

Servidor MCP (Model Context Protocol) diseñado para funcionar con el ecosistema de **Laburen.com**, incluyendo su integración nativa con Kommo CRM. Este servidor expone herramientas que permiten a los agentes de IA de Laburen gestionar leads, moverlos entre pipelines, pausar agentes y agregar notas contextuales directamente en Kommo.

## 🎯 Descripción General

Este servidor MCP forma parte del ecosistema de **Laburen.com** y actúa como un puente entre los agentes de IA de Laburen y la API de Kommo CRM, aprovechando la integración nativa entre ambas plataformas. Proporciona herramientas especializadas para la gestión automatizada de leads, permitiendo que los agentes de Laburen interactúen directamente con Kommo para mover leads, pausar agentes y agregar notas contextuales. El servidor se ejecuta en Cloudflare Workers y utiliza Durable Objects para mantener el estado de las conexiones MCP.

## ✨ Características Principales

### 1. **Servidor MCP Completo**
- Implementación del protocolo MCP (Model Context Protocol)
- Soporte para Server-Sent Events (SSE) para comunicación en tiempo real
- Integración con el SDK oficial de MCP

### 2. **Herramientas de Gestión de Leads**
- **Mover leads** entre pipelines y estados
- **Pausar agentes** asignados a leads específicos
- **Agregar notas** contextuales al historial de leads

### 3. **Configuración Flexible**
- Configuración mediante variables de entorno
- Sobrescritura por headers HTTP en cada request
- Control granular de herramientas habilitadas

### 4. **Multi-cuenta**
- Soporte para múltiples cuentas de Kommo mediante configuración dinámica
- Autenticación independiente por cuenta

## 🏗️ Arquitectura

### Componentes Principales

- **Entry Point** (`src/index.ts`): Maneja las peticiones HTTP y enruta a los endpoints MCP
- **MCP Server** (`src/mcp.ts`): Define el servidor MCP y registra las herramientas disponibles
- **Tools** (`src/tools/leads.ts`): Implementa las funciones para interactuar con la API de Kommo
- **Utils** (`src/utils/`): Utilidades para validación y parsing de configuración

### Tecnologías

- **Cloudflare Workers**: Plataforma de ejecución serverless
- **Durable Objects**: Para mantener estado de conexiones MCP
- **Model Context Protocol SDK**: SDK oficial para servidores MCP
- **Kommo API v4**: Integración nativa con el CRM de Kommo
- **Laburen.com**: Ecosistema de agentes de IA integrado
- **TypeScript**: Lenguaje de programación
- **Zod**: Validación de esquemas

## 📋 Requisitos

### Variables de Entorno

El servidor puede recibir configuración de dos formas (los headers tienen prioridad sobre las variables de entorno):

#### 1. Variables de Entorno (en `wrangler.jsonc` o Cloudflare Dashboard)

```json
{
  "KOMMO_LONG_DURATION_TOKEN": "tu_token_de_kommo",
  "KOMMO_ACCOUNT_SUBDOMAIN": "tu_subdominio",
  "TOOLS_TO_USE": ["move_lead", "pause_agent", "add_note"]
}
```

#### 2. Headers HTTP (prioridad sobre env)

Cada request puede incluir headers para sobrescribir la configuración:

- `KOMMO_LONG_DURATION_TOKEN`: Token de autenticación de Kommo
- `KOMMO_ACCOUNT_SUBDOMAIN`: Subdominio de la cuenta de Kommo
- `TOOLS_TO_USE`: Lista de herramientas habilitadas (formato JSON array o CSV)

**Formato de `TOOLS_TO_USE`:**
- JSON: `["move_lead", "pause_agent", "add_note"]`
- CSV: `move_lead,pause_agent,add_note`

## 🚀 Instalación y Despliegue

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# O usando wrangler directamente
wrangler dev
```

### Despliegue a Producción

```bash
# Desplegar a Cloudflare Workers
npm run deploy

# O usando wrangler directamente
wrangler deploy
```

### Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run deploy`: Despliega a Cloudflare Workers
- `npm run format`: Formatea el código con Biome
- `npm run lint:fix`: Corrige problemas de linting
- `npm run type-check`: Verifica tipos de TypeScript
- `npm run cf-typegen`: Genera tipos de Cloudflare Workers

## 📡 Endpoints

### MCP Server (HTTP)

```
GET /mcp
```

Endpoint principal del servidor MCP para comunicación HTTP.

### Server-Sent Events (SSE)

```
GET /sse
GET /sse/message
```

Endpoints para comunicación mediante Server-Sent Events, permitiendo comunicación en tiempo real con clientes MCP.

## 🛠️ Herramientas Disponibles

El servidor expone las siguientes herramientas MCP para interactuar con Kommo:

### `move_lead`
****
Mueve un lead a un pipeline y estado diferente en Kommo.

**Parámetros:**
- `lead_id` (number): ID único del lead en Kommo
- `pipeline_id` (number): ID del pipeline destino
- `status_id` (number): ID del estado dentro del pipeline

**Ejemplo de uso:**
```json
{
  "lead_id": 12345,
  "pipeline_id": 1,
  "status_id": 2
}
```

**Respuestas:**
- ✅ Éxito: "Lead successfully moved to the specified pipeline and status."
- ❌ Lead no existe: "Failed to move lead: the specified lead does not exist in Kommo."
- ❌ Error de API: "Failed to move lead: Kommo did not accept the update request."

### `pause_agent`

Pausa el agente asignado a un lead específico actualizando un campo personalizado en Kommo.

**Parámetros:**
- `lead_id` (number): ID único del lead en Kommo

**Ejemplo de uso:**
```json
{
  "lead_id": 12345
}
```

**Respuestas:**
- ✅ Éxito: "Agent successfully paused for the specified lead."
- ❌ Lead no existe: "Failed to pause agent: the specified lead does not exist in Kommo."

### `add_note`

Añade una nota contextual al historial de un lead en Kommo.

**Parámetros:**
- `lead_id` (number): ID único del lead en Kommo
- `note` (string): Nota a agregar al historial del lead

**Ejemplo de uso:**
```json
{
  "lead_id": 12345,
  "note": "Cliente interesado en producto premium. Seguimiento programado para mañana."
}
```

**Respuestas:**
- ✅ Éxito: "Note added succesfully."
- ❌ Error: "Error adding the note."

## 🔧 Configuración de Herramientas

Las herramientas se pueden habilitar o deshabilitar mediante la variable `TOOLS_TO_USE`. Solo las herramientas listadas estarán disponibles en el servidor MCP.

**Ejemplo - Solo habilitar `move_lead` y `add_note`:**
```json
{
  "TOOLS_TO_USE": ["move_lead", "add_note"]
}
```

**Ejemplo - Deshabilitar todas las herramientas:**
```json
{
  "TOOLS_TO_USE": []
}
```

## 🔗 Integración con Laburen.com

Este servidor MCP está diseñado específicamente para funcionar dentro del ecosistema de **Laburen.com**. Los agentes de IA de Laburen pueden utilizar este servidor MCP para interactuar con Kommo CRM mediante la integración nativa entre ambas plataformas.

### Flujo de Integración

1. Los agentes de Laburen se conectan al servidor MCP
2. El servidor MCP expone herramientas especializadas para Kommo
3. Los agentes utilizan estas herramientas para gestionar leads en Kommo
4. Las acciones se ejecutan directamente en la cuenta de Kommo configurada

## 🔐 Autenticación con Kommo

El servidor utiliza tokens de larga duración de Kommo para autenticarse. Para obtener un token:

1. Accede a la configuración de tu cuenta de Kommo
2. Ve a Integraciones → API
3. Genera un token de larga duración
4. Configúralo en las variables de entorno o headers

**Nota:** El token debe tener los siguientes scopes:
- `crm`: Acceso al CRM
- `files`: Acceso a archivos (si es necesario)
- `notifications`: Notificaciones (si es necesario)

## 📊 Estructura del Proyecto

```
kommo-mcp-server/
├── src/
│   ├── index.ts              # Punto de entrada del worker
│   ├── mcp.ts                # Servidor MCP y definición de herramientas
│   ├── types.ts              # Tipos TypeScript
│   ├── tools/
│   │   └── leads.ts          # Funciones para interactuar con API de Kommo
│   └── utils/
│       ├── canUseTools.ts    # Validación de herramientas habilitadas
│       └── parseTools.ts     # Parsing de configuración de herramientas
├── wrangler.jsonc            # Configuración de Cloudflare Workers
├── tsconfig.json             # Configuración de TypeScript
├── biome.json                # Configuración de Biome (linter/formatter)
└── package.json              # Dependencias del proyecto
```

## 🔍 Monitoreo y Observabilidad

El servidor tiene observabilidad habilitada en Cloudflare Workers:
- **Logs**: Registro de ejecución y errores
- **Métricas**: Rendimiento y uso de recursos
- **Trazabilidad**: Seguimiento de requests y herramientas utilizadas

Los logs incluyen:
- Errores de herramientas con prefijo `💥`
- Errores de API con prefijo `❌`
- Información de depuración

## 🧪 Desarrollo

### Validación de Tipos

```bash
npm run type-check
```

### Formateo de Código

```bash
npm run format
```

### Linting

```bash
npm run lint:fix
```

## 📝 Notas Técnicas

- El servidor utiliza **Durable Objects** para mantener el estado de las conexiones MCP
- Las herramientas se validan dinámicamente antes de ser expuestas
- Todas las herramientas validan la existencia del lead antes de ejecutar la acción
- Los errores se manejan de forma consistente y retornan mensajes descriptivos

## 🤝 Contribución

Este es un proyecto privado. Para cambios o mejoras, contacta al equipo de desarrollo.

## 📄 Licencia

Privado - Todos los derechos reservados.
