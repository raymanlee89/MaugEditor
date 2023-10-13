import React, { useState, useEffect } from 'react';
import formulaNode from '../functions/formulaNode';
import Latex from '../react-latex/latex';
import '../katex/katex.css';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const style = "\\displaystyle ";
const formulaFontSizeRange = {max: 5, min: 1};

function FormulaView({mode, formula, formulaFontSize, changeFormulaFontSize, links, linkIdx, changeSymbolsInLink}) {
    const { getClassName, changeClassName } = formulaNode();

    const changeFontSize = (type) => {
        switch (type) {
            case "+":
                if(formulaFontSize < formulaFontSizeRange.max){
                    changeFormulaFontSize(formulaFontSize + 1);
                }
                break;
            case "-":
                if(formulaFontSize > formulaFontSizeRange.min){
                    changeFormulaFontSize(formulaFontSize - 1);
                }
                break;
            default:
                console.log("No such type in changeFormulaFontSize");
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
        // console.log("mathRegionNodesContainingPositionToCodeRanges", mathRegionNodesContainingPositionToCodeRanges);

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
            changeClassName("remove", hoveredMathRegionNode, "hovered");
            changeHoveredMathRegionNode(null);
        }

        // Set the new hovered math region
        if (potentialMathRegionNode) {
            let className = getClassName(potentialMathRegionNode);
            if(!className.includes(" hovered") && !className.includes(" disabled")){
                changeClassName("add", potentialMathRegionNode, "hovered");
            }

            changeHoveredMathRegionNode(potentialMathRegionNode);
        }
    }

    const symbolOnClick = (clientX, clientY) => {
        const targetMathRegionNode = getDeepestMathRegionNodeContainingPosition(clientX, clientY);
        console.log(targetMathRegionNode);

        if(mode !== 1){
            return;
        }

        if(targetMathRegionNode){
            // fix the code range with the length with style prefix
            const codeRange = {start: targetMathRegionNode.codeRange.start - style.length, end: targetMathRegionNode.codeRange.end - style.length};

            const symbol = {
                node: targetMathRegionNode.node,
                text: formula.substring(codeRange.start, codeRange.end),
                location: {start: codeRange.start, end: codeRange.end}
            }

            const node = targetMathRegionNode.node;
            let className = getClassName(node);
            if(!className.includes(" disabled")){
                if(className.includes( ` link_${linkIdx}`)){
                    changeClassName("remove", node, `link_${linkIdx}`);
                    changeSymbolsInLink("remove", symbol);
                }else{
                    changeClassName("add", node, `link_${linkIdx}`);
                    changeSymbolsInLink("add", symbol);
                }
            }
        }
    }

    useEffect(() => {
        // clear all highlighted and disabled class
        const allSymbols = [...document.querySelectorAll("svg")].concat([...document.getElementsByClassName("symbolNode")]).concat([...document.getElementsByClassName("spanNode")]);
        // console.log(allSymbols);
        allSymbols.forEach((item) => {
            for(let i=links.length-1 ; i>=0 ; i--){
                changeClassName("remove", item, `link_${i}`);
            }
            changeClassName("remove", item, "disabled");
        });

        // reassign class to all nodes
        // console.log(links);
        links.forEach((link, i) => {
            link.symbols.forEach((item) => {
                const node = item.node;
                if(mode === 1 && i !== linkIdx){
                    changeClassName("add", node, `link_${i} disabled`);
                }else{
                    changeClassName("add", node, `link_${i}`);
                }
            })
        });
    }, [mode, links, linkIdx]);

    return(
        <div className='element horizontal'>
            <Button type="text" icon={<ZoomOutOutlined />} disabled={formulaFontSize===formulaFontSizeRange.min} onClick={() => changeFontSize("-")}/>
            <div className='push'></div>
            <div 
                className={`formulaView unselectable formulaFontSize_${formulaFontSize}`}
                onMouseMove={({clientX, clientY}) => onMouseMove(clientX, clientY)} 
                onClick={({clientX, clientY}) => symbolOnClick(clientX, clientY)}
            >
                
                <Latex >{`\\[${style}${formula}\\]`}</Latex>
            </div>
            <div className='push'></div>
            <Button type="text" icon={<ZoomInOutlined />} disabled={formulaFontSize===formulaFontSizeRange.max} onClick={() => changeFontSize("+")}/>
        </div>
        
    );
}

export default FormulaView;