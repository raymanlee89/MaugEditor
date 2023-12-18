import { Button } from 'antd';
import Latex from '../react-latex/latex';
import '../katex/katex.css';
import { createParagraphs, creatTerms } from '../functions/proseToTerms';

function ProseView({stage, prose, links, linkIdx, changeTermsInLink}) {
    // handle click on term
    const termOnClick = (term) => {
        // console.log("termOnClick", term);
        if(links[linkIdx].terms.find(item => item.start === term.start)){
            changeTermsInLink("remove", term);
        }else{
            changeTermsInLink("add", term);
        }
        // console.log("changeTermsInLink", links[linkIdx].terms);
    }

    // if the term is picked in this link
    const isPicked = (idx, term) => {
        return links[idx]?.terms.find(item => item.start === term.start);
    }

    // if the term is picked in other link
    const isPickedInOtherLink = (term) => {
        let result = false;
        for(let i=0 ; i<links.length ; i++){
            if(i === linkIdx){
                continue;
            }
            if(isPicked(i, term)){
                result = true;
                break;
            }
        }
        return result;
    }

    // get link idx for a term
    const getLinkIdx = (term) => {
        for(let i=0 ; i<links.length ; i++){
            if(isPicked(i, term)){
                return i
            }
        }
        return "";
    }

    return(
        <div className='element'>
            {(() => {
                let pStart = 0;
                switch (stage) {
                    case 0:
                        return <Latex>{prose}</Latex>
                    case 1:
                        return (createParagraphs(prose).map((paragraph) => {
                            pStart += paragraph.length + 1;
                            return (
                                <div>
                                    {creatTerms(paragraph, pStart - paragraph.length - 1).map((item, i) => (
                                        <Button
                                            className={`link_${getLinkIdx(item)}${isPickedInOtherLink(item) ? " disabled": ""}`}
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
                                            disabled={isPickedInOtherLink(item)}
                                        >
                                            <Latex>{item.text}</Latex>
                                        </Button>
                                    ))}
                                </div>
                            )
                        }))
                    case 2:
                        return (
                            <div className='vertical termsContainer'>
                                {createParagraphs(prose).map((paragraph) => {
                                    pStart += paragraph.length + 1;
                                    return (
                                        <div className='horizontal termsContainer'> 
                                            {creatTerms(paragraph, pStart - paragraph.length - 1).map((item, i) => (
                                                <div className={`term link_${getLinkIdx(item)}`} key={`prose_${i}`}>
                                                    <Latex>{item.text}</Latex>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    default:
                        return <div className='page vertical'></div>;
            }})()}
        </div>
    );
}

export default ProseView;