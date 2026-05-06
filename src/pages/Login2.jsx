import React, { useState, useRef } from "react"; // Added useRef
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha"; // Import the library
import { styles } from '../style/style';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    // 1. Create a reference for the reCAPTCHA widget
    const recaptchaRef = useRef();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        // 2. Get the CAPTCHA token
        const captchaToken = recaptchaRef.current.getValue();

        if (!captchaToken) {
            setError("Please verify that you are not a robot.");
            return;
        }

        let reqBody = {
            email: email,
            password: password,
            captchaToken: captchaToken // 3. Add token to your request body
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
                // 4. Reset CAPTCHA on failed login so user can try again
                recaptchaRef.current.reset();
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            recaptchaRef.current.reset();
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

                {/* 5. Add the reCAPTCHA widget before the button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <ReCAPTCHA
                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} 
                        ref={recaptchaRef}
                    />
                </div>

                {error && <div style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</div>}
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    );
}

export default Login;