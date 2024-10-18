import { Chart, BufferEvent, BufferEventType, BufferComputeEvent, BufferNoteOnEvent, BufferNoteOffEvent, BufferFinishEvent } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { sitOut, convertBpmToMpb } from '../helper.ts'

type Note = [number, number, number]

const pitchesPositionsAndDurations: Note[] = [
    [60, 0, 1],
    [60, 1, 1],
    [67, 2, 1],
    [67, 3, 1],
    [69, 4, 1],
    [69, 5, 1],
    [67, 6, 2],
    [65, 8, 1],
    [65, 9, 1],
    [64, 10, 1],
    [64, 11, 1],
    [62, 12, 1],
    [62, 13, 1],
    [60, 14, 2],
]

function playTTLS(part: Part): BufferEvent[] {
    const millisecondsPerBeat = convertBpmToMpb(120)

    const octaveJumpControl = part.controller.getRangeControl('8va chance: ', 0, 100, '%')

    function makeJumpEvent([pitch, position, duration]: Note): BufferComputeEvent {
        const roll = Math.random() * 100

        return {
            time: (position - 0.1) * millisecondsPerBeat,
            type: BufferEventType.Compute,
            callback: (buffer: BufferEvent[]) => {
                const chance = octaveJumpControl.value

                const newPitch = roll < chance ? pitch + 12 : pitch

                const noteOnEvent: BufferNoteOnEvent = {
                    time: position * millisecondsPerBeat,
                    type: BufferEventType.NoteOn,
                    part,
                    pitch: newPitch,
                    velocity: 0x7F,
                }

                const noteOffEvent: BufferNoteOffEvent = {
                    time: (position + duration - 0.1) * millisecondsPerBeat,
                    type: BufferEventType.NoteOff,
                    part,
                    pitch: newPitch,
                }

                buffer.unshift(noteOnEvent, noteOffEvent)
            }
        }
    }

    const computeEvents = pitchesPositionsAndDurations.map(makeJumpEvent)

    const [_, lastPosition, lastDuration] = pitchesPositionsAndDurations.at(-1) ?? [0, 0, 0]

    const finishEvent: BufferFinishEvent = {
        time: (lastDuration + lastPosition + 0.1) * millisecondsPerBeat,
        type: BufferEventType.Finish,
        part,
    }

    return [
        ...computeEvents,
        finishEvent,
    ]
}

const chart: Chart = {
    title: "Twinkle Twinkle Little Star",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        ...sitOut(bass, drum, keys),
        ...playTTLS(lead),
    ],
}

export default chart