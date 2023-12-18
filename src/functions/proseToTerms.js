// split prose into paragraphs
export const createParagraphs = (prose) => {
    return prose.split('\n');
}

// split prose for the buttons => terms
// pStart is the start location of this paragraph
export const creatTerms = (prose, pStart) => {
    let mark = 0;
    let latexMode = false;
    let terms = [];
    let firstBracket = prose.indexOf("$");
    while (firstBracket !== -1) {
        const newItems = prose.substring(0, firstBracket).split(' ');
        for (let i = 0; i< newItems.length; i++){
            let item = newItems[i];
            let start = mark;
            let end = mark + item.length;
            if (latexMode) {
                terms.push({text: "$" + item + "$", start: pStart+start, end: pStart+end});
            }else{
                terms.push({text: item, start: pStart + start, end: pStart+end});
            }
            mark = end + 1;
        }
        prose = prose.substring(firstBracket + 1);
        firstBracket = prose.indexOf("$");
        
        if (latexMode) {
            latexMode = false;
        } else {
            latexMode = true;
        }
    };
    if(prose.length > 0){
        const newItems = prose.split(' ');
        newItems.forEach((item) => {
            let start = mark;
            let end = mark + item.length;
            terms.push({text: item, start: pStart+start, end: pStart+end});
            mark = end + 1;
        });
    };
    terms = terms.filter((item) => item.text !== "");
    // console.log(terms);
    return terms;
}