-- Inicialización del plugin AutoEstilo
local LrPrefs = import 'LrPrefs'

local prefs = LrPrefs.prefsForPlugin()

-- Inicializar preferencias si no existen
if prefs.referenciaGuardada == nil then
    prefs.referenciaGuardada = false
end
