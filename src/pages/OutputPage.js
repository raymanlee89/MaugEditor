import React, { useEffect, useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { addColorToFormula, addColorToProse } from '../functions/outputCreation';

function OutputPage({formula, prose, links, tabItems}) {
    const [output, changeOutput] = useState("");
    
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    useEffect(() => {
        // Create Output
        let header = "\\usepackage{color}\n\n";
        header = header + tabItems.reduce((accumulator, item, idx) => {
            // hex to rgb
            let rgb = hexToRgb(item.color);
            return links[idx].terms.length + links[idx].symbols.length > 0 ? accumulator + `\\definecolor{c${idx}}{RGB}{${rgb.r},${rgb.g},${rgb.b}}\n` : accumulator;
        }, "");
        
        header = header + "\n\\newcommand{\\plain}{\\color{black}}\n\\newcommand{\\link}[1]{\\color{c#1}}";
    
        let outputFormula = addColorToFormula(links, formula);
        // console.log(outputFormula);
    
        let outputProse = addColorToProse(links, prose);
        // console.log(outputProse);
    
        changeOutput(header + "\n\n\\[" + outputFormula + "\n\\]\n\n" + outputProse);
    }, [tabItems, formula, prose, links])

    const [messageApi, contextHolder] = message.useMessage();
    const copyContent = () => {
        navigator.clipboard.writeText(output);
        messageApi.info('Copied!');
    }

    return (
        <div className='page vertical'>
            <div className='element'>
                <p>Output</p>
                <div className='vertical outputArea'>
                    <div className='outputText'>
                        {output}
                    </div>
                    <div className="horizontal" style={{ width: "100%" }}>
                        <div className='push'></div>
                        {contextHolder}
                        <Tooltip title="Copy">
                            <Button type="text" shape="circle" icon={<CopyOutlined />} onClick={copyContent}/>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OutputPage;