import React, { useState } from 'react';
import { Layout, Divider, Button, Tooltip } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './App.css';
import InputPage from './pages/InputPage';
import ViewPage from './pages/ViewPage';
import LinkPage from './pages/LinkPage';
import OutputPage from './pages/OutputPage';
import useLinks from './hooks/useLinks';
import useTabs from './hooks/usetTabs';

const { Header, Footer, Content } = Layout;
const modeNames = ["LaTeX Editing", "Visual Link Creation", "Output"];

function App() {
  const [mode, changeMode] = useState(0);
  const [formula, changeFormula] = useState("c^2 = a^2 + b^2");
  const [prose, changeProse] = useState("When an object spans perpendicular directions, its area is the combined area of each part.");
  const {links, linkIdx, changeLinkIdx, changeLinkArray, changeTermsInLink, changeSymbolsInLink} = useLinks();
  // Warning: the label of tab is different from the link idx in links
  const {tabItems, changeTabs, changeColor} = useTabs();

  return (
    <Layout style={{ height: "100vh", width: "100vw"}}>
      <Header className='horizontal' style={{ color: "white", fontSize: "2em" }}>
        <div>MaugEditor</div>
        <div className='push'></div>
        <div>{modeNames[mode]}</div>
      </Header>
      <Content className='horizontal'>
        {(() => {
          switch (mode) {
            case 0:
              return <InputPage formula={formula} changeFormula={changeFormula} prose={prose} changeProse={changeProse}/>;
            case 1:
            case 2:
              return <ViewPage mode={mode} formula={formula} prose={prose} links={links} linkIdx={linkIdx}
                changeTermsInLink={changeTermsInLink} changeSymbolsInLink={changeSymbolsInLink}
                tabItems={tabItems} changeColor={changeColor}/>;
            default:
              return <div className='page vertical'></div>;
          }
        })()}
        <Divider style={{ height: "100%" }} type="vertical"/>
        {(() => {
          switch (mode) {
            case 0:
              return <ViewPage mode={mode} formula={formula} prose={prose} links={links} linkIdx={linkIdx}
                changeTermsInLink={changeTermsInLink} changeSymbolsInLink={changeSymbolsInLink}
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
            shape="circle" icon={<ArrowLeftOutlined />} style={{ scale: "150%" }} disabled={mode === 0}
            onClick={() => {
              if(mode === 1){
                changeLinkArray("clear");
                changeTabs("clear");
              }
              changeMode(mode-1);
            }}
          />
        </Tooltip>
        <div className='push'></div>
        <Tooltip title="Next">
          <Button
            shape="circle" icon={<ArrowRightOutlined />} style={{ scale: "150%" }} disabled={mode === 2}
            onClick={() => {
              changeMode(mode+1);
            }}
          />
        </Tooltip>
      </Footer>
    </Layout>
  );
}

export default App;
