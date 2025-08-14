import NavBar from "shared-components/NavBar";

const MyRecommendations = () => {
  return (
    <div className="bg-lightTanGray h-screen">
      <NavBar />
      <div className="mx-8 mt-4 flex justify-end">
        <button className="bg-darkBlue rounded-md px-4 py-2 text-white shadow-lg">
          Add recommendation
        </button>
      </div>
      <div className="bg-cerulean m-12 rounded-md">I am a box</div>
    </div>
  );
};

export default MyRecommendations;
