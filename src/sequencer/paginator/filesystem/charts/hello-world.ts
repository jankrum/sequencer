import { Chart, BufferEvent, BufferEventType, } from '../../../../types.ts'
import { sitOut } from '../helper.ts'

const chart: Chart = {
    title: "Hello World",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        ...sitOut(bass, drum, keys),
        pipe(
            setTempo(60),
            play(lead, 'C4', 0, 4, 0x7F),
            finish(lead),
        )
    ],
}

export default chart