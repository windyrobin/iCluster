var net = require('net');
var cp = require('child_process');

var PORT = 3458;
var WORKER_NUMBER = 5;
var GRACE_EXIT_TIME = 2000;//2s
var WORKER_PATH = __dirname + '/worker.js';
var WORKER_HEART_BEAT = 10*1000;//10s, update memory ,etc

function output(str){
  console.log(str);
}

function main(fn){
  fn();
}

var childs = [];
function startWorker(handle){
    var debug = isDebug();
    for(var i=0; i<WORKER_NUMBER; i++){
        var c  = null;
        if (debug){
            c  =  cp.fork(WORKER_PATH,{execArgv: [ '--debug='+(process.debugPort+i+1) ]});
        }else{
            c  =  cp.fork(WORKER_PATH);
        }
        c.send({"server" : true}, handle);
        childs.push(c);
    }
    /*
     setInterval(function(){
     inspect(childMng.getStatus());
     childMng.updateStatus();
     },WORKER_HEART_BEAT);
     */
    function isDebug(){
        for(var i=0;i<process.execArgv.length;i++){
            if(process.execArgv[i].indexOf("--debug")==0 ){
                return true;
            }
        }
        return false;
    }
}

var exitTimer = null;
function aboutExit(){
  if(exitTimer) return;

  childs.forEach(function(c){
    c.kill();
  })
  exitTimer = setTimeout(function(){
    output('master exit...');

    process.exit(0);
  }, GRACE_EXIT_TIME);
}

function startServer(){
  var tcpServer = net.createServer();
  tcpServer.listen(PORT , function(){
    startWorker(tcpServer._handle);
    tcpServer.close();
  });
}

void main(function(){
  
  startServer();

  output('master is running...');
  process.on('SIGINT' , aboutExit);
  process.on('SIGTERM' , aboutExit);

});
