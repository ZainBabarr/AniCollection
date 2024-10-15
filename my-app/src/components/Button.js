import React from 'react';
import './Styles/Button.css';

function Button({ children, onClick, link, className }) {

    const handleClick = (e) => {
        e.preventDefault();
        const targetElement = document.querySelector(link);
        const offset = 70;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
        });
    };

    return (
        <button onClick={onClick} className={`custom-button ${className}`}>
            {link ? <a href={link} onClick={handleClick} rel="noopener noreferrer" className="custom-link">{children}</a> : children}
        </button>
    );
}

export default Button;
