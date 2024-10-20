import { Chart, BufferEvent, } from '../../../../types.ts'
import { pipe, finish, } from '../helper.ts'

const chart: Chart = {
    title: 'My Favorite Things',
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => pipe(
        finish(bass, drum, keys, lead),
    ),
}

export default chart