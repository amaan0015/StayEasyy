
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { MessageCircle, Send, RefreshCw } from "lucide-react";
import Navbar from "../components/NavBar.jsx";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

function Chat() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const socketRef = useRef(null);
  const selectedIdRef = useRef(selectedId);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    setOtherTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [selectedId]);

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === selectedId
  );

  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get("/chat/conversations");
      const list = response.data.conversations || [];

      setConversations(list);

      setSelectedId((currentId) => {
        if (currentId && list.some((item) => item._id === currentId)) {
          return currentId;
        }

        return list[0]?._id || "";
      });
    } catch (err) {
      console.error("Load conversations error:", err);
      setError(
        err.response?.data?.message || "Could not load conversations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setMessagesLoading(true);

      const response = await api.get(
        `/chat/conversations/${conversationId}/messages`
      );

      if (String(selectedIdRef.current) !== String(conversationId)) {
        return;
      }

      setMessages(response.data.messages || []);

      // Refresh unread counts after messages are marked as read.
      const conversationsResponse = await api.get("/chat/conversations");

      if (String(selectedIdRef.current) === String(conversationId)) {
        setConversations(conversationsResponse.data.conversations || []);
      }
    } catch (err) {
      console.error("Load messages error:", err);
      setError(
        err.response?.data?.message || "Could not load messages."
      );
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    setMessages([]);
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  // Authenticate the socket using the existing JWT.
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to use chat.");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      setError("");
    });

    socket.on("connect_error", (err) => {
      setSocketConnected(false);
      console.error("Socket connection error:", err.message);
      setError("Real-time connection failed. Please refresh the page.");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      setOtherTyping(false);
    });

    
socket.on("new_message", (message) => {
  if (!message?._id || !message?.conversation) return;

  const conversationId =
    typeof message.conversation === "object"
      ? message.conversation._id
      : message.conversation;

  if (String(conversationId) !== String(selectedIdRef.current)) {
    loadConversations();
    return;
  }

  const currentUserId = String(user?._id || user?.id || "");

  const senderId =
    typeof message.sender === "object"
      ? message.sender?._id
      : message.sender;

  // Add the incoming message without creating duplicates.
  setMessages((previous) => {
    if (previous.some((item) => item._id === message._id)) {
      return previous;
    }

    return [...previous, message];
  });

  setOtherTyping(false);
  loadConversations();

  // If the other person sent a message to the conversation
  // currently open, fetch messages again to mark it as read.
  if (String(senderId) !== currentUserId) {
    loadMessages(conversationId);
  }
});

    // Update read receipts on the sender's screen.
  
    // Update read receipts on the sender's screen.
    socket.on("messages_read", ({ conversationId, readerId }) => {
      if (!conversationId || !readerId) return;

      console.log("MESSAGES_READ EVENT RECEIVED:", {
        conversationId,
        readerId,
        selectedConversation: selectedIdRef.current,
      });

      if (String(conversationId) === String(selectedIdRef.current)) {
        const currentUserId = String(user?._id || user?.id || "");

        setMessages((previous) => {
          console.log("READ RECEIPT ID CHECK:", {
  currentUserId: String(user?._id || user?.id || ""),
  readerId: String(readerId),
  selectedConversation: String(selectedIdRef.current),
  conversationId: String(conversationId),
});
          const updatedMessages = previous.map((message) => {
            const senderId =
              typeof message.sender === "object"
                ? message.sender?._id
                : message.sender;

            // Only mark messages sent by the current user as read.
            if (
              String(senderId) === currentUserId &&
              String(readerId) !== currentUserId
            ) {
              return { ...message, isRead: true };
            }

            return message;
          });

          console.log(
            "READ RECEIPT UPDATED:",
            updatedMessages.map((message) => ({
              text: message.text,
              isRead: message.isRead,
            }))
          );

          return updatedMessages;
        });
      }

      loadConversations();
    });

    // Display typing from the other participant.
    socket.on("user_typing", ({ conversationId, userId }) => {
      if (
        String(conversationId) === String(selectedIdRef.current) &&
        String(userId) !== String(user?._id || user?.id)
      ) {
        setOtherTyping(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setOtherTyping(false);
          typingTimeoutRef.current = null;
        }, 3000);
      }
    });


    socket.on("user_stop_typing", ({ conversationId, userId }) => {
      if (
        String(conversationId) === String(selectedIdRef.current) &&
        String(userId) !== String(user?._id || user?.id)
      ) {
        setOtherTyping(false);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      socket.disconnect();
      socketRef.current = null;
    };
  }, [loadConversations, user]);

  // Join the selected conversation after connecting.
  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !socketConnected || !selectedId) return;

    socket.emit("join_conversation", selectedId, (result) => {
      if (!result?.success) {
        setError(
          result?.message || "Could not join this conversation."
        );
      }
    });
  }, [selectedId, socketConnected]);

  const handleTyping = (value) => {
    setText(value);

    const socket = socketRef.current;

    if (!socket || !socketConnected || !selectedId) return;

    if (value.trim()) {
      socket.emit("typing", selectedId);
    } else {
      socket.emit("stop_typing", selectedId);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText || !selectedId || sending) return;

    try {
      setSending(true);
      setError("");

      // Stop typing before sending.
      socketRef.current?.emit("stop_typing", selectedId);

      const response = await api.post(
        `/chat/conversations/${selectedId}/messages`,
        { text: trimmedText }
      );

      const savedMessage = response.data.message;

      setMessages((previous) => {
        if (previous.some((item) => item._id === savedMessage._id)) {
          return previous;
        }

        return [...previous, savedMessage];
      });

      setText("");
      await loadConversations();
    } catch (err) {
      console.error("Send message error:", err);
      setError(
        err.response?.data?.message || "Could not send message."
      );
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!user) return null;

    return user.role === "owner"
      ? conversation.tenant
      : conversation.owner;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">
            Messages
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Chat with tenants and property owners.
          </p>

          <p
            className={`mt-1 text-xs ${
              socketConnected ? "text-green-700" : "text-amber-700"
            }`}
          >
            {socketConnected
              ? "● Real-time connected"
              : "● Connecting to real-time chat..."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[320px_1fr]">
          <aside className="border-b border-slate-200 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <h2 className="font-semibold text-slate-900">
                Conversations
              </h2>

              <button
                type="button"
                onClick={loadConversations}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                title="Refresh conversations"
              >
                <RefreshCw size={17} />
              </button>
            </div>

            {loading ? (
              <p className="p-5 text-sm text-slate-500">
                Loading conversations...
              </p>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle
                  size={30}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm font-medium text-slate-700">
                  No conversations yet
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Open an approved property and select Message Owner to start.
                </p>

                <Link
                  to="/properties"
                  className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline"
                >
                  Explore properties
                </Link>
              </div>
            ) : (
              <div className="max-h-[560px] overflow-y-auto">
                {conversations.map((conversation) => {
                  const other = getOtherParticipant(conversation);
                  const unreadCount = conversation.unreadCount || 0;

                  return (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() => setSelectedId(conversation._id)}
                      className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                        selectedId === conversation._id ? "bg-teal-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-slate-900">
                          {other?.name || "User"}
                        </p>

                        {unreadCount > 0 && (
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {conversation.property?.title || "Property"}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-600">
                        {conversation.lastMessage?.text ||
                          "Start your conversation"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="flex min-h-[500px] flex-col">
            {!selectedConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <MessageCircle
                  size={42}
                  className="mb-3 text-slate-300"
                />

                <h2 className="font-semibold text-slate-800">
                  Select a conversation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your messages will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    {getOtherParticipant(selectedConversation)?.name || "Chat"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedConversation.property?.title || "Property"}
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                  {otherTyping && (
                    <p className="px-1 text-xs italic text-slate-500">
                      {getOtherParticipant(selectedConversation)?.name ||
                        "User"}{" "}
                      is typing...
                    </p>
                  )}

                  {messagesLoading ? (
                    <p className="text-center text-sm text-slate-500">
                      Loading messages...
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No messages yet. Say hello!
                    </p>
                  ) : (
                    messages.map((message) => {
                      const senderId =
                        typeof message.sender === "object"
                          ? message.sender?._id
                          : message.sender;

                      const currentUserId = user?._id || user?.id;
                      const isMine =
                        String(senderId) === String(currentUserId);

                      return (
                        <div
                          key={message._id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                              isMine
                                ? "bg-teal-700 text-white"
                                : "border border-slate-200 bg-white text-slate-800"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm">
                              {message.text}
                            </p>

                            <p
                              className={`mt-2 text-right text-[10px] ${
                                isMine ? "text-teal-100" : "text-slate-400"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleString()}

                              {isMine && message.isRead && (
                                <span className="ml-2">✓✓ Read</span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="flex gap-2 border-t border-slate-200 bg-white p-3 sm:p-4"
                >
                  <input
                    type="text"
                    value={text}
                    onChange={(event) => handleTyping(event.target.value)}
                    onBlur={() => {
                      if (selectedId) {
                        socketRef.current?.emit("stop_typing", selectedId);
                      }
                    }}
                    maxLength={2000}
                    placeholder="Write a message..."
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={17} />
                    <span className="hidden sm:inline">
                      {sending ? "Sending..." : "Send"}
                    </span>
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Chat;
