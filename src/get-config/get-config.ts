import { Config, ControllerType, SynthesizerType, TransporterType } from '../types.ts'

export default async (): Promise<Config> => ({
    parts: {
        bass: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Log
            },
        },
        drum: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Log
            },
        },
        keys: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Log
            },
        },
        lead: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Log
            },
        },
    },
    transporter: {
        type: TransporterType.Dom
    },
})