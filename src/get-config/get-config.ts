import { Config, ControllerType, SynthesizerType, TransporterType } from '../types.ts'

export default async (): Promise<Config> => ({
    parts: {
        bass: {
            controller: {
                type: ControllerType.Dom
            },
            synthesizer: {
                // type: SynthesizerType.Dom,
                type: SynthesizerType.Midi,
                midi: {
                    output: 'loopMIDI Port',
                    channel: 1,
                },
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
                // type: SynthesizerType.Dom,
                type: SynthesizerType.Midi,
                midi: {
                    output: 'loopMIDI Port',
                    channel: 2,
                },
            },
        },
    },
    transporter: {
        type: TransporterType.Dom
    },
})