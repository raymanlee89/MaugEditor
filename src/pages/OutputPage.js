import React, { useEffect, useState } from 'react';
import { Button, Tooltip, message, Select } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { addColorToFormula, addColorToProse, itemizeLink } from '../functions/outputCreation';

function OutputPage({options, formula, prose, links, linkElements, colorOrder}) {
    const [output, changeOutput] = useState("");
    const [medium, changeMedium] = useState("paper");
    
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    useEffect(() => {
        console.log("links", links);
        // Create Output
        let header = "\\usepackage{color}\n";
        header += colorOrder.reduce((accumulator, item, idx) => {
            // hex to rgb
            let rgb = hexToRgb(item.color);
            return accumulator + `\\definecolor{c${idx}}{RGB}{${rgb.r},${rgb.g},${rgb.b}}\n`;
        }, "");
        
        header += "\\newcommand{\\plain}{\\color{black}}\n\\newcommand{\\link}[1]{\\color{c#1}}";

        header += "\n\n\\begin{document}";
        let tail = "";

        switch (medium) {
            case "slide":
                header += "\n\\begin{frame}";
                header += "\n\\frametitle{Title}"
                tail = "\n\n\\end{frame}";
                break
            case "paper":
            default:
                header = header + "\n\\begin{center}";
                tail = "\n\n\\end{center}";
                break
        }

        tail += "\n\\end{document}";

        let outputContext = "\n\n\$\$" + addColorToFormula(colorOrder, links, formula) + "\n\$\$";
    
        if(options[0]){
            outputContext += "\n" + addColorToProse(colorOrder, links, prose);
        }

        if(options[1]){
            outputContext += "\n\n" + itemizeLink(linkElements);
        }
    
        changeOutput(header + outputContext + tail);
    }, [medium, options, formula, prose, links, linkElements, colorOrder])

    const [messageApi, contextHolder] = message.useMessage();
    const copyContent = () => {
        navigator.clipboard.writeText(output);
        messageApi.info('Copied!');
    }

    return (
        <div className='box'>
            <div className='element'>
                <div className='horizontal justifyStart'>
                    <p>Output</p>
                    <div style={{ width: "30px"}}/>
                    <Select
                        value={medium}
                        onChange={(v) => changeMedium(v)}
                        options={[
                            {
                                value: 'paper',
                                label: 'paper',
                            },
                            {
                                value: 'slide',
                                label: 'slide',
                            }
                        ]}
                    />
                </div>
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