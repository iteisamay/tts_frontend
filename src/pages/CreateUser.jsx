import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styles } from '../style/style';

function CreateUser() {
    const [email, setEmail] = useState("");
    const [empCode, setEmpCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("USER"); // Default role
    const [error, setError] = useState("");
    const [userCred, setUserCred] = useState(null);
    const navigate = useNavigate();

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const users = [];

        const newUser = {
            email,
            emp_code: empCode,
            password,
            user_type: role,
            user_code:userCred.user
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKENDURL}/auth/create/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });
            const data = await response.json();
            if (response.status == 201) {
                alert('User created successfully');
                navigate("/tts/records");
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed');
        }
    };

    useEffect(()=>{
        const userRole=JSON.parse(window.localStorage.getItem("tts_currentUserRole"));
        const userCode=JSON.parse(window.localStorage.getItem("tts_currentUser"));
        if(!userCode || userCode.trim()=="" || !userRole || userRole.trim()==""){
            window.localStorage.removeItem("tts_currentUser");
            window.localStorage.removeItem("tts_currentUserRole");
            navigate("/login");
        }else{
            setUserCred({user:userCode,role:userRole});
        }
    },[]);

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create New User</h2>
            <form style={styles.form} onSubmit={handleCreateUser}>
                <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="role">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.input}
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
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
                    <label style={styles.label} htmlFor="empCode">Emp Code</label>
                    <input
                        id="empCode"
                        type="text"
                        value={empCode}
                        onChange={(e) => setEmpCode(e.target.value)}
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
                <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
                {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
                <button type="submit" style={styles.button}>Create User</button>
            </form>
        </div>
    );
}

export default CreateUser;
