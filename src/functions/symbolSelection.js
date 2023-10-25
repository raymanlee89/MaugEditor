// find the target symbols
// WARNNING!! these symbols are {node: node, start: 0, end: 0}, they don't have text
const getOffsetFromNode = (node, attrSuffix) => {
    const attribute = `data-source-location-${attrSuffix}`;
    if (!node.hasAttribute(attribute)) {
        return null;
    }

    return parseInt(node.getAttribute(attribute));
}

const getLocationOfNode = (node) => {
    const start = getOffsetFromNode(node, "start");
    const end = getOffsetFromNode(node, "end");

    if (start === null || end === null) {
        return null;
    }

    return {start: start, end: end};
}

export const getAllSymbolsContainingPosition = (clientX, clientY) => {
    const allNodesContainingPosition = document.elementsFromPoint(clientX, clientY);
    // console.log("allNodesContainingPosition", allNodesContainingPosition);

    let allSymbolsContainingPosition = [];
    for (let node of allNodesContainingPosition) {
        const location = getLocationOfNode(node);
        if (location) {
            allSymbolsContainingPosition.push({node, start: location.start, end: location.end});
        }
    }
    // console.log("allSymbolsContainingPosition", allSymbolsContainingPosition);

    return allSymbolsContainingPosition;
}