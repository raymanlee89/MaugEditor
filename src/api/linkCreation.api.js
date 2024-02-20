import axios from 'axios'

const instance = axios.create({ baseURL: "http://localhost:5000" })

export const getLinks = async (formula, prose) => {
    try{
        const res = await instance.post("\\links", formula + "<;>" + prose);
        // console.log("getLinks res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}

export const getLinksGPT = async (formula, prose) => {
    try{
        const res = await instance.post("\\links_GPT", formula + "<;>" + prose);
        // console.log("getLinksGPT res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}

export const getDefinitionBySymbol = async (formula, prose, symbol) => {
    try{
        const res = await instance.post("\\definition", formula + "<;>" + prose + "<;>" + symbol);
        // console.log("getDefinitionBySymbol res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}