import { useState } from "react";
import { createParagraphs, creatTerms } from '../functions/proseToTerms';

const useLinks = () => {
    // term = {text: "", start: 0, end: 0}
    // symbol = {text: "", start: 0, end: 0}
    // link = {terms: [], symbols: []}
    const [links, changeLinks] = useState([
        {terms: [], symbols: []}
    ]);

    const [linkIdx, changeLinkIdx] = useState(-1);

    const compareLocationStart = (a, b) => {
        return a.start - b.start;
    }

    const haveSameLocation = (a, b) => {
        return a.start === b.start && a.end === b.end;
    }

    // check if loc1 is in the loc2
    const isIn = (loc1, loc2) => {
        return loc2.start <= loc1.start && loc1.end <= loc2.end;
    }

    // check if loc1 and loc2 has union
    const hasUnion = (loc1, loc2) => {
        if((loc2.start <= loc1.start && loc1.start <= loc2.end) || (loc2.start <= loc1.end && loc1.end <= loc2.end)){
            return true;
        }
        if((loc1.start <= loc2.start && loc2.start <= loc1.end) || (loc1.start <= loc2.end && loc2.end <= loc1.end)){
            return true;
        }
        return false;
    }

    // select term button in ProseView with definition
    const selectTermsWithDefinition = (definition, prose) => {
        let res = [];
        let pStart = 0;
        createParagraphs(prose).forEach((paragraph) => {
            pStart += paragraph.length + 1;
            const terms = creatTerms(paragraph, pStart - paragraph.length - 1);
            terms.forEach((item) => {
                if(hasUnion(item, definition)){
                    res.push(item);
                }
            });
        });
        // console.log("selectTermsWithDefinition", definition, res);
        return res;
    }

    // select math node in FormulaView with composite symbol
    const selectSymbolsWithCompositeSymbol = (compositeSymbol, formula, document) => {
        let res = [];
        // get all selectable math node
        const selectableMathNodes = [...document.querySelectorAll(".formulaView .symbolNode")]
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        // select math node in compositeSymbol
        selectableMathNodes.forEach((item) => {
            const start = parseInt(item.getAttribute("data-source-location-start"));
            const end = parseInt(item.getAttribute("data-source-location-end"));
            if(isIn({start: start, end: end}, compositeSymbol)){
                res.push({
                    text: formula.substring(start, end),
                    start: start,
                    end: end
                });
            }
        });
        // console.log("selectSymbolsWithCompositeSymbol", compositeSymbol, res);
        return res;
    }

    // the coverage of link => in order to sort the links
    const linkCoverage = (link) => {
        let coverage = 0;
        link.terms.forEach((item) => {
            coverage += (item.end - item.start);
        });
        link.symbols.forEach((item) => {
            coverage += (item.end - item.start);
        });
        return coverage;
    }

    // get suggested links from the backend model
    // need the math nodes in FormulaView and the term buttons in ProseView => document
    // the symbol & term in suggested links is actually composite symbols and definitions!!
    const setSuggestedLinkArray = (suggestedLinks, prose, formula, document) => {
        let newLinks = suggestedLinks.map((item) => ({terms: [], symbols: []}));

        // select math node in FormulaView with suggestedLinks
        let targetLocs = [];
        suggestedLinks.forEach((item, defaultLinkIdx) => {
            item.symbols.forEach((s) => {
                targetLocs.push({
                    linkIdx: defaultLinkIdx,
                    text: s.text,
                    start: s.start,
                    end: s.end
                });
            })
        })
        // console.log("targetLocs", targetLocs);

        // if the symbol is a substring in many composite symbols, keep the longest composite symbols
        targetLocs.sort((a, b) => a.text.length - b.text.length);
        let uniqueTargetLocs = []
        for(let i=0 ; i<targetLocs.length ; i++){
            let isUnique = true;
            for(let j=i+1 ; j<targetLocs.length ; j++){
                if(isIn(targetLocs[i], targetLocs[j])){
                    isUnique = false;
                    break;
                }
            }
            if(isUnique){
                uniqueTargetLocs.push(targetLocs[i]);
            }
        }
        // console.log("uniqueTargetLocs", uniqueTargetLocs);

        // select math node in FormulaView with uniqueTargetLocs
        uniqueTargetLocs.forEach((loc) => {
            const idx = loc.linkIdx;
            const newSymbols = selectSymbolsWithCompositeSymbol(loc, formula, document);
            newLinks[idx].symbols = newLinks[idx].symbols.concat(newSymbols);
        });

        // select term button in ProseView with suggestedLinks
        suggestedLinks.forEach((link, idx) => {
            link.terms.forEach((def) => {
                const newTerms = selectTermsWithDefinition(def, prose);
                newLinks[idx].terms = newLinks[idx].terms.concat(newTerms);
            });
        });

        // sort the links with their coverage
        newLinks.sort((a, b) => linkCoverage(b) - linkCoverage(a));
        console.log("setSuggestedLinkArray", newLinks);

        changeLinks(newLinks);
    }

    const changeLinkArray = (type, idx) => {
        switch (type) {
            case "add":
                const newLink = {terms: [], symbols: []};
                changeLinks([...links, newLink]);
                break;
            case "remove":
                const linksCopy = [...links];
                linksCopy.splice(idx, 1);
                changeLinks(linksCopy);
                break;
            case "clear":
                const newLinks = [
                    {terms: [], symbols: []}
                ];
                changeLinks(newLinks);
                changeLinkIdx(-1);
                break;
            default:
                console.log("No such type in changeLinkArray");
        }
    }

    const changeTermsInLink = (type, term, prose) => {
        console.log("changeTermsInLink", type, linkIdx, term);
        const newLinks = [...links];
        switch (type) {
            case "add":
                newLinks[linkIdx].terms = [...newLinks[linkIdx].terms, term].sort(compareLocationStart);
                break;
            case "add with difinition":
                // the difinition is in term
                const newTerms = selectTermsWithDefinition(term, prose);
                // const allTerms = newLinks[linkIdx].terms.concat(newTerms);
                // // get unique terms
                // newLinks[linkIdx].terms = [...new Map(allTerms.map(item => [item.start, item])).values()].sort(compareLocationStart);
                newLinks[linkIdx].terms = newTerms;
                break;
            case "remove":
                newLinks[linkIdx].terms = newLinks[linkIdx].terms.filter((item) => !haveSameLocation(item, term)).sort(compareLocationStart);
                break;
            case "remove with difinition":
                // the difinition is in term
                newLinks[linkIdx].terms = newLinks[linkIdx].terms.filter((item) => !(term.start <= item.start && item.end <= term.end));
                break;
            default:
                console.log("No such type in changeTermInLink");
        }
        changeLinks(newLinks);
    }

    const changeSymbolsInLink = (type, symbol, formula, document) => {
        console.log("changeSymbolsInLink", type, linkIdx, symbol);
        const newLinks = [...links];
        switch (type) {
            case "add":
                newLinks[linkIdx].symbols = [...newLinks[linkIdx].symbols, symbol].sort(compareLocationStart);
                break;
            case "add with compositeSymbol":
                // the compositeSymbol is in symbol
                const newSymbols = selectSymbolsWithCompositeSymbol(symbol, formula, document);
                // const allSymbols = newLinks[linkIdx].symbols.concat(newSymbols);
                // // get unique symbols
                // newLinks[linkIdx].symbols = [...new Map(allSymbols.map(item => [item.start, item])).values()].sort(compareLocationStart);
                newLinks[linkIdx].symbols = newSymbols;
                break;
            case "remove":
                newLinks[linkIdx].symbols = newLinks[linkIdx].symbols.filter((item) => !haveSameLocation(item, symbol)).sort(compareLocationStart);
                break;
            case "remove with compositeSymbol":
                // the compositeSymbol is in symbol
                newLinks[linkIdx].symbols = newLinks[linkIdx].symbols.filter((item) => !(symbol.start <= item.start && item.end <= symbol.end));
                break;
            default:
                console.log("No such type in changeSymbolInLink");
        }
        changeLinks(newLinks);
    }

    return {links, linkIdx, changeLinkIdx, setSuggestedLinkArray, changeLinkArray, changeTermsInLink, changeSymbolsInLink};
};

export default useLinks;