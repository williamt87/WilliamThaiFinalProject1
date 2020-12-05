//William Thai - CCCS425 final Project 1

// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));

const morgan = require("morgan");
app.use(morgan("combined"));

const cors = require("cors");
app.use(cors());

// object declaration with map

let pwd = new Map();
let msg = new Map();
let channels = new Map();
let userData = new Map();
let sessionId = new Map();
let counters = new Map();
let ban = new Map();


//token generation

let counter = 0;
let getSessionToken = () => {
  counter = counter + 84;
  return "Session Token" + counter;
                            
}

var arrChannels = [["testing1", "testing2", "testing3"]];
var arrMsg = [["testing1", "testing2", "testing3"]];

// sourcecode endpoint

app.get("/sourcecode", (req, resp) => {
  resp.send(
	require("fs")
		.readFileSync(__filename)
		.toString()
		);
});


//this is the account creation part
//
//
// ---------- [signup] ----------

app.post("/signup", (req, resp) => {
  
  let parsedBody = JSON.parse(req.body);
  let newAccount = parsedBody.username;
  let password = parsedBody.password;
  let rightPassword = pwd.get(userData);
  
 //testing the console.log
 //
 //
 //console.log("signup:");
  console.log("signup:" + newAccount + "password" + password);
  
  if (pwd.has(parsedBody.username)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Username exists"
    })
  );
    return;
    
  } if (parsedBody.password === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"password field missing"
    })
  );
    return;
    
  } if (parsedBody.username === undefined) {
    resp.send(
      
    JSON.stringify({"success":false,"reason":"username field missing"})
  );
    return;
	
  }
  pwd.set(parsedBody.username, parsedBody.password);
  
  resp.send(JSON.stringify({"success":true}));
  
});


// ---------- [login] ----------

app.post("/login", (req, resp) => {



  let parsedBody = JSON.parse(req.body);
  let newAccount = parsedBody.username;
  let rightPassword = pwd.get(newAccount);
  let password = parsedBody.password;
  
  
  // console.log("login");
  console.log("login:" + newAccount + "password" + password);
  
  if(newAccount === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"username field missing"
    })
  );
    return;
	
    
  } if (!pwd.has(newAccount)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"User does not exist"
    })
  );
    return;
    
	
  } if (password === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"password field missing"
    })
  );
    return; 
	
  }
  
  if(password === rightPassword) {
    let Token = getSessionToken();
    sessionId.set(Token, newAccount);
    resp.send(JSON.stringify({"success":true,"token":Token})
  );
    return;
	
    
  } else {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Invalid password"
    })
  );
    return;  
	
  }
  
});

// Channel Creation
//
//
// ---------- [create-channel] ----------

app.post("/create-channel", (req, resp) => {

  let parsedBody = JSON.parse(req.body);
  let token = req.headers.token;
  let newAccount = sessionId.get(token);
  let channelName = parsedBody.channelName;
  
  
  //console.log("create-channel");
  console.log("create-channel:" + "channelName" + "token"+ token);
  
  if(token === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"token field missing"
    })
  );
    return;
    
	
  } if (!sessionId.has(token)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Invalid token"
    })
  );
    return;
    
	
  } if (channelName === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"channelName field missing"
    })
  );
    return;
    
	
  } if (channels.has(channelName)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Channel already exists"
    })
  );
    return;
    
	
  }
  channels.set(channelName, newAccount);
  if(!userData.has(channelName)) {
  userData.set(channelName, []);
  }
  
  if(!ban.has(channelName)) {
    ban.set(channelName, []);
  }
  
  if(!msg.has(channelName)) {
    msg.set(channelName, []);
  }
  resp.send(JSON.stringify({"success":true}))
});

// ---------- [join-channel] ----------

app.post("/join-channel", (req, resp) => {
  

  let parsedBody = JSON.parse(req.body);
  let token = req.headers.token;
  let newAccount = sessionId.get(token);
  let channelName = parsedBody.channelName;
  let user = userData.get(channelName);
  let banUser = ban.get(channelName);
  
  // console.log("join-channel");
  console.log("join-channel:" + "channelName" + "token" + token);
  
  if(token === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"token field missing"
    })
  );
    return;
	
    
  } if (!sessionId.has(token)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Invalid token"
    })
  );
    return;
	
    
  } if (channelName === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"channelName field missing"
    })
  );
    return;
    
	
  } if (!channels.has(channelName)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Channel does not exist"
    })
  );
    return;
    
	
  } if (user.includes(newAccount)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"User has already joined"
    })
  );
    return;
    
	
  } if (banUser.includes(newAccount)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"User is banned"
    })
  );
    return;
    
	
  }
  user.push(newAccount);
  resp.send(JSON.stringify({"success":true}));
})

// ---------- [joined] ----------

app.get("/joined", (req, resp) => {
  
  let channelName = req.query.channelName;
	let token = req.headers.token;
  let newAccount = sessionId.get(token);
  let user = userData.get(channelName);
  
  // console.log("joined:");
  console.log("joined:" + "channelName" + "token" + token);
  
  if(!channels.has(channelName)) {
    resp.send(JSON.stringify({"success":false,"reason":"Channel does not exist"})
    );
    return;
	
    
  } if (token === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"token field missing"})
    );
    return;
    
	
  } if (!sessionId.has(token)) {
    resp.send(JSON.stringify({"success":false,"reason":"Invalid token"})
    );
    return;
    
	
  } if (!user.includes(newAccount)) {
    resp.send(JSON.stringify({"success":false,"reason":"User is not part of this channel"})
    );
    return;
    
	
  }
  resp.send(JSON.stringify({"success":true,"joined":user}));
});

// ---------- [leave-channel] ----------

app.post("/leave-channel", (req, resp) => {
  

  let token = req.headers.token;
  let parsedBody = JSON.parse(req.body); 
  let newAccount = sessionId.get(token);
  let channelName = parsedBody.channelName;
  let user = userData.get(channelName);
  
  
  // console.log("leave-channel:" );
  console.log("leave-channel:" + "channelName" + "token" + token);
  
  if(token === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"token field missing"})
      );
    return;
    
	
  } if (!sessionId.has(token)) {
    resp.send(JSON.stringify({"success":false,"reason":"Invalid token"})
      );
    return;
    
	
  } if (channelName === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"channelName field missing"})
      );
    return;
    
	
  } if (!channels.has(channelName)) {
    resp.send(JSON.stringify({"success":false,"reason":"Channel does not exist"})
      );
    return;
    
	
  }
  
  for(var i = 0; i < 10; i++) {
    if(user[i] === newAccount) {
      user.shift(i);
      
 // Console log for variable (array)     
      console.log(i);
      
    resp.send(JSON.stringify({"success":true}));
    return;
      
	  
   }
  }
  resp.send(
    JSON.stringify({
      "success":false,"reason":"User is not part of this channel"
    })
  );
  return;
});

// ---------- [kick] ----------

app.post("/kick", (req, resp) => {
   
  let parsedBody = JSON.parse(req.body);
  let channelName = parsedBody.channelName;
  let target = parsedBody.target;
  let channelCreator = channels.get(channelName);
  let user = userData.get(channelName);
  let token = req.headers.token;
  let newAccount = sessionId.get(token);
  
  //console.log("token");
  
  // console.log("kick:");
  console.log("kick:" + channelName + "token" + token);
  
  if(token === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"token field missing"})
    );
    return;
    
	
  } else if(!sessionId.has(token)) {
    resp.send(JSON.stringify({"success":false,"reason":"Invalid token"})
    );
    return;
    
	
  } if (channelName === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"channelName field missing"})
    );
    return;
    
	
  } if (target === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"target field missing"})
    );
    return;
    
	
  } if (newAccount !== channelCreator) {
    resp.send(JSON.stringify({"success":false,"reason":"Channel not owned by user"})
    );
    return;
    
	
  }
  
  for(var i = 0; i < 10; i++) {
    if(user[i] === target) {
      user.splice(i);
      
    // Console log for the for loop + array 
      console.log(i);
  }
  }
  resp.send(JSON.stringify({"success":true}));
});

// ---------- [ban] ----------

app.post("/ban", (req, resp) => {
  
  let parsedBody = JSON.parse(req.body);
  let channelName = parsedBody.channelName;
  let target= parsedBody.target;
  let token = req.headers.token;
  let banUser = ban.get(channelName);
  let channelCreator = channels.get(channelName);
  
  let newAccount = sessionId.get(token);
  
  // console.log("ban:");
  console.log("ban:" + channelName + "token"+ target);
  
  if(token === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"token field missing"})
    );
    return;
    
	
  } if (!sessionId.has(token)) {
    resp.send(JSON.stringify({"success":false,"reason":"Invalid token"})
    );
    return;
    
	
  } if (channelName === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"channelName field missing"})
    );
    return;
    
	
  } if (target === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"target field missing"})
    );
    return;
    
	
  } if (newAccount !== channelCreator) {
    resp.send(JSON.stringify({"success":false,"reason":"Channel not owned by user"})
    );
    return;
    
	
  }
  
  banUser.push(target);
  resp.send(JSON.stringify({"success":true}));
});
// ---------- [delete] ----------

app.post("/delete", (req, resp) => {
  
  let parsedBody = JSON.parse(req.body);
  let channelName = parsedBody.channelName;
  let token = req.headers.token;
  let channelCreator = channels.get(channelName);
  let newAccount = sessionId.get(token);
  
  
  //console.log("delete:");
  console.log("delete:" + "channelName" + "token" + token);
  
  if(token === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"token field missing"})
      );
    return;
    
	
  } if (!sessionId.has(token)) {
    resp.send(JSON.stringify({"success":false,"reason":"Invalid token"})
      );
    return;
    
	
  } if (channelName === undefined) {
    resp.send(JSON.stringify({"success":false,"reason":"channelName field missing"})
      );
    return;
    
	
  } if (!channels.has(channelName)) {
    resp.send(JSON.stringify({"success":false,"reason":"Channel does not exist"})
      );
    return;
	
  }
  
  if(newAccount === channelCreator) {
      channels.delete(channelName);
      resp.send(JSON.stringify({"success":true}));
  }
});

// sending the message


// ---------- [message] ----------

app.post("/message", (req, resp) => {
  
  let token = req.headers.token;
  let parsedBody = JSON.parse(req.body);
  let channelName = parsedBody.channelName;
  let msgContent = parsedBody.contents;
  let user = userData.get(channelName);
  let newAccount = sessionId.get(token);
  let msgList = msg.get(channelName);
  

  // console.log("channelName");
  // console.log("message");
  console.log("message: " + channelName + " msgContent " + msgList); 
  
  if(token === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"token field missing"
    })
  );
    return;
    
	
  } if (!sessionId.has(token)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Invalid token"
    })
  );
    return;
    
	
  } if (channelName === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"channelName field missing"
    })
  );
    return;
    
	
  } if (msgContent === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"contents field missing"
    })
  );
    return;
    
	
  } if (user === undefined || !user.includes(newAccount)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"User is not part of this channel"
    })
  );
    return;
	
  }
  msgList.push({"from":newAccount, "contents":msgContent});
  resp.send(JSON.stringify({"success":true})
  );
});

// getting the message
//
//
// ---------- [messages] ----------

app.get("/messages", (req, resp) => {
  
  let token = req.headers.token;
  let newAccount = sessionId.get(token);
  let channelName = req.query.channelName;
  let user = userData.get(channelName);
  let msgList = msg.get(channelName);
  
  // console.log("messages);
  console.log("messages: " + channelName + " token: " + token);  
  
  if(channelName === undefined) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"channelName field missing"
    })
   );
    return;
    
	
  } if (!channels.has(channelName)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"Channel does not exist"
    })
   );
    return;
    
	
  } if (!user.includes(newAccount)) {
    resp.send(JSON.stringify({
      "success":false,
      "reason":"User is not part of this channel"
    })
   );
    return;
    
	
  }
  resp.send(JSON.stringify({"success":true,"messages":msgList })
   );
  
});


//const listener = app.listen(process.env.PORT, ());

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});