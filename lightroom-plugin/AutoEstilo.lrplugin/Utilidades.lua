-- Módulo de utilidades compartidas
local LrPrefs     = import 'LrPrefs'
local LrLogger    = import 'LrLogger'

local logger = LrLogger('AutoEstilo')
logger:enable('logfile')

local M = {}

-- Lista completa de parámetros de Develop que se copian
M.PARAMS_DEVELOP = {
    -- Básicos
    'Exposure2012', 'Contrast2012', 'Highlights2012', 'Shadows2012',
    'Whites2012', 'Blacks2012', 'Texture', 'Clarity2012', 'Dehaze',
    'Vibrance', 'Saturation',

    -- Tono / Curva de tono
    'ToneCurveName2012', 'ToneCurve', 'ToneCurveRed', 'ToneCurveGreen',
    'ToneCurveBlue', 'ToneCurvePV2012', 'ToneCurvePV2012Red',
    'ToneCurvePV2012Green', 'ToneCurvePV2012Blue',

    -- HSL / Color
    'HueAdjustmentRed', 'HueAdjustmentOrange', 'HueAdjustmentYellow',
    'HueAdjustmentGreen', 'HueAdjustmentAqua', 'HueAdjustmentBlue',
    'HueAdjustmentPurple', 'HueAdjustmentMagenta',
    'SaturationAdjustmentRed', 'SaturationAdjustmentOrange',
    'SaturationAdjustmentYellow', 'SaturationAdjustmentGreen',
    'SaturationAdjustmentAqua', 'SaturationAdjustmentBlue',
    'SaturationAdjustmentPurple', 'SaturationAdjustmentMagenta',
    'LuminanceAdjustmentRed', 'LuminanceAdjustmentOrange',
    'LuminanceAdjustmentYellow', 'LuminanceAdjustmentGreen',
    'LuminanceAdjustmentAqua', 'LuminanceAdjustmentBlue',
    'LuminanceAdjustmentPurple', 'LuminanceAdjustmentMagenta',

    -- Blanco y negro
    'ConvertToGrayscale',
    'GrayMixerRed', 'GrayMixerOrange', 'GrayMixerYellow',
    'GrayMixerGreen', 'GrayMixerAqua', 'GrayMixerBlue',
    'GrayMixerPurple', 'GrayMixerMagenta',

    -- Calibración de cámara
    'CameraProfile', 'ShadowTint',
    'RedHue', 'RedSaturation', 'GreenHue', 'GreenSaturation',
    'BlueHue', 'BlueSaturation',

    -- Viñeta
    'PostCropVignetteAmount', 'PostCropVignetteMidpoint',
    'PostCropVignetteFeather', 'PostCropVignetteRoundness',
    'PostCropVignetteStyle', 'PostCropVignetteHighlightContrast',

    -- Grano
    'GrainAmount', 'GrainSize', 'GrainFrequency',

    -- Reducción de ruido
    'LuminanceSmoothing', 'LuminanceNoiseReductionDetail',
    'LuminanceNoiseReductionContrast', 'ColorNoiseReduction',
    'ColorNoiseReductionDetail', 'ColorNoiseReductionSmoothness',

    -- Nitidez
    'Sharpness', 'SharpenRadius', 'SharpenDetail', 'SharpenEdgeMasking',

    -- Corrección de lente
    'LensProfileEnable', 'AutoLateralCA', 'LensManualDistortionAmount',
    'VignetteAmount', 'ShadowClipping',

    -- Balance de blancos
    'WhiteBalance', 'Temperature', 'Tint',

    -- Tratamiento
    'CameraProfile', 'ProcessVersion',

    -- Gradación de color (Color Grading / Split Toning)
    'SplitToningShadowHue', 'SplitToningShadowSaturation',
    'SplitToningHighlightHue', 'SplitToningHighlightSaturation',
    'SplitToningBalance',
    'ColorGradeMidtoneHue', 'ColorGradeMidtoneSat', 'ColorGradeMidtoneLum',
    'ColorGradeShadowHue', 'ColorGradeShadowSat', 'ColorGradeShadowLum',
    'ColorGradeHighlightHue', 'ColorGradeHighlightSat', 'ColorGradeHighlightLum',
    'ColorGradeGlobalHue', 'ColorGradeGlobalSat', 'ColorGradeGlobalLum',
    'ColorGradeBlending', 'ColorGradeMidtoneBalance',
}

function M.getPrefs()
    return LrPrefs.prefsForPlugin()
end

function M.log(msg)
    logger:trace(msg)
end

return M
