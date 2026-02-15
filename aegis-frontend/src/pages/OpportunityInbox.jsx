import React, { useEffect, useState } from 'react';

export default function OpportunityInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/opportunity_messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReply() {
    if (!replyText.trim() || !selectedMsg) return;

    setReplying(true);
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/opportunities/${selectedMsg.opportunity_id}/message`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient_id: selectedMsg.sender_id === JSON.parse(atob(localStorage.getItem('aegis_token').split('.')[1])).user_id 
              ? selectedMsg.recipient_id 
              : selectedMsg.sender_id,
            body: replyText
          })
        }
      );

      if (res.ok) {
        setReplyText('');
        fetchMessages();
        alert('Reply sent!');
      } else {
        alert('Failed to send reply');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Error sending reply');
    } finally {
      setReplying(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading inbox...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl">
        <h1 className="text-4xl font-bold mb-6">Opportunity Inbox</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Messages ({messages.length})</h2>
            </div>

            {messages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No messages yet
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    onClick={() => setSelectedMsg(msg)}
                    className={`p-4 border-b cursor-pointer transition ${
                      selectedMsg?.message_id === msg.message_id
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900">
                      {msg.sender_name || `User ${msg.sender_id}`}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      📚 {msg.opportunity_title || `Opportunity ${msg.opportunity_id}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail & Reply */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            {selectedMsg ? (
              <div className="space-y-4">
                {/* Message Header */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedMsg.opportunity_title || `Opportunity ${selectedMsg.opportunity_id}`}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        From: <span className="font-semibold">{selectedMsg.sender_name || `User ${selectedMsg.sender_id}`}</span>
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(selectedMsg.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Message</h3>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 text-gray-800 whitespace-pre-wrap">
                    {selectedMsg.message_text || selectedMsg.body || 'No message content'}
                  </div>
                </div>

                {/* File Attachment */}
                {selectedMsg.attachment_path && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Attachment</h3>
                    <a
                      href={`${import.meta.env.VITE_API_BASE}${selectedMsg.attachment_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      📎 Download Attachment
                    </a>
                  </div>
                )}

                {/* Reply Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Reply</h3>
                  <textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    rows={4}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || replying}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replying ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Select a message to view details and reply</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
