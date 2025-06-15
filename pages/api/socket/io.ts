import {Server as NetServer} from "http"
import { NextApiRequest } from "next"
import {Server as ServerIO} from "socket.io"
import { NextApiResponseServerIo } from "@/types"

export const config = {
    api:{
        bodyParser:false,
    },
};

const ioHandler = (req:NextApiRequest,res: NextApiResponseServerIo) => {
    try {
        if (!res.socket || !res.socket.server) {
            console.error("Socket or server not available");
            return res.status(500).end();
        }
        
        if(!res.socket.server.io){
            const path = "/api/socket/io"
            const httpServer: NetServer = res.socket.server as any;
            
            // Initialize Socket.IO with proper server binding
            const io = new ServerIO(httpServer, {
                path: path,
                addTrailingSlash: false,
                transports: ['websocket', 'polling'],
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                },
                pingTimeout: 60000,
                upgradeTimeout: 30000,
                allowRequest: (req, callback) => {
                    callback(null, true);
                }
            });

            // Add connection handler
            io.on("connection", (socket) => {
                console.log("Socket connected:", socket.id);
                
                socket.on("disconnect", () => {
                    console.log("Socket disconnected:", socket.id);
                });
            });

            res.socket.server.io = io;
        }
        res.end();
    } catch (error) {
        console.error("Socket.IO initialization error:", error);
        res.status(500).end();
    }
}

export default ioHandler