import { Chart, BufferEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent, BufferFinishEvent } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { sitOut, convertBpmToMpb } from '../helper.ts'

const majorScaleSteps = [0, 2, 4, 5, 7, 9, 11, 12]

const millisecondsPerBeat = convertBpmToMpb(120)

function makeMajorScaleWalk(part: Part): BufferEvent[] {
    const notes = majorScaleSteps.map(note => note + 24).map((pitch: number, index: number): [BufferNoteOnEvent, BufferNoteOffEvent] => ([{
        time: index * millisecondsPerBeat,
        part,
        type: BufferEventType.NoteOn,
        pitch: pitch,
        velocity: 0x7F,
    }, {
        time: (index + 0.9) * millisecondsPerBeat,
        part,
        type: BufferEventType.NoteOff,
        pitch: pitch
    }])).flat() as BufferEvent[]

    const finishEvent = {
        time: majorScaleSteps.length * millisecondsPerBeat,
        type: BufferEventType.Finish,
        part,
    } as BufferFinishEvent

    return [
        ...notes,
        finishEvent,
    ]
}

const chart: Chart = {
    title: "Bass Scale",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        ...sitOut(drum, keys, lead),
        ...makeMajorScaleWalk(bass),
    ],
}

export default chart