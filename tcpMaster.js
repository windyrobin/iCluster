var cp = require("child_process");
var TCP = process.binding("tcp_wrap").TCP;

const PORT = 3458;
const WORKER_NUMBER = 5;
const GRACE_EXIT_TIME = 2000;//2s
const WORKER_PATH = __dirname + "/tcpWorker.js";
const WORKER_HEART_BEAT = 10*1000;//10s, update memory ,etc

function main(fn){
  fn();
}

function output(str){
  console.log(str);
}

var childs = [];
var last_child_pos = 0;
function startWorker(){
  worker_succ_count = 0;
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
var exit_timer = null;
function about_exit(){
  if(exit_timer) return;

  server.close();
  childs.forEach(function(c){
    c.kill();
  })
  exit_timer = setTimeout(function(){
    output("master exit...");

    //log.destroy();
    process.exit(0);
  }, GRACE_EXIT_TIME);
}

const ADDRESS = "127.0.0.1";
const BACK_LOG = 128;

function onconnection(handle){
  //output("master on connection");
  last_child_pos++;
  if(last_child_pos >= WORKER_NUMBER){
    last_child_pos = 0;
  }
  childs[last_child_pos].send({"handle" : true}, handle);
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

  output("master is running...");
  process.on("SIGINT" , about_exit);
  process.on("SIGTERM" , about_exit);

});
