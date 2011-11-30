var cp = require('child_process');
var TCP = process.binding('tcp_wrap').TCP;

var PORT = 3458;
var WORKER_NUMBER = 5;
var GRACE_EXIT_TIME = 2000;//2s
var WORKER_PATH = __dirname + '/tcpWorker.js';
var WORKER_HEART_BEAT = 10*1000;//10s, update memory ,etc

function main(fn){
  fn();
}

function output(str){
  console.log(str);
}

var childs = [];
var lastChildPos = 0;
function startWorker(){
  for(var i=0; i<WORKER_NUMBER; i++){
    var c  =  cp.fork(WORKER_PATH);
    childs.push(c);
  }
/*
  setInterval(function(){
    inspect(childMng.getStatus());
    childMng.updateStatus();
  },WORKER_HEART_BEAT);
  */
}

var server = null;
var exitTimer = null;
function aboutExit(){
  if(exitTimer) return;

  server.close();
  childs.forEach(function(c){
    c.kill();
  })
  exitTimer = setTimeout(function(){
    output('master exit...');

    //log.destroy();
    process.exit(0);
  }, GRACE_EXIT_TIME);
}

//var ADDRESS = '127.0.0.1';
var ADDRESS = '0.0.0.0';
var BACK_LOG = 128;

function onconnection(handle){
  //output('master on connection');
  lastChildPos++;
  if(lastChildPos >= WORKER_NUMBER){
    lastChildPos = 0;
  }
  childs[lastChildPos].send({'handle' : true}, handle);
  handle.close();
}

function startServer(){
  server = new TCP();
  server.bind(ADDRESS, PORT);
  server.onconnection = onconnection;
  server.listen(BACK_LOG);
}

void main(function(){
  
  startServer();
  startWorker();

  output('master is running...');
  process.on('SIGINT' , aboutExit);
  process.on('SIGTERM' , aboutExit);

});
