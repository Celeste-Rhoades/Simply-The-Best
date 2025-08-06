import beachPlease from "../../images/beachPlease.png";
import logo1 from "../../images/logo1.png";

const FormContainer = (props) => {
  const { children } = props;
  return (
    <div className="flex w-full">
      <div className="relative hidden md:flex">
        <img src={beachPlease} className="h-screen object-cover" />
        <div className="absolute top-0 left-0 h-full w-full bg-black/15"></div>
        <div className="bg-darkBlue/10 absolute top-0 left-0 h-full w-full"></div>
      </div>

      <div className="bg-lightTanGray flex h-screen flex-1 flex-col items-center justify-center">
        <div className="mx-2 my-8 flex flex-col items-center">
          <img src={logo1} className="mb-2 w-34" />
          <div className="text-lighTeal text-3xl">Simply the Best</div>
        </div>
        {children}
      </div>
    </div>
  );
};
export default FormContainer;
