import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link } from "react-router-dom";
import './Styles/authStyles.css';

export default function ForgotPassword() {
    const emailRef = useRef();
    const { resetPassword } = useAuth();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(emailRef.current.value);
            setMessage('Check your inbox for further instructions.');
        } catch (error) {
            console.error("Error resetting password:", error);
            setError('Failed to reset password');
        }

        setLoading(false);
    }

    return (
        <>
            <Card className="auth-card">
                <Card.Body className="auth-card-body">
                    <h2 className="text-center mb-4">Password Reset</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label className="authLabel">Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>

                        <Button disabled={loading} className="authButton w-100" type="submit">Reset Password</Button>
                    </Form>
                </Card.Body>
                <div className="w-100 text-center mt-2 mb-3">
                    Need an account? <Link to="/register">Sign up</Link>
                </div>
            </Card>
        </>
    );
}
