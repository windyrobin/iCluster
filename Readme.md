###icluster

Works on v0.5.9+

Compare to multi-node or node-cluster ,it's very simple/fast and easy to
mantain/hack ,so you could write you own cluster based on it.

It supports two types :

- multi worker processes listen on the same port
- the master receives the incoming sockets and distributes them to workers

In my test machine , CPU X 5 ,it could reach 10K qps for task like below:

```js
server = http.createServer(function(req, res){
  var i,r;
  for(i=0; i<10000; i++){
    r = Math.random();
  }   
  res.writeHead(200 ,{"content-type" : "text/html"});
  res.end("hello,world");
  child_req_count++;
});
```

just enjoy it

weibo : http://weibo.com/windyrobin