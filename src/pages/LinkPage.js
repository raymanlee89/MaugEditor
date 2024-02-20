import React, { useState, useEffect } from 'react';
import CompositeSymbolsDisplay from '../components/CompositeSymbolsDisplay';
import DefinitionsDisplay from '../components/DefinitionsDisplay';
import { mergeConnectedSymbols } from '../functions/mergeConnectedString';
import { getDefinitionBySymbol } from '../api/linkCreation.api';

import { Divider, Tabs, Modal, Button } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';

function LinkPage({formula, prose, links, linkIdx, changeLinkIdx, changeLinkArray, changeTermsInLink, changeSymbolsInLink, tabItems, changeTabs}) {
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

    // Modify colors in LinkPage
    useEffect(() => {
        const buttons = [...document.querySelectorAll(".buttonsContainer button")];
        buttons.forEach((item) => {
            item.style.backgroundColor = tabItems[linkIdx].color;
            item.style.color = "white";
        })
        
        const tabs = [...document.querySelectorAll(".ant-tabs-tab")];
        const tabTexts = [...document.querySelectorAll(".ant-tabs-tab-btn")];
        const tabCrosses = [...document.querySelectorAll(".ant-tabs-tab-remove")];
        tabs.forEach((item, i) => {
            if(i === linkIdx){
                item.style.backgroundColor = tabItems[i].color;
                tabTexts[i].style.color = "white";
                tabTexts[i].style.fontWeight = "bold";
                if(tabCrosses[i]){
                    tabCrosses[i].style.color = "white";
                }
            }else{
                item.style.backgroundColor = "white";
                item.style.borderColor = tabItems[i].color;
                tabTexts[i].style.color = tabItems[i].color;
                tabTexts[i].style.fontWeight = "bold";
                if(tabCrosses[i]){
                    tabCrosses[i].style.color = null;
                }
            }
        })
    }, [links, tabItems, linkIdx]);

    const getDefinition = async () => {
        const pickedSymbols = mergeConnectedSymbols(formula, links[linkIdx].symbols, linkIdx);
        console.log("getDefinition symbols", pickedSymbols.map((item) => item.text));
        const res = await getDefinitionBySymbol(formula, prose, pickedSymbols.reduce((a, v, i) => i === 0 ? a + v.text : a + "<,>" + v.text, ""));
        console.log("New definitions", res);
        res.forEach((def) => {
            const newTerms = splitDefinition(def);
            console.log("newTerms", newTerms);
            newTerms.forEach((term) => {
                changeTermsInLink("add", term);
            })
        })
    }

    const splitDefinition = (definition) => {
        let terms = [];
        let start = 0;
        let split = definition.text.indexOf(" ");
        while(split !== -1){
            terms.push({
                text: definition.text.substring(start, split),
                start: definition.start + start,
                end: definition.start + split
            });
            start = split + 1;
            split = definition.text.indexOf(" ", start);
        }
        terms.push({
            text: definition.text.substring(start),
            start: definition.start + start,
            end: definition.end
        });
        return terms;
    }

    return(
        <div className='box linkPage'>
            <div className='element'>
                <Tabs type="editable-card" tabPosition="top" onChange={onChange} activeKey={linkIdx.toString()} onEdit={onEdit} items={tabItems}/>
            </div>
            <CompositeSymbolsDisplay formula={formula} pickedSymbols={links[linkIdx] === undefined? [] : links[linkIdx].symbols} changeSymbolsInLink={changeSymbolsInLink}/>
            <Divider>
                <Button shape="circle" icon={<ArrowDownOutlined />} onClick={async () => getDefinition()}/>
            </Divider>
            <DefinitionsDisplay pickedTerms={links[linkIdx] === undefined? [] : links[linkIdx].terms} changeTermsInLink={changeTermsInLink}/>
            <Modal title={`You are trying to remove ${tabItems[removeLinkIdx]?.label}`} open={removeLinkIdx!==-1} onOk={onRemove} onCancel={onCancel}>
                Are you sure you want to remove this link?
            </Modal>
        </div>
    );
}

export default LinkPage;