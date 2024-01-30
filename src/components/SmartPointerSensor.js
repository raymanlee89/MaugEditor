import { PointerEvent } from "react";
import { PointerSensor } from "@dnd-kit/core";

/**
 * An extended "PointerSensor" that prevent some
 * interactive html element(button, input, textarea, select, option...) from dragging
 */
export class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: "onPointerDown",
            handler: ({nativeEvent: event}) => {
                if (
                    !event.isPrimary ||
                    event.button !== 0 ||
                    isInteractiveElement(event.target)
                ) {
                    return false;
                }

                return true;
            },
        },
    ];
}

function isInteractiveElement(element) {
    const interactiveElements = [
        "button",
        "input",
        "textarea",
        "select",
        "option",
        "svg"
    ];
    if (
        element?.tagName &&
        interactiveElements.includes(element.tagName.toLowerCase())
    ) {
        return true;
    }

    return false;
}