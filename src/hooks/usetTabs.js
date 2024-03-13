import { useState } from "react";

const useTabs = () => {
    const defaultColors = [
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

    // Warning: the label of tab is different from the link idx in links
    const [tabItems, changeTabItems] = useState([
        { label: 'ALL', key: '-1', closable: false, color: "#000000" },
        { label: 'Link 1', key: '0', closable: true, color: defaultColors[0] }
    ]);

    // colorOrder is a subset indices of tabItems, and it decides the coloring order in output page
    const [colorOrder, changeColorOrder] = useState([0]);

    const setDefaultTabs = (tabCount) => {
        let newTabItems = [{ label: 'ALL', key: '-1', closable: false, color: "#000000" }];
        let newColorOrder = [];
        for(let i=0 ; i<tabCount ; i++){
            newTabItems.push({
                label: `Link ${i+1}`,
                key: i.toString(),
                closable: true,
                color: defaultColors[i % defaultColors.length]
            });
            newColorOrder.push(i);
        }
        changeTabItems(newTabItems);
        changeColorOrder(newColorOrder);
    }

    const changeTabs = (type, targetLinkIdx) => {
        let tabItemsCopy = [...tabItems];
        switch (type) {
            case "add":
                const lastTabName = Number(tabItems[tabItems.length-1].label.replace("Link ", ""));
                const newTabItem = {
                    label: `Link ${isNaN(lastTabName) ? 1 : lastTabName+1}`,
                    key: targetLinkIdx.toString(),
                    closable: true,
                    color: defaultColors[isNaN(lastTabName) ? 0 : lastTabName%defaultColors.length]
                }
                tabItemsCopy.push(newTabItem);
                tabItemsCopy.filter((item) => item.label !== "ALL").forEach((item) => item.closable = true);
                break;
            case "remove":
                tabItemsCopy.splice(targetLinkIdx, 1);
                // update the keys of tabs => the label of tab is different from the link idx in links
                tabItemsCopy.forEach((item, idx) => item.key = idx.toString());
                if(tabItemsCopy.length === 1){
                    tabItemsCopy[0].closable = false;
                }
                break;
            case "clear":
                tabItemsCopy = [
                    { label: 'ALL', key: '-1', closable: false, color: "#000000" },
                    { label: 'Link 1', key: '0', closable: true, color: defaultColors[0] }
                ];
                break;
            default:
                console.log("No such type in changeTabs");
        }
        changeTabItems(tabItemsCopy);
        changeColorOrder(tabItemsCopy.filter((item) => item.label !== "ALL").map((tab) => Number(tab.key)));
    }

    const changeColor = (idx, color) => {
        const newTabItemsCopy = [...tabItems];
        newTabItemsCopy[idx].color = color;
        changeTabItems(newTabItemsCopy);
    }

    return {tabItems, setDefaultTabs, changeTabs, changeColor, colorOrder, changeColorOrder};
};

export default useTabs;