import React, { useState } from 'react';
import Latex from '../react-latex/latex';
import { Button, Divider, Tooltip, Modal, Radio, Checkbox, Input } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';
import { getLinksGPT, getDefinitionBySymbol, getSymbolByDefinition } from '../api/linkCreation.api';

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
    const [customFeedback, changeCustomFeedback] = useState("");

    const showModal = () => {
        console.log("conversationQueue", conversationQueue);
        changeIsModalOpen(true);
    };

    const handleOk = async () => {
        let API = conversationQueue.API;
        // generate new feedback
        let feedback = satis;
        adv.forEach((item) => {
            if (item === -1){
                feedback += " " + customFeedback;
            }else if(advices[API][item].type === "static"){
                feedback += " " + advices[API][item].text;
            }else{
                feedback += " " + prefix + advices[API][item].text;
            }
        });
        console.log("feedback", feedback);
        callAPIs(API, feedback);
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

    // callGetLinks & getDefinition & getCompositeSymbol
    const callAPIs = async (type, feedback) => {
        changeLoading(true);
        // prepare the conversations
        let conversation = [...conversationQueue.queue];
        conversation.push(feedback);
        let fromStart = false;
        if(feedback === undefined || conversationQueue.API !== type || conversationQueue.linkIdx !== linkIdx){
            // change mode and clean the conversation queue
            changeAdv([]);
            fromStart = true;
            conversation = [];
        }

        // send the feedback to the backend
        let res = { warning: "Feedback not sent", rawString: "You did not send your feedback!" };
        switch (type) {
            case "links":
                res = await getLinksGPT(formula, prose, conversation);
                break
            case "definitions":
                const pickedSymbols = mergeConnectedSymbols(formula, links[linkIdx].symbols, linkIdx);
                res = await getDefinitionBySymbol(formula, prose, pickedSymbols.map((item) => item.text), conversation);
                break
            case "symbols":
                const pickedTerms = mergeConnectedTerms(links[linkIdx].terms, linkIdx);
                res = await getSymbolByDefinition(formula, prose, pickedTerms.map((item) => item.text), conversation);
                break
            default:
                console.log("No such API");
        }

        if(res.warning !== undefined){
            // show the warning Modal
            Modal.warning({
                title: res.warning,
                content: res.rawString,
                footer: (_, { OkBtn }) => (
                    <OkBtn/>
                ),
            });
        }else{
            // save the response data
            switch (type) {
                case "links":
                    if(fromStart){
                        addInitialResponse("links", -1, res.rawString);
                    }else{
                        addConversationPair("links", -1, feedback, res.rawString);
                    }
                    console.log("New Links:", res.links);
                    // set the suggested links as the default links
                    setSuggestedLinkArray(res.links, prose, formula, document);
                    setDefaultTabs(res.links.length);
                    break
                case "definitions":
                    console.log("New definitions", res.link.terms);
                    changeTermsInLink("add with difinitions", res.link.terms, prose);
                    break
                case "symbols":
                    console.log("New composite symbols", res.link);
                    changeSymbolsInLink("add with compositeSymbols", res.link.symbols, formula, document);
                    break
                default:
                    console.log("No such API");
            }
            // update conversation queue
            if(fromStart){
                addInitialResponse(type, linkIdx, res.rawString);
            }else{
                addConversationPair(type, linkIdx, feedback, res.rawString);
            }
        }
        changeLoading(false);
    }

    return (
        <Divider style={{height: "50px"}}>
            {linkIdx >= 0 ? 
                <Tooltip title="Get identifiers">
                    <Button shape="circle" icon={<ArrowUpOutlined />} loading={loading} onClick={async () => callAPIs("symbols")}/>
                </Tooltip>
                : <></>
            }
            <Tooltip title="Give feedback">
                <Button shape="circle" icon={<ReloadOutlined />} loading={loading} onClick={() => showModal()}
                    disabled={conversationQueue.queue.length === 0 || linkIdx !== conversationQueue.linkIdx}/>
            </Tooltip>
            {linkIdx >= 0 ? 
                <Tooltip title="Get definitions" placement="bottom">
                    <Button shape="circle" icon={<ArrowDownOutlined />} loading={loading} onClick={async () => callAPIs("definitions")}/>
                </Tooltip>
                : <></>
            }
            <Modal title="Feedback Panel" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div className='feedbackPanel'>
                    <p>The AI response:</p>
                    {conversationQueue.queue.length > 0 ? conversationQueue.queue[conversationQueue.queue.length-1].split("; ").map((link) => (
                        <div>
                            <Latex>{link}</Latex>
                        </div>
                    )) : <></>}
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
                        {advices[conversationQueue.API].map((item, idx) => (
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
                                value={customFeedback}
                                onChange={(e) => changeCustomFeedback(e.target.value)}
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