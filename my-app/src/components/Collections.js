import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/Collections.css';
import { doc, collection, getDocs, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

const Collections = () => {
    const [state, setState] = useState({
        collections: [],
        error: null,
        isModalOpen: false,
        newCollectionTitle: '',
        newCollectionDescription: '',
        pastedUUID: '',
    });
    
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const createLikedCollectionIfNotExists = async () => {

        try {
            const likedCollectionID = `liked-${currentUser.uid}`;
            const likedCollectionRef = doc(db, "collections", likedCollectionID);
            const likedCollectionSnap = await getDoc(likedCollectionRef);
    
            if (!likedCollectionSnap.exists()) {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
    
                if (!userSnap.exists()) {
                    setState(prev => ({ ...prev, error: "User document does not exist." }));
                    return;
                }
    
                // Create the liked collection
                await setDoc(likedCollectionRef, {
                    name: "Liked Collection",
                    description: "Your favorite animes.",
                    animes: [],
                    users: [currentUser.email],
                    ownerId: currentUser.uid,
                    uniqueID: likedCollectionID,
                });
    
                // Add the liked collection's uniqueID to the user's savedCollections
                await updateDoc(userRef, {
                    savedCollections: arrayUnion(likedCollectionID),
                });
            }
        } catch (error) {
            
        }
    };
    
    

    const fetchCollections = async () => {
        if (!currentUser) return;
    
        try {
            const collectionsRef = collection(db, "collections");
            const collectionsSnap = await getDocs(collectionsRef);
            const allCollections = collectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
            // Fetch user saved collections
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            const savedCollections = userSnap.data()?.savedCollections || [];
    
            // Filter collections based on savedCollections
            const userCollections = allCollections.filter(collection =>
                savedCollections.includes(collection.uniqueID) // Ensure uniqueID matches
            ).sort((a, b) => (a.id === `liked-${currentUser.uid}` ? -1 : 0));
    
            setState(prev => ({ ...prev, collections: userCollections }));
        } catch (error) {
            
        }
    };
    

    useEffect(() => {
        createLikedCollectionIfNotExists();
        fetchCollections();
    }, [currentUser]);

    const handleCollectionClick = (id) => navigate(`/collection/${id}`);

    const handleNewCollectionClick = async () => {
        const { newCollectionTitle, newCollectionDescription } = state;

        const trimmedTitle = newCollectionTitle.trim();
        const trimmedDescription = newCollectionDescription.trim();

        if (trimmedTitle && trimmedDescription) {
            try {
                const uniqueID = uuidv4();
                const newCollectionRef = doc(db, "collections", uniqueID);
                await setDoc(newCollectionRef, {
                    name: trimmedTitle,
                    animes: [],
                    description: trimmedDescription,
                    users: [currentUser.email],
                    ownerId: currentUser.uid,
                    uniqueID: uniqueID,
                });

                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                    savedCollections: arrayUnion(uniqueID),
                });

                fetchCollections();

                setState(prev => ({
                    ...prev,
                    isModalOpen: false,
                    newCollectionTitle: '',
                    newCollectionDescription: '',
                    error: null,
                }));

            } catch (error) {
                
            }
        } else {
            setState(prev => ({ ...prev, error: "Please fill out both title and description" }));
        }
    };

    const handlePasteUUID = async () => {
        const { pastedUUID } = state;
    
        if (pastedUUID) {
            try {
                // Fetch all collections
                const collectionsRef = collection(db, 'collections');
                const collectionsSnap = await getDocs(collectionsRef);
                const collections = collectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
                // Check if any collection has the pastedUUID
                const foundCollection = collections.find(collection => collection.uniqueID === pastedUUID);
    
                if (foundCollection) {
                    // If the collection exists, get or create the user's document
                    const userRef = doc(db, 'users', currentUser.uid);
    
                    // Update the user's savedCollections
                    await updateDoc(userRef, {
                        savedCollections: arrayUnion(foundCollection.uniqueID)
                    });
    
                    setState(prev => ({ ...prev, pastedUUID: '', error: null }));
                    fetchCollections(); // Fetch updated collections
                } else {
                    setState(prev => ({ ...prev, error: "No collection found with that UUID" }));
                }
            } catch (error) {
                
            }
        } else {
            setState(prev => ({ ...prev, error: "Please enter a UUID" }));
        }
    };
    
      

    return (
        <div className="collections-page">
            <h1>Your Collections</h1>
            {state.error && <p className="error-message">{state.error}</p>}

            <div className="actions-container">
                <button className="new-collection-button" onClick={() => setState(prev => ({ ...prev, isModalOpen: true }))}>
                    Create New Collection
                </button>
                <input
                    className="uuid-input"
                    type="text"
                    value={state.pastedUUID}
                    onChange={(e) => setState(prev => ({ ...prev, pastedUUID: e.target.value })) }
                    placeholder="Paste CollectionID here"
                />
                <button className="uuid-button" onClick={handlePasteUUID}>Add CollectionID</button>
            </div>

            <div className="collections-list">
                {state.collections.map(collection => (
                    <div key={collection.id} className="collection-card" onClick={() => handleCollectionClick(collection.id)}>
                        <h3 className="collection-name">{collection.name}</h3>
                        <p className="collection-description">{collection.description}</p>
                        {collection.id === `liked-${currentUser.uid}`}
                    </div>
                ))}
            </div>

            {state.isModalOpen && (
                <div className="modal-overlay">
                    <div className="new-collection-modal">
                        <h3>Create New Collection</h3>
                        <input
                            type="text"
                            value={state.newCollectionTitle}
                            maxLength={17}
                            onChange={(e) => setState(prev => ({ ...prev, newCollectionTitle: e.target.value }))}
                            placeholder="Collection Title"
                        />
                        <textarea
                            value={state.newCollectionDescription}
                            maxLength={23}
                            onChange={(e) => setState(prev => ({ ...prev, newCollectionDescription: e.target.value }))}
                            placeholder="Collection Description"
                        />
                        <button className="create-button" onClick={handleNewCollectionClick}>Create</button>
                        <button className="close-button" onClick={() => setState(prev => ({ ...prev, isModalOpen: false }))}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Collections;
