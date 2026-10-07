# BallIt – Front (Angular 20)

Front web para la API de BallIt: subir un video de tiro libre, ver el análisis del codo, el coach virtual,
el historial y la comparación antes/después.

## Requisitos
- Node.js 20.19+ o 22.12+ (`node -v`)
- Tu backend BallItMVP funcionando (Python + ffmpeg, ver su README)

## 1. Arrancar el backend (en la carpeta de BallItMVP)

Angular corre en el puerto **4200**, y la API por defecto solo permite 3000 y 5173, así que hay que
habilitar el origen:

**Windows (PowerShell)**
```powershell
$env:BALLIT_CORS_ORIGINS="http://localhost:4200"
python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

**macOS / Linux**
```bash
BALLIT_CORS_ORIGINS=http://localhost:4200 python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

## 2. Arrancar el front (en esta carpeta)
```bash
npm install
npm start          # = ng serve  → http://localhost:4200
```

## Configuración
La URL de la API está en `src/environments/environment.ts` (`apiBase`, por defecto `http://127.0.0.1:8000`).

## Estructura
```
src/app/
├── core/                  # modelos del contrato, servicio de la API, interceptor X-User-Id, utilidades
├── shared/secure-media.ts # carga imágenes/videos de /files/... (exigen el header X-User-Id) vía blob
└── features/
    ├── upload/            # subir video + opciones (brazo, cámara, objetivo)
    ├── analysis/          # progreso (polling) + resultado: coach, tiros, gráfica del ángulo
    ├── history/           # lista, eliminar, elegir 2 para comparar
    └── compare/           # antes vs. después
```

## Notas
- El UUID de usuario se guarda en `localStorage` (`ballit_user_id`). Si lo borras, pierdes acceso a tu historial.
- Los clips de cada tiro (con el esqueleto dibujado) los genera el backend en segundo plano; mientras tanto
  se muestra la imagen del tiro y se sigue consultando hasta que estén listos.
- La evaluación es solo del codo y con una regla provisional; la interfaz lo indica.
