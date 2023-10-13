import { useEffect } from 'react';
import FormulaView from '../components/FormulaView';
import ProseView from '../components/ProseView';
import ColorBar from '../components/ColorBar';
import formulaNode from '../functions/formulaNode';
import { Divider } from 'antd';

function ViewPage({mode, formula, prose, formulaFontSize, changeFormulaFontSize, links, linkIdx, changeTermsInLink, changeSymbolsInLink, tabItems, changeColor}) {
  const { getClassName, changeNodeColor } = formulaNode();

  // change alpha in a hex color
  const addAlpha = (color, opacity) => {
    // coerce values so ti is between 0 and 1.
    var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }

  useEffect(() => {
    // clean color (SVGs + terms + symbols)
    const defaultColorNodes = [...document.querySelectorAll(".formulaView svg")].concat([...document.querySelectorAll(".formulaView .symbolNode")]).concat([...document.querySelectorAll(".formulaView .spanNode")]);
    defaultColorNodes.forEach((i) => {
      changeNodeColor(i, "#000000e0");
    });

    // draw color
    tabItems.forEach((item) => {
      const targetNodes = [...document.getElementsByClassName(`link_${item.key}`)];
      targetNodes.forEach((i) => {
        let className = getClassName(i);
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