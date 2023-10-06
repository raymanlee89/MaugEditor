import { Button } from 'antd';
import Latex from '../react-latex/latex';
import '../katex/katex.css';

function ProseView({mode, prose, links, linkIdx, changeTermsInLink}) {
    // split prose into paragraphs
    const createParagraphs = (prose) => {
        return prose.split('\n');
    }

    // split prose for the buttons => terms
    const creatTerms = (prose) => {
        let copiedProse = prose;
        let mark = 0;
        let latexMode = false;
        let terms = [];
        let firstBracket = copiedProse.indexOf("$");
        while (firstBracket !== -1) {
            const newItems = copiedProse.substring(0, firstBracket).split(' ');
            for (let i = 0; i< newItems.length; i++){
                let item = newItems[i];
                let start = mark;
                let end = mark + item.length;
                if (latexMode) {
                    terms.push({text: "$" + item + "$", location: {start: start, end: end}});
                }else{
                    terms.push({text: item, location: {start: start, end: end}});
                }
                mark = end + 1;
            }
            copiedProse = copiedProse.substring(firstBracket + 1);
            firstBracket = copiedProse.indexOf("$");
            
            if (latexMode) {
                latexMode = false;
            } else {
                latexMode = true;
            }
        };
        if(copiedProse.length > 0){
            const newItems = copiedProse.split(' ');
            newItems.forEach((item) => {
                let start = mark;
                let end = mark + item.length;
                terms.push({text: item, location: {start: start, end: end}});
                mark = end + 1;
            });
        };
        terms = terms.filter((item) => item.text !== "");
        // console.log(terms);
        return terms;
    }

    // handle click on term
    const termOnClick = (term) => {
        // console.log("termOnClick", term);
        if(links[linkIdx].terms.find(item => item.location.start === term.location.start)){
            changeTermsInLink("remove", term);
        }else{
            changeTermsInLink("add", term);
        }
        // console.log("changeTermsInLink", links[linkIdx].terms);
    }

    // if the term is picked in this link
    const isPicked = (idx, term) => {
        return links[idx]?.terms.find(item => item.location.start === term.location.start);
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

    // get link id for a term
    const getLinkId = (term) => {
        for(let i=0 ; i<links.length ; i++){
            if(isPicked(i, term)){
                return i
            }
        }
        return "";
    }

    return(
        <div className='element'>
            {(() => {switch (mode) {
                case 0:
                    return <Latex>{prose}</Latex>
                case 1:
                    return (createParagraphs(prose).map((paragraph) => (
                        <div>
                            {creatTerms(paragraph).map((item, i) => (
                                <Button
                                    className={`link_${getLinkId(item)}${isPickedInOtherLink(item) ? " disabled": ""}`}
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
                    )))
                case 2:
                    return (
                        <div className='vertical termsContainer'>
                            {createParagraphs(prose).map((paragraph) => (
                                <div className='horizontal termsContainer'> 
                                    {creatTerms(paragraph).map((item, i) => (
                                        <div className={`term link_${getLinkId(item)}`} key={`prose_${i}`}>
                                            <Latex>{item.text}</Latex>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )
                default:
                    return <div className='page vertical'></div>;
            }})()}
        </div>
    );
}

export default ProseView;