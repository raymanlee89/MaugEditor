import { getNodeClassName, changeNodeClassName } from '../functions/formulaNode';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { Button } from 'antd';

function OverlapSymbolsMenu({mouseLocation, hoveredSymbols, changeHoveredSymbols, switchSymbol, changeRightClicked}) {
    const leaveOverlapSymbolsMenu = () => {
        changeRightClicked(false);
        hoveredSymbols.forEach((item) => {
            changeNodeClassName("remove", item.node, "outline");
            changeNodeClassName("remove", item.node, "hovered");
        })
        changeHoveredSymbols([]);
    }

    const contextMenuItemOnClick = (hoveredSymbolIdx) => {
        const targetSymbol = hoveredSymbols[hoveredSymbolIdx];
        const className = getNodeClassName(targetSymbol.node);
        if(!className.includes("disabled")){
            switchSymbol(targetSymbol, !className.includes(`link_`));
        }

        leaveOverlapSymbolsMenu();
    }

    const ref = useOutsideClick(leaveOverlapSymbolsMenu);

    return (
        <div
            className="contextMenu"
            style={{left: `${mouseLocation.x}px`, top: `${mouseLocation.y}px`}}
            ref={ref}
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
        </div>
    );
}
  
export default OverlapSymbolsMenu;