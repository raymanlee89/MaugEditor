import { useState } from "react";
import { changeNodeClassName } from '../functions/formulaNode';
import { createParagraphs, creatTerms } from '../functions/proseToTerms';

const useLinks = () => {
    // term = {text: "", start: 0, end: 0}
    // symbol = {node: node, text: "", start: 0, end: 0}
    // link = {terms: [], symbols: []}
    const [links, changeLinks] = useState([
        {terms: [], symbols: []}
    ]);

    const [linkIdx, changeLinkIdx] = useState(0);

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

    // get suggested links from the backend model
    // need the math nodes in FormulaView and the term buttons in ProseView => document
    const setSuggestedLinkArray = (suggestedLinks, prose, formula, document) => {
        console.log("setSuggestedLinkArray", suggestedLinks);

        let newLinks = suggestedLinks.map((item) => ({terms: [], symbols: []}));

        // select math node in FormulaView with suggestedLinks
        // get all target symbols' locations in the formula
        let targetLocs = [];
        suggestedLinks.forEach((item, defaultLinkIdx) => {
            let targetTexts = new Set();
            // make sure that the text is unique
            item.forEach((i) => {
                if(i.label === "SYMBOL"){
                    const text = prose.substring(i.start, i.end);
                    targetTexts.add(text);
                }
            })
            targetTexts.forEach((text) => {
                let startIdx = 0;
                let idx = formula.indexOf(text, startIdx);
                while (idx !== -1) {
                    targetLocs.push({
                        linkIdx: defaultLinkIdx,
                        text: text,
                        start: idx,
                        end: idx + text.length
                    });
                    startIdx = idx + text.length;
                    idx = formula.indexOf(text, startIdx);
                }
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

        // get all selectable math node
        const selectableMathNodes = [...document.querySelectorAll(".formulaView .symbolNode")]
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        // select math node in uniqueTargetLocs
        selectableMathNodes.forEach((item) => {
            const start = parseInt(item.getAttribute("data-source-location-start"));
            const end = parseInt(item.getAttribute("data-source-location-end"));
            uniqueTargetLocs.forEach((loc) => {
                if(isIn({start: start, end: end}, loc)){
                    newLinks[loc.linkIdx].symbols.push({
                        node: item,
                        text: formula.substring(start, end),
                        start: start,
                        end: end
                    });
                }
            })
        })

        // select term button in ProseView with suggestedLinks
        let pStart = 0;
        createParagraphs(prose).forEach((paragraph) => {
            pStart += paragraph.length + 1;
            const terms = creatTerms(paragraph, pStart - paragraph.length - 1).map((item, i) => (item));
            terms.forEach((item) => {
                suggestedLinks.forEach((link, idx) => {
                    link.forEach((i) => {
                        if(isIn(item, i)){
                            newLinks[idx].terms.push(item);
                        }
                    });
                });
            })
        })
        // console.log("newLinks", newLinks);

        changeLinks(newLinks);
    }

    const changeLinkArray = (type, idx) => {
        switch (type) {
            case "add":
                const newLink = {terms: [], symbols: []};
                changeLinks([...links, newLink]);
                break;
            case "remove":
                const symbols = links[idx].symbols;
                symbols.forEach((item) => {
                    changeNodeClassName("remove", item.node, "highlighted");
                    changeNodeClassName("remove", item.node, "disabled");
                })
                const linksCopy = [...links];
                linksCopy.splice(idx, 1);
                changeLinks(linksCopy);
                break;
            case "clear":
                const newLinks = [
                    {terms: [], symbols: []}
                ];
                changeLinks(newLinks);
                changeLinkIdx(0);
                break;
            default:
                console.log("No such type in changeLinkArray");
        }
    }

    const changeTermsInLink = (type, term, range) => {
        console.log("changeTermsInLink", type, term, range);
        const newLinks = [...links];
        switch (type) {
            case "add":
                newLinks[linkIdx].terms = [...newLinks[linkIdx].terms, term].sort(compareLocationStart);
                break;
            case "remove":
                newLinks[linkIdx].terms = newLinks[linkIdx].terms.filter((item) => !haveSameLocation(item, term)).sort(compareLocationStart);
                break;
            case "remove with range":
                newLinks[linkIdx].terms = newLinks[linkIdx].terms.filter((item) => !(range.start <= item.start && item.end <= range.end));
                break;
            default:
                console.log("No such type in changeTermInLink");
        }
        changeLinks(newLinks);
    }

    const changeSymbolsInLink = (type, symbol, range) => {
        console.log("changeSymbolsInLink", type, symbol, range);
        const newLinks = [...links];
        switch (type) {
            case "add":
                newLinks[linkIdx].symbols = [...newLinks[linkIdx].symbols, symbol].sort(compareLocationStart);
                break;
            case "remove":
                newLinks[linkIdx].symbols = newLinks[linkIdx].symbols.filter((item) => !haveSameLocation(item, symbol)).sort(compareLocationStart);
                break;
            case "remove with range":
                newLinks[linkIdx].symbols = newLinks[linkIdx].symbols.filter((item) => !(range.start <= item.start && item.end <= range.end));
                break;
            default:
                console.log("No such type in changeSymbolInLink");
        }
        changeLinks(newLinks);
    }

    return {links, linkIdx, changeLinkIdx, setSuggestedLinkArray, changeLinkArray, changeTermsInLink, changeSymbolsInLink};
};

export default useLinks;