import { useState } from "react";
import Field from "./Field";

const AuthForm = (props) => {
  const { fields, submitButtonLabel } = props;
  const [values, setValues] = useState(() => {
    const initialState = {};
    for (let field of fields) {
      initialState[field.label] = "";
    }
    return initialState;
  });

const handleSubmit = async(e) => {
e.preventDefault()
console.log(values)
const response = await fetch("http://localhost:5288/api/auth/login", {
  method: 'POST',
  body: JSON.stringify(values),
  headers: {
    "Content-Type": "application/json"
  },
  credentials:"include"

})
console.log(response)

}
  return (
    <form className="p-4 m-4 bg-white border rounded-lg border-slate-200" onSubmit={handleSubmit}
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
      <button className="w-full py-2 mt-4 text-white rounded-lg bg-lighTeal" type="submit">
        {submitButtonLabel}
      </button>
    </form>
  );
};

export default AuthForm;
