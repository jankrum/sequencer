// import getConfigFromUrl from './from-url.ts'
import getConfigFromUser from './from-user.ts'

export default async (): Promise<Config> => {
    // Cheeky fucker
    return /*getConfigFromUrl() ||*/ await getConfigFromUser()
// }

// import { Config, ControllerType, SynthesizerType, TransporterType } from '../types.ts'
// import getProblems from './get-problems.ts'

// const dummyConfig: Config = {
//     parts: {
//         bass: {
//             controller: {
//                 type: ControllerType.Dom
//             },
//             synthesizer: {
//                 type: SynthesizerType.Dom,
//                 // type: SynthesizerType.Midi,
//                 // midi: {
//                 //     output: 'loopMIDI Port',
//                 //     channel: 1,
//                 // },
//             },
//         },
//         drum: {
//             controller: {
//                 type: ControllerType.Dom
//             },
//             synthesizer: {
//                 type: SynthesizerType.Dom
//             },
//         },
//         keys: {
//             controller: {
//                 type: ControllerType.Dom
//             },
//             synthesizer: {
//                 type: SynthesizerType.Dom
//             },
//         },
//         lead: {
//             controller: {
//                 type: ControllerType.Dom
//             },
//             synthesizer: {
//                 type: SynthesizerType.Dom,
//                 // type: SynthesizerType.Midi,
//                 // midi: {
//                 //     output: 'loopMIDI Port',
//                 //     channel: 2,
//                 // },
//             },
//         },
//     },
//     transporter: {
//         type: TransporterType.Dom,
//     },
// }

// export default async (): Promise<Config> => {
//     const problems = getProblems(dummyConfig)
//     console.log('Problems:', problems)
//     return dummyConfig
// }