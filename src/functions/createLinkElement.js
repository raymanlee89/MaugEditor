import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';

// create a link element with a link
export const createLinkElement = (formula, link, idx) => {
    // the composite symbols on the left side should be unique
    const uniqueSymbols = new Set(mergeConnectedSymbols(formula, link.symbols, idx));
    const compositeSymbols = Array.from(uniqueSymbols).reduce((a, v, i) => i === 0 ? a + v.text : a + ", " + v.text, "");

    // the definitions on the right side should have no same symbols
    const noSymbolsTerms = link.terms.filter((item) => {
        let res = true;
        link.symbols.forEach((sym) => {
            if(item.text === ("$" + sym.text + "$")){
                res = false;
            }
        })
        return res;
    });
    const definitions = mergeConnectedTerms(noSymbolsTerms, idx).reduce((a, v, i) => i === 0 ? a + v.text : a + ", " + v.text, "");
    const linkIdx = idx;
    return {compositeSymbols, definitions, linkIdx};
}