import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/Search.css';
import { GoHeartFill } from "react-icons/go";
import { db } from './firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc, deleteDoc, collection } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';

const Search = () => {
    const [animeList, setAnimeList] = useState([]);
    const [likedAnimes, setLikedAnimes] = useState([]);
    const [error, setError] = useState(null);
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryParam = new URLSearchParams(window.location.search).get('query') || "";
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Fetch anime list from Jikan API based on search query
    useEffect(() => {
        const fetchAnime = async () => {
            if (!queryParam) return;

            try {
                const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(queryParam)}&limit=25`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setAnimeList(data.data);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setError(error.message);
                setAnimeList([]);
            }
        };

        const fetchUserData = async () => {
            if (!currentUser) return;

            try {
                // Fetch user document
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setLikedAnimes(userSnap.data().savedCollections || []);
                } else {
                    console.error("User document not found");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchAnime();
        fetchUserData();
    }, [queryParam, currentUser]);

    const toggleLike = async (anime) => {
        if (!currentUser) {
            setError("You need to log in to like an anime.");
            return;
        }

        const likedCollectionName = `liked-${currentUser.uid}`; // Name of the liked collection
        const collectionRef = doc(db, "collections", likedCollectionName); // Reference to the liked collection document

        try {
            // Fetch the current liked collection document
            const collectionSnap = await getDoc(collectionRef);

            const newAnimeData = {
                mal_id: anime.mal_id,
                title: anime.title,
                image_url: anime.images.jpg.image_url,
                episodes: anime.episodes,
                year: anime.aired?.prop.from.year
            };

            if (collectionSnap.exists()) {
                // If the collection exists, check the current liked animes
                const existingAnimes = collectionSnap.data().animes || [];

                if (existingAnimes.some(a => a.mal_id === anime.mal_id)) {
                    // If the anime is already liked, remove it from the array
                    const updatedAnimes = existingAnimes.filter(a => a.mal_id !== anime.mal_id);

                    // Update the Firestore document
                    await updateDoc(collectionRef, {
                        animes: updatedAnimes
                    });

                    // Update local state
                    setLikedAnimes(updatedAnimes);
                } else {
                    // If the anime is not liked, add it to the array
                    await updateDoc(collectionRef, {
                        animes: arrayUnion(newAnimeData) // Add new anime to the array
                    });

                    // Update local state
                    setLikedAnimes([...existingAnimes, newAnimeData]);
                }
            } else {
                // If the liked collection doesn't exist, create it
                await setDoc(collectionRef, {
                    animes: [newAnimeData] // Initialize with the new anime
                });

                // Update local state
                setLikedAnimes([newAnimeData]);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            setError("An error occurred while toggling like.");
        }
    };



    const isLiked = (animeId) => likedAnimes.some(anime => anime.mal_id === animeId);

    const handleAnimeClick = (anime) => navigate(`/anime/${anime.mal_id}`);

    const openCollectionModal = (anime) => {
        setSelectedAnime(anime);
        setIsModalOpen(true);
    };

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (animeList.length === 0) {
        return <p>Getting {queryParam}...</p>;
    }

    return (
        <div className="search-results">
            <h2 className="searchResultsFor">Search Results for "{queryParam}"</h2>
            <div className="anime-grid">
                {animeList.map(anime => (
                    <div key={anime.mal_id} className="anime-card">
                        <GoHeartFill
                            className="heart-icon"
                            style={{ color: isLiked(anime.mal_id) ? 'red' : '#007BFF' }}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering parent events (like card click)
                                toggleLike(anime); // Like or unlike the anime
                            }}
                        />
                        <img
                            src={anime.images.jpg.image_url}
                            alt={anime.title}
                            className="anime-image"
                            onClick={() => handleAnimeClick(anime)}
                        />
                        <h3 className="anime-title">{anime.title}</h3>
                        <p className="anime-detail">Episodes: {anime.episodes}</p>
                        <p className="anime-detail">Year: {anime.aired?.prop.from.year}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;
