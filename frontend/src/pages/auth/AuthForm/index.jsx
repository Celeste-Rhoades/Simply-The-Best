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
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="m-4 rounded-lg border border-slate-200 bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(values);
        setLoading(false);
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
      <button
        className="bg-cerulean relative mt-4 w-full rounded-lg py-2 text-white"
        type="submit"
      >
        {submitButtonLabel}
        {loading && (
          <div className="absolute top-0 right-4 flex h-full items-center">
            <i className="fa-solid fa-spinner animate-spin text-xl text-[#dfcd3]"></i>
          </div>
        )}
      </button>
    </form>
  );
};

export default AuthForm;
