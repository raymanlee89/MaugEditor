import Latex from '../react-latex/latex';
import { Button } from 'antd';

function CompositeSymbolsDisplay({formula, pickedSymbols, changeSymbolsInLink}) {
    const createCompositeSymbols = (pickedSymbols) => {
        const compositeSymbols = [];
        let i = 0;
        let newSym = {text: "", location: {start: 0, end: 0}};
        while(i < pickedSymbols?.length){
            const between = formula.substring(newSym.location.end, pickedSymbols[i].location.start).replace(/[.^_ ]/g, "");
            // console.log(between);
            if(between.length === 0){
                newSym.text = formula.substring(newSym.location.start, pickedSymbols[i].location.end);
                newSym.location.end = pickedSymbols[i].location.end;
            }else{
                if(newSym.text !== ""){
                    compositeSymbols.push(newSym);
                }
                newSym = {text: pickedSymbols[i].text, location: {start: pickedSymbols[i].location.start, end: pickedSymbols[i].location.end}};
            }
            i++;
        }
        if(newSym.text !== ""){
            compositeSymbols.push(newSym);
        }
        
        return compositeSymbols;
    }

    const compositeSymbolsOnClick = ({start, end}) => {
        changeSymbolsInLink("remove with range", undefined, {start, end});
    }

    return(
        <div className='element fixedHightElement'>
            <p>Symbols</p>
            <div className='horizontal buttonsContainer'>
                {createCompositeSymbols(pickedSymbols).map((item) => (
                    <Button type="primary" shape="round" size="large"
                        key={`${item.text}-${item.location.start}`}
                        onClick={() => compositeSymbolsOnClick(item.location)}
                    >
                        <Latex>{"$" + item.text + "$"}</Latex>
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default CompositeSymbolsDisplay;