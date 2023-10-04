import CompositeSymbolsDisplay from '../components/CompositeSymbolsDisplay';
import DefinitionsDisplay from '../components/DefinitionsDisplay';
import { Divider, Tabs } from 'antd';

function LinkPage({formula, links, linkIdx, changeLinkIdx, changeLinkArray, changeTermsInLink, changeSymbolsInLink, tabItems, changeTabs}) {
    const onChange = (newActiveKey) => {
        const targetLinkIdx = Number(newActiveKey);
        // console.log("Change link", targetLinkIdx);
        if(targetLinkIdx < links.length){
            changeLinkIdx(targetLinkIdx);
        }else{
            console.log("targetLinkIdx is out of range");
        }
    }

    const onEdit = (targetKey, action) => {
        if (action === 'add') {
            // add new tab
            changeTabs("add", links.length);

            // add new link to links
            changeLinkArray("add");

            // change picked link
            changeLinkIdx(links.length);
        } else {
            const targetLinkIdx = Number(targetKey);
            changeTabs("remove", targetLinkIdx);

            // remove the target link in links
            changeLinkArray("remove", targetLinkIdx);

            // change picked link
            if(targetLinkIdx < linkIdx || targetLinkIdx === linkIdx){
                changeLinkIdx(linkIdx - 1);
            }
        }
    }

    return(
        <div className='page vertical'>
            <Tabs type="editable-card" tabPosition="top" onChange={onChange} activeKey={linkIdx.toString()} onEdit={onEdit} items={tabItems}/>
            <CompositeSymbolsDisplay formula={formula} pickedSymbols={links[linkIdx].symbols} changeSymbolsInLink={changeSymbolsInLink}/>
            <Divider />
            <DefinitionsDisplay pickedTerms={links[linkIdx].terms} changeTermsInLink={changeTermsInLink}/>
        </div>
    );
}

export default LinkPage;