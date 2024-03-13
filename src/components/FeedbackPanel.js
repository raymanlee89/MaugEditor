import React, { useState } from 'react';
import { Button, Divider, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined } from '@ant-design/icons';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';
import { getDefinitionBySymbol, getSymbolByDefinition } from '../api/linkCreation.api';

function FeedbackPanel({formula, prose, links, linkIdx, changeTermsInLink, changeSymbolsInLink}) {
    const [loading, changeLoading] = useState(false);

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

    return (
        <Divider style={{height: "50px"}}>
            {linkIdx >= 0 ? 
            <>
                <Tooltip title="Get identifiers">
                    <Button shape="circle" icon={<ArrowUpOutlined />} loading={loading} onClick={async () => getCompositeSymbol()}/>
                </Tooltip>
                <div style={{ width: "5px", height: "5px"}}/>
                <Tooltip title="Get definitions" placement="bottom">
                    <Button shape="circle" icon={<ArrowDownOutlined />} loading={loading} onClick={async () => getDefinition()}/>
                </Tooltip>
            </>
            : 
            <Tooltip title="Get identifier-definition pairs">
                <Button shape="circle" icon={<ReloadOutlined />} loading={loading}/>
            </Tooltip>
            }
            
        </Divider>
    );
}

export default FeedbackPanel;