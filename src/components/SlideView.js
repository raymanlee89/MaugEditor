import React, { useState, useEffect, useRef } from 'react';
import Latex from '../react-latex/latex';
import { Input, Button } from 'antd';
import { EditOutlined, CheckOutlined } from '@ant-design/icons';
import { createLinkElement } from '../functions/createLinkElement';

function SlideView({formula, links, colorOrder, linkElements, changeLinkElements, editingIdx, changeEditingIdx}) {
    const editInputRef = useRef(null);

    const onChangeLinkElement = (idx, type, value) => {
        let newLinkElements = [...linkElements];
        newLinkElements[idx][type] = value;
        changeLinkElements(newLinkElements);
    }

    // update LinkElements
    useEffect(() => {
        let newLinkElements = [];
        colorOrder.forEach((idx) => {
            const newElement = createLinkElement(formula, links[idx], idx);
            newLinkElements.push(newElement);
        });
        changeLinkElements(newLinkElements);
        // console.log("linkElements", newLinkElements);
    }, [colorOrder, links]);

    return (
        <div className='element'>
            {linkElements.map((item, idx) => (
                idx === editingIdx ? 
                    <div className='linkElement'>
                        <Input
                            type="text"
                            size="small"
                            style={{width: "20%"}}
                            value={item.compositeSymbols}
                            onChange={(e) => onChangeLinkElement(idx, "compositeSymbols", e.target.value)}
                            onPressEnter={() => changeEditingIdx(-1)}
                            ref={editInputRef}
                            onBlur={() => changeEditingIdx(-1)}
                        />
                        <div className='separator'>:</div>
                        <Input
                            type="text"
                            size="small"
                            style={{width: "80%"}}
                            value={item.definitions}
                            onChange={(e) => onChangeLinkElement(idx, "definitions", e.target.value)}
                            onPressEnter={() => changeEditingIdx(-1)}
                            ref={editInputRef}
                            onBlur={() => changeEditingIdx(-1)}
                        />
                        <Button type="text" icon={<CheckOutlined/>} size="small" onClick={() => changeEditingIdx(-1)}/>
                    </div>
                    :
                    <div className='linkElement'>
                        <div className={`link_${item.linkIdx}`}>
                            <Latex>{`$${item.compositeSymbols}$`}</Latex>
                        </div>
                        <div className='separator'>:</div>
                        <Latex>{item.definitions}</Latex>
                        <Button type="text" icon={<EditOutlined/>} size="small" onClick={() => changeEditingIdx(idx)}/>
                    </div>
            ))}
        </div>
    );
}

export default SlideView;