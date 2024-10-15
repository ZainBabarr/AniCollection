import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';  // Firestore database instance
import { createUserWithEmailAndPassword } from 'firebase/auth';  // Correct import for Firebase v9
import { auth } from './firebase';  // Import Firebase Auth instance
import './Styles/loginButton.css';

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);

            // Use the Firebase Auth instance directly for signing up the user
            const userCredential = await createUserWithEmailAndPassword(
                auth, // Pass Firebase Auth instance here
                emailRef.current.value,
                passwordRef.current.value
            );

            const user = userCredential.user;
            const userRef = doc(db, "users", user.uid);

            // Create user document in Firestore
            await setDoc(userRef, {
                email: user.email,
                createdAt: new Date(),
            });

            console.log("User document created successfully!");
            navigate('/home');

        } catch (error) {
            setError('Failed to create an account');
            console.error("Signup error:", error.message);
        }

        setLoading(false);
    }

    return (
        <>
            <Card className="signup-card">
                <Card.Body className="signup-card-body">
                    <h2 className="text-center mb-3">Sign Up</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label className="loginLabel">Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>

                        <Form.Group id="password">
                            <Form.Label className="loginLabel">Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required />
                        </Form.Group>

                        <Form.Group id="password-confirm">
                            <Form.Label className="loginLabel">Password Confirmation</Form.Label>
                            <Form.Control type="password" ref={passwordConfirmRef} required />
                        </Form.Group>

                        <Button disabled={loading} className="authButton w-100" type="submit">Sign Up</Button>
                    </Form>
                </Card.Body>
                <div className="w-100 text-center mt-2 mb-3">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </Card>
        </>
    );
}
