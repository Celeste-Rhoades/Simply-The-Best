import logo1 from "../images/logo1.png";

const NavBar = () => {
  return (
    <nav>
      <div className="flex w-full items-center border-b border-slate-400 shadow-xl bg-lighTeal py-8 justify-between p-12">
        <img className="m-4 w-14 rounded-md shadow-md" src={logo1} />
        <div className="text-4xl text-white ">Simply The Best</div>
        <div className="m-2 text-white"><a>Log In</a>
        <a className="m-10">Sign up</a>
        </div>
        
      </div>
    </nav>
  );
};

export default NavBar;
