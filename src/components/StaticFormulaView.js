import Latex from '../react-latex/latex';
import { getNodeWithLoc } from '../functions/symbolSelection';
import { changeNodeClassName } from '../functions/formulaNode';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const formulaFontSizeRange = {max: 5, min: 1};

function StaticFormulaView({formula, formulaFontSize, changeFormulaFontSize, links}) {
    // reassign link_ class to mathNode
    // becase KaTeX will rerender and clean all link_ class
    if(links){
        links.forEach((link, idx) => {
            link.symbols.forEach((symbol) => {
                const node = getNodeWithLoc(symbol.start, symbol.end);
                changeNodeClassName("add", node, `link_${idx}`);
            })
        })
    };

    const changeFontSize = (type) => {
        switch (type) {
            case "+":
                if(formulaFontSize < formulaFontSizeRange.max){
                    changeFormulaFontSize(formulaFontSize + 1);
                }
                break;
            case "-":
                if(formulaFontSize > formulaFontSizeRange.min){
                    changeFormulaFontSize(formulaFontSize - 1);
                }
                break;
            default:
                console.log("No such type in changeFormulaFontSize");
        }
    }
    
    return(
        <div className='element horizontal'>
            <Button type="text" icon={<ZoomOutOutlined />} disabled={formulaFontSize===formulaFontSizeRange.min} onClick={() => changeFontSize("-")}/>
            <div className='push'></div>
            <div className={`formulaView formulaFontSize_${formulaFontSize}`}>
                <Latex >{`\\[${formula}\\]`}</Latex>
            </div>
            <div className='push'></div>
            <Button type="text" icon={<ZoomInOutlined />} disabled={formulaFontSize===formulaFontSizeRange.max} onClick={() => changeFontSize("+")}/>
        </div>
    );
}

export default StaticFormulaView;