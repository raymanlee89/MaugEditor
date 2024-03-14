import { useState } from 'react';

const useConversation = () => {
    // conversationQueue: { API: "links", linkIdx: -1 , queue: [] }
    const [conversationQueue, changeConversationQueue] = useState({ API: "links", linkIdx: -1 , queue: [] });

    const addConversationPair = (API, linkIdx, feedback, response) => {
        let newConversationQueue = [...conversationQueue.queue];
        newConversationQueue.push(feedback);
        newConversationQueue.push(response);
        changeConversationQueue({ API: API, linkIdx: linkIdx , queue: newConversationQueue });
    }

    const addInitialResponse = (API, linkIdx, response) => {
        let newConversationQueue = [];
        newConversationQueue.push(response);
        changeConversationQueue({ API: API, linkIdx: linkIdx , queue: newConversationQueue });
    }

    return {conversationQueue, addConversationPair, addInitialResponse};
};

export default useConversation;