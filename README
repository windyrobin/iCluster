##icluster
this's a very simple cluster ,and it supports two types :

#1 multi worker processes listen on the same port
#2 the master recv the incoming sockets and distribute to worker

in my test machine  CPU X 5 ,it could reach 10K qps of tasks like below:

>server = http.createServer(function(req, res){
>  var i,r;
>  for(i=0; i<10000; i++){
>    r = Math.random();
>  }   
>  res.writeHead(200 ,{"content-type" : "text/html"});
>  res.end("hello,world");
>  child_req_count++;
>});

just enjoy it

weibo : http://weibo.com/windyrobin