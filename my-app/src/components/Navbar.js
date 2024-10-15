import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase'; // Import your Firebase config
import './Styles/Navbar.css';
import Button from './Button';
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
    const [navbarAtTop, setNavbarAtTop] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePopupOpen, setProfilePopupOpen] = useState(false);
    const [user, setUser] = useState(null);
    const sidebarRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setNavbarAtTop(window.scrollY === 0);
        };

        // Ensure navbar is always fixed at the top
        window.addEventListener('scroll', handleScroll);

        // Clean up on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navigateToSection = (path) => {
        if (path === '/about') {
            const aboutSection = document.getElementById('aboutSection');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate(path);
        }
        setSidebarOpen(false);
        setProfilePopupOpen(false);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut(); // Sign out the user
            setUser(null); // Clear user state
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Function to handle clicks outside of the sidebar and profile popup
    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
            setSidebarOpen(false);
        }
        if (profileRef.current && !profileRef.current.contains(event.target) && profilePopupOpen) {
            setProfilePopupOpen(false);
        }
    };

    useEffect(() => {
        // Add event listener to detect clicks outside
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up on unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarOpen, profilePopupOpen]);

    return (
        <div>
            <div className={`navbar ${!navbarAtTop ? 'shadow' : ''}`}>
                <div className="navbar-logo" onClick={() => navigateToSection('/home')}>
                    AniCollection
                </div>
                <ul className="NavbarElements">
                    <Button onClick={() => navigateToSection('/login')}>Login</Button>
                    <Button onClick={() => navigateToSection('/about')}>About</Button>
                    <Button onClick={() => navigateToSection('/collections')}>My Collections</Button>
                    <CgProfile
                        className="profileIcon"
                        onClick={() => setProfilePopupOpen(!profilePopupOpen)}
                    />
                </ul>
                <button className="sidebarToggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <CgProfile size={30} className="profileIconSidebar" />
                </button>
            </div>

            {profilePopupOpen && user && (
                <div className="profilePopup" ref={profileRef}>
                    <p>Logged in as {user.email}</p>
                    <button className="profileLogoutButton" onClick={handleLogout}>Logout</button>
                </div>
            )}

            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                <Button className="sidebarButtons" onClick={() => setSidebarOpen(false)}>×</Button>
                <Button className="sidebarButtons" onClick={() => navigateToSection('/login')}>{user?.email}</Button>
                <Button className="sidebarButtons" onClick={() => navigateToSection('/about')}>About</Button>
                <Button className="sidebarButtons" onClick={() => navigateToSection('/collections')}>My Collections</Button>
                {user && (
                    <>
                        <Button className="sidebarButtons" onClick={handleLogout}>Logout</Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
