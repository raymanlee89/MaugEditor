import { useState } from 'react';

const useConversation = () => {
    // conversationQueue: { API: "links", linkIdx: -1 , queue: [], data: [] }
    // queue is the conversation string => for LLM
    // data is the real links => for rollback
    const [conversationQueue, changeConversationQueue] = useState({ API: "links", linkIdx: -1 , queue: [], data: [] });

    const addConversationPair = (API, linkIdx, feedback, response, currentData) => {
        let newQueue = [...conversationQueue.queue];
        newQueue.push(feedback);
        newQueue.push(response);
        let newData = [...conversationQueue.data];
        newData.push(currentData);
        changeConversationQueue({ API: API, linkIdx: linkIdx , queue: newQueue, data: newData });
    }

    const addInitialResponse = (API, linkIdx, response, currentData) => {
        const newQueue = [response];
        const newData = [currentData];
        changeConversationQueue({ API: API, linkIdx: linkIdx , queue: newQueue, data: newData });
    }

    const rollBackConversation = () => {
        let newQueue = [...conversationQueue.queue];
        newQueue.pop();
        if(newQueue.length > 0){
            // rollback a pair
            newQueue.pop();
        }
        let newData = [...conversationQueue.data];
        newData.pop();
        changeConversationQueue({ API: conversationQueue.API, linkIdx: conversationQueue.linkIdx , queue: newQueue, data: newData });
    }

    // for the remove link case
    const fixConversationLinkIdx = (removeLinkIdx) => {
        if(conversationQueue.linkIdx > removeLinkIdx){
            changeConversationQueue({ API: conversationQueue.API, linkIdx: conversationQueue.linkIdx-1 , queue: conversationQueue.queue, data: conversationQueue.data });
        }else if(conversationQueue.linkIdx === removeLinkIdx){
            changeConversationQueue({ API: "links", linkIdx: -1 , queue: [], data: [] });
        }
    }

    return {conversationQueue, addConversationPair, addInitialResponse, rollBackConversation, fixConversationLinkIdx};
};

export default useConversation;