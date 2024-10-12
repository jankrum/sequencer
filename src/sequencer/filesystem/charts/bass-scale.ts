import Chart, { BufferEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent } from '../../../types.ts'
import { Part } from '../../band.ts'
import { setInitialTempo, sitOut } from '../helper.ts'

const majorScale = [0, 2, 4, 5, 7, 9, 11, 12]

function makeMajorScaleWalk(part: Part): BufferEvent[] {
    return majorScale.map(note => note + 24).map((pitch: number, index: number): [BufferNoteOnEvent, BufferNoteOffEvent] => ([{
        position: index,
        part,
        type: BufferEventType.NoteOn,
        pitch: pitch
    }, {
        position: index + 0.9,
        part,
        type: BufferEventType.NoteOff,
        pitch: pitch
    }])).flat()
}

const chart: Chart = {
    title: "Bass Scale",
    compose: ({ bass, drum, chord, lead }): BufferEvent[] => {
        return [
            setInitialTempo(120),
            ...sitOut(drum, chord, lead),
            ...makeMajorScaleWalk(bass),
            {
                position: majorScale.length,
                type: BufferEventType.Finish,
                part: bass
            },
        ]
    },
}

export default chart