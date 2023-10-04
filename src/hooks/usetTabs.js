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
        { label: 'Link 1', key: '0', closable: true, color: defaultColors[0] },
        { label: 'Link 2', key: '1', closable: true, color: defaultColors[1] },
        { label: 'Link 3', key: '2', closable: true, color: defaultColors[2] }
    ]);

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
                tabItemsCopy.forEach((item) => item.closable = true);
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
                    { label: 'Link 1', key: '0', closable: true, color: defaultColors[0] },
                    { label: 'Link 2', key: '1', closable: true, color: defaultColors[1] },
                    { label: 'Link 3', key: '2', closable: true, color: defaultColors[2] }
                ];
                break;
            default:
                console.log("No such type in changeTabs");
        }
        changeTabItems(tabItemsCopy);
    }

    const changeColor = (idx, color) => {
        const tabItemsCopy = [...tabItems];
        tabItemsCopy[idx].color = color;
        changeTabItems(tabItemsCopy);
    }

    return {tabItems, changeTabs, changeColor};
};

export default useTabs;