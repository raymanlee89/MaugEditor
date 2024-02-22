import Latex from '../react-latex/latex';
import { Button } from 'antd';
import { mergeConnectedTerms } from '../functions/mergeConnectedString';

function DefinitionsDisplay({pickedTerms, changeTermsInLink}) {
    const createDifinitions = (pickedTerms) => {
        return mergeConnectedTerms(pickedTerms, -1);
    }

    const definitionOnClick = (difinition) => {
        changeTermsInLink("remove with difinition", {start: difinition.start, end: difinition.end});
    }
    
    return(
        <div className='element fixedHightElement'>
            <p>Definitions</p>
            <div className='buttonsContainer'>
                {createDifinitions(pickedTerms).map((item) => (
                    <Button shape="round" size="large"
                        key={`${item.text}-${item.start}`}
                        onClick={() => definitionOnClick(item)}
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