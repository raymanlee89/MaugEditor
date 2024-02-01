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
            const terms = creatTerms(paragraph, pStart - paragraph.length - 1).map((item) => (item));
            terms.forEach((item) => {
                suggestedLinks.forEach((link, idx) => {
                    link.terms.forEach((i) => {
                        if(hasUnion(item, i)){
                            newLinks[idx].terms.push(item);
                        }
                    });
                });
            })
        })

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