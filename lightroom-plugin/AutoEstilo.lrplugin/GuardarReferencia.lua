local LrApplication  = import 'LrApplication'
local LrDialogs      = import 'LrDialogs'
local LrTasks        = import 'LrTasks'
local LrDate         = import 'LrDate'

local U = require 'Utilidades'

LrTasks.startAsyncTask(function()
    local catalog = LrApplication.activeCatalog()
    local foto    = catalog:getTargetPhoto()

    if not foto then
        LrDialogs.message(
            'AutoEstilo',
            'No hay ninguna foto activa.\nSelecciona la foto que quieres usar como referencia.',
            'critical'
        )
        return
    end

    -- Leer configuración de develop de la foto activa
    local settings = foto:getDevelopSettings()

    if not settings then
        LrDialogs.message(
            'AutoEstilo',
            'No se pudieron leer los parámetros de la foto.',
            'critical'
        )
        return
    end

    -- Construir tabla solo con los parámetros que nos interesan
    local prefs    = U.getPrefs()
    local guardado = {}

    for _, param in ipairs(U.PARAMS_DEVELOP) do
        if settings[param] ~= nil then
            guardado[param] = settings[param]
        end
    end

    -- Guardar en preferencias del plugin (persisten entre sesiones)
    prefs.referenciaGuardada  = true
    prefs.referenciaSettings  = guardado
    prefs.referenciaNombre    = foto:getFormattedMetadata('fileName') or 'desconocido'
    prefs.referenciaFecha     = LrDate.timeToUserFormat(LrDate.currentTime(), '%Y-%m-%d %H:%M')

    U.log('Referencia guardada: ' .. prefs.referenciaNombre)

    LrDialogs.message(
        'AutoEstilo — Referencia Guardada',
        'Se guardaron los parámetros de:\n' .. prefs.referenciaNombre ..
        '\n\nYa puedes ejecutar "Aplicar Estilo de Foto de Referencia" sobre cualquier selección.',
        'info'
    )
end)
