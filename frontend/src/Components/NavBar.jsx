import logo1 from "../images/logo1.png";

const NavBar = () => {
  return (
    <nav>
      <div className="flex w-full items-center justify-center border-b border-slate-400 shadow-xl bg-[#1fa5b0] py-8 ">
        <img className="m-4 w-14 rounded-md shadow-md" src={logo1} />
        <div className="text-4xl text-white ">Simply The Best</div>
      </div>
    </nav>
  );
};

export default NavBar;
