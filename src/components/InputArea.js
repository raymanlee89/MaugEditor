import { Input } from 'antd';

const { TextArea } = Input;
const placeholders = { "Formula": "LaTeX only", "Explanatory Prose":"Use $$ to wrap LaTeX mathematical symbols" };

function InputArea({type, defaultValue, onChange}) {
    return (
        <div className='element'>
            <p>{type}</p>
            <TextArea placeholder={placeholders[type]} autoSize={{ minRows: 4 }} allowClear defaultValue={defaultValue} onChange={(e) => onChange(e.target.value)}/>
        </div>
    );
}

export default InputArea;