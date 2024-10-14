import { PartName, ControllerConfig, ControllerType } from '../../../../types.ts'
import dm from '../../../../dm.ts'

const numberOfControllerModules = 12
const rangeValues = {
    min: 0,
    max: 127,
    step: 1,
    default: 63,
}
type RangeControl = { value: number }
type OptionControl = { value: number }

const enum SpanType {
    Prefix,
    Root,
    Suffix,
}

class DomControllerModule {
    #spans: { [key in SpanType]: HTMLSpanElement }
    #input: HTMLInputElement
    #updateRoot: () => void = () => { }
    #computeValue: () => number = () => 0

    constructor() {
        const rootSpan = dm('span', {}, 'EMPTY') as HTMLSpanElement

        this.#spans = {
            [SpanType.Prefix]: dm('span', {}, '%%') as HTMLSpanElement,
            [SpanType.Root]: rootSpan,
            [SpanType.Suffix]: dm('span', {}, '%%') as HTMLSpanElement,
        }

        const input = this.#input = dm('input', { type: 'range', min: rangeValues.min, max: rangeValues.max, step: rangeValues.step, value: rangeValues.default }) as HTMLInputElement
        input.addEventListener('input', () => { this.#updateRoot() })
    }

    clear(): void { }

    get value(): number { return this.#computeValue() }

    makeIntoRangeControl(prefix: string, min: number, max: number, suffix: string = ''): void {
        const spans = this.#spans
        const rootSpan = spans[SpanType.Root]
        const input = this.#input

        spans[SpanType.Prefix].textContent = prefix
        spans[SpanType.Suffix].textContent = suffix

        const computeValue = this.#computeValue = () => {
            return min + (max - min) * Number(input.value) / rangeValues.max
        }

        this.#updateRoot = () => {
            rootSpan.textContent = computeValue().toString()
        }
    }

    makeIntoOptionControl(prefix: string, options: string[], suffix: string = ''): void {
        const spans = this.#spans
        const rootSpan = spans[SpanType.Root]
        const input = this.#input

        spans[SpanType.Prefix].textContent = prefix
        spans[SpanType.Suffix].textContent = suffix

        const computeValue = this.#computeValue = () => {
            return options.length * Number(input.value) / rangeValues.max
        }

        this.#updateRoot = () => {
            rootSpan.textContent = options[computeValue()]
        }
    }

    render(): HTMLDivElement {
        const label = dm('label', {}, ...Object.values(this.#spans)) as HTMLLabelElement
        const div = dm('div', {}, label, this.#input) as HTMLDivElement
        return div
    }
}

function makeIntoDomController(controller: Controller): void {
    const controllers = Array.from({ length: numberOfControllerModules }, () => new DomControllerModule())
    let numberOfAllocatedControllers = 0

    controller.clear = () => {
        controllers.forEach(controller => controller.clear())
        numberOfAllocatedControllers = 0
    }

    function getNextAvailableControl(): DomControllerModule {
        if (numberOfAllocatedControllers >= numberOfControllerModules) {
            throw new Error('No more controllers available')
        }

        const controller = controllers[numberOfAllocatedControllers]

        numberOfAllocatedControllers += 1

        return controller
    }

    controller.getRangeControl = (prefix: string, min: number, max: number, suffix: string = ''): RangeControl => {
        const control = getNextAvailableControl()

        control.makeIntoRangeControl(prefix, min, max, suffix)

        return control
    }

    controller.getOptionControl = (prefix: string, options: string[], suffix: string = '') => {
        const control = getNextAvailableControl()

        control.makeIntoOptionControl(prefix, options, suffix)

        return control
    }

    controller.render = (): HTMLDivElement => {
        const controllerDivs = controllers.map(controller => controller.render())
        return dm('div', {}, ...controllerDivs) as HTMLDivElement
    }
}

function makeIntoMidiController() { }

function makeIntoWebrtcController() { }

export default class Controller {
    constructor(_name: PartName, config: ControllerConfig) {
        switch (config.type) {
            case ControllerType.Dom:
                makeIntoDomController(this)
                break
            // case ControllerType.Midi:
            //     makeIntoMidiController(this)
            //     break
            // case ControllerType.Webrtc:
            //     makeIntoWebrtcController(this)
            //     break
            default:
                throw new Error(`Invalid Controller type: ${config}`)
        }
    }

    clear(): void { }

    getRangeControl(_prefix: string, _min: number, _max: number, _suffix: string = ''): RangeControl { return { value: 0 } }

    getOptionControl(_prefix: string, _options: string[], _suffix: string = ''): OptionControl { return { value: 0 } }

    render(): HTMLDivElement | null { return null }
}