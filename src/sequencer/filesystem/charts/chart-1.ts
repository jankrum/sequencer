import Chart, { BufferEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent } from '../../../types/types.ts'

const majorScale = [0, 2, 4, 5, 7, 9, 11, 12]

const chart: Chart = {
    title: "Bass Scale",
    compose: (bass, drum, chord, lead): BufferEvent[] => {
        return [
            {
                position: -Infinity,
                type: BufferEventType.Tempo,
                bpm: 120
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
            {
                position: -Infinity,
                part: lead,
                type: BufferEventType.Finish,
            },
            ...majorScale.map((pitch: number, index: number): [BufferNoteOnEvent, BufferNoteOffEvent] => ([{
                position: index,
                part: bass,
                type: BufferEventType.NoteOn,
                pitch: pitch + 24
            }, {
                position: index + 0.9,
                part: bass,
                type: BufferEventType.NoteOff,
                pitch: pitch + 24
            }])).flat(),
            {
                position: majorScale.length,
                type: BufferEventType.Finish,
                part: bass
            },
        ]
    },
}

export default chart