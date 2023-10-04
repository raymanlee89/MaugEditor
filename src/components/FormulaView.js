import React, { useState, useEffect } from 'react';
import Latex from '../react-latex/latex';
import '../katex/katex.css';

function FormulaView({mode, formula, links, linkIdx, changeSymbolsInLink}) {
    // find the target symbols
    const getOffsetFromMathRegionNode = (node, attrSuffix) => {
        const attribute = `data-source-location-${attrSuffix}`;
        if (!node.hasAttribute(attribute)) {
            return null;
        }

        return parseInt(node.getAttribute(attribute));
    }

    const getRawMathRegionCodeRangeOfNode = (node) => {
        const start = getOffsetFromMathRegionNode(node, "start");
        const end = getOffsetFromMathRegionNode(node, "end");

        if (start === null || end === null) {
            return null;
        }

        return {start: start, end: end};
    }

    const getDeepestMathRegionNodeContainingPosition = (clientX, clientY) => {
        const allNodesContainingPosition = document.elementsFromPoint(clientX, clientY);
        // console.log("allNodesContainingPosition", allNodesContainingPosition);

        const mathRegionNodesContainingPositionToCodeRanges = [];
        for (let node of allNodesContainingPosition) {
            const codeRange = getRawMathRegionCodeRangeOfNode(node);
            if (codeRange) {
                mathRegionNodesContainingPositionToCodeRanges.push({node, codeRange});
            }
        }
        
        let bestNodeAndCodeRange = null;
        for (let nodeAndCodeRange of mathRegionNodesContainingPositionToCodeRanges) {
            if (!bestNodeAndCodeRange) {
                bestNodeAndCodeRange = nodeAndCodeRange;
                continue;
            }

            // If the code range of the best match contains the current code range, update it
            if (bestNodeAndCodeRange.codeRange.start < nodeAndCodeRange.codeRange.start
            || nodeAndCodeRange.codeRange.end < bestNodeAndCodeRange.codeRange.end) {
                bestNodeAndCodeRange = nodeAndCodeRange;
            }
        }
        // console.log("bestNodeAndCodeRange", bestNodeAndCodeRange);

        return bestNodeAndCodeRange;
    }

    const [hoveredMathRegionNode, changeHoveredMathRegionNode] = useState(null);

    const onMouseMove = (clientX, clientY) => {
        if(mode !== 1){
            return;
        }
        
        const potentialMathRegionNode = getDeepestMathRegionNodeContainingPosition(clientX, clientY)?.node;
        // Always reset the hovered region when the mouse moves over the typeset math
        if (hoveredMathRegionNode !== null) {
            if(hoveredMathRegionNode === potentialMathRegionNode){
                return;
            }
            hoveredMathRegionNode.className = hoveredMathRegionNode.className.replace(" hovered", "");
            changeHoveredMathRegionNode(null);
        }

        // Set the new hovered math region
        if (potentialMathRegionNode && !potentialMathRegionNode?.className.includes(" disabled")) {
            if(!potentialMathRegionNode.className.includes(" hovered")){
                potentialMathRegionNode.className = potentialMathRegionNode.className.concat(" hovered");
            }
            changeHoveredMathRegionNode(potentialMathRegionNode);
        }
    }

    const symbolOnClick = (clientX, clientY) => {
        const targetMathRegionNode = getDeepestMathRegionNodeContainingPosition(clientX, clientY);
        // console.log(targetMathRegionNode?.node.innerHTML, targetMathRegionNode?.codeRange);

        if(mode !== 1){
            return;
        }

        if(targetMathRegionNode){
            const codeRange = {start: targetMathRegionNode.codeRange.start, end: targetMathRegionNode.codeRange.end};

            const symbol = {
                node: targetMathRegionNode.node,
                text: formula.substring(codeRange.start+1, codeRange.end+1),
                location: {start: codeRange.start, end: codeRange.end}
            }

            if(!symbol.node.className.includes(" disabled")){
                if(symbol.node.className.includes( ` link_${linkIdx}`)){
                    symbol.node.className = symbol.node.className.replace(` link_${linkIdx}`, "");
                    changeSymbolsInLink("remove", symbol);
                }else{
                    symbol.node.className = symbol.node.className.concat(` link_${linkIdx}`);
                    changeSymbolsInLink("add", symbol);
                }
            }
        }
    }

    useEffect(() => {
        // clear all highlighted and disabled class
        const allSymbols = [...document.getElementsByClassName("symbolNode")].concat([...document.getElementsByClassName("spanNode")]);
        // console.log(allSymbols);
        allSymbols.forEach((item) => {
            for(let i=links.length-1 ; i>=0 ; i--){
                item.className = item.className.replace(` link_${i}`, "");
            }
            item.className = item.className.replace(" disabled", "");
        });

        // reassign class to all nodes
        // console.log(links);
        if(mode === 1){
            links.forEach((link, i) => {
                const symbols = link.symbols;
                symbols.forEach((item) => {
                    if(i !== linkIdx){
                        item.node.className = item.node.className.concat(` link_${i} disabled`);
                    }else{
                        item.node.className = item.node.className.concat(` link_${i}`);
                    }
                })
            });
        }else{
            links.forEach((link, i) => {
                const symbols = link.symbols;
                symbols.forEach((item) => {
                    item.node.className = item.node.className.concat(` link_${i}`);
                })
            });
        }
    }, [mode, links, linkIdx]);

    return(
        <div 
            className='element horizontal formulaview unselectable'
            onMouseMove={({clientX, clientY}) => onMouseMove(clientX, clientY)} 
            // onClick={({clientX, clientY}) => symbolOnClick(clientX, clientY)}
            onMouseDown={({clientX, clientY}) => symbolOnClick(clientX, clientY)}
            onMouseOver={({buttons, clientX, clientY}) => {
                if(buttons === 1){
                    symbolOnClick(clientX, clientY);
                }
            }}
        >
            <Latex >{formula}</Latex>
        </div>
    );
}

export default FormulaView;