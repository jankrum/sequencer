import { BufferTempoEvent, BufferFinishEvent, BufferEventType } from '../../types.ts'
import { Part } from '../band.ts'

export function setInitialTempo(bpm: number): BufferTempoEvent {
    return {
        position: -Infinity,
        type: BufferEventType.Tempo,
        bpm,
    }
}

export function sitOut(...parts: Part[]): BufferFinishEvent[] {
    return parts.map(part => ({
        position: -Infinity,
        part,
        type: BufferEventType.Finish,
    }))
}