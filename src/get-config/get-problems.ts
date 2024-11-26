import midiAccess from '../midi-access.ts'
import { Config, ControllerConfig, ControllerType, PartConfig, PartName, PartsConfig, /*DuplexMidiConfig,*/ SimplexMidiConfig, SynthesizerConfig, SynthesizerType, TransporterConfig, TransporterType, } from '../types.ts'

function getMidiPortProblems(parentName: string, portName: string, direction: 'inputs' | 'outputs'): string[] {
    const problems: string[] = []

    if (!midiAccess) {
        problems.push(`The ${parentName} cannot be type MIDI without MIDI access`)
        return problems
    }

    const map = midiAccess[direction] as MIDIInputMap | MIDIOutputMap
    const values = map.values()
    const ports: { name: string }[] = Array.from(values as any)  // TypeScript doesn't know that values is an iterator

    if (!ports) {
        problems.push(`No MIDI ${direction}`)
        return problems
    }

    const port = ports.find(({ name }) => name === portName)

    if (!port) {
        problems.push(`No MIDI ${direction} named ${portName} for ${parentName}`)
    }

    return problems
}

// function getDuplexMidiProblems(parentName: string, config: DuplexMidiConfig): string[] {
//     const problems: string[] = []

//     const { input, output } = config

//     if (!input) {
//         problems.push(`No MIDI input for ${parentName}`)
//     } else {
//         problems.push(...getMidiPortProblems(parentName, input, 'inputs'))
//     }

//     if (!output) {
//         problems.push(`No MIDI output for ${parentName}`)
//     } else {
//         problems.push(...getMidiPortProblems(parentName, output, 'outputs'))
//     }

//     if (problems.length) {
//         return problems
//     }

//     if (input === output) {
//         problems.push(`Input and output are the same for ${parentName}`)
//         return problems
//     }

//     return problems
// }

function getSimplexMidiProblems(parentName: string, config: SimplexMidiConfig): string[] {
    const problems: string[] = []

    const { output, channel } = config

    if (!output) {
        problems.push(`No MIDI output for ${parentName}`)
    } else {
        problems.push(...getMidiPortProblems(parentName, output, 'outputs'))
    }

    if (!channel) {
        problems.push(`No MIDI channel for ${parentName}`)
    } else if (channel < 1 || channel > 16) {
        problems.push(`Invalid MIDI channel for ${parentName}: ${channel}`)
    }

    return problems
}

//#region Transporter
function getTransporterProblems(config: TransporterConfig): string[] {
    const problems: string[] = []

    if (config.type === undefined) {
        problems.push('No transporter type')
        return problems
    }

    if (!(config.type in TransporterType)) {
        problems.push(`Invalid transporter type: ${config.type}`)
        return problems
    }

    // if (config.type === TransporterType.Midi) {
    //     if (!midiAccess) {
    //         problems.push('No MIDI access')
    //         return problems
    //     }

    //     const { midi } = config

    //     if (!midi) {
    //         problems.push('No MIDI config')
    //         return problems
    //     }

    //     problems.push(...getDuplexMidiProblems('Transporter', midi))
    // }

    return problems
}
//#endregion

//#region Parts
function getControllerProblems(partName: PartName, config: ControllerConfig): string[] {
    const problems: string[] = []

    if (config.type === undefined) {
        problems.push(`No controller type for ${partName} part`)
        return problems
    }

    if (!(config.type in ControllerType)) {
        problems.push(`Invalid controller type for ${partName} part: ${config.type}`)
        return problems
    }

    // if (config.type === ControllerType.Midi) {
    //     if (!midiAccess) {
    //         problems.push('No MIDI access')
    //         return problems
    //     }

    //     const { midi } = config

    //     if (!midi) {
    //         problems.push('No MIDI config')
    //         return problems
    //     }

    //     problems.push(...getDuplexMidiProblems(`${partName} controller`, midi))
    // }

    return problems
}

function getSynthesizerProblems(partName: PartName, config: SynthesizerConfig): string[] {
    const problems: string[] = []

    if (config.type === undefined) {
        problems.push(`No synthesizer type for ${partName} part`)
        return problems
    }

    if (!(config.type in SynthesizerType)) {
        problems.push(`Invalid synthesizer type for ${partName} part: ${config.type}`)
    }

    if (config.type === SynthesizerType.Midi) {
        if (!midiAccess) {
            problems.push('No MIDI access')
            return problems
        }

        const { midi } = config

        if (!midi) {
            problems.push('No MIDI config')
            return problems
        }

        problems.push(...getSimplexMidiProblems(`${partName} synthesizer`, midi))
    }

    return problems
}

function getPartProblems(partName: PartName, config: PartConfig): string[] {
    const problems: string[] = []

    const { controller, synthesizer } = config

    if (!controller) {
        problems.push(`No controller for ${partName} part`)
    } else {
        problems.push(...getControllerProblems(partName, controller))
    }

    if (!synthesizer) {
        problems.push(`No synthesizer for ${partName} part`)
    } else {
        problems.push(...getSynthesizerProblems(partName, synthesizer))
    }

    return problems
}

function getPartsProblems(configs: PartsConfig): string[] {
    const problems: string[] = []

    const partNames: PartName[] = ['bass', 'drum', 'keys', 'lead']

    for (const partName of partNames) {
        const partConfig = configs[partName]

        if (!partConfig) {
            problems.push(`No ${partName} part`)
            continue
        }

        problems.push(...getPartProblems(partName, partConfig))
    }

    return problems
}
//#endregion

//#region getProblems
export default function getProblems(config: Config): string[] {
    const problems: string[] = []

    const { transporter, parts } = config

    if (!transporter) {
        problems.push('No transporter')
    } else {
        problems.push(...getTransporterProblems(transporter))
    }

    if (!parts) {
        problems.push('No parts')
    } else {
        problems.push(...getPartsProblems(parts))
    }
    return problems
}
//#endregion