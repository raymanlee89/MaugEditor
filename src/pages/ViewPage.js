import { useEffect } from 'react';
import FormulaView from '../components/FormulaView';
import ProseView from '../components/ProseView';
import ColorBar from '../components/ColorBar';
import { getNodeClassName, changeNodeColor } from '../functions/formulaNode';
import { Divider } from 'antd';

function ViewPage({mode, formula, prose, formulaFontSize, changeFormulaFontSize, links, linkIdx, changeTermsInLink, changeSymbolsInLink, tabItems, changeColor}) {
  // change alpha in a hex color
  const addAlpha = (color, opacity) => {
    // coerce values so ti is between 0 and 1.
    var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }

  useEffect(() => {
    // clean color (terms + HTML symbols + SVGs)
    const defaultColorNodes = [...document.querySelectorAll("link_")]
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
        if(className?.includes("disabled") && mode === 1){
          changeNodeColor(i, addAlpha(item.color, 0.4));
        }else{
          changeNodeColor(i, item.color);
        }
      });
    });
  }, [mode, tabItems, links, linkIdx]);

  return(
    <div className='page vertical'>
      {mode !== 0 ? <div style={{ height: "50px" }}></div> : <></>}
      <FormulaView mode={mode} formula={formula}
        formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
        links={links} linkIdx={linkIdx} changeSymbolsInLink={changeSymbolsInLink}/>
      <Divider />
      <ProseView mode={mode} prose={prose}
        links={links} linkIdx={linkIdx} changeTermsInLink={changeTermsInLink}/>
      {mode !== 0 ? <ColorBar tabItems={tabItems} changeColor={changeColor}/> : <></>}
    </div>
  );
}

export default ViewPage;