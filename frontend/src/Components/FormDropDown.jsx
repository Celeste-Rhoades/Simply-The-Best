import NavBar from "./NavBar";

const FormDropDown = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-[#f6f5f2]">
      <div className="">
        <form className="flex flex-col items-center">
          <input></input>
          <select name="category " className="m-4 border">
            <option>-- Please Select Option--</option>
            <option value="movie">Movies</option>
            <option value="tvShows">Tv Shows</option>
            <option value="books">Books</option>
            <option value="videoGames">Video Games</option>
            <option value="podcasts">Podcasts</option>
            <option value="music">Music</option>
            <option value="recipes">Recipes</option>
            <option value="youTube">You Tube</option>
            <option value="restaurants">Restaurants</option>
            <option value="BetterThanAllTheRest">
              Better Than all the Rest
            </option>
            <option value="other">Other</option>
          </select>
          <button className="w-24 rounded-full bg-[#006895] text-white">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormDropDown;
