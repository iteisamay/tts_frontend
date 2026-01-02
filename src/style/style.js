export const styles={
    container: {
      maxWidth: "600px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#333",
    },
    required: {
      color: "#e74c3c",
      marginLeft: "4px",
    },
    input: {
      padding: "10px 12px",
      fontSize: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    textarea: {
      padding: "10px 12px",
      fontSize: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      outline: "none",
      minHeight: "120px",
      resize: "vertical",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    button: {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#ffffff",
      backgroundColor: "#3498db",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      marginTop: "10px",
    },
    loader: {
      marginTop: "20px",
      textAlign: "center",
      fontWeight: "500",
      color: "#3498db",
    },
    imageContainer: {
      textAlign: "center",
      marginTop: "30px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    image: {
      width: "200px",
      height: "200px",
      objectFit: "contain",
      border: "1px solid #ddd",
      borderRadius: "8px",
    },
    downloadBtn: {
      display: "inline-block",
      marginTop: "15px",
      padding: "10px 20px",
      backgroundColor: "#2ecc71",
      color: "#fff",
      textDecoration: "none",
      borderRadius: "4px",
      fontWeight: "500",
    },
    saveButton: {
      display: "inline-block",
      marginTop: "15px",
      padding: "10px 20px",
      backgroundColor: "#2a89d1ff",
      color: "#fff",
      textDecoration: "none",
      borderRadius: "4px",
      fontWeight: "500",
    },
    audio_container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    updateData:{
        parent_div:{
            margin:"30px 0 30px 0",
            display:"flex",
            flexDirection:"column",
            rowGap:"20px"
        },
        div_label:{
            fontSize:"25px"
        },
        div_input_text:{
            fontSize:"20px",
            outline:"none",
            padding:"5px 10px 5px 10px"
        },
        div_input_text_area:{
            fontSize:"20px",
            outline:"none",
            padding:"5px 10px 5px 10px",
            height:"300px",
            maxHeight:"500px",
            minHeight:"200px",
            resize:"vertical"
        },
        div_input_file:{
            fontSize:"20px",
            outline:"none",
            margin:"10px 5px 10px 5px"
        },
        div_button:{
            margin:"10px 5px 10px 5px",
            padding:"5px 10px 5px 10px",
            textTransform:"uppercase",
        },
        div_button_update:{
            margin:"10px 5px 10px 5px",
            padding:"5px 10px 5px 10px",
            textTransform:"uppercase",
            color:"#fff",
            backgroundColor:"#246f13ff",
            outline:"none",
            border:"none",
            padding:"10px 0px",
            cursor:"pointer"
        },
        div_button_close:{
            margin:"10px 5px 10px 5px",
            padding:"5px 10px 5px 10px",
            textTransform:"uppercase",
            color:"#e3e3e3ff",
            backgroundColor:"#333333ff",
            outline:"none",
            border:"none",
            padding:"10px 0px",
            cursor:"pointer"
        }
    }
  };