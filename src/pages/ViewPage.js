import { useEffect, useState } from 'react';
import FormulaView from '../components/FormulaView';
import ProseView from '../components/ProseView';
import SlideView from '../components/SlideView';
import ColorBar from '../components/ColorBar';
import ColorOrderBar from '../components/ColorOrderBar';
import { getNodeClassName, changeNodeColor } from '../functions/formulaNode';
import { Divider } from 'antd';

function ViewPage({
    stage, formula, prose, 
    formulaFontSize, changeFormulaFontSize,
    links, linkIdx, changeLinkIdx, changeTermsInLink, changeSymbolsInLink, 
    tabItems, changeColor,
    linkElements, changeLinkElements
}) {
    // the coloring order
    const [colorOrder, changeColorOrder] = useState([]);
    // in SlideView => need redraw color
    const [editingIdx, changeEditingIdx] = useState(-1);
    // Initialize colorOrder
    useEffect(() => {
        if(stage === 2){
            changeColorOrder(tabItems.map((item) => ({
                label: item.label,
                id: item.key,
                color: item.color
            })))
        }
    }, [stage, tabItems])

    // Change alpha in a hex color
    const addAlpha = (color, opacity) => {
        // coerce values so ti is between 0 and 1.
        var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
        return color + _opacity.toString(16).toUpperCase();
    }

    // Modify colors in ViewPage
    useEffect(() => {
        // console.log("Change color in ViewPage");
        // clean color (terms + HTML symbols + SVGs)
        const defaultColorNodes = [...document.getElementsByClassName("term")]
            .concat([...document.querySelectorAll(".formulaView .symbolNode")])
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        defaultColorNodes.forEach((item) => {
            changeNodeColor(item, "#000000e0");
        });

        // draw color
        if(stage === 1){
            // in Links Creation page
            tabItems.forEach((item) => {
                const targetNodes = [...document.getElementsByClassName(`link_${item.key}`)];
                targetNodes.forEach((i) => {
                    // skip the current link
                    if(i === linkIdx){
                        return;
                    }
                    let className = getNodeClassName(i);
                    if(className.includes("disabled")){
                        changeNodeColor(i, addAlpha(item.color, 0.4));
                    }else{
                        changeNodeColor(i, item.color);
                    }
                });
            });
            // color the current link last => prevent overlapping
            const targetNodes = [...document.getElementsByClassName(`link_${linkIdx}`)];
            targetNodes.forEach((i) => {
                changeNodeColor(i, tabItems[linkIdx].color);
            });
        }else if(stage === 2){
            // in Output
            // console.log("colorOrder", colorOrder);
            colorOrder.forEach((item) => {
                const targetNodes = [...document.getElementsByClassName(`link_${item.id}`)];
                targetNodes.forEach((i) => {
                    changeNodeColor(i, tabItems[item.id].color);
                });
            });
        }
    }, [stage, tabItems, links, linkIdx, colorOrder, editingIdx]);

    return(
        <div className='box'>
            {stage === 2 ? <><ColorOrderBar tabItems={tabItems} colorOrder={colorOrder} changeColorOrder={changeColorOrder}/> <Divider /></> : <></>}
            {stage === 1 ? <div style={{ height: "50px" }}/> : <></>}
            <FormulaView stage={stage} formula={formula}
                formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                links={links} linkIdx={linkIdx} changeSymbolsInLink={changeSymbolsInLink}/>
            <Divider />
            <ProseView stage={stage} prose={prose}
                links={links} linkIdx={linkIdx} changeTermsInLink={changeTermsInLink}/>
            {stage === 2 ?
                <>
                    <Divider />
                    <SlideView
                        formula={formula} links={links}
                        linkElements={linkElements} changeLinkElements={changeLinkElements}
                        editingIdx={editingIdx} changeEditingIdx={changeEditingIdx}/>
                </>
            : <></>}
            {stage !== 0 ? <ColorBar tabItems={tabItems} changeColor={changeColor} changeLinkIdx={changeLinkIdx}/> : <></>}
        </div>
    );
}

export default ViewPage;