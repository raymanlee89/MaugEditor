import { ColorPicker, Button } from 'antd';
import space from 'color-space';
import { rgbaToHex } from '@uiw/color-convert';

function ColorBar({stage, colorOrder, tabItems, changeColor, changeLinkIdx}) {
    const randomColor = () => {
        const colorNum = colorOrder.length;
        const angleBase = Math.random() * 2 * Math.PI;
        const angleIncrement = 2 * Math.PI / (colorNum);
        const newColors = colorOrder.map((idx, i) => {
            const theta = angleBase + i * angleIncrement;
            const L = 67.1;
            const U = 21.1 + 75 * Math.cos(theta);
            const V = 11.2 + 75 * Math.sin(theta);
            const rgb = space.luv.rgb([L, U, V]);
            return {color: rgbaToHex({r: rgb[0], g: rgb[1], b: rgb[2], a: 1}), tabIdx: idx};
        }) 
        console.log("New random colors", newColors);
        newColors.forEach((item) => changeColor(item.tabIdx, item.color));
    }

    return (
        <div className='element vertical'>
            <div className='horizontal colorBar'>
                {colorOrder.map((idx) => 
                    <div className='vertical' style={{margin: "10px"}} key={`colorPicker_${tabItems[idx].label}`}>
                        {tabItems[idx].label}
                        <ColorPicker disabledAlpha value={tabItems[idx].color}
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
                                const targets = [...document.getElementsByClassName(`link_${idx}`)];
                                targets.forEach((i) => {
                                    i.style.color = color.toHexString();
                                });
                                changeColor(idx, color.toHexString());
                            }}
                            onOpenChange={(open) => {
                                if(open){
                                    changeLinkIdx(Number(idx));
                                }
                            }}
                        />
                    </div>
                )}
            </div>
            <Button onClick={() => randomColor()}>Auto-assign colors</Button>
        </div>
    );
}

export default ColorBar;