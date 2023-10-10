import { useState } from "react";

const useLinks = () => {
    // term = {text: "", location: { start: 0, end: 0}}
    // symbol = {node: node, text: "", location: { start: 0, end: 0}}
    // link = {terms: [], symbols: []}
    const [links, changeLinks] = useState([
        {terms: [], symbols: []},
        {terms: [], symbols: []},
        {terms: [], symbols: []}
    ]);

    const [linkIdx, changeLinkIdx] = useState(0);

    const compareLocationStart = (a, b) => {
        return a.location.start - b.location.start;
    }

    const haveSameLocation = (a, b) => {
        return a.location.start === b.location.start && a.location.end === b.location.end;
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
                    item.node.className = item.node.className.replace(" highlighted", "");
                    item.node.className = item.node.className.replace(" disabled", "");
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
        // console.log("changeTermsInLink", type, term, range);
        const newLinks = [...links];
        switch (type) {
            case "add":
                newLinks[linkIdx].terms = [...newLinks[linkIdx].terms, term].sort(compareLocationStart);
                break;
            case "remove":
                newLinks[linkIdx].terms = newLinks[linkIdx].terms.filter((item) => !haveSameLocation(item, term)).sort(compareLocationStart);
                break;
            case "remove with range":
                newLinks[linkIdx].terms = newLinks[linkIdx].terms.filter((item) => !(range.start <= item.location.start && item.location.end <= range.end));
                break;
            default:
                console.log("No such type in changeTermInLink");
        }
        changeLinks(newLinks);
    }

    const changeSymbolsInLink = (type, symbol, range) => {
        // console.log("changeSymbolsInLink", type, symbol, range);
        const newLinks = [...links];
        switch (type) {
            case "add":
                newLinks[linkIdx].symbols = [...newLinks[linkIdx].symbols, symbol].sort(compareLocationStart);
                break;
            case "remove":
                newLinks[linkIdx].symbols = newLinks[linkIdx].symbols.filter((item) => !haveSameLocation(item, symbol)).sort(compareLocationStart);
                break;
            case "remove with range":
                newLinks[linkIdx].symbols = newLinks[linkIdx].symbols.filter((item) => !(range.start <= item.location.start && item.location.end <= range.end));
                break;
            default:
                console.log("No such type in changeSymbolInLink");
        }
        changeLinks(newLinks);
    }

    return {links, linkIdx, changeLinkIdx, changeLinkArray, changeTermsInLink, changeSymbolsInLink};
};

export default useLinks;