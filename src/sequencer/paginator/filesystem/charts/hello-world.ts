import { Chart, BufferEvent, BufferEventType, Milliseconds } from '../../../../types.ts'
import { Dynamics } from '../helper.ts'

// No magic numbers
const pitch = 60
const velocity: Dynamics = Dynamics.mf
const duration: Milliseconds = 4000

const chart: Chart = {
    title: 'Hello World',
    compose: ({ lead }): BufferEvent[] => [
        {
            time: 0,
            type: BufferEventType.NoteOn,
            part: lead,
            pitch,
            velocity,
        },
        {
            time: duration,
            type: BufferEventType.NoteOff,
            part: lead,
            pitch,
        },
    ],
}

export default chart