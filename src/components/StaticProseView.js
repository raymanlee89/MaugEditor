import Latex from '../react-latex/latex';
import '../katex/katex.css';
import { createParagraphs, creatTerms } from '../functions/proseToTerms';

function StaticProseView({prose, links}) {
    // if the term is picked in this link
    const isPicked = (idx, term) => {
        return links[idx]?.terms.find(item => item.start === term.start && item.end === term.end);
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

    return(
        <div className='element'>
            <div className='vertical termsContainer'>
                {(() => {
                    let pStart = 0;
                    return createParagraphs(prose).map((paragraph) => {
                        pStart += paragraph.length + 1;
                        return (
                            <div className='horizontal termsContainer'> 
                                {creatTerms(paragraph, pStart - paragraph.length - 1).map((item, i) => (
                                    <div className={`term ${createLinkMarks(item)}`} key={`prose_${i}`}>
                                        <Latex>{item.text}</Latex>
                                    </div>
                                ))}
                            </div>
                        )
                    })
                })()}
            </div>
        </div>
    );
}

export default StaticProseView;