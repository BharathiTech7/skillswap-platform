import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";

function Meeting() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.id) {
            const res = await API.get(`/users/${decoded.id}`);
            if (res.data?.data?.name) {
              setUserName(res.data.data.name);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user info", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-screen bg-accent">
        <div className="text-xl font-bold text-secondary">Invalid Meeting Link</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-accent">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading meeting room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-accent flex flex-col">
      <div className="bg-surface border-b border-dark-border px-6 flex justify-between items-center h-14">
        <h1 className="text-sm font-semibold text-charcoal flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          SkillSwap Meeting
        </h1>
        <button
          onClick={() => navigate("/outcomes/new/" + roomId)}
          className="btn btn-danger text-sm py-1.5 px-4"
        >
          Leave Meeting
        </button>
      </div>
      <div className="flex-1 w-full">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomId}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_CHROME_EXTENSION_BANNER: false,
          }}
          userInfo={{
            displayName: userName,
          }}
          onApiReady={(externalApi) => {}}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
          }}
        />
      </div>
    </div>
  );
}

export default Meeting;
