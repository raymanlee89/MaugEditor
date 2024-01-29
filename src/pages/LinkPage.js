import React, { useState, useEffect } from 'react';
import CompositeSymbolsDisplay from '../components/CompositeSymbolsDisplay';
import DefinitionsDisplay from '../components/DefinitionsDisplay';
import { Divider, Tabs, Modal } from 'antd';

function LinkPage({formula, links, linkIdx, changeLinkIdx, changeLinkArray, changeTermsInLink, changeSymbolsInLink, tabItems, changeTabs}) {
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

    useEffect(() => {
        const buttons = [...document.querySelectorAll(".buttonsContainer button")];
        // console.log("buttons", buttons);
        buttons.forEach((item) => {
            item.style.backgroundColor = tabItems[linkIdx].color;
            item.style.color = "white";
        })
        
        const tabs = [...document.querySelectorAll(".ant-tabs-tab")];
        const tabTexts = [...document.querySelectorAll(".ant-tabs-tab-btn")];
        const tabCrosses = [...document.querySelectorAll(".ant-tabs-tab-remove")];
        // console.log("tabs", tabs);
        tabs.forEach((item, i) => {
            if(i === linkIdx){
                item.style.backgroundColor = tabItems[i].color;
                tabTexts[i].style.color = "white";
                tabTexts[i].style.fontWeight = "bold";
                tabCrosses[i].style.color = "white";
            }else{
                item.style.backgroundColor = "white";
                item.style.borderColor = tabItems[i].color;
                tabTexts[i].style.color = tabItems[i].color;
                tabTexts[i].style.fontWeight = "bold";
                tabCrosses[i].style.color = null;
            }
        })
    }, [links, tabItems, linkIdx]);

    return(
        <div className='page vertical'>
            <Tabs type="editable-card" tabPosition="top" onChange={onChange} activeKey={linkIdx.toString()} onEdit={onEdit} items={tabItems}/>
            <CompositeSymbolsDisplay formula={formula} pickedSymbols={links[linkIdx] === undefined? [] : links[linkIdx].symbols} changeSymbolsInLink={changeSymbolsInLink}/>
            <Divider />
            <DefinitionsDisplay pickedTerms={links[linkIdx] === undefined? [] : links[linkIdx].terms} changeTermsInLink={changeTermsInLink}/>
            <Modal title={`You are trying to remove ${tabItems[removeLinkIdx]?.label}`} open={removeLinkIdx!==-1} onOk={onRemove} onCancel={onCancel}>
                Are you sure you want to remove this link?
            </Modal>
        </div>
    );
}

export default LinkPage;