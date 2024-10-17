import { Chart, BufferEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { setInitialTempo, sitOut } from '../helper.ts'

const majorScaleSteps = [0, 2, 4, 5, 7, 9, 11, 12]

function makeMajorScaleWalk(part: Part): BufferEvent[] {
    return majorScaleSteps.map(note => note + 24).map((pitch: number, index: number): [BufferNoteOnEvent, BufferNoteOffEvent] => ([{
        position: index,
        part,
        type: BufferEventType.NoteOn,
        pitch: pitch,
        velocity: 0x7F,
    }, {
        position: index + 0.9,
        part,
        type: BufferEventType.NoteOff,
        pitch: pitch
    }])).flat()
}

const chart: Chart = {
    title: "Bass Scale",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        setInitialTempo(120),
        ...sitOut(drum, keys, lead),
        ...makeMajorScaleWalk(bass),
        {
            position: majorScaleSteps.length,
            type: BufferEventType.Finish,
            part: bass
        },
    ],
}

export default chart