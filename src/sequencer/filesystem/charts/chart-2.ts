import Chart, { BufferEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent } from '../../../types/types.ts'

const majorScale = [0, 2, 4, 5, 7, 9, 11, 12]

const chart: Chart = {
    title: "Lead Scale",
    compose: (bass, drum, chord, lead): BufferEvent[] => {
        return [
            {
                position: -Infinity,
                type: BufferEventType.Tempo,
                bpm: 120
            },
            {
                position: -Infinity,
                part: bass,
                type: BufferEventType.Finish,
            },
            {
                position: -Infinity,
                part: drum,
                type: BufferEventType.Finish,
            },
            {
                position: -Infinity,
                part: chord,
                type: BufferEventType.Finish,
            },
            ...majorScale.map((pitch: number, index: number): [BufferNoteOnEvent, BufferNoteOffEvent] => ([{
                position: index,
                part: lead,
                type: BufferEventType.NoteOn,
                pitch: pitch
            }, {
                position: index + 0.9,
                part: lead,
                type: BufferEventType.NoteOff,
                pitch: pitch
            }])).flat(),
            {
                position: majorScale.length,
                type: BufferEventType.Finish,
                part: lead
            },
        ]
    },
}

export default chart