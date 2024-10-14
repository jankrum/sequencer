const midiAccess: MIDIAccess | null = await navigator.requestMIDIAccess({ sysex: true }).catch(() => null)

export default midiAccess