import React, { useEffect, useState } from 'react';
import { getNodeClassName, changeNodeClassName } from '../functions/formulaNode';
import { getAllSymbolsContainingPosition, getNodeWithLoc } from '../functions/symbolSelection';
import OverlapSymbolsMenu from './OverlapSymbolsMenu';
import Latex from '../react-latex/latex';
import '../katex/katex.css';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const formulaFontSizeRange = {max: 5, min: 1};

function FormulaView({stage, formula, formulaFontSize, changeFormulaFontSize, links, linkIdx, changeSymbolsInLink}) {
    useEffect(() => {
        // clear all highlighted and disabled class
        const allSymbols = [...document.getElementsByClassName("symbolNode")]
            .concat([...document.getElementsByClassName("spanNode")])
            .concat([...document.getElementsByClassName("svgNode")]);
        // console.log(allSymbols);
        allSymbols.forEach((item) => {
            for(let i=links.length-1 ; i>=0 ; i--){
                changeNodeClassName("remove", item, `link_${i}`);
            }
        });

        // reassign link_ class to mathNode
        // becase KaTeX will rerender and clean all link_ class
        links.forEach((link, idx) => {
            // console.log("link", link);
            link.symbols.forEach((symbol) => {
                const node = getNodeWithLoc(symbol.start, symbol.end);
                changeNodeClassName("add", node, `link_${idx}`);
            })
        })
    }, [links]);

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

    const isInSymbolsArray = (symbol, symbolsArray) => {
        for(let i=0 ; i<symbolsArray.length ; i++){
            if(symbolsArray[i].node === symbol.node){
                return true;
            }
        }
        return false;
    }

    const [hoveredSymbols, changeHoveredSymbols] = useState([]);

    const onMouseMove = (clientX, clientY) => {
        // symbols are not selectable in ALL mode
        if(linkIdx === -1 || rightClicked){
            return;
        }
        
        const targetSymbols = getAllSymbolsContainingPosition(clientX, clientY);

        // Always reset the hovered region when the mouse moves over the typeset math
        hoveredSymbols.forEach((item) => {
            if(!isInSymbolsArray(item, targetSymbols)){
                changeNodeClassName("remove", item.node, "hovered");
            }
        })

        // Set the new hovered math region
        let newHoveredSymbols = [];
        targetSymbols.forEach((item) => {
            const className = getNodeClassName(item.node);
            if(!className.includes("hovered")){
                changeNodeClassName("add", item.node, "hovered");
            }

            const symbol = {
                node: item.node,
                text: formula.substring(item.start, item.end),
                start: item.start,
                end: item.end
            }

            newHoveredSymbols.push(symbol);
        })
        changeHoveredSymbols(newHoveredSymbols);
    }

    // if select === true, select the target symbol; otherwise deselect it
    const switchSymbol = (targetSymbol, select) => {
        const node = targetSymbol.node;
        const start = targetSymbol.start;
        const end = targetSymbol.end;

        const symbol = {
            text: formula.substring(start, end),
            start: start,
            end: end
        }

        const className = getNodeClassName(node);
        if(select){
            // if it has been selected, don't select it again
            if(!className.includes(`link_${linkIdx}`)){
                changeNodeClassName("add", node, `link_${linkIdx}`);
                changeSymbolsInLink("add", symbol);
            }
        }else{
            changeNodeClassName("remove", node, `link_${linkIdx}`);
            changeSymbolsInLink("remove", symbol);
        }
    }

    const symbolsOnClick = (clientX, clientY) => {
        // symbols are not selectable in ALL mode
        if(linkIdx === -1 || rightClicked){
            return;
        }

        const targetSymbols = getAllSymbolsContainingPosition(clientX, clientY);
        // if the target symbols are all selected, deselect all; otherwise, select them all
        let selectAll = false;
        for(let i=0 ; i<targetSymbols.length ; i++){
            const className = getNodeClassName(targetSymbols[i].node);
            if(!className.includes(`link_${linkIdx}`)){
                selectAll = true;
            }
        }
        targetSymbols.forEach((item) => switchSymbol(item, selectAll));
    }

    const [mouseLocation, changeMouseLocation] = useState({x: 0, y: 0});
    const [rightClicked, changeRightClicked] = useState(false);

    const symbolsOnRightClick = (clientX, clientY) => {
        if(rightClicked){
            changeRightClicked(false);
            return;
        }

        // symbols are not selectable in ALL mode
        if(linkIdx === -1){
            return;
        }

        // open the overlap symbols menu
        changeRightClicked(true);
        changeMouseLocation({x: clientX, y:clientY});
    }

    return(
        <div className='element horizontal'>
            <Button type="text" icon={<ZoomOutOutlined />} disabled={formulaFontSize===formulaFontSizeRange.min} onClick={() => changeFontSize("-")}/>
            <div className='push'></div>
            <div 
                className={`formulaView unselectable formulaBigFontSize_${formulaFontSize}`}
                onMouseMove={({clientX, clientY}) => onMouseMove(clientX, clientY)} 
                onClick={({clientX, clientY}) => symbolsOnClick(clientX, clientY)}
                onContextMenu={(e) => {
                    if(stage === 1){
                        e.preventDefault(); // prevent the default behaviour when right clicked
                    }
                    symbolsOnRightClick(e.clientX, e.clientY);
                }}
            >
                <Latex >{`\\[${formula}\\]`}</Latex>
            </div>
            <div className='push'></div>
            <Button type="text" icon={<ZoomInOutlined />} disabled={formulaFontSize===formulaFontSizeRange.max} onClick={() => changeFontSize("+")}/>
            {rightClicked && 
                <OverlapSymbolsMenu 
                    mouseLocation={mouseLocation} 
                    hoveredSymbols={hoveredSymbols} changeHoveredSymbols={changeHoveredSymbols} 
                    switchSymbol={switchSymbol} 
                    changeRightClicked={changeRightClicked}
                />
            }
        </div>
    );
}

export default FormulaView;