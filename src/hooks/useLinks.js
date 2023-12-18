import { useState } from "react";
import { changeNodeClassName } from '../functions/formulaNode';

const useLinks = () => {
    // term = {text: "", start: 0, end: 0}
    // symbol = {node: node, text: "", start: 0, end: 0}
    // link = {terms: [], symbols: []}
    const [links, changeLinks] = useState([
        {terms: [], symbols: []},
        {terms: [], symbols: []},
        {terms: [], symbols: []}
    ]);

    const [linkIdx, changeLinkIdx] = useState(0);

    const compareLocationStart = (a, b) => {
        return a.start - b.start;
    }

    const haveSameLocation = (a, b) => {
        return a.start === b.start && a.end === b.end;
    }

    // get default links from the backend model
    const setDefaultLinkArray = (defaultLinks) => {
        console.log("setDefaultLinkArray", defaultLinks);
        changeLinks(defaultLinks);
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
                    {terms: [], symbols: []},
                    {terms: [], symbols: []},
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

    return {links, linkIdx, changeLinkIdx, setDefaultLinkArray, changeLinkArray, changeTermsInLink, changeSymbolsInLink};
};

export default useLinks;