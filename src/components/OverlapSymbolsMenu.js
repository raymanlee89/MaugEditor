import { getNodeClassName, changeNodeClassName } from '../functions/formulaNode';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';

function OverlapSymbolsMenu({mouseLocation, hoveredSymbols, changeHoveredSymbols, switchSymbol, changeRightClicked}) {
    const contextMenuItemOnClick = (hoveredSymbolIdx) => {
        const targetSymbol = hoveredSymbols[hoveredSymbolIdx];
        const className = getNodeClassName(targetSymbol.node);
        if(!className.includes("disabled")){
            switchSymbol(targetSymbol, !className.includes(`link_`));
        }

        leaveOverlapSymbolsMenu();
    }

    const leaveOverlapSymbolsMenu = () => {
        changeRightClicked(false);
        hoveredSymbols.forEach((item) => {
            changeNodeClassName("remove", item.node, "outline");
            changeNodeClassName("remove", item.node, "hovered");
        })
        changeHoveredSymbols([]);
    }

    return (
        <div
            className="contextMenu"
            style={{left: `${mouseLocation.x}px`, top: `${mouseLocation.y}px`}}
        >
            {hoveredSymbols.map((item, i) => (
                <Button
                    onClick={() => contextMenuItemOnClick(i)}
                    onMouseEnter={() => {changeNodeClassName("add", hoveredSymbols[i].node, "outline")}}
                    onMouseLeave={() => {changeNodeClassName("remove", hoveredSymbols[i].node, "outline")}}
                >
                    {item.text}
                </Button>
            ))}
            <Button icon={<CloseCircleOutlined />} onClick={leaveOverlapSymbolsMenu}/>
        </div>
    );
}
  
export default OverlapSymbolsMenu;