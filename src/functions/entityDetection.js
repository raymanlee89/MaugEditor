export const isInCharArray = (targetChar, charArray) => {
    for(let i=0 ; i<charArray.length ; i++){
        if(targetChar === charArray[i]){
            return true;
        }
    }
    return false;
}

// wether the symbol is an entity of those functions that has an single entity
const isSingleEntity = (formula, symbol, funcArray) => {
    if(formula[symbol.start-1] === "{"){
        return false;
    }
    for(let i=0 ; i<funcArray.length ; i++){
        const func = funcArray[i];
        if(formula.substring(symbol.start-1-func.length, symbol.start-1) === func){
            return true;
        }
    }
    return false;
}

const sqrt = ["\\sqrt"];
const accent = [
    "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat",
    "\\vec", "\\dot", "\\mathring", "\\widecheck", "\\widehat", "\\widetilde", "\\overrightarrow",
    "\\overleftarrow", "\\Overrightarrow", "\\overleftrightarrow", "\\overgroup", "\\overlinesegment", "\\overleftharpoon", "\\overrightharpoon",
    "\\'", "\\`", "\\^", "\\~", "\\=", "\\u", "\\.", '\\"', "\\c", "\\r", "\\H", "\\v", "\\textcircled"
];
const accentUnder = ["\\underleftarrow", "\\underrightarrow", "\\underleftrightarrow", "\\undergroup", "\\underlinesegment", "\\utilde"];
const xArrow = [
    "\\xleftarrow", "\\xrightarrow", "\\xLeftarrow", "\\xRightarrow", "\\xleftrightarrow", "\\xLeftrightarrow", "\\xhookleftarrow",
    "\\xhookrightarrow", "\\xmapsto", "\\xrightharpoondown", "\\xrightharpoonup", "\\xleftharpoondown", "\\xleftharpoonup", "\\xrightleftharpoons",
    "\\xleftrightharpoons", "\\xlongequal", "\\xtwoheadrightarrow", "\\xtwoheadleftarrow", "\\xtofrom"
];
const overline = ["\\overline"];
const underline = ["\\underline"];

export const isEntity = (formula, symbol) => {
    // console.log("isEntity", symbol);
    const isSupSubEntity = isInCharArray(formula[symbol.start-1], ["^", "_"]);
    const isSqrtEntity = isSingleEntity(formula, symbol, sqrt);
    const isFracEntity = false;
    const isAccentEntity = isSingleEntity(formula, symbol, accent);
    const isAccentUnderEntity = isSingleEntity(formula, symbol, accentUnder);
    const isXArrowEntity = isSingleEntity(formula, symbol, xArrow);
    const isOverlineEntity = isSingleEntity(formula, symbol, overline);
    const isUnderlineEntity = isSingleEntity(formula, symbol, underline);

    return isSupSubEntity || isSqrtEntity || isFracEntity || isAccentEntity || isAccentUnderEntity || isXArrowEntity || isOverlineEntity || isUnderlineEntity;
}
