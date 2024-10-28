import { Chart, EventType, Milliseconds } from '../../../../types.ts'
import { Dynamics } from '../helper.ts'

// No magic numbers
const pitch = 60
const velocity: Dynamics = Dynamics.mf
const duration: Milliseconds = 4000

const chart: Chart = {
    title: 'Hello World',
    compose: function* ({ lead }) {
        yield {
            time: 0,
            type: EventType.NoteOn,
            part: lead,
            pitch,
            velocity,
        }

        yield {
            time: duration,
            type: EventType.NoteOff,
            part: lead,
            pitch,
        }
    },
}

export default chart