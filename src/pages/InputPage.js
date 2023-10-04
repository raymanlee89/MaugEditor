import InputArea from '../components/InputArea';
import { Divider } from 'antd';

function InputPage({formula, changeFormula, prose, changeProse}) {
  return(
    <div className='page vertical'>
      <InputArea type="Formula" defaultValue={formula} onChange={changeFormula}/>
      <Divider />
      <InputArea type="Prose" defaultValue={prose} onChange={changeProse}/>
    </div>
  );
}

export default InputPage;