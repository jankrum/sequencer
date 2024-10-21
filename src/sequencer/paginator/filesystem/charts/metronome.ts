import { PitchNumber, Chart, BufferEvent, BufferEventType, } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { convertBpmToMpb, } from '../helper.ts'

type Bpm = number
type Milliseconds = number

//---------------------Constants---------------------
const minTempo: Bpm = 60
const maxTempo: Bpm = 240
const metronomeSamplePitch: PitchNumber = 32
const triggerLength: Milliseconds = 5
const scheduleAhead: Milliseconds = 100  // With this amount of schedule-ahead, we cannot go faster than 600 bpm
const midiMaxValue = 0x7F
//---------------------------------------------------

function makeMetronomeBeat(drum: Part): BufferEvent[] {
    const tempoControl = drum.controller.getRangeControl('Tempo: ', minTempo, maxTempo, ' pm')

    const makeMetronomeBeatAtTime = (targetTime: number): BufferEvent[] => [
        {
            time: targetTime - scheduleAhead,
            type: BufferEventType.Compute,
            callback: (buffer: BufferEvent[]) => {
                const tempo = tempoControl.value
                const nextTargetTime = targetTime + convertBpmToMpb(tempo)
                buffer.push(...makeMetronomeBeatAtTime(nextTargetTime))
            }
        },
        {
            time: targetTime,
            type: BufferEventType.NoteOn,
            part: drum,
            pitch: metronomeSamplePitch,
            velocity: midiMaxValue,
        },
        {
            time: targetTime + triggerLength,
            type: BufferEventType.NoteOff,
            part: drum,
            pitch: metronomeSamplePitch,
        },
    ]

    return makeMetronomeBeatAtTime(0)
}

const chart: Chart = {
    title: 'Metronome',
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        {
            time: -Infinity,
            type: BufferEventType.Finish,
            part: bass,
        },
        {
            time: -Infinity,
            type: BufferEventType.Finish,
            part: keys,
        },
        {
            time: -Infinity,
            type: BufferEventType.Finish,
            part: lead,
        },
        ...makeMetronomeBeat(drum),
    ],
}

export default chart