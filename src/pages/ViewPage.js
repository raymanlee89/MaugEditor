import { useEffect, useState, useRef } from 'react';
import FormulaView from '../components/FormulaView';
import ProseView from '../components/ProseView';
import ColorBar from '../components/ColorBar';
import { getNodeClassName, changeNodeColor } from '../functions/formulaNode';
import { Divider } from 'antd';

function ViewPage({stage, formula, prose, formulaFontSize, changeFormulaFontSize, suggestedLinks, setSuggestedLinkArray, links, linkIdx, changeTermsInLink, changeSymbolsInLink, tabItems, changeColor}) {
    // change alpha in a hex color
    const addAlpha = (color, opacity) => {
        // coerce values so ti is between 0 and 1.
        var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
        return color + _opacity.toString(16).toUpperCase();
    }

    // Modify colors in ViewPage
    useEffect(() => {
        // clean color (terms + HTML symbols + SVGs)
        const defaultColorNodes = [...document.getElementsByClassName("link_")]
            .concat([...document.querySelectorAll(".formulaView .symbolNode")])
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        defaultColorNodes.forEach((item) => {
            changeNodeColor(item, "#000000e0");
        });

        // draw color
        tabItems.forEach((item) => {
            const targetNodes = [...document.getElementsByClassName(`link_${item.key}`)];
            targetNodes.forEach((i) => {
                let className = getNodeClassName(i);
                if(className?.includes("disabled") && stage === 1){
                    changeNodeColor(i, addAlpha(item.color, 0.4));
                }else{
                    changeNodeColor(i, item.color);
                }
            });
        });
    }, [stage, tabItems, links, linkIdx]);

    // Set suggestedLinks to real links
    // since the math nodes in formula is rendered here, this step should be done here
    useEffect(() => {
        // If suggestedLinks is empty, skip this step
        if(suggestedLinks.length === 0){
            return;
        }

        setSuggestedLinkArray(suggestedLinks, prose, formula, document);
    }, [suggestedLinks]);

    // // Color mark in the cursor
    // const cursor = useRef(null);
    // const [showCursor, changeShowCursor] = useState(false);
    // const changePosition = (e) => {
    //   cursor.current.style.top = `${e.clientY}px`;
    //   cursor.current.style.left = `${e.clientX}px`;
    // }

    // useEffect(() => {
    //     if(showCursor === false){
    //         return;
    //     }
    //     const cursorNode = [...document.getElementsByClassName("cursor-style")];
    //     if(cursorNode.length !== 0){
    //         cursorNode[0].style.borderColor = tabItems[linkIdx].color;
    //     }
    // }, [showCursor, tabItems, linkIdx]);

    // return(
    //     <div className='page vertical' onMouseMove={changePosition} onMouseEnter={() => changeShowCursor(true)} onMouseLeave={() => changeShowCursor(false)}>
    //         <div className={stage === 1 && showCursor ? "cursor-style" : ""} ref={cursor} ></div>
    return(
        <div className='page vertical'>
            {stage !== 0 ? <div style={{ height: "50px" }}></div> : <></>}
            <FormulaView stage={stage} formula={formula}
                formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                links={links} linkIdx={linkIdx} changeSymbolsInLink={changeSymbolsInLink}/>
            <Divider />
            <ProseView stage={stage} prose={prose}
                links={links} linkIdx={linkIdx} changeTermsInLink={changeTermsInLink}/>
            {stage !== 0 ? <ColorBar tabItems={tabItems} changeColor={changeColor}/> : <></>}
        </div>
    );
}

export default ViewPage;