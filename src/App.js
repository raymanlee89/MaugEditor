import React, { useState } from 'react';
import { Layout, Divider, Button, Tooltip, Switch, Modal } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './App.css';
import InputPage from './pages/InputPage';
import ViewPage from './pages/ViewPage';
import LinkPage from './pages/LinkPage';
import OutputPage from './pages/OutputPage';
import useLinks from './hooks/useLinks';
import useTabs from './hooks/usetTabs';
import { getLinks, getLinksGPT } from './api/linkCreation.api';

const { Header, Footer, Content } = Layout;
const stageNames = ["LaTeX Editing", "Links Creation", "Output"];

function App() {
  const [mode, changeMode] = useState(true); // AI mode
  const [stage, changeStage] = useState(0);
  const [loading, changeLoading] = useState(false);
  const [formula, changeFormula] = useState("\\displaystyle p_i = (p_{chipset} + \\sum^G_{g=1}p_g)\\cdot 1.59");
  const [prose, changeProse] = useState("Every 10 seconds, the total instantaneous power usage $p_i$, in watts, is computed as the sum of those of your chipset $p_{chipset}$(CPU and DRAM) and graphics cards $p_g$, multiplied by a PUE coefficient (default value at 1.59[Ascierto 2020]) that adjusts for electricity used by other resources like cooling and lighting.");
  const [formulaFontSize, changeFormulaFontSize] = useState(3);
  const [suggestedLinks, changeSuggestedLinks] = useState([]); 
  const {links, linkIdx, changeLinkIdx, setSuggestedLinkArray, changeLinkArray, changeTermsInLink, changeSymbolsInLink} = useLinks();
  // Warning: the label of tab is different from the link idx in links
  const {tabItems, setDefaultTabs, changeTabs, changeColor} = useTabs();

  return (
    <Layout style={{ height: "100vh", width: "100vw"}}>
      <Header className='horizontal' style={{ color: "white", fontSize: "2em" }}>
        <div>MaugVLink</div>
        <div style={{ width: "30px"}}/>
        <Switch 
          checkedChildren="AI"
          unCheckedChildren="Manual"
          checked={mode}
          onChange={(checked) => {
          changeMode(checked)
            if(stage === 1){
              changeSuggestedLinks([]);
              changeLinkArray("clear");
              changeTabs("clear");
            }
          }}
          disabled={stage === 2}
        />
        <div className='push'></div>
        <div>{stageNames[stage]}</div>
      </Header>
      <Content className='horizontal'>
        {(() => {
          switch (stage) {
            case 0:
              return <InputPage formula={formula} changeFormula={changeFormula} prose={prose} changeProse={changeProse}/>;
            case 1:
            case 2:
              return <ViewPage stage={stage} formula={formula} prose={prose}
                formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                suggestedLinks={suggestedLinks} setSuggestedLinkArray={setSuggestedLinkArray}
                links={links} linkIdx={linkIdx} changeLinkIdx={changeLinkIdx} changeTermsInLink={changeTermsInLink} changeSymbolsInLink={changeSymbolsInLink}
                tabItems={tabItems} changeColor={changeColor}/>;
            default:
              return <div className='page vertical'></div>;
          }
        })()}
        <Divider style={{ height: "100%" }} type="vertical"/>
        {(() => {
          switch (stage) {
            case 0:
              return <ViewPage stage={stage} formula={formula} prose={prose}
                formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                suggestedLinks={suggestedLinks} setSuggestedLinkArray={setSuggestedLinkArray}
                links={links} linkIdx={linkIdx} changeLinkIdx={changeLinkIdx} changeTermsInLink={changeTermsInLink} changeSymbolsInLink={changeSymbolsInLink}
                tabItems={tabItems} changeColor={changeColor}/>;
            case 1:
              return <LinkPage formula={formula} links={links} linkIdx={linkIdx}
                changeLinkIdx={changeLinkIdx} changeLinkArray={changeLinkArray}
                changeTermsInLink={changeTermsInLink} changeSymbolsInLink={changeSymbolsInLink}
                tabItems={tabItems} changeTabs={changeTabs}/>;
            case 2:
              return <OutputPage formula={formula} prose={prose} links={links} tabItems={tabItems}/>;
            default:
              return <div className='page vertical'></div>;
          }
        })()}
      </Content>
      <Footer className='horizontal'>
        <Tooltip title="Return">
          <Button
            shape="circle" icon={<ArrowLeftOutlined />} style={{ scale: "150%" }} disabled={stage === 0} loading={loading}
            onClick={() => {
              if(stage === 1){
                changeSuggestedLinks([]);
                changeLinkArray("clear");
                changeTabs("clear");
              }
              changeStage(stage-1);
            }}
          />
        </Tooltip>
        <div className='push'></div>
        <Tooltip title="Next">
          <Button
            shape="circle" icon={<ArrowRightOutlined />} style={{ scale: "150%" }} disabled={stage === 2} loading={loading}
            onClick={async () => {
              if(stage === 0 && mode){
                console.log("call getLinks");
                try {
                  changeLoading(true);
                  // get suggestedLinks from the backend
                  let res = await getLinks(formula, prose);
                  // use GPT if NER & RE cannot handle the prose
                  if(res.length === 0){
                    console.log("use GPT");
                    res = await getLinksGPT(formula, prose);
                  }
                  console.log("suggestedLinks:", res);
                  // set the suggested links as the default links
                  if(res.length > 0){
                    changeSuggestedLinks(res);
                    setDefaultTabs(res.length);
                  }
                  // go to the next page
                  changeLoading(false);
                  changeStage(stage+1);
                } catch (e) {
                  console.error(e);
                  // show the warning Modal
                  Modal.warning({
                    title: 'Cannot connect to the backend!',
                    content: 'MaugEditor will switch to the Manual mode automatically.',
                    footer: (_, { OkBtn }) => (
                      <OkBtn/>
                    ),
                    onOk() {
                      changeLoading(false);
                      changeStage(stage+1);
                      changeMode(false);
                    }
                  });
                }
              }else{
                changeStage(stage+1);
              }
            }}
          />
        </Tooltip>
      </Footer>
    </Layout>
  );
}

export default App;
