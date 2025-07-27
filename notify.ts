import { toast } from "react-hot-toast";

const notify = (type: string, message: string) => {
  if (type === "warning") {
    toast.success(message, {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
    });
  }
  if (type === "error") {
    toast.error(message, {
      style: {
        border: "1px solid #be1e2d",
        padding: "10px 25px",
        color: "#be1e2d",
      },
      iconTheme: {
        primary: "#be1e2d",
        secondary: "#ffffff",
      },
    });
  }
};

export default notify;