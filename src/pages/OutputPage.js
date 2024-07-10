import React, { useEffect, useState } from 'react';
import { Button, Tooltip, message, Select } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { hexToRgba } from '@uiw/color-convert';
import { addColorToFormula, addColorToProse, itemizeLink } from '../functions/outputCreation';

function OutputPage({options, formula, prose, links, linkElements, tabItems, colorOrder}) {
    const [output, changeOutput] = useState("");
    const [medium, changeMedium] = useState("default");

    useEffect(() => {
        // console.log("links", links);
        // Create Output
        let header = "";
        switch (medium) {
            case "slide":
                header += "\\documentclass{beamer}";
                header += "\n\\usepackage{amsmath}";
                header += "\n\\usepackage{amssymb}";
                header += "\n\\usepackage{cmbright}";
                header += "\n\n\\usetheme{Madrid}";
                header += "\n\\usecolortheme{default}";
                header += "\n\n\\usepackage{mathtools}";
                header += "\n\\usepackage{annotate-equations}";
                break
            case "paper":
                header += "\\documentclass{article}";
                header += "\n\\usepackage[utf8]{inputenc}";
                header += "\n\\usepackage{amsmath}";
                header += "\n\\usepackage{amssymb}";
                header += "\n\n\\renewcommand{\\familydefault}{\\sfdefault}";
                break
            case "default":
            default:
                header += "\\documentclass[preview]{standalone}";
                header += "\n\\usepackage[utf8]{inputenc}";
                header += "\n\\usepackage{amsmath}";
                header += "\n\\usepackage{amssymb}";
                header += "\n\n\\renewcommand{\\familydefault}{\\sfdefault}";
                break
        }
        header += "\n\n\\usepackage{color}\n";
        header += colorOrder.reduce((accumulator, tabIdx, idx) => {
            // hex to rgb
            let rgb = hexToRgba(tabItems[tabIdx+1].color);
            return accumulator + `\\definecolor{c${idx}}{RGB}{${rgb.r},${rgb.g},${rgb.b}}\n`;
        }, "");
        
        header += "\\newcommand{\\plain}{\\color{black}}\n\\newcommand{\\link}[1]{\\color{c#1}}";

        header += "\n\n\\begin{document}";
        let tail = "";

        switch (medium) {
            case "slide":
                header += "\n\\begin{frame}";
                header += "\n\\frametitle{Title}";
                tail += "\n\n\\end{frame}";
                break
            case "paper":
            case "default":
            default:
                header += "\n\\begin{center}";
                tail += "\n\n\\end{center}";
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
    }, [medium, options, formula, prose, links, linkElements, colorOrder, tabItems])

    const [messageApi, contextHolder] = message.useMessage();
    const copyContent = () => {
        console.log("Final links", links);
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
                                value: 'default',
                                label: 'default',
                            },
                            {
                                value: 'slide',
                                label: 'slide',
                            },
                            {
                                value: 'paper',
                                label: 'paper',
                            }
                        ]}
                    />
                    <div className="horizontal" style={{ width: "100%" }}>
                        <div className='push'></div>
                        {contextHolder}
                        <Tooltip title="Copy" placement="left">
                            <Button type="text" shape="circle" icon={<CopyOutlined />} onClick={copyContent}/>
                        </Tooltip>
                    </div>
                </div>
                <div className='vertical outputArea'>
                    <div className='outputText'>
                        {output}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OutputPage;