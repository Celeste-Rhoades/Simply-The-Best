import beachPlease from '../../images/beachPlease.png';
import logo1 from '../../images/logo1.png';

const FormContainer = (props) => {
  const { children } = props;
  return (
    <div className="flex w-full">
      <div className="relative hidden md:flex">
        <img
          src={beachPlease}
          className="h-screen object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/15"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-darkBlue/10"></div>
      </div>

      <div className="flex flex-col justify-center items-center h-screen bg-lightTanGray flex-1">
        <div className="flex flex-col items-center mx-2 my-8">
          <img
            src={logo1}
            className="w-36 mb-4"
          />
          <div className="text-3xl text-lighTeal ">
           Simply the Best
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
export default FormContainer;