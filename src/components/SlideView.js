import Latex from '../react-latex/latex';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';

function SlideView({formula, links}) {
    // create link elements
    const createLinkElement = (link, idx) => {
        // the composite symbols on the left side should be unique
        const uniqueSymbols = new Set(mergeConnectedSymbols(formula, link.symbols, idx));
        const compositeSymbols = Array.from(uniqueSymbols).reduce((a, v, i) => i === 0 ? a + `$${v.text}$` : a + `, $${v.text}$`, "");

        // the definitions on the right side should have no symbols
        const noSymbolsTerms = link.terms.filter((item) => item.text.indexOf("$") === -1);
        const definitions = mergeConnectedTerms(noSymbolsTerms, idx).reduce((a, v, i) => i === 0 ? a + v.text : a + ", " + v.text, "");

        return (
            <div className='linkElement'>
                <div className={`link_${idx}`}>
                    <Latex>{compositeSymbols}</Latex>
                </div>
                <div className='separator'>:</div>
                <Latex>{definitions}</Latex>
                <Button type="text" icon={<EditOutlined/>} size="small"/>
            </div>
        );
    }

    return (
        <div className='element'>
            {links.map((item, idx) => (
                <>
                    {createLinkElement(item, idx)}
                </>
            ))}
        </div>
    );
}

export default SlideView;