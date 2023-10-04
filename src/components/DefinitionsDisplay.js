import Latex from '../react-latex/latex';
import { Button } from 'antd';

function DefinitionsDisplay({pickedTerms, changeTermsInLink}) {
    const createDifinitions = (pickedTerms) => {
        const definitions = [];
        let i = 0;
        let newDef = {text: "", location: {start: 0, end: 0}};
        while(i < pickedTerms?.length){
            if(newDef.location.end + 1 === pickedTerms[i].location.start){
                newDef.text = newDef.text.concat(" ", pickedTerms[i].text);
                newDef.location.end = pickedTerms[i].location.end;
            }else{
                if(newDef.text !== ""){
                    definitions.push(newDef);
                }
                newDef = {text: pickedTerms[i].text, location: {start: pickedTerms[i].location.start, end: pickedTerms[i].location.end}};
            }
            i++;
        }
        if(newDef.text !== ""){
            definitions.push(newDef);
        }
        
        return definitions;
    }

    const definitionOnClick = ({start, end}) => {
        changeTermsInLink("remove with range", undefined, {start, end});
    }
    
    return(
        <div className='element fixedHightElement'>
            <p>Definitions</p>
            <div className='horizontal buttonsContainer'>
                {createDifinitions(pickedTerms).map((item) => (
                    <Button type="primary" shape="round" size="large"
                        key={`${item.text}-${item.location.start}`}
                        onClick={() => definitionOnClick(item.location)}
                    >
                        {item.text.length < 20 ? 
                            <Latex>{item.text}</Latex> : 
                            <Latex>{item.text.substring(0, item.text.indexOf(" ")) + "..." + item.text.substring(item.text.lastIndexOf(" "))}</Latex>
                        }
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default DefinitionsDisplay;