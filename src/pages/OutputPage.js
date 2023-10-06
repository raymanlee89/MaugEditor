import React, { useEffect, useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

function OutputPage({formula, prose, links, tabItems}) {
    const [output, changeOutput] = useState("");

    const addColorLatex = (type, string) => {
        if(type !== "terms" && type !== "symbols"){
            console.log("Cannot deal with this type");
            return "";
        }
    
        // create the sorted array of the link marks
        let linkMarks = links.reduce((accumulator, item, idx) => (
            accumulator.concat(item[type].map((i) => (
                {
                    start: i.location.start,
                    end: i.location.end,
                    link: idx
                }
            )))
        ), []);
        linkMarks.sort((a, b) => b.start - a.start);
    
        if(type === "terms"){
            // merge connected terms in the same link
            for(let i=0 ; i<linkMarks.length-1 ; i++){
                if(linkMarks[i].start === linkMarks[i+1].end + 1 && linkMarks[i].link === linkMarks[i+1].link){
                    const newLinkMark = {
                    start: linkMarks[i+1].start,
                    end: linkMarks[i].end,
                    link: linkMarks[i].link
                    }
                    linkMarks.splice(i, 2, newLinkMark);
                }
            }
        }
        // console.log(linkMarks);
    
        let result = string.trim();
        linkMarks.forEach((item) => {
            if(type === "terms"){
                result = result.substring(0, item.start) + `\\link${item.link} ` + result.substring(item.start, item.end) + " \\plain" + result.substring(item.end);
            }else if(type === "symbols"){
                result = result.substring(0, item.start) + `{\\link${item.link} ` + result.substring(item.start, item.end) + "} \\plain" + result.substring(item.end);
            }
        });
        if(!result.startsWith("\\link")){
            result = "\\plain " + result;
        }
        result = result.replaceAll("\\plain \\link", "\\link");
        // remove last \\plain
        if(result.endsWith("\\plain")){
            result = result.substring(0, result.lastIndexOf("\\plain"));
        }
        // console.log(result);
        return result;
    }
    
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
    
        let outputFormula = addColorLatex("symbols", formula);
        // console.log(outputFormula);
    
        let outputProse = addColorLatex("terms", prose);
        // console.log(outputProse);
    
        changeOutput(header + "\n\n\\[" + outputFormula + "\\]\n\n" + outputProse);
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