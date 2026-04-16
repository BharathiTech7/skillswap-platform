import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import socket from "../services/socket";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

function Chat() {
  const [partners, setPartners] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [unread, setUnread] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      setCurrentUserId(userId);
      API.get(`/swaps/user/${userId}`)
        .then((res) => {
          const accepted = res.data.data.filter((s) => s.status === "accepted");
          const partnerIds = new Set();
          const uniquePartners = [];
          accepted.forEach((swap) => {
            const partner = swap.sender._id === userId ? swap.receiver : swap.sender;
            if (!partnerIds.has(partner._id)) { partnerIds.add(partner._id); uniquePartners.push(partner); }
          });
          setPartners(uniquePartners);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch (e) { console.error(e); setLoading(false); }
  }, []);

  const loadMessages = (partner) => {
    setSelectedUser(partner);
    setMessages([]);
    setUnread((prev) => { const updated = { ...prev }; delete updated[partner._id]; return updated; });
    API.get(`/messages/${currentUserId}/${partner._id}`)
      .then((res) => {
        setMessages(res.data.data);
        if (res.data.data.length > 0) { setLastMessages(prev => ({ ...prev, [partner._id]: res.data.data[res.data.data.length - 1].text })); }
      })
      .catch(console.log);
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;
    const messageData = { sender: currentUserId, receiver: selectedUser._id, text, createdAt: new Date() };
    socket.emit("sendMessage", messageData);
    setText("");
    await API.post("/messages/send", messageData);
  };

  useEffect(() => {
    const handleMessage = (data) => {
      const senderId = typeof data.sender === "object" ? data.sender._id : data.sender;
      const receiverId = typeof data.receiver === "object" ? data.receiver._id : data.receiver;
      const partnerId = senderId === currentUserId ? receiverId : senderId;
      setLastMessages(prev => ({ ...prev, [partnerId]: data.text }));
      if (selectedUser && ((senderId === selectedUser._id && receiverId === currentUserId) || (senderId === currentUserId && receiverId === selectedUser._id))) {
        setMessages((prev) => [...prev, data]);
      } else {
        setUnread((prev) => ({ ...prev, [partnerId]: true }));
        setPartners((prevPartners) => { const index = prevPartners.findIndex((p) => p._id === partnerId); if (index === -1) return prevPartners; const updated = [...prevPartners]; const [partner] = updated.splice(index, 1); return [partner, ...updated]; });
      }
    };
    socket.on("receiveMessage", handleMessage);
    socket.on("getOnlineUsers", (users) => setOnlineUsers(users.map(u => u.userId)));
    const handleTyping = (data) => { if (data.senderId !== currentUserId) setTypingUsers(prev => ({ ...prev, [data.senderId]: true })); };
    const handleStopTyping = (data) => { if (data.senderId !== currentUserId) setTypingUsers(prev => ({ ...prev, [data.senderId]: false })); };
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    return () => { socket.off("receiveMessage", handleMessage); socket.off("getOnlineUsers"); socket.off("typing", handleTyping); socket.off("stopTyping", handleStopTyping); };
  }, [selectedUser, currentUserId]);

  useEffect(() => { if (currentUserId) socket.emit("addUser", currentUserId); }, [currentUserId]);

  const handleTypingEvent = (e) => {
    setText(e.target.value);
    if (selectedUser) {
      socket.emit("typing", { senderId: currentUserId, receiverId: selectedUser._id });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => { socket.emit("stopTyping", { senderId: currentUserId, receiverId: selectedUser._id }); }, 1000);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (loading) {
    return (<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] card p-0 overflow-hidden animate-fade-in">
      {/* Sidebar: Conversation List */}
      <div className="w-80 border-r border-dark-border flex flex-col bg-surface">
        <header className="p-5 border-b border-dark-border">
          <span className="section-label">Messages</span>
          <h2 className="text-lg font-bold text-charcoal mt-1">Conversations</h2>
        </header>
        <div className="flex-1 overflow-y-auto">
          {partners.length === 0 ? (
            <div className="p-6 text-center text-muted/50 italic text-sm">No active connections...</div>
          ) : (
            partners.map((p) => {
              const isSelected = selectedUser?._id === p._id;
              const isOnline = onlineUsers.includes(p._id);
              const isTyping = typingUsers[p._id];
              const hasUnread = unread[p._id];
              return (
                <div key={p._id} onClick={() => loadMessages(p)}
                  className={`px-5 py-4 border-b border-dark-border/50 cursor-pointer transition-all ${isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface-light/30"}`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className={`font-semibold text-sm ${isSelected ? "text-primary-light" : "text-charcoal"}`}>{p.name}</h3>
                    <div className="flex items-center gap-2">
                      {hasUnread && <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>}
                      <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" : "bg-muted/30"}`}></span>
                    </div>
                  </div>
                  <p className="text-xs text-muted truncate">
                    {isTyping ? <span className="text-primary-light italic animate-pulse">Typing...</span> : (lastMessages[p._id] || "Start a conversation...")}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedUser ? (
          <>
            <header className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary-light border border-dark-border">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-charcoal">{selectedUser.name}</h2>
                  <p className="text-xs text-muted">{onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}</p>
                </div>
              </div>
              <Link to="/sessions" className="btn btn-secondary text-xs py-1.5 px-3">Schedule</Link>
            </header>

            <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4 bg-surface-light/30">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted/50 italic text-sm">Start a conversation...</div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = (typeof msg.sender === "object" ? msg.sender._id : msg.sender) === currentUserId;
                  const currentMsgDate = new Date(msg.createdAt);
                  const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
                  let showDateDivider = false, dateLabel = "";
                  if (!prevMsgDate || currentMsgDate.toDateString() !== prevMsgDate.toDateString()) {
                    showDateDivider = true;
                    const today = new Date(); const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
                    if (currentMsgDate.toDateString() === today.toDateString()) dateLabel = "Today";
                    else if (currentMsgDate.toDateString() === yesterday.toDateString()) dateLabel = "Yesterday";
                    else dateLabel = currentMsgDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                  return (
                    <div key={index} className="flex flex-col">
                      {showDateDivider && (<div className="flex justify-center my-4"><span className="px-3 py-1 text-[10px] text-muted/60 bg-surface-light/50 rounded-full border border-dark-border">{dateLabel}</span></div>)}
                      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl mb-1 ${isMine ? "bg-primary text-white rounded-br-md" : "bg-surface-light text-charcoal rounded-bl-md"}`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className={`text-[10px] mt-1 ${isMine ? "text-white/50 text-right" : "text-muted"}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef}></div>
            </div>

            <footer className="px-6 py-4 border-t border-dark-border bg-surface">
              {typingUsers[selectedUser._id] && (<div className="mb-2 text-xs text-primary-light italic">{selectedUser.name} is typing...</div>)}
              <div className="flex gap-3">
                <input value={text} onChange={handleTypingEvent} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} className="input-field flex-1" placeholder="Type a message..." />
                <button onClick={sendMessage} disabled={!text.trim()} className="btn btn-primary px-6">Send</button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-light/50 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-charcoal/50 mb-2">Select a conversation</h2>
            <p className="text-sm text-muted/50">Choose a partner to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
