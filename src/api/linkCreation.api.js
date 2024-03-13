import axios from 'axios'

const instance = axios.create({ baseURL: "http://localhost:5000" })

export const getLinks = async (formula, prose) => {
    try{
        const json = JSON.stringify({ 
            formula: formula,
            prose: prose
        });
        const res = await instance.post("\\links", json, {
            headers: {
              'Content-Type': 'application/json'
            }
        });
        // console.log("getLinks res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}

export const getLinksGPT = async (formula, prose, conversation) => {
    try{
        const json = JSON.stringify({ 
            formula: formula,
            prose: prose,
            conversation: conversation
        });
        const res = await instance.post("\\links_GPT", json, {
            headers: {
              'Content-Type': 'application/json'
            }
        });
        // console.log("getLinksGPT res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}

export const getDefinitionBySymbol = async (formula, prose, symbol, conversation) => {
    try{
        const json = JSON.stringify({ 
            formula: formula,
            prose: prose,
            symbol: symbol,
            conversation: conversation
        });
        const res = await instance.post("\\definition_GPT", json, {
            headers: {
              'Content-Type': 'application/json'
            }
        });
        // console.log("getDefinitionBySymbol res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}

export const getSymbolByDefinition = async (formula, prose, definition, conversation) => {
    try{
        const json = JSON.stringify({ 
            formula: formula,
            prose: prose,
            definition: definition,
            conversation: conversation
        });
        const res = await instance.post("\\symbol_GPT", json, {
            headers: {
              'Content-Type': 'application/json'
            }
        });
        // console.log("getSymbolByDefinition res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}