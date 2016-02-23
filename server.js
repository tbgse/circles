var express = require('express'),
    http = require('http'),
    router = express(),
    server = http.createServer(router),
    io = require('socket.io')(server);

router.get('/',function(req,res){
    res.sendFile(process.cwd()+'/public/index.html')
})

router.use(express.static('public'))
var activeUsers = [];
io.on('connection',function(socket){
    
    console.log(socket.id)
    console.log('a user connected');
    socket.on('disconnect',function(){
         
    })
    socket.on('channel join',function(user){
        activeUsers.push(user)
        io.emit('channel join',activeUsers);
    })
    socket.on('text message',function(msg){
        socket.broadcast.emit('text message',msg)
    console.log('message: '+msg)    
    })
})


server.listen(process.env.PORT,process.env.IP,function(){
    console.log('server listening on '+process.env.IP+' at port '+process.env.PORT)
})