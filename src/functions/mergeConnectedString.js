// merge connected symbols in the same link
export const mergeConnectedSymbols = (formula, symbols, linkIdx) => {
    symbols.sort((a, b) => a.start - b.start);
    let mergedSymbols = [];
    let newSym = null;
    symbols.forEach((item) => {
        const text = formula.substring(item.start, item.end);
        if(newSym === null){
            newSym = {
                text: text,
                start: item.start,
                end: item.end,
                link: linkIdx
            };
        }else{
            const between = formula.substring(newSym.end, item.start).replace(/[.^_ \{\}]/g, "");
            if(between.length === 0){
                newSym.text = formula.substring(newSym.start, item.end);
                newSym.end = item.end;
            }else{
                mergedSymbols.push(newSym);
                newSym = {
                    text: text,
                    start: item.start,
                    end: item.end,
                    link: linkIdx
                };
            }
        }
    })
    if(newSym !== null){
        mergedSymbols.push(newSym);
    }
    return mergedSymbols;
}

// merge connected terms in the same link
export const mergeConnectedTerms = (terms, linkIdx) => {
    let mergedTerms = [];
    let newTerm = null;
    terms.forEach((item) => {
        if(newTerm === null){
            newTerm = {
                text: item.text,
                start: item.start,
                end: item.end,
                link: linkIdx
            };
        }else{
            if(newTerm.end + 1 === item.start){
                newTerm.text = newTerm.text.concat(" ", item.text);
                newTerm.end = item.end;
            }else{
                mergedTerms.push(newTerm);
                newTerm = {
                    text: item.text,
                    start: item.start,
                    end: item.end,
                    link: linkIdx
                };
            }
        }
    })
    if(newTerm !== null){
        mergedTerms.push(newTerm);
    }
    return mergedTerms;
}