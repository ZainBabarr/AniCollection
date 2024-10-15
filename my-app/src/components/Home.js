import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/Home.css';
import { FaSearch } from "react-icons/fa";

const Home = () => {
    const [search, SetSearch] = useState("");
    const navigate = useNavigate();

    const HandleSearch = (e) => {
        e.preventDefault();
        if (search.trim() === "") {
            alert("Please enter a search term");
            return;
        }

        navigate(`/search?query=${encodeURIComponent(search)}`);
    };

    return (
        <div className="home">
            <div className="intro">
                <form className="search-box" onSubmit={HandleSearch}>
                    <input
                        type="search"
                        className="search-input"
                        placeholder="Search for anime..."
                        required
                        value={search}
                        onChange={(e) => SetSearch(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                        <FaSearch size={22} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;
