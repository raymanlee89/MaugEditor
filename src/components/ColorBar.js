import { ColorPicker } from 'antd';

function ColorBar({tabItems, changeColor, changeLinkIdx}) {
    return (
        <div className='element horizontal colorBar'>
            {tabItems.map((item, idx) => 
                <div className='vertical' style={{margin: "10px"}} key={`colorPicker_${item.label}`}>
                {item.label}
                <ColorPicker disabledAlpha defaultValue={tabItems[idx].color}
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
                        const targets = [...document.getElementsByClassName(`link_${item.key}`)];
                        targets.forEach((i) => {
                            i.style.color = color.toHexString();
                        });
                        changeColor(idx, color.toHexString());
                    }}
                    onOpenChange={(open) => {
                        if(open){
                            changeLinkIdx(Number(item.key));
                        }
                    }}
                />
                </div>
            )}
        </div>
    );
}

export default ColorBar;