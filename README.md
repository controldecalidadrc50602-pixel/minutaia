# 🚀 Minutas IA Enterprise - Groq / Vercel Ready

Este sistema es un centro de inteligencia operativa de alto rendimiento diseñado para transformar grabaciones en activos estratégicos. Optimizada para regiones con restricciones (Venezuela) mediante el uso de **Groq API**.

## 🛠️ Despliegue en Vercel

1. **GitHub**: Sube el código a un repositorio (Privado recomendado).
2. **Variables de Entorno**: En el panel de Vercel (Settings > Environment Variables), añade:
   - `API_KEY`: Tu clave de Groq Cloud (https://console.groq.com/).
3. **Build**: Vercel detectará React. El directorio de salida es `dist`.

## 🧠 Arquitectura de IA (Groq Engine)

- **Cerebro Corporativo**: Llama 3.3 70B Versatile (Análisis y Chat).
- **Visión Ejecutiva**: Llama 3.2 11B Vision (Análisis de pizarras/slides).
- **Transcripción Instantánea**: Whisper Large V3.

## 🔒 Seguridad
- Las llaves nunca se exponen en el cliente de forma estática.
- Uso de `process.env.API_KEY` para inyección segura en tiempo de ejecución.
- Almacenamiento local (LocalStorage) para privacidad total del usuario.

---
*Ingeniería Senior para Escalabilidad y Cumplimiento Regional.*