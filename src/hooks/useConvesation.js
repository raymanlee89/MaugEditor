import { useState } from 'react';

const useConversation = () => {
    const [conversationQueue, changeConversationQueue] = useState([]);

    const addConversationPair = (feedback, response) => {
        let newConversationQueue = [...conversationQueue];
        newConversationQueue.push(feedback);
        newConversationQueue.push(response);
        changeConversationQueue(newConversationQueue);
    }

    const addInitialResponse = (response) => {
        let newConversationQueue = [];
        newConversationQueue.push(response);
        changeConversationQueue(newConversationQueue);
    }

    return {conversationQueue, addConversationPair, addInitialResponse};
};

export default useConversation;