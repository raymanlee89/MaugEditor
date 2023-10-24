// deal with the difference in the usage between SVG node and HTML node
export const getNodeClassName = (node) => {
    if(node instanceof SVGElement){
        let className = node.getAttribute("class");
        if(className === null){
            className = "";
        }
        return className;
    }else{
        return node.className;
    }
}

export const changeNodeClassName = (type, node, classToken) => {
    let newClassName = getNodeClassName(node);
    
    switch (type) {
        case "add":
            newClassName = newClassName.concat(" " + classToken);
            break;
        case "remove":
            newClassName = newClassName.replace(" " + classToken, "");
            break;
        default:
            console.log("No such type in changeClassName");
    }

    if(node instanceof SVGElement){
        node.setAttribute("class", newClassName);
    }else{
        node.className = newClassName;
    }
}

export const getNodeColor = (node) => {
    if(node instanceof SVGElement){
        return node.style.fill;
    }else{
        return node.style.color;
    }
}

export const changeNodeColor = (node, newColor) => {
    if(node instanceof SVGElement){
        node.style.fill = newColor;
    }else{
        node.style.color = newColor;
    }
}