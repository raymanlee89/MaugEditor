import { mergeConnectedSymbols, mergeConnectedTerms } from './mergeConnectedString';
import { isEntity, isInCharArray } from "./entityDetection";

// add color marks to the formula
export const addColorToFormula = (links, formula) => {
    // create the sorted array of the composite symbols in all links
    let mergedSymbols = links.reduce((accumulator, item, idx) => (
        accumulator.concat(
            // merge connected symbols in the same link
            mergeConnectedSymbols(formula, item.symbols, idx)
        )
    ), []);
    mergedSymbols.sort((a, b) => a.start - b.start);
    // console.log("mergedSymbols", [...mergedSymbols]);

    // create a default link to colorize the plain color
    for(let i=mergedSymbols.length ; i>-1 ; i--){
        let start = i === 0 ? 0 : mergedSymbols[i-1].end;
        while(isInCharArray(formula[start], [".", "^", "_", " ", "{", "}"])){
            start++; // remove the " " and "}" form the previous colorized element
        }

        let end = i === mergedSymbols.length ? formula.length : mergedSymbols[i].start;
        while(isInCharArray(formula[end-1], [".", "^", "_", " ", "{", "}"])){
            end--; // remove the " " and "{" form the next colorized element
        }

        if(start > end){
            continue; // if the plainText is empty
        }

        // WARNNING!! plainText is not equal to between, it is the text in plain color
        const plainText = formula.substring(start, end);
        if(plainText.replace(/[.^_ {}]/g, "").length !== 0){
            const newSym = {
                text: plainText,
                start: start,
                end: end,
                link: -1
            };
            mergedSymbols.splice(i, 0, newSym);
        }
    }
    // console.log("mergedSymbols + plainText", mergedSymbols);
    
    const reversed = [...mergedSymbols].reverse();
    let result = formula.trim();
    reversed.forEach((item) => {
        const colorMark = item.link === -1 ? "\\plain" : `\\link${item.link}`;
        if(isEntity(formula, item)){
            // if this symbol is an entity, use {} to protect it
            let separator = item.start + 1;
            if(formula[item.start] === "\\"){
                const separatorEnd = formula.substring(item.start, item.end).search(" ");
                separator = separatorEnd===-1 ?  item.end : item.start + separatorEnd;
            }
            const entity = result.substring(item.start, separator);
            const remain = result.substring(separator, item.end);
            // console.log("Item", formula.substring(item.start, item.end), "Entity", entity, "Remain", remain);
            if(separator !== item.end){
                result = result.substring(0, separator) + "\n" + colorMark + " " + remain + result.substring(item.end);
            }
            result = result.substring(0, item.start) + "\n{" + colorMark + " " + entity + "}" + result.substring(separator);
        }else{
            result = result.substring(0, item.start) + "\n" + colorMark + " " + result.substring(item.start);
        }
    });
    // console.log("result", result);
    return result;
}

// add color marks to the prose
export const addColorToProse = (links, prose) => {
    // create the sorted array of the composite terms in all links
    let mergedTerms = links.reduce((accumulator, item, idx) => (
        accumulator.concat(
            // merge connected terms in the same link
            mergeConnectedTerms(item.terms, idx)
        )
    ), []);
    mergedTerms.sort((a, b) => a.start - b.start);
    for(let i=mergedTerms.length ; i>-1 ; i--){
        let start = i === 0 ? 0 : mergedTerms[i-1].end;
        let end = i === mergedTerms.length ? prose.length : mergedTerms[i].start;
        const between = prose.substring(start, end).replace(" ", "");
        if(between.length !== 0){
            const newSym = {
                text: prose.substring(start, end),
                start: start,
                end: end,
                link: -1
            };
            mergedTerms.splice(i, 0, newSym);
        }
    }
    // console.log("mergedTerms", mergedTerms);
    
    const reversed = mergedTerms.reverse();
    let result = prose.trim();
    reversed.forEach((item) => {
        const colorMark = item.link === -1 ? "\\plain" : `\\link${item.link}`;
        result = result.substring(0, item.start) + "\n" + colorMark + " " + result.substring(item.start);
    });
    // console.log("result", result);
    return result;
}