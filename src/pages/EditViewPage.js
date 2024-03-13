import Latex from '../react-latex/latex';
import StaticFormulaView from '../components/StaticFormulaView';

function EditViewPage({ formula, prose, formulaFontSize, changeFormulaFontSize }) {
    return(
        <div className='box'>
            <StaticFormulaView formula={formula} formulaFontSize={formulaFontSize} changeFormulaFontSize={changeFormulaFontSize}/>
            <div style={{ height: "20px" }}></div>
            <div className='element'>
                <Latex>{prose}</Latex>
            </div>
        </div>
    );
}

export default EditViewPage;