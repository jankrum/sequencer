export default function dm(tag: string, attributes: object = {}, ...children: (string | HTMLElement)[]): any {
    const element = document.createElement(tag)

    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value)
    }

    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child))
        } else {
            element.appendChild(child)
        }
    }

    return element
}