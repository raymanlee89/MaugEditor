import { useEffect } from 'react';
import FormulaView from '../components/FormulaView';
import ProseView from '../components/ProseView';
import ColorBar from '../components/ColorBar';
import { Divider } from 'antd';

function ViewPage({mode, formula, prose, links, linkIdx, changeTermsInLink, changeSymbolsInLink, tabItems, changeColor}) {
  // change alpha in a hex color
  const addAlpha = (color, opacity) => {
    // coerce values so ti is between 0 and 1.
    var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }

  useEffect(() => {
    // clean color (SVGs)
    const defaultColorSVGs = [...document.querySelectorAll(".formulaView svg")];
    defaultColorSVGs.forEach((i) => {
      i.style.fill = "#000000e0";
    });
    // clean color (terms + symbols)
    const defaultColorNodes = [...document.getElementsByClassName("link_")].concat([...document.querySelectorAll(".formulaView .symbolNode")]).concat([...document.querySelectorAll(".formulaView .spanNode")]);
    defaultColorNodes.forEach((i) => {
      i.style.color = "#000000e0";
    });

    // draw color
    tabItems.forEach((item) => {
      const targetNodes = [...document.getElementsByClassName(`link_${item.key}`)];
      targetNodes.forEach((i) => {
        if(i instanceof SVGElement){
          let className = i.getAttribute("class");
          if(className?.includes("disabled") && mode === 1){
            i.style.fill = addAlpha(item.color, 0.4);
          }else{
            i.style.fill = item.color;
          }
        }else{
          if(i.className.includes("disabled") && mode === 1){
            i.style.color = addAlpha(item.color, 0.4);
          }else{
            i.style.color = item.color;
          }
        }
      });
    });
  }, [mode, tabItems, links, linkIdx]);

  return(
    <div className='page vertical'>
      {mode !== 0 ? <div style={{ height: "50px" }}></div> : <></>}
      <FormulaView mode={mode} formula={formula} links={links} linkIdx={linkIdx} changeSymbolsInLink={changeSymbolsInLink}/>
      <Divider />
      <ProseView mode={mode} prose={prose} links={links} linkIdx={linkIdx} changeTermsInLink={changeTermsInLink}/>
      {mode !== 0 ? <ColorBar tabItems={tabItems} changeColor={changeColor}/> : <></>}
    </div>
  );
}

export default ViewPage;