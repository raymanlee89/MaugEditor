import { useEffect, useState } from 'react';
import FormulaView from '../components/FormulaView';
import ProseView from '../components/ProseView';
import StaticSlideView from '../components/StaticSlideView';
import FeedbackPanel from '../components/FeedbackPanel';
import { changeNodeColor } from '../functions/formulaNode';
import { Tabs, Modal } from 'antd';

function ExtractionPage({
    stage, options, formula, prose, 
    formulaFontSize, changeFormulaFontSize,
    linkIdx, changeLinkIdx,
    links, changeTermsInLink, changeSymbolsInLink, changeLinkArray, 
    tabItems, changeTabs, changeColor,
    linkElements, changeLinkElements,
    colorOrder, changeColorOrder
}) {
    const [removeLinkIdx, changeRemoveLinkIdx] = useState(-1);

    const onChange = (newActiveKey) => {
        const targetLinkIdx = Number(newActiveKey);
        // console.log("Change link", targetLinkIdx);
        if(targetLinkIdx < links.length){
            changeLinkIdx(targetLinkIdx);
        }else{
            console.log("targetLinkIdx is out of range");
        }
    }

    const onEdit = (targetKey, action) => {
        if (action === 'add') {
            // add new tab
            changeTabs("add", links.length);

            // add new link to links
            changeLinkArray("add");

            // change picked link
            changeLinkIdx(links.length);
        } else {
            changeRemoveLinkIdx(Number(targetKey));
        }
    }

    const onRemove = () => {
        changeTabs("remove", removeLinkIdx);

        // remove the target link in links
        changeLinkArray("remove", removeLinkIdx);

        // change picked link
        if(removeLinkIdx < linkIdx || removeLinkIdx === linkIdx){
            changeLinkIdx(linkIdx - 1);
        }
        changeRemoveLinkIdx(-1);
    }

    const onCancel = () => {
        changeRemoveLinkIdx(-1);
    }

    // Modify colors
    useEffect(() => {
        // clean color (terms + HTML symbols + SVGs)
        const defaultColorNodes = [...document.getElementsByClassName("term")]
            .concat([...document.querySelectorAll(".formulaView .symbolNode")])
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        defaultColorNodes.forEach((item) => {
            changeNodeColor(item, "#000000e0");
        });

        if(linkIdx === -1){
            tabItems.forEach((item) => {
                const targetNodes = [...document.getElementsByClassName(`link_${item.key}`)];
                targetNodes.forEach((i) => {
                    changeNodeColor(i, item.color);
                });
            });
        }else{
            // color the current link last => prevent overlapping
            const targetNodes = [...document.getElementsByClassName(`link_${linkIdx}`)];
            targetNodes.forEach((i) => {
                changeNodeColor(i, tabItems[linkIdx+1].color);
            });
        }

        // for tabs     
        const tabs = [...document.querySelectorAll(".ant-tabs-tab")];
        const tabTexts = [...document.querySelectorAll(".ant-tabs-tab-btn")];
        const tabCrosses = [...document.querySelectorAll(".ant-tabs-tab-remove")];
        tabs.forEach((item, i) => {
            if(i-1 === linkIdx){
                item.style.backgroundColor = tabItems[i].color;
                tabTexts[i].style.color = "white";
                tabTexts[i].style.fontWeight = "bold";
                if(tabCrosses[i-1]){
                    tabCrosses[i-1].style.color = "white";
                }
            }else{
                item.style.backgroundColor = "white";
                item.style.borderColor = tabItems[i].color;
                tabTexts[i].style.color = tabItems[i].color;
                tabTexts[i].style.fontWeight = "bold";
                if(tabCrosses[i-1]){
                    tabCrosses[i-1].style.color = null;
                }
            }
        })
    }, [stage, options, tabItems, links, linkIdx, colorOrder, linkElements]);

    return(
        <div>
            <div className='element'>
                <Tabs type="editable-card" tabPosition="top" onChange={onChange} activeKey={linkIdx.toString()} onEdit={onEdit} items={tabItems}/>
            </div>
            <FormulaView stage={stage} formula={formula}
                formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                links={links} linkIdx={linkIdx} changeSymbolsInLink={changeSymbolsInLink}/>
            <FeedbackPanel formula={formula} prose={prose}
                links={links} linkIdx={linkIdx} changeTermsInLink={changeTermsInLink} changeSymbolsInLink={changeSymbolsInLink}/>
            <div className='horizontal'>
                <div style={{ marginLeft: "10%", paddingRight: "30px", width: "50%" }}>
                    <ProseView stage={stage} prose={prose}
                        links={links} linkIdx={linkIdx} changeTermsInLink={changeTermsInLink}/>
                </div>
                <div style={{ paddingLeft: "30px", marginRight: "10%", width: "30%" }}>
                    <StaticSlideView
                        formula={formula} links={links} changeLinkIdx={changeLinkIdx} 
                        tabItems={tabItems} colorOrder={colorOrder} changeColor={changeColor}
                        linkElements={linkElements} changeLinkElements={changeLinkElements}/>
                </div>
            </div>
            <Modal title={`You are trying to remove ${tabItems[removeLinkIdx]?.label}`} open={removeLinkIdx!==-1} onOk={onRemove} onCancel={onCancel}>
                Are you sure you want to remove this pair?
            </Modal>
        </div>
    );
}

export default ExtractionPage;