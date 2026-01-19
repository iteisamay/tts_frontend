import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buttonStyle } from "../style/userManagementButtonClass.js"
function Usermanagement() {
    const [userCred, setUserCred] = useState({ user: "", role: "" });
    const [allUserData, setallUserData] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const userRole = JSON.parse(localStorage.getItem("tts_currentUserRole"));
        const userCode = JSON.parse(localStorage.getItem("tts_currentUser"));

        if (!userCode || !userRole) {
            localStorage.removeItem("tts_currentUser");
            localStorage.removeItem("tts_currentUserRole");
            navigate("/login");
        } else {
            setUserCred({ user: userCode, role: userRole });
        }
    }, [navigate]);

    useEffect(() => {
        if (userCred.user && userCred.role) {
            fetchUserData();
        }
    }, [userCred]);

    const fetchUserData = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.REACT_APP_BACKENDURL}/tts/get/userdata`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_code: userCred.user,
                        action: "access_modification"
                    })
                }
            );

            if (!res.ok) {
                throw new Error("Permission denied or server error");
            }

            const data = await res.json();
            setallUserData(data.data || []);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (action, currUserCode, currentStatus) => {
        const p = prompt(`Type 'yes' if you want to update the '${action}' permission of ${currUserCode}.`);
        if (p.toLocaleLowerCase() === 'yes') {
            const url = `${process.env.REACT_APP_BACKENDURL}/tts/toggle/user/access`;
            try {
                let res = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify({
                        user_code: userCred.user,
                        action: "edit",
                        current_status: currentStatus,
                        user_id: currUserCode,
                        access_name: action
                    }),
                    headers: { 'Content-type': 'application/json' }
                });
                if (res.ok) {
                    fetchUserData();
                } else {
                    let resData = await res.json();
                    alert(resData.msg);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            alert("Invalid input.");
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("tts_currentUser");
        localStorage.removeItem("tts_currentUserRole");
        navigate("/login");
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>
            <Link
                    to="/tts/records"
                    style={{
                      display: "inline-block",
                      marginBottom: "20px",
                      textDecoration: "none",
                      background: "#2563eb",
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: "8px",
                    }}
                  >
                     TTS Record
                  </Link>
            <div style={{ display: "flex", gap: "10px", float: "right" }}>
                {(userCred.role === 'ADMIN' || userCred.role === 'SUPERADMIN') && (
                    <Link
                        to="/create-user"
                        style={{
                            textDecoration: "none",
                            background: "#2ecc71",
                            color: "#fff",
                            padding: "10px 20px",
                            borderRadius: "8px",
                        }}
                    >
                        Add New User
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    style={{
                        background: "#e74c3c",
                        color: "#fff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    Logout
                </button>
            </div>
            <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "28px", fontWeight: "bold" }}>
                    USER DASHBOARD
                </p>
            </div>

            {loading ? (
                <p>Loading data...</p>
            ) : (
                <table
                    border="1"
                    cellPadding="8"
                    cellSpacing="0"
                    width="100%"
                    style={{ borderCollapse: "collapse" }}
                >
                    <thead style={{ background: "#f3f4f6" }}>
                        <tr>
                            <th>ID</th>
                            <th>EMAIL</th>
                            <th>TYPE</th>
                            <th>ACCESS</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUserData.length > 0 ? (
                            allUserData.map((rec, index) => (
                                <tr key={index}>
                                    <td>{rec.user_empcode}</td>
                                    <td>{rec.user_email}</td>
                                    <td>{rec.user_type}</td>
                                    <td>
                                        <div style={{ display: "flex", justifyContent: "center", "columnGap": "10px" }}>
                                            <button onClick={(e) => { togglePermission("create", rec.user_empcode, rec.can_create) }} style={rec.can_create == 'NO' ? buttonStyle.red_button : buttonStyle.green_button}>Create</button>
                                            <button onClick={(e) => { togglePermission("view", rec.user_empcode, rec.can_view) }} style={rec.can_view == 'NO' ? buttonStyle.red_button : buttonStyle.green_button}>View</button>
                                            <button onClick={(e) => { togglePermission("edit", rec.user_empcode, rec.can_edit) }} style={rec.can_edit == 'NO' ? buttonStyle.red_button : buttonStyle.green_button}>Edit</button>
                                        </div>
                                    </td>
                                    <td>{rec.user_status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Usermanagement;
