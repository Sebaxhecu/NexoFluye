local LrApplication  = import 'LrApplication'
local LrDialogs      = import 'LrDialogs'
local LrTasks        = import 'LrTasks'
local LrProgressScope = import 'LrProgressScope'
local LrFunctionContext = import 'LrFunctionContext'

local U = require 'Utilidades'

LrTasks.startAsyncTask(function()
    local prefs = U.getPrefs()

    -- Verificar que hay referencia guardada
    if not prefs.referenciaGuardada or not prefs.referenciaSettings then
        LrDialogs.message(
            'AutoEstilo',
            'No hay ninguna referencia guardada.\n\nPrimero selecciona la foto modelo y ejecuta\n"Guardar Foto Actual como Referencia".',
            'critical'
        )
        return
    end

    local catalog = LrApplication.activeCatalog()
    local fotos   = catalog:getTargetPhotos()

    if not fotos or #fotos == 0 then
        LrDialogs.message(
            'AutoEstilo',
            'No hay fotos seleccionadas.\nSelecciona las fotos a las que quieres aplicar el estilo.',
            'critical'
        )
        return
    end

    -- Confirmación antes de proceder
    local total   = #fotos
    local confirm = LrDialogs.confirm(
        'AutoEstilo — Aplicar Estilo',
        'Se aplicará el estilo de:\n"' .. (prefs.referenciaNombre or 'referencia') ..
        '"\n\na ' .. total .. ' foto(s) seleccionada(s).\n\n¿Continuar?',
        'Aplicar a todas', 'Cancelar'
    )

    if confirm == 'cancel' then return end

    -- Aplicar con barra de progreso
    LrFunctionContext.callWithContext('AutoEstilo_Aplicar', function(context)
        local progress = LrProgressScope({
            title    = 'AutoEstilo: Aplicando estilo...',
            caption  = '',
            functionContext = context,
        })

        local settings  = prefs.referenciaSettings
        local exitosas  = 0
        local fallidas  = 0

        for i, foto in ipairs(fotos) do
            if progress:isCanceled() then break end

            local nombre = foto:getFormattedMetadata('fileName') or ('foto ' .. i)
            progress:setCaption(nombre)
            progress:setPortionComplete(i - 1, total)

            -- Aplicar en escritura al catálogo
            local ok, err = pcall(function()
                catalog:withWriteAccessDo('Aplicar estilo AutoEstilo', function()
                    foto:applyDevelopSettings(settings)
                end)
            end)

            if ok then
                exitosas = exitosas + 1
                U.log('Estilo aplicado a: ' .. nombre)
            else
                fallidas = fallidas + 1
                U.log('Error en ' .. nombre .. ': ' .. tostring(err))
            end

            LrTasks.sleep(0.02) -- pausa mínima para no saturar la UI
        end

        progress:done()

        local msg = 'Proceso completado.\n\n' ..
                    '✓ Exitosas: ' .. exitosas .. '\n'
        if fallidas > 0 then
            msg = msg .. '✗ Con error: ' .. fallidas ..
                  '\n\nRevisa el log en: Ayuda > Registro de la sesión'
        end

        LrDialogs.message('AutoEstilo — Listo', msg, 'info')
    end)
end)
