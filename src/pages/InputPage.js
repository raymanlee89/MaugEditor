import InputArea from '../components/InputArea';

function InputPage({formula, changeFormula, prose, changeProse}) {
    return(
        <div className='box'>
            <InputArea type="Formula" defaultValue={formula} onChange={changeFormula}/>
            <InputArea type="Explanatory Prose" defaultValue={prose} onChange={changeProse}/>
        </div>
    );
}

export default InputPage;