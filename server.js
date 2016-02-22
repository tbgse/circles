var express = require('express');
var http = require('http');
var router = express();
var server = http.createServer(router);

router.get('/',function(req,res){
    res.sendFile(process.cwd()+'/public/index.html')
})

server.listen(process.env.PORT,process.env.IP,function(){
    console.log('server listening on '+process.env.IP+' at port '+process.env.PORT)
})