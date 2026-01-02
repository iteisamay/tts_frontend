import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styles } from '../style/style';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem("tts_users") || "[]");

        const user = users.find(u => u.email === email && u.password === password);
        let reqBody = {
            email: email,
            password: password
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKENDURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reqBody),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("tts_currentUser", JSON.stringify(data.user.user_empcode));
                localStorage.setItem("tts_currentUserRole", JSON.stringify(data.user.user_type));
                navigate("/tts/records");
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
            <form style={styles.form} onSubmit={handleLogin}>
                <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
                {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    );
}

export default Login;
