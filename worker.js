var http = require("http");

function output(str){
  console.log(str);
}

function main(fn){
  fn();
}

const GRACE_EXIT_TIME = 1500;

var server = null;
var exit_timer = null;
var child_req_count = 0;

function about_exit(){
  if(exit_timer) return;

  server.close();
  exit_timer = setTimeout(function(){
    output("worker will exit...");
    output("child req total : " + child_req_count);

    process.exit(0);
  },GRACE_EXIT_TIME);
}


void main(function(){
  process.on("SIGINT"  ,about_exit)
  process.on("SIGTERM" ,about_exit)

  server = http.createServer(function(req, res){
    var i,r;
    for(i=0; i<10000; i++){
      r = Math.random();
    }
    res.writeHead(200 ,{"content-type" : "text/html"});
    res.end("hello,world");
    child_req_count++;
  });

  process.on("message",function(m ,handle){
    if(handle){
      server.listen(handle, function(err){
        if(err){
          output("worker listen error");
        }else{
          process.send({"listenOK" : true});
          output("worker listen ok");
        }  
      });     
    }
    if(m.status == "update"){
      process.send({"status" : process.memoryUsage()});
    }
  });

  output("worker is running...");
});
