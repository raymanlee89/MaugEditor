import React, { useState } from 'react';
import Latex from '../react-latex/latex';
import { Button, Divider, Tooltip, Modal, Radio, Checkbox, Input, Select } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';
import { getLinksGPT, getDefinitionBySymbol, getSymbolByDefinition } from '../api/linkCreation.api';

const satisfactions = [
    {icon: <SmileOutlined />, value: "It is a good response.", label: "Good"},
    {icon: <MehOutlined />, value: "It is an OK response.", label: "Ok"},
    {icon: <FrownOutlined />, value: "It is a bad response.", label: "Bad"}
];

const advices = {
    links: [
        {
            title: "More or Less pairs?",
            options: [
                { label: "No", value: "" },
                { label: "More", value: "Split the pairs into more detail pairs." },
                { label: "Less", value: "Merge the high related pairs into big pairs."}
            ]
        }
    ],
    symbols: [
        {
            title: "Longer or Shorter symbols?",
            options: [
                { label: "No", value: "" },
                { label: "Longer", value: "Give me longer symbols." },
                { label: "Shorter", value: "Give me shorter symbols."}
            ]
        },
        {
            title: "More or Less symbols?",
            options: [
                { label: "No", value: "" },
                { label: "More", value: "Give me more related symbols." },
                { label: "Less", value: "Give me the most related symbols."}
            ]
        }
    ],
    definitions: [
        {
            title: "Longer or Shorter definitions?",
            options: [
                { label: "No", value: "" },
                { label: "Longer", value: "Give me longer definitions." },
                { label: "Shorter", value: "Give me shorter definitions."}
            ]
        },
        {
            title: "More or Less definitions?",
            options: [
                { label: "No", value: "" },
                { label: "More", value: "Give me more related definitions." },
                { label: "Less", value: "Give me the most related definitions."}
            ]
        }
    ]
}

function FeedbackPanel({
    formula, prose, links, linkIdx, changeTermsInLink, changeSymbolsInLink,
    setSuggestedLinkArray, setDefaultTabs, 
    conversationQueue, addConversationPair, addInitialResponse, rollBackConversation
}) {
    const [loading, changeLoading] = useState(false);
    const [isModalOpen, changeIsModalOpen] = useState(false);
    const [satis, changeSatis] = useState(satisfactions[0].value);
    const [adv, changeAdv] = useState(["", ""]);
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
            if(item !== ""){
                feedback += " " + item;
            }
        })
        console.log("feedback", feedback);
        callAPIs(API, feedback);
        changeIsModalOpen(false);
    };

    const handleRollback = () => {
        const record = conversationQueue.data[conversationQueue.data.length-1];
        console.log("rollback data", record);
        // roll back data
        switch (conversationQueue.API) {
            case "links":
                setSuggestedLinkArray(record, prose, formula, document);
                setDefaultTabs(record.length);
                break
            case "definitions":
                changeTermsInLink("add with difinitions", record.terms, prose);
                break
            case "symbols":
                changeSymbolsInLink("add with compositeSymbols", record.symbols, formula, document);
                break
            default:
                console.log("No such API");
        }
        rollBackConversation();
        changeIsModalOpen(false);
    }

    const handleCancel = () => {
        changeIsModalOpen(false);
    };

    const onChangeSatisfaction = (e) => {
        changeSatis(e.target.value);
    };

    const onChangeAdvice = (idx, value) => {
        let newAdv = [...adv];
        newAdv[idx] = value;
        changeAdv(newAdv);
        console.log("change advice", newAdv);
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
            changeAdv(["", ""]);
            changeSatis(satisfactions[0].value);
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
            // save current data for rollback
            let currentData = [];
            // save the response
            switch (type) {
                case "links":
                    currentData = [...links];
                    console.log("New Links:", res.links);
                    // set the suggested links as the default links
                    setSuggestedLinkArray(res.links, prose, formula, document);
                    setDefaultTabs(res.links.length);
                    break
                case "definitions":
                    currentData = { symbols: links[linkIdx].symbols, terms: links[linkIdx].terms };
                    console.log("New definitions", res.link);
                    changeTermsInLink("add with difinitions", res.link.terms, prose);
                    break
                case "symbols":
                    currentData = { symbols: links[linkIdx].symbols, terms: links[linkIdx].terms };
                    console.log("New composite symbols", res.link);
                    changeSymbolsInLink("add with compositeSymbols", res.link.symbols, formula, document);
                    break
                default:
                    console.log("No such API");
            }
            // update conversation queue
            if(fromStart){
                addInitialResponse(type, linkIdx, res.rawString, currentData);
            }else{
                addConversationPair(type, linkIdx, feedback, res.rawString, currentData);
            }
        }
        changeLoading(false);
    }

    return (
        <Divider style={{height: "50px"}}>
            {linkIdx >= 0 ? 
                <Tooltip title="Get identifiers">
                    <Button shape="circle" icon={<ArrowUpOutlined />} loading={loading} onClick={async () => callAPIs("symbols")}
                        disabled={links[linkIdx].terms.length === 0}/>
                </Tooltip>
                : <></>
            }
            <Tooltip title="Give feedback">
                <Button shape="circle" icon={<ReloadOutlined />} loading={loading} onClick={() => showModal()}
                    disabled={conversationQueue.queue.length === 0 || linkIdx !== conversationQueue.linkIdx}/>
            </Tooltip>
            {linkIdx >= 0 ? 
                <Tooltip title="Get definitions" placement="bottom">
                    <Button shape="circle" icon={<ArrowDownOutlined />} loading={loading} onClick={async () => callAPIs("definitions")}
                        disabled={links[linkIdx].symbols.length === 0}/>
                </Tooltip>
                : <></>
            }
            <Modal title="Feedback Panel" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
                footer={[
                    <Tooltip title="Rollback the last feedback">
                        <Button key="rollback" disabled={conversationQueue.data.length===0} danger onClick={handleRollback}>Rollback</Button>
                    </Tooltip>,
                    <Tooltip title="Submit the feedback">
                        <Button key="submit" type="primary" onClick={handleOk}>Submit</Button>
                    </Tooltip>
                ]}
            >
                <div className='feedbackPanel'>
                    <p>The AI response:</p>
                    {conversationQueue.queue.length > 0 ? conversationQueue.queue[conversationQueue.queue.length-1].split("; ").map((link) => (
                        <div style={{marginLeft: "5px"}}>
                            <Latex>{link}</Latex>
                        </div>
                    )) : <></>}
                    <p>Are you satisfied with the AI response?</p>
                    <Radio.Group onChange={onChangeSatisfaction} value={satis} style={{marginLeft: "5px"}}>
                        {satisfactions.map((item) => (
                            <Radio.Button style={{ height: "55px", width: "60px" }} value={item.value}>
                                <div className='vertical satisfactionButton'>
                                    {item.icon}
                                    {item.label}
                                </div>
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                    <p>What's your advice?</p>
                    <div className='vertical justifyStart alignStart' style={{marginLeft: "5px"}}>
                        {advices[conversationQueue.API].map((item, idx) => (
                            <div className='horizontal justifyStart'>
                                <div style={{marginRight: "10px"}}>{item.title}</div>
                                <Select
                                    value={adv[idx]}
                                    options={item.options}
                                    onChange={(value) => onChangeAdvice(idx, value)}
                                />
                            </div>
                        ))}
                        <div className='horizontal justifyStart'>
                            <div style={{marginRight: "5px", width: "120px"}}>Other advice</div>
                            <Input
                                type="text"
                                size="small"
                                value={customFeedback}
                                onChange={(e) => changeCustomFeedback(e.target.value)}
                                placeholder="Custom feedback"
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </Divider>
    );
}

export default FeedbackPanel;