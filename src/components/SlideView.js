import React, { useState, useEffect, useRef } from 'react';
import Latex from '../react-latex/latex';
import { Input, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { mergeConnectedSymbols, mergeConnectedTerms } from '../functions/mergeConnectedString';

function SlideView({formula, links, linkElements, changeLinkElements, editingIdx, changeEditingIdx}) {
    const editInputRef = useRef(null);

    // create a link element with a link
    const createLinkElement = (link, idx) => {
        // the composite symbols on the left side should be unique
        const uniqueSymbols = new Set(mergeConnectedSymbols(formula, link.symbols, idx));
        const compositeSymbols = Array.from(uniqueSymbols).reduce((a, v, i) => i === 0 ? a + `$${v.text}$` : a + `, $${v.text}$`, "");

        // the definitions on the right side should have no symbols
        const noSymbolsTerms = link.terms.filter((item) => item.text.indexOf("$") === -1);
        const definitions = mergeConnectedTerms(noSymbolsTerms, idx).reduce((a, v, i) => i === 0 ? a + v.text : a + ", " + v.text, "");

        return {compositeSymbols, definitions};
    }

    const onChangeLinkElement = (idx, type, value) => {
        let newLinkElements = [...linkElements];
        newLinkElements[idx][type] = value;
        changeLinkElements(newLinkElements);
    }

    // update LinkElements
    useEffect(() => {
        let newLinkElements = [];
        links.forEach((item, idx) => {
            const newElement = createLinkElement(item, idx);
            newLinkElements.push(newElement);
        });
        changeLinkElements(newLinkElements);
        console.log("linkElements", newLinkElements);
    }, [links]);

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
                    </div>
                    :
                    <div className='linkElement'>
                        <div className={`link_${idx}`}>
                            <Latex>{item.compositeSymbols}</Latex>
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