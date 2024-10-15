import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from './firebase';
import { IoIosRemoveCircle } from 'react-icons/io';
import './Styles/CollectionDetail.css';

const CollectionDetail = () => {
    const { collectionId } = useParams();
    const { currentUser } = useAuth();
    const [collectionData, setCollectionData] = useState(null);
    const [animes, setAnimes] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedUUID, setCopiedUUID] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCollectionData();
    }, [currentUser, collectionId]);

    const fetchCollectionData = async () => {
        if (!currentUser) {
            console.error("No current user. Make sure you are logged in.");
            return;
        }

        try {
            const collectionRef = doc(db, "collections", collectionId);
            const collectionSnap = await getDoc(collectionRef);

            if (collectionSnap.exists()) {
                const collectionData = collectionSnap.data();

                setCollectionData({ id: collectionSnap.id, ...collectionData });

                if (Array.isArray(collectionData.animes)) {
                    const formattedAnimes = collectionData.animes.map(anime => ({
                        mal_id: anime.mal_id,
                        title: anime.title,
                        image: anime.image_url,
                        episodes: anime.episodes,
                        year: anime.year
                    }));
                    setAnimes(formattedAnimes);
                } else {
                    setAnimes([]);
                }
            } else {
                setError("Collection not found");
            }
        } catch (error) {
            setError("Failed to fetch collection data");
        }
    };

    const handleRemoveAnime = async (animeId) => {
        try {
            const collectionRef = doc(db, "collections", collectionId);
            const collectionSnap = await getDoc(collectionRef);

            if (collectionSnap.exists()) {
                const currentData = collectionSnap.data();
                const updatedAnimes = currentData.animes.filter(anime => anime.mal_id !== animeId);

                await updateDoc(collectionRef, { animes: updatedAnimes });

                setAnimes(updatedAnimes);
                setCollectionData(prevData => ({
                    ...prevData,
                    animes: updatedAnimes
                }));

                window.location.reload()
            } else {
                setError("Collection not found.");
            }
        } catch (error) {
            setError("Failed to remove anime.");
        }
    };

    const handleDeleteCollection = async () => {
        if (collectionData?.liked) {
            alert("You cannot delete a liked collection.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this collection?")) {
            try {
                const collectionRef = doc(db, "collections", collectionId);
                const uniqueID = collectionData.uniqueID;

                const usersSnapshot = await getDocs(collection(db, 'users'));
                const batch = writeBatch(db);

                usersSnapshot.forEach(userDoc => {
                    const userData = userDoc.data();
                    const userId = userDoc.id;

                    if (Array.isArray(userData.savedCollections)) {
                        const updatedSavedCollections = userData.savedCollections.filter(id => id !== collectionId);
                        batch.update(doc(db, 'users', userId), {
                            savedCollections: updatedSavedCollections
                        });
                    }

                    if (Array.isArray(userData.savedCollections)) {
                        const updatedSavedCollectionsWithUUID = userData.savedCollections.filter(id => id !== uniqueID);
                        batch.update(doc(db, 'users', userId), {
                            savedCollections: updatedSavedCollectionsWithUUID
                        });
                    }
                });

                await deleteDoc(collectionRef);
                await batch.commit();

                navigate('/collections');
            } catch (error) {
                setError("Failed to delete collection");
            }
        }
    };

    const handleCopyUUID = async () => {
        if (collectionData?.uniqueID) {
            try {
                await navigator.clipboard.writeText(collectionData.uniqueID);
                setCopiedUUID(true);
                setTimeout(() => setCopiedUUID(false), 3000);
            } catch (error) {
                setError("Failed to copy UUID");
            }
        } else {
            setError("UUID not found");
        }
    };

    // Open MyAnimeList link in a new tab
    const handleAnimeClick = (anime) => {
        console.log(anime)
        window.location.href = `/anime/${anime.mal_id}`;
    };

    return (
        <div className="collection-detail-page">
            {error && <p className="error-message">{error}</p>}
            {collectionData ? (
    <div>
        <h2 className="collection-title">{collectionData.name}</h2>
        <p className="collection-description">{collectionData.description}</p>

        {!collectionData.name?.toLowerCase().includes('liked') && (
            <>
                <button className="delete-collection-button" onClick={handleDeleteCollection}>
                    Delete Collection
                </button>
                <button className="share-collection-button" onClick={() => setIsModalOpen(true)}>
                    Share Collection
                </button>
            </>
        )}

        <div className="anime-grid">
            {animes.length > 0 ? (
                animes.map((anime) => (
                    <div key={anime.mal_id}>
                        <div className="anime-item" onClick={() => handleAnimeClick(anime)}>
                            <img src={anime.image} alt={anime.title} />
                            <p>{anime.title}</p>
                        </div>
                        <div>
                            <IoIosRemoveCircle
                                className="remove-anime-icon"
                                onClick={() => handleRemoveAnime(anime.mal_id)}
                                size={25}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <p>No animes in this collection.</p>
            )}
        </div>

        {isModalOpen && (
            <div className="modal-overlay">
                <div className="share-modal">
                    <h3>Share this Collection</h3>
                    <p>Share this collection by sending this CollectionID:</p>
                    <div className="uuid-container">
                        <span className="uuid-text">{collectionData.uniqueID}</span>
                        <button className="copy-button" onClick={handleCopyUUID}>
                            {copiedUUID ? "Copied!" : "Copy CollectionID"}
                        </button>
                    </div>
                    <button className="close-button" onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
            </div>
        )}
    </div>
) : (
    <p>Loading collection details...</p>
)}

        </div>
    );
};

export default CollectionDetail;
