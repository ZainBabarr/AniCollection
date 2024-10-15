// Search.js
import React from 'react';
import AnimeGrid from './AnimeGrid';

const Search = ({ animeList }) => {
    return (
        <div className="search-results">
            <h2>Search Results</h2>
            <AnimeGrid animeList={animeList} />
        </div>
    );
};

export default Search;
