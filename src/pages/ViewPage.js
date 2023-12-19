import { useEffect } from 'react';
import FormulaView from '../components/FormulaView';
import ProseView from '../components/ProseView';
import ColorBar from '../components/ColorBar';
import { getNodeClassName, changeNodeColor } from '../functions/formulaNode';
import { createParagraphs, creatTerms } from '../functions/proseToTerms';
import { Divider } from 'antd';

function ViewPage({stage, formula, prose, formulaFontSize, changeFormulaFontSize, defaultLinks, setDefaultLinkArray, links, linkIdx, changeTermsInLink, changeSymbolsInLink, tabItems, changeColor}) {
    // change alpha in a hex color
    const addAlpha = (color, opacity) => {
        // coerce values so ti is between 0 and 1.
        var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
        return color + _opacity.toString(16).toUpperCase();
    }

    // Modify colors in ViewPage
    useEffect(() => {
        // clean color (terms + HTML symbols + SVGs)
        const defaultColorNodes = [...document.getElementsByClassName("link_")]
            .concat([...document.querySelectorAll(".formulaView .symbolNode")])
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        defaultColorNodes.forEach((item) => {
            changeNodeColor(item, "#000000e0");
        });

        // draw color
        tabItems.forEach((item) => {
            const targetNodes = [...document.getElementsByClassName(`link_${item.key}`)];
            targetNodes.forEach((i) => {
                let className = getNodeClassName(i);
                if(className?.includes("disabled") && stage === 1){
                    changeNodeColor(i, addAlpha(item.color, 0.4));
                }else{
                    changeNodeColor(i, item.color);
                }
            });
        });
    }, [stage, tabItems, links, linkIdx]);

    // check if loc1 is in the loc2
    const isIn = (loc1, loc2) => {
        return loc2.start <= loc1.start && loc1.end <= loc2.end;
    }

    // Set defaultLinks to real links
    useEffect(() => {
        // If defaultLinks is empty, skip this step
        if(defaultLinks.length === 0){
            return;
        }

        // console.log("Set defaultLinks", defaultLinks);
        let newLinks = defaultLinks.map((item) => ({terms: [], symbols: []}));

        // select math node in FormulaView with defaultLinks
        // get all target symbols' locations in the formula
        let targetLocs = [];
        defaultLinks.forEach((item, defaultLinkIdx) => {
            let targetTexts = new Set();
            // make sure that the text is unique
            item.forEach((i) => {
                if(i.label === "SYMBOL"){
                    const text = prose.substring(i.start, i.end);
                    targetTexts.add(text);
                }
            })
            targetTexts.forEach((text) => {
                let startIdx = 0;
                let idx = formula.indexOf(text, startIdx);
                while (idx !== -1) {
                    targetLocs.push({
                        linkIdx: defaultLinkIdx,
                        text: text,
                        start: idx,
                        end: idx + text.length
                    });
                    startIdx = idx + text.length;
                    idx = formula.indexOf(text, startIdx);
                }
            })
        })
        console.log("targetLocs", targetLocs);

        // if the symbol is a substring in many composite symbols, keep the longest composite symbols
        targetLocs.sort((a, b) => a.text.length - b.text.length);
        let uniqueTargetLocs = []
        for(let i=0 ; i<targetLocs.length ; i++){
            let isUnique = true;
            for(let j=i+1 ; j<targetLocs.length ; j++){
                if(isIn(targetLocs[i], targetLocs[j])){
                    isUnique = false;
                    break;
                }
            }
            if(isUnique){
                uniqueTargetLocs.push(targetLocs[i]);
            }
        }
        console.log("uniqueTargetLocs", uniqueTargetLocs);

        // get all selectable math node
        const selectableMathNodes = [...document.querySelectorAll(".formulaView .symbolNode")]
            .concat([...document.querySelectorAll(".formulaView .spanNode")])
            .concat([...document.querySelectorAll(".formulaView .svgNode")]);
        // select math node in uniqueTargetLocs
        selectableMathNodes.forEach((item) => {
            const start = parseInt(item.getAttribute("data-source-location-start"));
            const end = parseInt(item.getAttribute("data-source-location-end"));
            uniqueTargetLocs.forEach((loc) => {
                if(isIn({start: start, end: end}, loc)){
                    newLinks[loc.linkIdx].symbols.push({
                        node: item,
                        text: formula.substring(start, end),
                        start: start,
                        end: end
                    });
                }
            })
        })

        // select term button in ProseView with defaultLinks
        let pStart = 0;
        createParagraphs(prose).forEach((paragraph) => {
            pStart += paragraph.length + 1;
            const terms = creatTerms(paragraph, pStart - paragraph.length - 1).map((item, i) => (item));
            terms.forEach((item) => {
                defaultLinks.forEach((link, idx) => {
                    link.forEach((i) => {
                        if(isIn(item, i)){
                            newLinks[idx].terms.push(item);
                        }
                    });
                });
            })
        })
        // console.log("newLinks", newLinks);
        setDefaultLinkArray(newLinks);
    }, [defaultLinks]);

    return(
        <div className='page vertical'>
            {stage !== 0 ? <div style={{ height: "50px" }}></div> : <></>}
            <FormulaView stage={stage} formula={formula}
                formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                links={links} linkIdx={linkIdx} changeSymbolsInLink={changeSymbolsInLink}/>
            <Divider />
            <ProseView stage={stage} prose={prose}
                links={links} linkIdx={linkIdx} changeTermsInLink={changeTermsInLink}/>
            {stage !== 0 ? <ColorBar tabItems={tabItems} changeColor={changeColor}/> : <></>}
        </div>
    );
}

export default ViewPage;