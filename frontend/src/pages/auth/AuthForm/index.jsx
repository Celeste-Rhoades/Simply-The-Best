import { useState } from "react";
import Field from "./Field";

const AuthForm = (props) => {
  const { fields, submitButtonLabel, onSubmit } = props;
  const [values, setValues] = useState(() => {
    const initialState = {};
    for (let field of fields) {
      initialState[field.label] = "";
    }
    return initialState;
  });
const [loading, setLoading] = useState(false)
  return (
    <form className="p-4 m-4 bg-white border rounded-lg border-slate-200" onSubmit={async (e) => {
      e.preventDefault()
      setLoading(true)
     await onSubmit(values)
      setLoading(false)
    }}
    >
      {fields.map((field) => (
        <Field 
          key={field.label}
          label={field.label} 
          type={field.type}
          value={values[field.label]}
          onChange={(e) => {
            setValues({ ...values, [field.label]: e.target.value });
          }}
        />
      ))}
      <button className="w-full py-2 mt-4 text-white rounded-lg bg-lighTeal relative" type="submit">
        {submitButtonLabel}
        {loading && 
        <div className="absolute top-0 right-4 flex items-center h-full ">
        <i className="text-xl fa-solid fa-spinner text-[#dfcd3] animate-spin "></i>
        </div>
        }
      </button>
    </form>
  );
};

export default AuthForm;
