import React, { useEffect } from 'react';
import Latex from '../react-latex/latex';
import { List, ColorPicker } from 'antd';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';

function StaticSlideView({formula, links, changeLinkIdx, tabItems, colorOrder, changeColor, linkElements, changeLinkElements}) {
    // create a link element with a link
    const createLinkElement = (link, idx) => {
        // the composite symbols on the left side should be unique
        const uniqueSymbols = new Set(mergeConnectedSymbols(formula, link.symbols, idx));
        const compositeSymbols = Array.from(uniqueSymbols).reduce((a, v, i) => i === 0 ? a + v.text : a + ", " + v.text, "");

        // the definitions on the right side should have no symbols
        const noSymbolsTerms = link.terms.filter((item) => item.text.indexOf("$") === -1);
        const definitions = mergeConnectedTerms(noSymbolsTerms, idx).reduce((a, v, i) => i === 0 ? a + v.text : a + ", " + v.text, "");
        const linkIdx = idx;
        return {compositeSymbols, definitions, linkIdx};
    }

    // update LinkElements
    useEffect(() => {
        if(colorOrder.length > links.length){
            console.log("colorOrder v.s. links", colorOrder, links);
            return;
        }
        let newLinkElements = [];
        colorOrder.forEach((idx) => {
            const newElement = createLinkElement(links[idx], idx);
            newLinkElements.push(newElement);
        });
        changeLinkElements(newLinkElements);
        console.log("linkElements", newLinkElements);
    }, [colorOrder, links]);

    return (
        <List
            header={
                <div style={{ fontWeight: "bold", fontSize: "1.2em" }}>Identifier-Definition Pairs</div>
            }
            dataSource={linkElements}
            renderItem={(item) => (
                <div className='linkElement'>
                    <ColorPicker disabledAlpha value={tabItems[item.linkIdx + 1].color}
                        presets={[{
                        label: 'Recommended',
                        colors: [
                            "#1f77b4", // tab:blue
                            "#ff7f0e", // tab:orange
                            "#2ca02c", // tab:green
                            "#d62728", // tab:red
                            "#9467bd", // tab:purple
                            "#8c564b", // tab:brown
                            "#e377c2", // tab:pink
                            "#7f7f7f", // tab:gray
                            "#bcbd22", // tab:olive
                            "#17becf" // tab:cyan
                        ]
                        }]}
                        onChange={(color) => {
                            changeColor(item.linkIdx + 1, color.toHexString());
                        }}
                    />
                    <div style={{ width: "10px" }}></div>
                    <div className={`link_${item.linkIdx}`}>
                        <Latex>{`$${item.compositeSymbols}$`}</Latex>
                    </div>
                    <div className='separator'>:</div>
                    <Latex>{item.definitions}</Latex>
                </div>
            )}
        />
    );
}

export default StaticSlideView;