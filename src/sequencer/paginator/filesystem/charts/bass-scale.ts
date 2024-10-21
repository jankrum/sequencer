import { Chart, BufferEvent, } from '../../../../types.ts'
import { SpecificPitch, pipe, finish, setTempo, play, } from '../helper.ts'

const majorScale: SpecificPitch[] = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3']

const chart: Chart = {
    title: 'Bass Scale',
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => pipe(
        finish(drum, keys, lead),
        setTempo(120),
        ...majorScale.map((pitchName, index) => play(bass, pitchName, index, 0.9, 0x7F)),
        finish(bass),
    ),
}

export default chart