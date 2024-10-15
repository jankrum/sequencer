// import { TransporterConfig, Config } from '../types'

// function getTransporterProblems(config: TransporterConfig): string[] {
//     const problems: string[] = []

//     if (config.type === undefined) {
//         problems.push('No transporter type')
//     }

//     return problems
// }

// export default function getProblems(config: Config): string[] {
//     const problems: string[] = []

//     const { transporter, parts } = config

//     if (!transporter) {
//         problems.push('No transporter')
//     }

//     if (!parts) {
//         problems.push('No parts')
//     }

//     if (problems.length) {
//         return problems
//     }

//     problems.push(...getTransporterProblems(transporter))
//     problems.push(...getPartsProblems(parts))

//     return problems
// }