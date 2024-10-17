import { Chart, BufferEvent, BufferEventType, } from '../../../../types.ts'
import { setInitialTempo, sitOut } from '../helper.ts'

const chart: Chart = {
    title: "Hello World",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        setInitialTempo(60),
        ...sitOut(bass, drum, keys),
        {
            position: 0,
            type: BufferEventType.NoteOn,
            part: lead,
            pitch: 60,
            velocity: 0x7F,
        },
        {
            position: 4,
            type: BufferEventType.NoteOff,
            part: lead,
            pitch: 60,
        },
        {
            position: 4,
            type: BufferEventType.Finish,
            part: lead,
        },
    ],
}

export default chart