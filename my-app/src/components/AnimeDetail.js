import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, getDocs, collection, where, query } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from './firebase';
import './Styles/AnimeDetails.css';
import { MdOutlineIosShare } from "react-icons/md";

const AnimeDetail = () => {
    const { id } = useParams();
    const [anime, setAnime] = useState(null);
    const [error, setError] = useState(null);
    const [collections, setCollections] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUniqueID, setSelectedUniqueID] = useState('');
    const { currentUser } = useAuth();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        fetchAnimeDetails();
        if (currentUser) {
            fetchUserCollections();
        }
    }, [id, currentUser]);

    const fetchAnimeDetails = async () => {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}. Try refreshing!`);
            }
            const data = await response.json();
            setAnime(data.data);
        } catch (error) {
            setError("Failed to load anime details. Please try again later.");
        }
    };

    const fetchUserCollections = async () => {
        if (!currentUser) {
            setError('User not logged in');
            return;
        }

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const collectionIDs = userSnap.data().savedCollections || [];
                const collectionsData = []
                    collectionIDs.map(async (id) => {
                        const collectionRef = doc(db, 'collections', id);
                        const collectionRefSnap = (await getDoc(collectionRef)).data()

                        

                        let currCollection = {
                            name: collectionRefSnap.name || "Unnamed Collection",
                            uniqueID: collectionRefSnap.uniqueID
                        };

                        collectionsData.push(currCollection);
                    })

                    console.log(collectionsData)
                setCollections(collectionsData);
            } else {
                setError("User collections not found.");
            }
        } catch (error) {
            setError("Failed to load collections. Please try again later.");
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleAddToCollection = async () => {

        
        console.log(selectedUniqueID);

        if (!selectedUniqueID) {
            alert("Please select a collection to add this anime.");
            return;
        }

        try {

            const collectionRef = doc(db, 'collections', selectedUniqueID);

            const animeData = {
                mal_id: anime.mal_id,
                title: anime.title,
                image_url: anime.images.jpg.image_url,
                episodes: anime.episodes,
                year: anime.aired?.prop.from.year
            };

            console.log("1");

            await updateDoc(collectionRef, {
                animes: arrayUnion(animeData)
            });

            console.log("1");

            handleCloseModal();
        } catch (error) {
            alert("Failed to add anime to the collection. Please try again later.");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUniqueID('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch(() => {
                setError("Failed to copy URL.");
            });
    };

    if (error) return <p className="error-message">Error: {error}</p>;
    if (!anime) return <p>Loading anime details...</p>;

    return (
        <div className="anime-details">
            <div className="anime-content">
                <img
                    src={anime.images?.jpg?.image_url || "path/to/fallback/image.jpg"}
                    alt={anime.title}
                />
                <div className="anime-info">
                    <h2 className="animeTitle">{anime.title}</h2>
                    <p>
                        <strong>Start Date:</strong> {anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString() : "Unknown"}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <strong>End Date:</strong> {anime.aired?.to ? new Date(anime.aired.to).toLocaleDateString() : "Ongoing"}
                    </p>
                    <p><strong>Episodes:</strong> {anime.episodes ? anime.episodes : "Unknown"}</p>
                    <p><strong>Genres:</strong> {anime.genres.map(genre => genre.name).join(", ")}</p>
                    <p><strong>Synopsis:</strong> {anime.synopsis}</p>
                </div>
                <div className="share-button" onClick={handleCopy} style={{ cursor: 'pointer' }}>
                    <MdOutlineIosShare size={35} />
                    {isCopied && <span className="copy-feedback">Copied!</span>}
                </div>
            </div>
            <div className="add-to-collection">
                <button className="collectionButton" onClick={handleOpenModal}>Add to Collection</button>
            </div>
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="anime-detail-modal">
                        <h3>Select a Collection</h3>
                        {collections.length > 0 ? (
                            <select onChange={(e) => setSelectedUniqueID(e.target.value)}>
                                <option value="">Select a Collection</option>
                                {collections.map((collection) => (
                                    <option key={collection.uniqueID} value={collection.uniqueID}>
                                        {collection.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p>No collections available to add this anime. Create a collection first.</p>
                        )}
                        <div className="modal-actions">
                            <button className="AddtoCollection" onClick={handleAddToCollection} >
                                Add to Collection
                            </button>
                            <button className="closeButton" onClick={handleCloseModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimeDetail;
