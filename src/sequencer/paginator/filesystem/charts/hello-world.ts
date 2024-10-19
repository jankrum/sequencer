import { Chart, BufferEvent, } from '../../../../types.ts'
import { pipe, finish, setTempo, play, } from '../helper.ts'

const chart: Chart = {
    title: 'Hello World',
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => pipe(
        finish(bass, drum, keys),
        setTempo(60),
        play(lead, 'C4', 0, 4, 0x7F),
        finish(lead),
    ),
}

export default chart