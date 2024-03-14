import React, { useEffect } from 'react';
import Latex from '../react-latex/latex';
import { List, ColorPicker } from 'antd';
import { createLinkElement } from '../functions/createLinkElement';

function StaticSlideView({formula, links, linkIdx, changeLinkIdx, tabItems, colorOrder, changeColor, linkElements, changeLinkElements}) {
    // update LinkElements
    useEffect(() => {
        if(colorOrder.length > links.length){
            return;
        }
        console.log("colorOrder", colorOrder);
        console.log("links", links);

        let newLinkElements = [];
        colorOrder.forEach((idx) => {
            const newElement = createLinkElement(formula, links[idx], idx);
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
                <div className={`linkElement ${item.linkIdx === linkIdx ? "currentLink" : ""}`}>
                    <ColorPicker disabledAlpha value={tabItems[item.linkIdx + 1]?.color}
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