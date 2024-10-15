import React from 'react';
import './Styles/About.css';
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { PiNumberSquareThreeFill } from "react-icons/pi";

const About = () => {
    return (
        <div id="aboutSection" className="about-container">
            <div className="about-content">
                <div className="about-text">
                    <h1 className="aboutTitle">What Is AniCollection?</h1>
                    <p>AniCollection is a platform for creating personalized anime collections. Organize watchlists, make recommendations, and collaborate with friends, all in one place. Easily track, share, and discuss your favorite shows!</p>
                </div>
                <div className="about-steps">
                    <p><PiNumberSquareOneFill size={50} /> Search an Anime</p>
                    <p><PiNumberSquareTwoFill size={50} /> Add it to your collection</p>
                    <p><PiNumberSquareThreeFill size={50} /> Share with others!</p>
                </div>
            </div>
        </div>
    );
}

export default About;
