var express = require('express'),
    http = require('http'),
    router = express(),
    server = http.createServer(router),
    jdenticon = require('jdenticon'),
    fs = require('fs'),
    md5 = require('js-md5'),
    io = require('socket.io')(server);

router.get('/',function(req,res){
    res.sendFile(process.cwd()+'/public/index.html')
})

router.use(express.static('public'))
var activeUsers = [];
console.log("test123")
io.on('connection',function(socket){
    var username;
    console.log(activeUsers)
    console.log(socket.id)
    console.log('a user connected');
    socket.on('disconnect',function(){
        activeUsers.splice(activeUsers.indexOf(username),1);
        io.emit('channel leave',username)
        fs.unlink(process.cwd()+"/public/icons/"+username+".svg")
    })
    socket.on('channel join',function(user){
        activeUsers.push(user)
        username = user;
        var hash = md5(username);
        var size = 50;
        var svg = jdenticon.toSvg(hash, size);
        socket.emit('channel load',activeUsers);
        fs.writeFile(process.cwd()+"/public/icons/"+username+".svg",svg,function(err){
            if (err) console.log(err);
        socket.broadcast.emit('channel join',user);
        })
       
    })
    socket.on('text message',function(msg){
        socket.broadcast.emit('text message',msg)
    console.log('message: '+msg)    
    })
})


server.listen(process.env.PORT,process.env.IP,function(){
    console.log('server listening on '+process.env.IP+' at port '+process.env.PORT)
})


String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};