import { Chart, BufferEvent, } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { sitOut, pipe, setTempo, play, finish } from '../helper.ts'

const majorScale = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3']

function makeMajorScaleWalk(part: Part): BufferEvent[] {
    return pipe(
        setTempo(120),
        ...majorScale.map((pitchName, index) => play(part, pitchName, index, 0.9, 0x7F)),
        finish(part),
    )
}

const chart: Chart = {
    title: "Bass Scale",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        ...sitOut(drum, keys, lead),
        ...makeMajorScaleWalk(bass),
    ],
}

export default chart