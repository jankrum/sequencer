import { Chart, BufferEvent, BufferEventType, BufferComputeEvent, BufferNoteOnEvent, BufferNoteOffEvent, BufferFinishEvent } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { convertPitchNameToMidiNumber, sitOut, convertBpmToMpb } from '../helper.ts'

type Note = [string, number, number]

const pitchesPositionsAndDurations: Note[] = [
    ['C4', 0, 1],
    ['C4', 1, 1],
    ['G4', 2, 1],
    ['G4', 3, 1],
    ['A4', 4, 1],
    ['A4', 5, 1],
    ['G4', 6, 2],
    ['F4', 8, 1],
    ['F4', 9, 1],
    ['E4', 10, 1],
    ['E4', 11, 1],
    ['D4', 12, 1],
    ['D4', 13, 1],
    ['C4', 14, 2],
    ['G4', 16, 1],
    ['G4', 17, 1],
    ['F4', 18, 1],
    ['F4', 19, 1],
    ['E4', 20, 1],
    ['E4', 21, 1],
    ['D4', 22, 2],
    ['G4', 24, 1],
    ['G4', 25, 1],
    ['F4', 26, 1],
    ['F4', 27, 1],
    ['E4', 28, 1],
    ['E4', 29, 1],
    ['D4', 30, 2],
    ['C4', 32, 1],
    ['C4', 33, 1],
    ['G4', 34, 1],
    ['G4', 35, 1],
    ['A4', 36, 1],
    ['A4', 37, 1],
    ['G4', 38, 2],
    ['F4', 40, 1],
    ['F4', 41, 1],
    ['E4', 42, 1],
    ['E4', 43, 1],
    ['D4', 44, 1],
    ['D4', 45, 1],
    ['C4', 46, 2],
]

function playTTLS(part: Part): BufferEvent[] {
    const millisecondsPerBeat = convertBpmToMpb(120)

    const octaveJumpControl = part.controller.getRangeControl('8va chance: ', 0, 100, '%')

    function makeJumpEvent([pitchName, position, duration]: Note): BufferComputeEvent {
        const roll = Math.random() * 100

        return {
            time: (position - 0.1) * millisecondsPerBeat,
            type: BufferEventType.Compute,
            callback: (buffer: BufferEvent[]) => {
                const chance = octaveJumpControl.value

                const pitch = convertPitchNameToMidiNumber(pitchName)

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