const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { v4: uuidv4 } = require('uuid');


const { uniqueNamesGenerator,colors, animals } = require('unique-names-generator');


const app = express()  // Create the Express application
const server = http.createServer(app) // Create the HTTP server using the Express app
const io = socketio(server)           // Connect socket.io to the HTTP server

const publicDirectoryPath = path.join(__dirname, './public')
app.use(express.static(publicDirectoryPath))

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set('view engine', 'ejs')
app.use("/peerjs", peerServer);

const USER_DETAILS=[]; // 

    app.get('/', (req, res)=> {
        res.render('login')
    })
    // app.get('/', (req, res)=> {
    //     res.render('room')
    // })
    app.get("/:room", (req, res) => {
        res.render("room", { roomId: req.params.room });
      });








io.on('connection', (socket) => {          // Listen for new connections to Socket.io
        const sid=socket.id;
        const randomName = uniqueNamesGenerator({ dictionaries: [colors, animals] }); // red_donkey
     
        console.log(`${randomName} is registering with this  ${sid} id`)
    
        USER_DETAILS.push({sid,randomName})

        socket.emit('sending_user_details',{sid,randomName} );// sending user details to client  (socket id and name)

        
        io.emit('all_users',USER_DETAILS)  //sending all users object


        socket.on('send-notification-to-perticular-user',x =>{
            const finduser= USER_DETAILS.find((element)=>{
                return element.randomName===x
             })

             if(finduser){
              let room_details=uuidv4();
              io.to(socket.id).emit('change_url',room_details)
              io.to(finduser.sid).emit('notification-send',{sid:socket.id,room_details}
              )
               
             }
             
         })

         
         socket.on("join-room", (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).broadcast.emit("user-connected", userId);
        
            socket.on("message", (message) => {
              io.to(roomId).emit("createMessage", message);
            });

            socket.on("leave",()=>{
              io.to(roomId).emit("leaveitnow")

            })
          });


          socket.on('accept-send',(sid)=>{
          
            // console.log(`Accept ${sid}`)
            io.to(sid).emit('accepted')
  
          })
          socket.on('reject-send',(sid)=>{
            // console.log(`reject  ${ID}  --------- ${sid}`)
            // console.log(`Reject ${sid}`)
            io.to(sid).emit('rejected')
  
          })






        socket.on('disconnect', () =>{
            USER_DETAILS.find((element,index)=>{
                if(element.sid===socket.id){
                    USER_DETAILS.splice(index,1)
                    io.emit('all_users',USER_DETAILS)
                    return true                  

                }
            })
        })

        



})
server.listen(process.env.PORT || 3030);
