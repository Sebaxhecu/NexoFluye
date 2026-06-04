return {
    LrSdkVersion        = 6.0,
    LrSdkMinimumVersion = 4.0,

    LrToolkitIdentifier = 'com.nexofluye.autoestilo',
    LrPluginName        = 'AutoEstilo',
    LrPluginInfoUrl     = 'https://github.com/sebaxhecu/nexofluye',

    LrInitPlugin        = 'Init.lua',

    LrExportMenuItems = {
        {
            title   = 'Aplicar Estilo de Foto de Referencia',
            file    = 'AplicarEstilo.lua',
        },
        {
            title   = 'Guardar Foto Actual como Referencia',
            file    = 'GuardarReferencia.lua',
        },
        {
            title   = 'Ver Referencia Guardada',
            file    = 'VerReferencia.lua',
        },
    },

    VERSION = { major=1, minor=0, revision=0 },
}
