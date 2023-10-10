import React, { useState, useEffect } from 'react';
import Latex from '../react-latex/latex';
import '../katex/katex.css';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Button } from 'antd';

function FormulaView({mode, formula, links, linkIdx, changeSymbolsInLink}) {
    const style = "\\displaystyle";

    const [fontSizeLevel, changeFontSizeLevel] = useState(3);

    const changeFontSize = (type) => {
        switch (type) {
            case "+":
                if(fontSizeLevel < 5){
                    changeFontSizeLevel(fontSizeLevel + 1);
                }
                break;
            case "-":
                if(fontSizeLevel > 1){
                    changeFontSizeLevel(fontSizeLevel - 1);
                }
                break;
            default:
                console.log("No such type in changeFontSize");
        }
    }

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
            if(hoveredMathRegionNode instanceof SVGElement){
                let className = hoveredMathRegionNode.getAttribute("class");
                if(className !== null){
                    hoveredMathRegionNode.setAttribute("class", className.replace(" hovered", ""));
                }
            }else{
                hoveredMathRegionNode.className = hoveredMathRegionNode.className.replace(" hovered", "");
            }
            changeHoveredMathRegionNode(null);
        }

        // Set the new hovered math region
        if (potentialMathRegionNode) {
            if(potentialMathRegionNode instanceof SVGElement){
                let className = potentialMathRegionNode.getAttribute("class");
                if(className !== null){
                    if(!className.includes(" hovered") && !className.includes(" disabled")){
                        potentialMathRegionNode.setAttribute("class", className.concat(" hovered"));
                    }
                }else{
                    potentialMathRegionNode.setAttribute("class", " hovered");
                }
            }else{
                if(!potentialMathRegionNode.className.includes(" hovered") && !potentialMathRegionNode.className.includes(" disabled")){
                    potentialMathRegionNode.className = potentialMathRegionNode.className.concat(" hovered");
                }
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
            // fix the code range with the length with style prefix
            const codeRange = {start: targetMathRegionNode.codeRange.start - style.length - 2, end: targetMathRegionNode.codeRange.end - style.length - 2};

            const symbol = {
                node: targetMathRegionNode.node,
                text: formula.substring(codeRange.start, codeRange.end),
                location: {start: codeRange.start, end: codeRange.end}
            }

            const node = targetMathRegionNode.node;
            if(node instanceof SVGElement){
                let className = node.getAttribute("class");
                if(className !== null){
                    if(!className.includes(" disabled")){
                        if(className.includes( ` link_${linkIdx}`)){
                            node.setAttribute("class", className.replace(` link_${linkIdx}`, ""));
                            changeSymbolsInLink("remove", symbol);
                        }else{
                            node.setAttribute("class", className.concat(` link_${linkIdx}`));
                            changeSymbolsInLink("add", symbol);
                        }
                    }
                }
            }else{
                if(!symbol.node.className.includes(" disabled")){
                    if(symbol.node.className.includes( ` link_${linkIdx}`)){
                        node.className = node.className.replace(` link_${linkIdx}`, "");
                        changeSymbolsInLink("remove", symbol);
                    }else{
                        node.className = node.className.concat(` link_${linkIdx}`);
                        changeSymbolsInLink("add", symbol);
                    }
                }
            }
        }
    }

    useEffect(() => {
        // clear all highlighted and disabled class
        const allSVGs = [...document.querySelectorAll("svg")];
        // console.log(allSVGs);
        allSVGs.forEach((item) => {
            let className = item.getAttribute("class");
            if(className !== null)
            {
                for(let i=links.length-1 ; i>=0 ; i--){
                    item.setAttribute("class", item.getAttribute("class").replace(` link_${i}`, ""));
                }
                item.setAttribute("class", item.getAttribute("class").replace(" disabled", ""));
            }
        });
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
                link.symbols.forEach((item) => {
                    const node = item.node;
                    if(node instanceof SVGElement){
                        let className = node.getAttribute("class");
                        if(className !== null){
                            if(i !== linkIdx){
                                node.setAttribute("class", className.concat(` link_${i} disabled`));
                            }else{
                                node.setAttribute("class", className.concat(` link_${i}`));
                            }
                        }else{
                            if(i !== linkIdx){
                                node.setAttribute("class",` link_${i} disabled`);
                            }else{
                                node.setAttribute("class", ` link_${i}`);
                            }
                        }
                    }else{
                        if(i !== linkIdx){
                            node.className = node.className.concat(` link_${i} disabled`);
                        }else{
                            node.className = node.className.concat(` link_${i}`);
                        }
                    }
                })
            });
        }else{
            links.forEach((link, i) => {
                link.symbols.forEach((item) => {
                    const node = item.node;
                    if(node instanceof SVGElement){
                        let className = node.getAttribute("class");
                        if(className !== null){
                            node.setAttribute("class", className.concat(` link_${i}`));
                        }else{
                            node.setAttribute("class", ` link_${i}`);
                        }
                    }else{
                        node.className = node.className.concat(` link_${i}`);
                    }
                })
            });
        }
    }, [mode, links, linkIdx]);

    return(
        <div className='element horizontal'>
            <Button type="text" icon={<ZoomOutOutlined />} onClick={() => changeFontSize("-")}/>
            <div className='push'></div>
            <div 
                className={`formulaView unselectable fontSizeLevel_${fontSizeLevel}`}
                onMouseMove={({clientX, clientY}) => onMouseMove(clientX, clientY)} 
                // onClick={({clientX, clientY}) => symbolOnClick(clientX, clientY)}
                onMouseDown={({buttons, clientX, clientY}) => {
                    if(buttons === 1){
                        symbolOnClick(clientX, clientY)
                    }
                }}
                onMouseOver={({buttons, clientX, clientY}) => {
                    if(buttons === 1){
                        symbolOnClick(clientX, clientY);
                    }
                }}
            >
                
                <Latex >{`\\[ ${style} ${formula}\\]`}</Latex>
            </div>
            <div className='push'></div>
            <Button type="text" icon={<ZoomInOutlined />} onClick={() => changeFontSize("+")}/>
        </div>
        
    );
}

export default FormulaView;