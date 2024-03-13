import React, { useState, useEffect } from 'react';
import { Button, Divider, Tooltip, Modal, Radio, Checkbox, Input } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';
import { getLinks, getLinksGPT, getDefinitionBySymbol, getSymbolByDefinition } from '../api/linkCreation.api';

const satisfactions = [
    {icon: <SmileOutlined />, value: "It is a good response.", text: "Good"},
    {icon: <MehOutlined />, value: "It is an OK response.", text: "Ok"},
    {icon: <FrownOutlined />, value: "It is a bad response.", text: "Bad"}
];

const advices = {
    links: [
        {type: "static", text: "Split the pairs into more detail pairs."},
        {type: "static", text: "Merge the high related pairs into big pairs."},
        {type: "prefix", text: " should have a pair."}
    ],
    symbols: [
        {type: "static", text: "Give me shorter symbols."},
        {type: "static", text: "Give me longer symbols."},
        {type: "static", text: "Give me more related symbols."},
        {type: "static", text: "Give me the most related symbols."}
    ],
    definitions: [
        {type: "static", text: "Give me shorter definitions."},
        {type: "static", text: "Give me longer definitions."},
        {type: "static", text: "Give me more related definitions."},
        {type: "static", text: "Give me the most related definitions."}
    ]
}

function FeedbackPanel({
    formula, prose, links, linkIdx, changeTermsInLink, changeSymbolsInLink,
    setSuggestedLinkArray, setDefaultTabs, 
    conversationQueue, addConversationPair, addInitialResponse
}) {
    const [loading, changeLoading] = useState(false);
    const [isModalOpen, changeIsModalOpen] = useState(false);
    const [satis, changeSatis] = useState(satisfactions[0].value);
    const [adv, changeAdv] = useState([]);
    const [prefix, changePrefix] = useState("");
    const [convMode, changeConvMode] = useState({API: "links", linkIdx: -1});

    const showModal = () => {
        console.log("conversationQueue", conversationQueue);
        changeIsModalOpen(true);
    };

    const handleOk = async () => {
        let api = convMode.API;
        // generate new feedback
        let feedback = satis;
        adv.forEach((item) => {
            if(advices[api][item].type === "static"){
                feedback += " " + advices[api][item].text;
            }else{
                feedback += " " + prefix + advices[api][item].text;
            }
        });
        console.log("feedback", feedback);
        // console.log("convMode", convMode);
        switch(api){
            case "links":
                callGetLinks(feedback);
                break;
            case "definitions":
                getDefinition(feedback);
                break;
            case "symbols":
                getCompositeSymbol(feedback);
                break;
            default:
                console.log("convMode.API do not exist!!");
        }
        changeIsModalOpen(false);
    };

    const handleCancel = () => {
        changeIsModalOpen(false);
    };

    const onChangeSatisfaction = (e) => {
        changeSatis(e.target.value);
    };

    const onCheck = (checked, idx) => {
        // console.log("onCheck", checked, idx);
        let newAdv = [...adv];
        if(checked){
            newAdv.push(idx);
        }else{
            newAdv = newAdv.filter((i) => i !== idx);
        }
        changeAdv(newAdv);
    }

    const getDefinition = async (feedback) => {
        changeLoading(true);
        if(links[linkIdx].symbols.length > 0){
            let conversation = [...conversationQueue];
            conversation.push(feedback);
            let fromStart = false;
            if(feedback === undefined || convMode.API !== "definitions" || convMode.linkIdx !== linkIdx){
                // change mode and clean the conversation queue
                changeConvMode({API: "definitions", linkIdx: linkIdx});
                fromStart = true;
                conversation = [];
            }
            const pickedSymbols = mergeConnectedSymbols(formula, links[linkIdx].symbols, linkIdx);
            // console.log("getDefinition symbols", pickedSymbols.map((item) => item.text));
            const res = await getDefinitionBySymbol(formula, prose, pickedSymbols.map((item) => item.text), conversation);
            console.log("New definitions", res.link.terms);
            res.link.terms.forEach((def) => {
                changeTermsInLink("add with difinition", def, prose);
            })
            // update conversation queue
            if(fromStart){
                addInitialResponse(res.rawString);
            }else{
                addConversationPair(feedback, res.rawString);
            }
        }
        changeLoading(false);
    }

    const getCompositeSymbol = async (feedback) => {
        changeLoading(true);
        if(links[linkIdx].terms.length > 0){
            let conversation = [...conversationQueue];
            conversation.push(feedback);
            let fromStart = false;
            if(feedback === undefined || convMode.API !== "symbols" || convMode.linkIdx !== linkIdx){
                // change mode and clean the conversation queue
                changeConvMode({API: "symbols", linkIdx: linkIdx});
                fromStart = true;
                conversation = [];
            }
            const pickedTerms = mergeConnectedTerms(links[linkIdx].terms, linkIdx);
            // console.log("getCompositeSymbol terms", pickedTerms.map((item) => item.text));
            const res = await getSymbolByDefinition(formula, prose, pickedTerms.map((item) => item.text), conversation);
            console.log("New composite symbols", res.link);
            res.link.symbols.forEach((sym) => {
                changeSymbolsInLink("add with compositeSymbol", sym, formula, document);
            })
            // update conversation queue
            if(fromStart){
                addInitialResponse(res.rawString);
            }else{
                addConversationPair(feedback, res.rawString);
            }
        }
        changeLoading(false);
    }

    const callGetLinks = async (feedback) => {
        changeLoading(true);
        let conversation = [...conversationQueue];
        conversation.push(feedback);
        let fromStart = false;
        if(convMode.API !== "links" || convMode.linkIdx !== linkIdx){
            // change mode and clean the conversation queue
            changeConvMode({API: "links", linkIdx: -1});
            fromStart = true;
            conversation = [];
        }

        let res = {links: [], rawString: ""}
        if(conversation.length > 0){
            console.log("use GPT");
            res = await getLinksGPT(formula, prose, conversation);
        }else{
            res = await getLinks(formula, prose);
            // use GPT if NER & RE cannot handle the prose
            if(res.links.length === 0){
              console.log("use GPT");
              res = await getLinksGPT(formula, prose, conversation);
            }
        }
        if(fromStart){
            addInitialResponse(res.rawString);
        }else{
            addConversationPair(feedback, res.rawString);
        }
        console.log("suggestedLinks:", res.links);
    
        if(res.links.length > 0){
            // set the suggested links as the default links
            setSuggestedLinkArray(res.links, prose, formula, document);
            setDefaultTabs(res.links.length);
        }
        changeLoading(false);
    }

    return (
        <Divider style={{height: "50px"}}>
            {linkIdx >= 0 ? 
                <Tooltip title="Get identifiers">
                    <Button shape="circle" icon={<ArrowUpOutlined />} loading={loading} onClick={async () => getCompositeSymbol()}/>
                </Tooltip>
                : <></>
            }
            <Tooltip title="Give feedback">
                <Button shape="circle" icon={<ReloadOutlined />} loading={loading} onClick={() => showModal()} disabled={linkIdx !== convMode.linkIdx}/>
            </Tooltip>
            {linkIdx >= 0 ? 
                <Tooltip title="Get definitions" placement="bottom">
                    <Button shape="circle" icon={<ArrowDownOutlined />} loading={loading} onClick={async () => getDefinition()}/>
                </Tooltip>
                : <></>
            }
            <Modal title="Feedback Panel" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div className='feedbackPanel'>
                    <p>Are you satisfied with the AI response?</p>
                    <Radio.Group onChange={onChangeSatisfaction} defaultValue={satisfactions[0].value}>
                        {satisfactions.map((item) => (
                            <Radio.Button style={{ height: "55px", width: "60px" }} value={item.value}>
                                <div className='vertical satisfactionButton'>
                                    {item.icon}
                                    {item.text}
                                </div>
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                    <p>What's your advice?</p>
                    <div className='vertical justifyStart alignStart'>
                        {advices[convMode.API].map((item, idx) => (
                            item.type === "static" ? 
                            <Checkbox onChange={(e) => onCheck(e.target.checked, idx)}>
                                {item.text}
                            </Checkbox>
                                : 
                            <Checkbox onChange={(e) => onCheck(e.target.checked, idx)}>
                                <Input
                                    type="text"
                                    size="small"
                                    style={{width: "50px"}}
                                    value={prefix}
                                    onChange={(e) => changePrefix(e.target.value)}
                                />
                                {item.text}
                            </Checkbox>
                        ))}
                        <Checkbox onChange={(e) => onCheck(e.target.checked, -1)}>
                            <Input
                                type="text"
                                size="small"
                                placeholder="Custom feedback"
                            />
                        </Checkbox>
                    </div>
                </div>
            </Modal>
        </Divider>
    );
}

export default FeedbackPanel;