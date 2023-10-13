// deal with the difference in the usage between SVG node and HTML node
const formulaNode = () => {
    const getClassName = (node) => {
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

    const changeClassName = (type, node, classToken) => {
        let newClassName = getClassName(node);
        
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

    const changeNodeColor = (node, newColor) => {
        if(node instanceof SVGElement){
        if(node.style.fill !== ""){
            node.style.fill = newColor;
        }
        }else{
            node.style.color = newColor;
        }
    }

    return {getClassName, changeClassName, changeNodeColor};
}

export default formulaNode;