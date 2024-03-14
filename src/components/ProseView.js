import { Button } from 'antd';
import Latex from '../react-latex/latex';
import '../katex/katex.css';
import { createParagraphs, creatTerms } from '../functions/proseToTerms';

function ProseView({prose, links, linkIdx, changeTermsInLink}) {
    // if the term is picked in this link
    const isPicked = (idx, term) => {
        return links[idx]?.terms.find(item => item.start === term.start && item.end === term.end);
    }

    // if the term is picked in other link and is not picked in this link
    const isPickedInOtherLink = (term) => {
        if(isPicked(linkIdx, term)){
            return false;
        }

        for(let i=0 ; i<links.length ; i++){
            if(isPicked(i, term)){
                return true;
            }
        }
        return false;
    }

    // create link marks
    const createLinkMarks = (term) => {
        let allLinkIdx = [];
        for(let i=0 ; i<links.length ; i++){
            if(isPicked(i, term)){
                allLinkIdx.push(i);
            }
        }

        let res = "";
        allLinkIdx.forEach((item) => {
            res = res + " link_" + item;
        })
        return res;
    }

    // handle click on term
    const termOnClick = (term) => {
        // terms are not selectable in ALL mode
        if(linkIdx === -1){
            return;
        }
        // console.log("termOnClick", term);
        if(isPicked(linkIdx, term)){
            changeTermsInLink("remove", term);
        }else{
            changeTermsInLink("add", term);
        }
        // console.log("changeTermsInLink", links[linkIdx].terms);
    }

    return(
        <div>
            {(() => {
                let pStart = 0;
                return createParagraphs(prose).map((paragraph) => {
                    pStart += paragraph.length + 1;
                    return (
                        <div className='termsContainer'>
                            {creatTerms(paragraph, pStart - paragraph.length - 1).map((item, i) => (
                                <Button
                                    className={`term ${createLinkMarks(item)}${isPickedInOtherLink(item) ? " disabled": ""}`}
                                    key={`prose_${i}`}
                                    type="text"
                                    style={{ padding: "0.3em"}}
                                    // onClick={() => termOnClick(item)}
                                    onMouseDown={({buttons}) => {
                                        if(buttons === 1){
                                            termOnClick(item);
                                        }
                                    }}
                                    onMouseEnter={({buttons}) => {
                                        if(buttons === 1){
                                            termOnClick(item);
                                        }
                                    }}
                                    // disabled={isPickedInOtherLink(item)}
                                >
                                    <Latex>{item.text}</Latex>
                                </Button>
                            ))}
                        </div>
                    )
                })
            })()}
        </div>
    );
}

export default ProseView;