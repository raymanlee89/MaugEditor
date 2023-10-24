import Latex from '../react-latex/latex';
import { Button } from 'antd';
import { mergeConnectedSymbols } from '../functions/mergeConnectedString';

function CompositeSymbolsDisplay({formula, pickedSymbols, changeSymbolsInLink}) {
    const createCompositeSymbols = (pickedSymbols) => {
        return mergeConnectedSymbols(formula, pickedSymbols, -1);
    }

    const compositeSymbolsOnClick = (compositeSymbol) => {
        changeSymbolsInLink("remove with range", undefined, {start: compositeSymbol.start, end: compositeSymbol.end});
    }

    return(
        <div className='element fixedHightElement'>
            <p>Symbols</p>
            <div className='horizontal buttonsContainer'>
                {createCompositeSymbols(pickedSymbols).map((item) => (
                    <Button type="primary" shape="round" size="large"
                        key={`${item.text}-${item.start}`}
                        onClick={() => compositeSymbolsOnClick(item)}
                    >
                        <Latex>{"$" + item.text + "$"}</Latex>
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default CompositeSymbolsDisplay;