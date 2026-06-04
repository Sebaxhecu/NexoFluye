# AutoEstilo — Plugin para Lightroom Classic

Copia los parámetros de una foto de referencia y los aplica automáticamente a todas las que selecciones.

---

## Instalación

1. Copia la carpeta **`AutoEstilo.lrplugin`** a una ubicación fija en tu disco (por ejemplo `Documentos/Lightroom/Plugins/`).
2. Abre Lightroom Classic.
3. Ve a **Archivo → Administrador de complementos** (o `Ctrl+Alt+Shift+,` / `Cmd+Alt+Shift+,`).
4. Haz clic en **Agregar** y selecciona la carpeta `AutoEstilo.lrplugin`.
5. Verifica que el estado diga **Instalado y en ejecución**.
6. Cierra el administrador.

---

## Cómo usarlo

El plugin aparece en el menú **Biblioteca → Complementos adicionales de exportación**  
(o **Archivo → Complementos adicionales de exportación**, dependiendo de tu versión).

### Paso 1 — Guardar la foto de referencia
1. En la tira de película, selecciona (clic simple) la foto que tiene el estilo que quieres copiar.
2. Ve a **Biblioteca → Complementos adicionales → Guardar Foto Actual como Referencia**.
3. El plugin guardará todos sus parámetros de Develop.

### Paso 2 — Aplicar a las demás fotos
1. Selecciona todas las fotos que quieres editar (Ctrl+A, o selección manual).
2. Ve a **Biblioteca → Complementos adicionales → Aplicar Estilo de Foto de Referencia**.
3. Confirma en el diálogo → el plugin aplicará el estilo a todas con barra de progreso.

### Extra — Ver qué referencia está guardada
- **Biblioteca → Complementos adicionales → Ver Referencia Guardada**  
  muestra la foto de referencia activa y sus valores principales.

---

## Parámetros que se copian

| Grupo | Parámetros |
|---|---|
| Luz | Exposición, Contraste, Iluminaciones, Sombras, Blancos, Negros, Claridad, Textura, Neblina |
| Color | Saturación, Vibración, Balance de blancos, Temperatura, Tinte |
| Curva de tono | Curva completa (RGB + canales individuales) |
| HSL | Matiz, Saturación y Luminancia por cada color |
| Gradación de color | Sombras, Medios tonos, Iluminaciones, Global |
| Nitidez | Radio, Detalle, Máscara |
| Reducción de ruido | Luminancia, Color y sus detalles |
| Viñeta | Cantidad, Punto medio, Pluma, Redondez |
| Grano | Cantidad, Tamaño, Frecuencia |
| Calibración | Perfil de cámara, Matiz/Saturación RGB |
| Corrección de lente | Perfil, CA lateral, Distorsión |

---

## Solución de problemas

| Problema | Solución |
|---|---|
| No aparece en el menú | Verifica que el plugin esté "en ejecución" en el Administrador de complementos |
| "No hay foto activa" | Haz clic en una foto antes de guardar la referencia |
| Los cambios no se ven | Cambia a módulo **Revelar** y vuelve a **Biblioteca** para forzar la actualización |
| Quiero revertir | Usa **Edición → Deshacer** (Ctrl+Z) inmediatamente después |
