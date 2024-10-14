import { Config, ControllerType, SynthesizerType, TransporterType } from '../types.ts'

export default async (): Promise<Config> => ({
    parts: {
        bass: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Dom
            },
        },
        drum: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Dom
            },
        },
        keys: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Dom
            },
        },
        lead: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                type: SynthesizerType.Dom
            },
        },
    },
    transporter: {
        type: TransporterType.Dom
    },
})