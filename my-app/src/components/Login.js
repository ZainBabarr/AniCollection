import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';  // Import the Firestore database instance
import './Styles/authStyles.css';

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);

            // Log the user in
            const userCredential = await login(emailRef.current.value, passwordRef.current.value);
            const user = userCredential.user;

            // Reference to the user's document in Firestore
            const userRef = doc(db, "users", user.uid);

            // Check if the user document already exists in Firestore
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Handle case where user document does not exist (optional)
                console.error("User document does not exist.");
            } else {
                console.log("User document already exists. No need to create collections.");
            }

            // Navigate to home after successful login
            navigate('/home');

        } catch (error) {
            console.error("Error during login:", error);
            setError('Failed to sign in');
        }

        setLoading(false);
    }

    return (
        <Card className="auth-card">
            <Card.Body className="auth-card-body">
                <h2 className="text-center mb-4">Log In</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group id="email">
                        <Form.Label className="authLabel">Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} required />
                    </Form.Group>

                    <Form.Group id="password">
                        <Form.Label className="authLabel">Password</Form.Label>
                        <Form.Control type="password" ref={passwordRef} required />
                    </Form.Group>

                    <Button disabled={loading} className="authButton w-100" type="submit">Log In</Button>
                </Form>
                <div className="w-100 text-center mt-3">
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </Card.Body>
            <div className="w-100 text-center mb-3">
                Need an account? <Link to="/register">Sign up</Link>
            </div>
        </Card>
    );
}
