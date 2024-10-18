import { Chart, BufferEvent, BufferComputeEvent, BufferEventType, } from '../../../../types.ts'
import { convertPitchNameToMidiNumber, sitOut, convertBpmToMpb } from '../helper.ts'

// const pitches = [40, 43, 45, 43, 50, 48, 50, 52]
const pitches = ['E3', 'G3', 'A3', 'G3', 'D4', 'C4', 'D4', 'E4'].map(convertPitchNameToMidiNumber)
const runDuration = 2
const stepDuration = runDuration / pitches.length
const millisecondsPerBeat = convertBpmToMpb(165)

const chart: Chart = {
    title: "On the Run",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => {
        const repeatControl = lead.controller.getOptionControl('Repeat again: ', ['No', 'Yes'], '!')

        function makeRun(position: number): BufferEvent[] {
            const noteOnAndOffEvents = pitches.map((pitch, index) => {
                const startPosition = position + (index * stepDuration)
                return [
                    {
                        time: startPosition * millisecondsPerBeat,
                        type: BufferEventType.NoteOn,
                        part: lead,
                        pitch,
                        velocity: 0x7F,
                    },
                    {
                        time: (startPosition + stepDuration - 0.05) * millisecondsPerBeat,
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
                time: (position - 0.1) * millisecondsPerBeat,
                type: BufferEventType.Compute,
                callback: (buffer) => {
                    if (repeatControl.value) {
                        buffer.push(...makeRun(position))
                    } else {
                        buffer.push({
                            time: position * millisecondsPerBeat,
                            type: BufferEventType.Finish,
                            part: lead,
                        })
                    }
                }
            }
        }

        return [
            ...sitOut(bass, drum, keys),
            maybeMakeRun(0),
        ]
    },
}

export default chart