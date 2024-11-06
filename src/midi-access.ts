const midiAccess: MIDIAccess | null = await (() => {
    try {
        return navigator.requestMIDIAccess({ sysex: true })
    } catch {
        return null
    }
})()

export default midiAccess