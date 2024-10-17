import { Config, ControllerType, PartConfig, PartName, SynthesizerType, TransporterConfig, TransporterType } from '../types.ts'

import dm from '../dm.ts'
import midiAccess from '../midi-access.ts'
import getProblems from './get-problems.ts'

// The types of transporters, controllers, and synthesizers
const transporterTypes: [string, TransporterType][] = [['DOM', TransporterType.Dom], ['MIDI', TransporterType.Midi]]
const controllerTypes: [string, ControllerType][] = [['DOM', ControllerType.Dom], ['MIDI', ControllerType.Midi]]
const synthesizerTypes: [string, SynthesizerType][] = [['DOM', SynthesizerType.Dom], ['MIDI', SynthesizerType.Midi]]


const SELECTORS = {
    CONFIG_FORM_ID: 'config-form',
    TRANSPORTER_CONFIG_ID: 'transporter-config',
    PART_CONFIG_CLASS: 'part-config',
    TYPE_DIV_CLASS: 'type-div',
    MIDI_DIV_CLASS: 'midi-div',
    MIDI_INPUT_SELECT_CLASS: 'midi-input-select',
    MIDI_OUTPUT_SELECT_CLASS: 'midi-output-select',
    REMEMBER_CHECKBOX_ID: 'remember-config',
}

type SpecificConfig = DuplexMidiConfigElement | SimplexMidiConfigElement

type AllTypes = TransporterType | ControllerType | SynthesizerType

function setUpRadioButtons(typeConfig: TypeConfigElement, typeSpecificNamesAndConfigs: [AllTypes, SpecificConfig][]) {
    if (!typeConfig.div) {
        throw new Error('setUpRadioButtons called before render')
    }

    // The radio buttons for the type
    const radioButtons = Array.from(typeConfig.div.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]

    // Add event listeners to the radio buttons
    for (const radioButton of radioButtons) {
        // Make the divs for the specific types hidden or not based on the radio button value
        for (const [type, config] of typeSpecificNamesAndConfigs) {
            radioButton.addEventListener('change', () => {
                if (!config.div) {
                    throw new Error('setUpRadioButtons called before render')
                }

                config.div.classList[Number(radioButton.value) === type ? 'remove' : 'add']('hidden')
            })
        }
    }
}

class TypeConfigElement {
    name: string
    title: string
    typeNamesAndEnums: [string, TransporterType | ControllerType | SynthesizerType][]
    inputs: { [key: string]: HTMLInputElement }
    div: HTMLElement | null

    constructor(name: string, title: string, typeNamesAndEnums: [string, TransporterType | ControllerType | SynthesizerType][]) {
        // Used in render
        this.name = name
        this.title = title
        this.typeNamesAndEnums = typeNamesAndEnums

        // For the config
        this.inputs = {}
        this.div = null
    }

    render() {
        // The inputs and labels for the types
        const inputsAndLabels = this.typeNamesAndEnums.map(([typeName, typeEnum]: [string, TransporterType | ControllerType | SynthesizerType]) => {
            const inputId = `${this.name}-${typeName}`
            const input = dm('input', { id: inputId, type: 'radio', name: this.name, value: typeEnum }) as HTMLInputElement
            const label = dm('label', { for: inputId }, typeName)
            this.inputs[typeEnum] = input
            return [input, label]
        }).flat()

        const div = this.div = dm('div', { class: SELECTORS.TYPE_DIV_CLASS }, this.title, ...inputsAndLabels)

        return div
    }

    getConfig(): TransporterType | ControllerType | SynthesizerType {
        if (!this.div) {
            throw new Error('getConfig called before render')
        }

        return Number((this.div.querySelector('input[type="radio"]:checked') as HTMLInputElement).value)
    }
}

class DuplexMidiConfigElement {
    inputSelect: HTMLSelectElement | null = null
    outputSelect: HTMLSelectElement | null = null
    div: HTMLElement | null = null

    render() {
        const inputSelect = this.inputSelect = dm('select', { class: SELECTORS.MIDI_INPUT_SELECT_CLASS }) as HTMLSelectElement
        const outputSelect = this.outputSelect = dm('select', { class: SELECTORS.MIDI_OUTPUT_SELECT_CLASS }) as HTMLSelectElement
        const div = this.div = dm('div', {}, inputSelect, ' → Here → ', outputSelect)

        return div
    }

    getConfig() {
        if (!this.inputSelect || !this.outputSelect) {
            throw new Error('getConfig called before render')
        }

        return {
            input: this.inputSelect.value,
            output: this.outputSelect.value,
        }
    }
}

class SimplexMidiConfigElement {
    select: HTMLSelectElement | null = null
    input: HTMLInputElement | null = null
    div: HTMLElement | null = null

    render() {
        const select = this.select = dm('select', { class: SELECTORS.MIDI_OUTPUT_SELECT_CLASS }) as HTMLSelectElement
        const input = this.input = dm('input', { type: 'number', name: 'channel', min: 1, max: 16, value: 1 }) as HTMLInputElement
        const div = this.div = dm('div', {}, select, ' on channel ', input)

        return div
    }

    getConfig() {
        if (!this.select || !this.input) {
            throw new Error('getConfig called before render')
        }

        return {
            output: this.select.value,
            channel: this.input.value,
        }
    }
}

class TransporterConfigElement {
    typeConfig: TypeConfigElement = new TypeConfigElement('transporter-type', 'Type: ', transporterTypes)
    midiConfig: DuplexMidiConfigElement = new DuplexMidiConfigElement()

    render() {
        const legend = dm('legend', {}, 'TRANSPORTER')
        const typeDiv = this.typeConfig.render()
        const midiDiv = this.midiConfig.render()
        const fieldset = dm('fieldset', { id: SELECTORS.TRANSPORTER_CONFIG_ID }, legend, typeDiv, midiDiv)

        return fieldset
    }

    setUp() {
        setUpRadioButtons(this.typeConfig, [[TransporterType.Midi, this.midiConfig]])
    }

    getConfig(): TransporterConfig {
        const config = {} as any

        const type = config.type = this.typeConfig.getConfig()

        if (type === TransporterType.Midi) {
            config.midi = this.midiConfig.getConfig()
        }

        return config
    }
}

class ControllerConfigElement {
    typeConfig: TypeConfigElement
    midiConfig: DuplexMidiConfigElement = new DuplexMidiConfigElement()
    div: HTMLElement | null = null

    constructor(name: PartName) {
        this.typeConfig = new TypeConfigElement(`${name}-controller-type`, 'Controller: ', controllerTypes)
    }

    render() {
        const typeDiv = this.typeConfig.render()
        const midiConfig = this.midiConfig.render()
        const div = this.div = dm('div', {}, typeDiv, midiConfig)

        return div
    }

    setUp() {
        setUpRadioButtons(this.typeConfig, [[ControllerType.Midi, this.midiConfig]])
    }

    getConfig() {
        const config = {} as any

        const type = config.type = this.typeConfig.getConfig()

        if (type === ControllerType.Midi) {
            config.midi = this.midiConfig.getConfig()
        }

        return config
    }
}

class SynthesizerConfigElement {
    typeConfig: TypeConfigElement
    midiConfig: SimplexMidiConfigElement = new SimplexMidiConfigElement()

    constructor(name: PartName) {
        this.typeConfig = new TypeConfigElement(`${name}-synthesizer-type`, 'Synthesizer: ', synthesizerTypes)
    }

    render() {
        const typeDiv = this.typeConfig.render()
        const midiConfig = this.midiConfig.render()
        const div = dm('div', {}, typeDiv, midiConfig)

        return div
    }

    setUp() {
        setUpRadioButtons(this.typeConfig, [[SynthesizerType.Midi, this.midiConfig]])
    }

    getConfig() {
        const config = {} as any

        const type = config.type = this.typeConfig.getConfig()

        if (type === SynthesizerType.Midi) {
            config.midi = this.midiConfig.getConfig()
        }

        return config
    }
}

class PartConfigElement {
    name: PartName
    controllerConfig: ControllerConfigElement
    synthesizerConfig: SynthesizerConfigElement

    constructor(name: PartName) {
        this.name = name
        this.controllerConfig = new ControllerConfigElement(name)
        this.synthesizerConfig = new SynthesizerConfigElement(name)
    }

    render() {
        const legend = dm('legend', {}, this.name.toUpperCase())
        const controllerDiv = this.controllerConfig.render()
        const hr = dm('hr')
        const synthesizerDiv = this.synthesizerConfig.render()
        const fieldset = dm('fieldset', {}, legend, controllerDiv, hr, synthesizerDiv)

        return fieldset
    }

    setUp() {
        this.controllerConfig.setUp()
        this.synthesizerConfig.setUp()
    }

    getConfig(): PartConfig {
        return {
            controller: this.controllerConfig.getConfig(),
            synthesizer: this.synthesizerConfig.getConfig(),
        }
    }
}

class ProblemDiv {
    div: HTMLElement | null = null

    render() {
        const div = this.div = dm('div', { class: 'problem-div' })

        return div
    }

    addProblems(problems: string[]) {
        if (!this.div) {
            throw new Error('addProblems called before render')
        }

        const div = this.div

        div.innerHTML = ''

        for (const problem of problems) {
            const p = dm('p', {}, problem)
            div.appendChild(p)
        }
    }
}

class MiscellaneousDiv {
    refreshButton: HTMLButtonElement | null = null
    rememberCheckbox: HTMLInputElement | null = null
    problemDiv = new ProblemDiv()

    render() {
        const refreshButton = this.refreshButton = dm('button', { type: 'button' }, 'Refresh MIDI Ports') as HTMLButtonElement
        const rememberCheckbox = this.rememberCheckbox = dm('input', { type: 'checkbox', id: SELECTORS.REMEMBER_CHECKBOX_ID }) as HTMLInputElement
        const rememberLabel = dm('label', { for: SELECTORS.REMEMBER_CHECKBOX_ID }, 'Remember')
        const submitButton = dm('button', { type: 'submit' }, 'Submit')
        const problemDiv = this.problemDiv.render()
        const div = dm('div', {}, refreshButton, rememberCheckbox, rememberLabel, submitButton, problemDiv)

        return div
    }

    setUp() { }
}

class ConfigFormElement {
    transporterConfig = new TransporterConfigElement()
    partConfigs = {
        bass: new PartConfigElement('bass'),
        drum: new PartConfigElement('drum'),
        keys: new PartConfigElement('keys'),
        lead: new PartConfigElement('lead'),
    }
    miscellaneousDiv = new MiscellaneousDiv()
    form: HTMLElement | null = null

    render() {
        const transporterFieldset = this.transporterConfig.render()
        const partFieldsets = Object.values(this.partConfigs).map(partConfig => partConfig.render())
        const miscellaneousDiv = this.miscellaneousDiv.render()
        const form = this.form = dm('form', { id: SELECTORS.CONFIG_FORM_ID }, transporterFieldset, ...partFieldsets, miscellaneousDiv)

        return form
    }

    setUp() {
        if (!this.form) {
            throw new Error('setUp called before render')
        }

        // Set up the parts, transporter, and miscellaneous div
        this.transporterConfig.setUp()

        for (const partConfig of Object.values(this.partConfigs)) {
            partConfig.setUp()
        }

        if (!this.miscellaneousDiv.refreshButton) {
            throw new Error('setUp called before render')
        }

        this.miscellaneousDiv.refreshButton.addEventListener('mousedown', this.refreshMidi.bind(this))

        // Refresh the MIDI portions
        this.refreshMidi()

        // Click the first radio buttons
        // We do this after refreshing the MIDI ports so that the MIDI radio buttons are disabled if there is no MIDI access
        this.clickAllFirstRadioButtons()

        // Show the form
        this.form.classList.remove('hidden')
    }

    getConfig(): Config {
        return {
            transporter: this.transporterConfig.getConfig(),
            parts: {
                bass: this.partConfigs.bass.getConfig(),
                drum: this.partConfigs.drum.getConfig(),
                keys: this.partConfigs.keys.getConfig(),
                lead: this.partConfigs.lead.getConfig(),
            },
        }
    }

    refreshMidi() {
        if (!this.form) {
            throw new Error('refreshMidi called before render')
        }

        // The radio buttons for the MIDI type
        const midiTypeRadioButtons = Array.from(this.form.querySelectorAll('input[type="radio"][value="midi"]')) as HTMLInputElement[]

        // Enable/disable the MIDI radio buttons
        for (const radioButton of midiTypeRadioButtons) {
            radioButton.disabled = !midiAccess
        }

        // If there is no MIDI access, we can't do anything else
        if (!midiAccess) {
            return
        }

        function populateMidiSelects(selector: string, direction: 'inputs' | 'outputs') {
            // The selects we will be populating
            const selectElements = document.getElementsByClassName(selector) as HTMLCollectionOf<HTMLSelectElement>

            // The names of the MIDI ports for the given direction
            const portNames = Array.from((midiAccess as any)[direction].values()).map((port: any) => port.name)  // Types suck here

            // Populate the select elements
            for (const select of selectElements) {
                // If there is a currently selected port, we want to keep it selected
                const selectedPort = select.value || portNames[0]

                // Clear the select element's children
                select.innerHTML = ''

                // Add an option for each port
                for (const port of portNames) {
                    const option = dm('option', { value: port }, port)
                    select.appendChild(option)
                }

                // If the selected port is still available, select it
                if (portNames.includes(selectedPort)) {
                    select.value = selectedPort
                }
            }
        }

        // Populate the MIDI selects
        populateMidiSelects(SELECTORS.MIDI_INPUT_SELECT_CLASS, 'inputs')
        populateMidiSelects(SELECTORS.MIDI_OUTPUT_SELECT_CLASS, 'outputs')
    }

    clickAllFirstRadioButtons() {
        if (!this.form) {
            throw new Error('clickAllFirstRadioButtons called before render')
        }

        // The first radio buttons for everything
        const firstRadioButtons = Array.from(this.form.querySelectorAll('input[type="radio"]:enabled:first-of-type')) as HTMLInputElement[]

        // Click all the first radio buttons
        for (const radioButton of firstRadioButtons) {
            radioButton.click()
        }
    }

    getPromise(): Promise<Config> {
        return new Promise(resolve => {
            if (!this.form) {
                throw new Error('getPromise called before render')
            }

            this.form.addEventListener('submit', (event: Event) => {
                if (!this.form) {
                    throw new Error('submit event listener called after form was removed')
                }

                // Prevent the form from submitting
                event.preventDefault()

                // Get the config from the form
                const config = this.getConfig()

                // Get the problems with the config
                const problems = getProblems(config)

                // Add the problems to the problem div
                this.miscellaneousDiv.problemDiv.addProblems(problems)

                // If there are problems, don't resolve the promise
                if (problems.length) {
                    return
                }

                // // If the user wants to remember the config, save it to session storage
                // if (this.miscellaneousDiv.rememberCheckbox.checked) {
                //     sessionStorage.setItem(SESSION_STORAGE_STRING, JSON.stringify(config))
                // }

                // Remove the form from the DOM
                this.form.remove()

                // Resolve the promise with the config
                resolve(config)
            })
        })
    }
}

export default async function getConfigFromUser(): Promise<Config> {
    // The form we will be working with
    const configForm = new ConfigFormElement()

    // Render the form and append it to the body
    document.body.append(configForm.render())

    // Set up the event listeners and refresh the MIDI ports
    configForm.setUp()

    // Get the config from the user
    const config = await configForm.getPromise()

    // Return the config
    return config
}