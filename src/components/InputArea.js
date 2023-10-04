import { Input } from 'antd';

const { TextArea } = Input;

function InputArea({type, defaultValue, onChange}) {
  return (
    <div className='element'>
      <p>{type}</p>
      <TextArea autoSize={{ minRows: 4 }} allowClear defaultValue={defaultValue} onChange={(e) => onChange(e.target.value)}/>
    </div>
  );
}

export default InputArea;