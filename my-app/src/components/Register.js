import React from 'react';
import { Card } from 'react-bootstrap';
import Signup from './Signup';

function Register() {
    return (
        <div className="d-flex justify-content-center align-items-center vh-99">
            <Card.Body>
                <Signup />
            </Card.Body>
        </div>
    );
}

export default Register;
