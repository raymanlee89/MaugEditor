import React, { useState, useEffect } from 'react';
import Wheel from '../react-color-wheel/src/index.tsx';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';

function ColorWheel({colorNum, changeColor, defaultColor}) {
    const [hsva, setHsva] = useState({h: 28, s: 94, v: 90, a: 0});

    const splitColors = (colorNum, targetColor) => {
        const result = [];
        const angleIncrement = 360 / (colorNum);
        for (let i=0 ; i < colorNum ; i++) {
            result.push({
                h: (targetColor.h + i * angleIncrement) % 360,
                s: targetColor.s,
                v: targetColor.v,
                a: targetColor.a
            });
        }
        return result;
    }

    useEffect(() => {
        splitColors(colorNum, hsva).forEach((color, i) => {
            changeColor(i, hsvaToHex(color));
        })
    }, [hsva])

    return (
        <Wheel colors={splitColors(colorNum, hsva)} onChange={(color) => setHsva({ ...hsva, ...color.hsva })} />
    );
}

export default ColorWheel;