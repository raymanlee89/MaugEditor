import React, { useState, useEffect } from 'react';
import CompositeSymbolsDisplay from '../components/CompositeSymbolsDisplay';
import DefinitionsDisplay from '../components/DefinitionsDisplay';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';
import { getDefinitionBySymbol, getSymbolByDefinition } from '../api/linkCreation.api';

import { Divider, Tabs, Modal, Button, Tooltip } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

function LinkPage({formula, prose, links, linkIdx, changeLinkIdx, changeLinkArray, changeTermsInLink, changeSymbolsInLink, tabItems, changeTabs}) {
    const [removeLinkIdx, changeRemoveLinkIdx] = useState(-1);
    const [loading, changeLoading] = useState(false);

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
        changeLoading(true);
        if(links[linkIdx].symbols.length > 0){
            const pickedSymbols = mergeConnectedSymbols(formula, links[linkIdx].symbols, linkIdx);
            // console.log("getDefinition symbols", pickedSymbols.map((item) => item.text));
            const res = await getDefinitionBySymbol(formula, prose, pickedSymbols.reduce((a, v, i) => i === 0 ? a + v.text : a + "<,>" + v.text, ""));
            console.log("New definitions", res);
            res.forEach((def) => {
                changeTermsInLink("add with difinition", def, prose);
            })
        }
        changeLoading(false);
    }

    const getCompositeSymbol = async () => {
        changeLoading(true);
        if(links[linkIdx].terms.length > 0){
            const pickedTerms = mergeConnectedTerms(links[linkIdx].terms, linkIdx);
            console.log("getCompositeSymbol terms", pickedTerms.map((item) => item.text));
            const res = await getSymbolByDefinition(formula, prose, pickedTerms.reduce((a, v, i) => i === 0 ? a + v.text : a + "<,>" + v.text, ""));
            console.log("New composite symbols", res);
            res.forEach((sym) => {
                changeSymbolsInLink("add with compositeSymbol", sym, formula, document);
            })
        }
        changeLoading(false);
    }

    return(
        <div className='box linkPage'>
            <div className='element'>
                <Tabs type="editable-card" tabPosition="top" onChange={onChange} activeKey={linkIdx.toString()} onEdit={onEdit} items={tabItems}/>
            </div>
            <CompositeSymbolsDisplay formula={formula} pickedSymbols={links[linkIdx] === undefined? [] : links[linkIdx].symbols} changeSymbolsInLink={changeSymbolsInLink}/>
            <Divider>
                <Tooltip title="Get symbols">
                    <Button shape="circle" icon={<ArrowUpOutlined />} loading={loading} onClick={async () => getCompositeSymbol()}/>
                </Tooltip>
                <div style={{ width: "5px", height: "5px"}}/>
                <Tooltip title="Get definitions" placement="bottom">
                    <Button shape="circle" icon={<ArrowDownOutlined />} loading={loading} onClick={async () => getDefinition()}/>
                </Tooltip>
            </Divider>
            <DefinitionsDisplay pickedTerms={links[linkIdx] === undefined? [] : links[linkIdx].terms} changeTermsInLink={changeTermsInLink}/>
            <Modal title={`You are trying to remove ${tabItems[removeLinkIdx]?.label}`} open={removeLinkIdx!==-1} onOk={onRemove} onCancel={onCancel}>
                Are you sure you want to remove this link?
            </Modal>
        </div>
    );
}

export default LinkPage;