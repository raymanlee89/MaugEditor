import { ColorPicker, Popover, Button } from 'antd';
import ColorWheel from './ColorWheel';

function ColorBar({colorOrder, tabItems, changeColor, changeLinkIdx}) {
    return (
        <div className='element vertical'>
            <div className='horizontal colorBar'>
                {colorOrder.map((item, idx) => 
                    <div className='vertical' style={{margin: "10px"}} key={`colorPicker_${item.label}`}>
                        {tabItems[item.id].label}
                        <ColorPicker disabledAlpha value={tabItems[item.id].color}
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
                                const targets = [...document.getElementsByClassName(`link_${tabItems[item.id].key}`)];
                                targets.forEach((i) => {
                                    i.style.color = color.toHexString();
                                });
                                changeColor(idx, color.toHexString());
                            }}
                            onOpenChange={(open) => {
                                if(open){
                                    changeLinkIdx(Number(tabItems[item.id].key));
                                }
                            }}
                        />
                    </div>
                )}
            </div>
            <Popover content={<ColorWheel colorNum={colorOrder.length} changeColor={changeColor} defaultColor={tabItems[colorOrder[0].id].color}/>} title="Colors" trigger="click" placement="right">
                <Button>Click me</Button>
            </Popover>
        </div>
    );
}

export default ColorBar;