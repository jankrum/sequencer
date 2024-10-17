import { Chart, BufferEvent, BufferComputeEvent, BufferEventType, } from '../../../../types.ts'
import { setInitialTempo, sitOut } from '../helper.ts'

const pitches = [40, 43, 45, 43, 50, 48, 50, 52]
const runDuration = 2
const stepDuration = runDuration / pitches.length

const chart: Chart = {
    title: "On the Run",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => {
        const repeatControl = lead.controller.getOptionControl('Repeat again: ', ['No', 'Yes'], '!')

        function makeRun(position: number): BufferEvent[] {
            const noteOnAndOffEvents = pitches.map((pitch, index) => {
                const startPosition = position + (index * stepDuration)
                return [
                    {
                        position: startPosition,
                        type: BufferEventType.NoteOn,
                        part: lead,
                        pitch,
                        velocity: 0x7F,
                    },
                    {
                        position: startPosition + stepDuration - 0.05,
                        type: BufferEventType.NoteOff,
                        part: lead,
                        pitch,
                    },
                ]
            }).flat() as BufferEvent[]

            const computeEvent = maybeMakeRun(position + runDuration)

            return [
                ...noteOnAndOffEvents,
                computeEvent,
            ]
        }

        function maybeMakeRun(position: number): BufferComputeEvent {
            return {
                position: position - 0.1,
                type: BufferEventType.Compute,
                callback: (buffer) => {
                    if (repeatControl.value) {
                        buffer.push(...makeRun(position))
                    } else {
                        buffer.push({
                            position: position,
                            type: BufferEventType.Finish,
                            part: lead,
                        })
                    }
                }
            }
        }

        return [
            setInitialTempo(165),
            ...sitOut(bass, drum, keys),
            maybeMakeRun(0),
        ]
    },
}

export default chart