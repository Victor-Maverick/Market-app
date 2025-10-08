import { NextResponse } from "next/server";
import { Server as SocketServer, Socket } from "socket.io";
import { createServer } from "http";

let io: SocketServer;

export async function GET(req: Request) {
    if (io) {
        console.log("Socket.IO server already started");
        return NextResponse.json({ success: true }, { status: 200 });
    } else {
        const httpServer = createServer();
        // Track by email (not userId)
        let onlineUsers: { email: string; socketId: string }[] = [];

        io = new SocketServer(httpServer, {
            path: "/api/server",
            cors: {
                origin: `${process.env.NEXT_APP_URL}:${process.env.NEXT_APP_PORT}`,
            },
        });

        const findSocketIdByEmail = (email: string) =>
            onlineUsers.find((u) => u.email === email)?.socketId;

        io.on("connection", (socket: Socket) => {
            // Register current socket with email from NextAuth session
            socket.on("register", (email: string) => {
                if (!email) return;
                if (!onlineUsers.some((u) => u.email === email)) {
                    onlineUsers.push({ email, socketId: socket.id });
                } else {
                    // Update socketId on reconnect
                    onlineUsers = onlineUsers.map((u) =>
                        u.email === email ? { email, socketId: socket.id } : u
                    );
                }
            });

            // Check if a specific user (by email) is online via ack/callback
            socket.on("isOnline", (email: string, ack?: (res: { online: boolean }) => void) => {
                const online = !!findSocketIdByEmail(email);
                if (typeof ack === "function") {
                    ack({ online });
                } else {
                    socket.emit("isOnlineResponse", { email, online });
                }
            });

            // Initiate a call by email
            socket.on("callUser", (payload: {
                toEmail: string;
                callType: "VOICE" | "VIDEO";
                metadata?: any;
                from: { email: string; name?: string };
            }) => {
                const { toEmail, callType, metadata, from } = payload || {};
                const calleeSocketId = toEmail ? findSocketIdByEmail(toEmail) : undefined;
                if (calleeSocketId) {
                    io.to(calleeSocketId).emit("incomingCall", {
                        from,
                        callType,
                        metadata,
                        ts: Date.now()
                    });
                } else {
                    socket.emit("calleeUnavailable", { toEmail });
                }
            });

            // Callee accepts
            socket.on("answerCall", (payload: {
                callerEmail: string;
                from: { email: string; name?: string };
                callType: "VOICE" | "VIDEO";
                metadata?: any;
            }) => {
                const callerSocketId = findSocketIdByEmail(payload.callerEmail);
                if (callerSocketId) {
                    io.to(callerSocketId).emit("callAccepted", {
                        by: payload.from,
                        callType: payload.callType,
                        metadata: payload.metadata,
                        ts: Date.now()
                    });
                }
            });

            // Callee rejects
            socket.on("rejectCall", (payload: {
                callerEmail: string;
                from: { email: string; name?: string };
                reason?: string;
            }) => {
                const callerSocketId = findSocketIdByEmail(payload.callerEmail);
                if (callerSocketId) {
                    io.to(callerSocketId).emit("callRejected", {
                        by: payload.from,
                        reason: payload.reason || "rejected",
                        ts: Date.now()
                    });
                }
            });

            // Either party ends
            socket.on("endCall", (payload: {
                otherPartyEmail: string;
                by: { email: string; name?: string };
            }) => {
                const otherSocketId = findSocketIdByEmail(payload.otherPartyEmail);
                if (otherSocketId) {
                    io.to(otherSocketId).emit("callEnded", {
                        by: payload.by,
                        ts: Date.now()
                    });
                }
            });

            socket.on("disconnect", () => {
                onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
            });
        });

        httpServer.listen(process.env.NEXT_PUBLIC_SOCKET_PORT, () => {
            console.log("Socket.IO server started");
        });
    }
    return NextResponse.json({ success: true }, { status: 200 });
}