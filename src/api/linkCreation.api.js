import axios from 'axios'

const instance = axios.create({ baseURL: "http://localhost:5000" })

export const getLinks = async (prose) => {
    try{
        const res = await instance.post("\\links", prose);
        // console.log("getLinks res", res);
        return res.data;
    }catch(e){
        console.log(e);
        return "Api fail!!"
    }
}
