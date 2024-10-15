import React from 'react';
import { Card } from 'react-bootstrap';
import Login from './Login';

function Register() {
    return (
        <div className="d-flex justify-content-center align-items-center vh-99">
            <Card.Body>
                <Login />
            </Card.Body>
        </div>
    );
}

export default Register;
