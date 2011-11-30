var http = require('http');

function output(str){
  console.log(str);
}

function main(fn){
  fn();
}

var GRACE_EXIT_TIME = 1500;

var server = null;
var exitTimer = null;
var childReqCount = 0;

function aboutExit(){
  if(exitTimer) return;

  server.close();
  exitTimer = setTimeout(function(){
    output('worker will exit...');
    output('child req total : ' + childReqCount);

    process.exit(0);
  },GRACE_EXIT_TIME);
}


void main(function(){
  process.on('SIGINT'  ,aboutExit)
  process.on('SIGTERM' ,aboutExit)

  server = http.createServer(function(req, res){
    var i,r;
    for(i=0; i<10000; i++){
      r = Math.random();
    }
    res.writeHead(200 ,{'content-type' : 'text/html'});
    res.end('hello,world');
    childReqCount++;
  });

  process.on('message',function(m ,handle){
    if(handle){
      server.listen(handle, function(err){
        if(err){
          output('worker listen error');
        }else{
          process.send({'listenOK' : true});
          output('worker listen ok');
        }  
      });     
    }
    if(m.status == 'update'){
      process.send({'status' : process.memoryUsage()});
    }
  });

  output('worker is running...');
});
