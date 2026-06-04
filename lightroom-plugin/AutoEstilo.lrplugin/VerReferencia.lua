local LrDialogs = import 'LrDialogs'
local LrTasks   = import 'LrTasks'

local U = require 'Utilidades'

LrTasks.startAsyncTask(function()
    local prefs = U.getPrefs()

    if not prefs.referenciaGuardada then
        LrDialogs.message(
            'AutoEstilo — Sin Referencia',
            'No hay ninguna referencia guardada todavía.',
            'info'
        )
        return
    end

    local s        = prefs.referenciaSettings or {}
    local nombre   = prefs.referenciaNombre   or 'desconocido'
    local fecha    = prefs.referenciaFecha    or ''

    -- Mostrar los valores más relevantes
    local info = 'Foto de referencia: ' .. nombre .. '\nGuardada el: ' .. fecha .. '\n\n'
    info = info .. '--- Parámetros principales ---\n'

    local mostrar = {
        { 'Exposición',     'Exposure2012'    },
        { 'Contraste',      'Contrast2012'    },
        { 'Iluminaciones',  'Highlights2012'  },
        { 'Sombras',        'Shadows2012'     },
        { 'Blancos',        'Whites2012'      },
        { 'Negros',         'Blacks2012'      },
        { 'Textura',        'Texture'         },
        { 'Claridad',       'Clarity2012'     },
        { 'Neblina',        'Dehaze'          },
        { 'Saturación',     'Saturation'      },
        { 'Vibración',      'Vibrance'        },
        { 'Temperatura',    'Temperature'     },
        { 'Tinte',          'Tint'            },
        { 'Nitidez',        'Sharpness'       },
        { 'Ruido lum.',     'LuminanceSmoothing' },
        { 'Ruido color',    'ColorNoiseReduction' },
    }

    for _, par in ipairs(mostrar) do
        local etiqueta, key = par[1], par[2]
        if s[key] ~= nil then
            info = info .. string.format('  %-18s %s\n', etiqueta .. ':', tostring(s[key]))
        end
    end

    LrDialogs.message('AutoEstilo — Referencia Actual', info, 'info')
end)
