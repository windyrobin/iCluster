var net = require("net");
var cp = require("child_process");

const PORT = 3458;
const WORKER_NUMBER = 5;
const GRACE_EXIT_TIME = 2000;//2s
const WORKER_PATH = __dirname + "/worker.js";
const WORKER_HEART_BEAT = 10*1000;//10s, update memory ,etc

function output(str){
  console.log(str);
}

function main(fn){
  fn();
}

var childs = [];
function startWorker(handle){
  for(var i=0; i<WORKER_NUMBER; i++){
    var c  =  cp.fork(WORKER_PATH);
    c.send({"server" : true}, handle);
    childs.push(c);
  }
/*
  setInterval(function(){
    inspect(childMng.getStatus());
    childMng.updateStatus();
  },WORKER_HEART_BEAT);
  */
}

var exit_timer = null;
function about_exit(){
  if(exit_timer) return;

  childs.forEach(function(c){
    c.kill();
  })
  exit_timer = setTimeout(function(){
    output("master exit...");

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

  output("master is running...");
  process.on("SIGINT" , about_exit);
  process.on("SIGTERM" , about_exit);

});
