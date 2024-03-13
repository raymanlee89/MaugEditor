import { useEffect, useState } from 'react';
import StaticFormulaView from '../components/StaticFormulaView';
import StaticProseView from '../components/StaticProseView';
import SlideView from '../components/SlideView';
import ColorOrderBar from '../components/ColorOrderBar';
import ColorBar from '../components/ColorBar';
import { getNodeClassName, changeNodeColor } from '../functions/formulaNode';
import { Divider } from 'antd';

function OutputViewPage({
    options, formula, prose, 
    formulaFontSize, changeFormulaFontSize,
    links, tabItems, changeColor,
    linkElements, changeLinkElements,
    colorOrder, changeColorOrder
}) {
    // in SlideView => need redraw color
    const [editingIdx, changeEditingIdx] = useState(-1);

    // Modify colors in ViewPage
    useEffect(() => {
        // console.log("Change color in OutputViewPage");
        // clean color (terms + HTML symbols + SVGs)
        const defaultColorNodes = [...document.getElementsByClassName("term")]
            .concat([...document.querySelectorAll(".formulaView .symbolNode")])
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        defaultColorNodes.forEach((item) => {
            changeNodeColor(item, "#000000e0");
        });

        // draw color
        // console.log("colorOrder", colorOrder);
        colorOrder.forEach((idx) => {
            const targetNodes = [...document.getElementsByClassName(`link_${idx}`)];
            targetNodes.forEach((i) => {
                changeNodeColor(i, tabItems[idx+1].color);
            });
        });
    }, [options, tabItems, links, colorOrder, editingIdx, linkElements]);

    return(
        <div className='box'>
            <ColorOrderBar tabItems={tabItems} colorOrder={colorOrder} changeColorOrder={changeColorOrder}/>
            <div style={{ height: "50px" }}/>
            <StaticFormulaView formula={formula} formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize} links={links}/>
            {options[0] ?
                <>
                    <Divider />
                    <StaticProseView prose={prose} links={links}/>
                </>
            : <></>}
            {options[1] ?
                <>
                    <Divider />
                    <SlideView formula={formula} links={links} colorOrder={colorOrder}
                        linkElements={linkElements} changeLinkElements={changeLinkElements}
                        editingIdx={editingIdx} changeEditingIdx={changeEditingIdx}/>
                </>
            : <></>}
            <ColorBar colorOrder={colorOrder} tabItems={tabItems} changeColor={changeColor}/>
        </div>
    );
}

export default OutputViewPage;