import { BufferFinishEvent, BufferEventType } from '../../../types.ts'
import Part from '../../playbacker/band/part/part.ts'

export function sitOut(...parts: Part[]): BufferFinishEvent[] {
    return parts.map((part): BufferFinishEvent => ({
        time: -Infinity,
        type: BufferEventType.Finish,
        part,
    }))
}