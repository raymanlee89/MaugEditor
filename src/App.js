import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Checkbox, Divider, Button, Tooltip, Switch, Modal, Steps } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './App.css';
import InputPage from './pages/InputPage';
import ExtractionPage from './pages/ExtractionPage';
import OutputPage from './pages/OutputPage';
import OutputViewPage from './pages/OutputViewPage';
import EditViewPage from './pages/EditViewPage';
import useLinks from './hooks/useLinks';
import useTabs from './hooks/usetTabs';
import useConvesation from './hooks/useConvesation';
import { getLinks, getLinksGPT } from './api/linkCreation.api';

const { Header, Footer, Content } = Layout;
const optionNames = ["Prose", "Bullet points"];

function App() {
  const [useSymlink, changeSymlink] = useState(true);
  const [mode, changeMode] = useState(true); // AI mode
  const [stage, changeStage] = useState(0);
  const [loading, changeLoading] = useState(false);
  const [options, changeOptions] = useState([true, true]);
  const [formula, changeFormula] = useState("\\displaystyle p_i = (p_{chipset} + \\sum^G_{g=1}p_g)\\cdot 1.59");
  const [prose, changeProse] = useState("Every 10 seconds, the total instantaneous power usage $p_i$, in watts, is computed as the sum of those of your chipset $p_{chipset}$(CPU and DRAM) and graphics cards $p_g$, multiplied by a PUE coefficient (default value at 1.59[Ascierto 2020]) that adjusts for electricity used by other resources like cooling and lighting.");
  const [formulaFontSize, changeFormulaFontSize] = useState(3);
  const [suggestedLinks, changeSuggestedLinks] = useState([]);
  const {links, linkIdx, changeLinkIdx, setSuggestedLinkArray, changeLinkArray, changeTermsInLink, changeSymbolsInLink} = useLinks();
  // Warning: the label of tab is different from the link idx in links
  const {tabItems, setDefaultTabs, changeTabs, changeColor, colorOrder, changeColorOrder} = useTabs();
  // for Slide, linkElement = {compositeSymbols: "", definitions: "", linkIdx: 0}
  const [linkElements, changeLinkElements] = useState([]);
  // for saving conversation with AI
  const {conversationQueue, addConversationPair, addInitialResponse, rollBackConversation, fixConversationLinkIdx} = useConvesation();
  
  // Reset colorOrder
  useEffect(() => {
    if(stage === 1){
      changeColorOrder(tabItems.filter((item) => item.label !== "ALL").map((item) => Number(item.key)));
    }
  }, [stage])

  // Set suggestedLinks to real links
  useEffect(() => {
    // If suggestedLinks is empty, skip this step
    if(suggestedLinks.length === 0 || stage !== 1){
      return;
    }
    setSuggestedLinkArray(suggestedLinks, prose, formula, document);
    changeSuggestedLinks([]);
  }, [suggestedLinks]);

  // call getLinks
  const callGetLinks = async (formula, prose) => {
    console.log("call getLinks");
    changeLoading(true);

    // get suggestedLinks from the backend
    let res = {links: [], rawString: ""};
    if(useSymlink){
      res = await getLinks(formula, prose);
    }

    if(res !== "Api fail!!"){
      // use GPT if NER & RE cannot handle the prose
      if(res.links.length === 0){
        console.log("use GPT");
        res = await getLinksGPT(formula, prose, []);
      }
      addInitialResponse("links", -1, res.rawString, [{terms: [], symbols: []}]);
      console.log("suggestedLinks", res.links);
      
      // set the suggested links as the default links
      changeSuggestedLinks(res.links);
      setDefaultTabs(res.links.length);
      // go to the next page
      changeLoading(false);
      changeStage(stage+1);
    }else{
      // show the warning Modal
      Modal.warning({
        title: 'Cannot connect to the backend!',
        content: 'MaugEditor will switch to the Manual mode automatically.',
        footer: (_, { OkBtn }) => (
          <OkBtn/>
        ),
        onOk() {
          // go to the next page
          changeLoading(false);
          changeStage(stage+1);
          changeMode(false);
        }
      });
    }
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            bodyBg: "#FFFFFF",
            headerBg: "#525252"
          },
          // Divider: {
          //   colorSplit: "rgba(5, 5, 5, 0.1)"
          // }
        }
      }}
    >
      <Layout style={{ height: "100vh", width: "100vw"}}>
        <Header className='horizontal' style={{ color: "white", fontSize: "2em" }}>
          <div>DefExtractor</div>
          <div style={{ width: "30px"}}/>
          <Switch 
            checkedChildren="AI"
            unCheckedChildren="Manual"
            checked={mode}
            onChange={(checked) => changeMode(checked)}
            disabled={stage === 2}
          />
          {/* <Switch 
            checkedChildren="Symlink first"
            unCheckedChildren="Direct GPT"
            checked={useSymlink}
            onChange={(checked) => changeSymlink(checked)}
            disabled={stage === 2}
          /> */}
          {stage === 2 ? 
            options.map((item, idx) => (
              <>
                <div style={{ width: "30px"}}/>
                <Checkbox style={{ color: "white" }} checked={item} onChange={(e) => {
                  let newOptions = [...options];
                  newOptions[idx] = e.target.checked;
                  changeOptions(newOptions);
                }}>{optionNames[idx]}</Checkbox>
              </>
            ))
          : <></>}
        <div className='push'></div>
        </Header>
        <Content className='horizontal'>
          {(() => {
            switch (stage) {
              case 0:
                return (
                  <>
                    <div className='page vertical'>
                      <InputPage formula={formula} changeFormula={changeFormula} prose={prose} changeProse={changeProse}/>
                    </div>
                    <Divider style={{ height: "100%" }} type="vertical"/>
                    <div className='page vertical'>
                      <EditViewPage formula={formula} prose={prose} formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}/>
                    </div>
                  </>
                )
              case 1:
                return (
                  <div className='fullPage vertical'>
                    <ExtractionPage mode={mode} stage={stage} options={options} formula={formula} prose={prose}
                      formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                      linkIdx={linkIdx} changeLinkIdx={changeLinkIdx} setSuggestedLinkArray={setSuggestedLinkArray}
                      links={links} changeTermsInLink={changeTermsInLink} changeSymbolsInLink={changeSymbolsInLink} changeLinkArray={changeLinkArray}
                      tabItems={tabItems} setDefaultTabs={setDefaultTabs} changeTabs={changeTabs} changeColor={changeColor}
                      linkElements={linkElements} changeLinkElements={changeLinkElements}
                      colorOrder={colorOrder} changeColorOrder={changeColorOrder}
                      conversationQueue={conversationQueue} addConversationPair={addConversationPair} addInitialResponse={addInitialResponse}
                      rollBackConversation={rollBackConversation} fixConversationLinkIdx={fixConversationLinkIdx}
                      />
                  </div>
                )
              case 2:
                return (
                  <>
                    <div className='page vertical'>
                      <OutputViewPage stage={stage} options={options} formula={formula} prose={prose}
                        formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}
                        links={links} tabItems={tabItems} changeColor={changeColor}
                        linkElements={linkElements} changeLinkElements={changeLinkElements}
                        colorOrder={colorOrder} changeColorOrder={changeColorOrder}/>
                  </div>
                    <Divider style={{ height: "100%" }} type="vertical"/>
                    <div className='page vertical'>
                      <OutputPage options={options} formula={formula} prose={prose}
                        links={links} linkElements={linkElements}
                        tabItems={tabItems} colorOrder={colorOrder}/>
                    </div>
                  </>
                )
              default:
                return <div className='box'></div>;
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
                changeLinkIdx(-1);
                changeStage(stage-1);
              }}
            />
          </Tooltip>
          <Steps
            size="small"
            progressDot
            current={stage}
            labelPlacement="vertical"
            style={{ marginLeft: "30%", marginRight: "30%" }}
            items={[
              { title: 'Formula Editing' },
              { title: 'Pair Extraction' },
              { title: 'Output Design' }
            ]}
          />
          <Tooltip title="Next">
            <Button
              shape="circle" icon={<ArrowRightOutlined />} style={{ scale: "150%" }} disabled={stage === 2} loading={loading}
              onClick={async () => {
                if(stage === 0 && mode){
                  callGetLinks(formula, prose);
                }else{
                  changeStage(stage+1);
                }
              }}
            />
          </Tooltip>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
