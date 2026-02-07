let socket;
let targetX = 0;
let stats = { left: 0, right: 0 };
let trail = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    socket = io();//Establishes the real-time connection to the server

    socket.on('update', (data) => {
        targetX = data.ballX;//Updating local variables with the server's master data
        stats.left = data.leftClicks;
        stats.right = data.rightClicks;
        
        //Updating the HTML text with JS data
        document.getElementById('left-stat').innerText = `Left Power: ${stats.left}`;
        document.getElementById('right-stat').innerText = `Right Power: ${stats.right}`;
        document.getElementById('user-count').innerText = `Users Online: ${data.userCount}`;
    });

    socket.on('someone_pushed', (data) => {
        let actionTxt = document.getElementById('last-action');
        actionTxt.innerText = `Someone pushed ${data.side}!`;
        setTimeout(() => { actionTxt.innerText = ""; }, 1000);
    });

    socket.on('reset', () => { trail = []; });
}

//Draw the Ball
function draw() {
    background(10, 10, 15, 50);

    let screenX = map(targetX, -100, 100, 50, width - 50);
    
    noStroke();
    fill(255, 50, 50, stats.left * 2);
    rect(0, 0, 10, height); 
    fill(50, 255, 50, stats.right * 2);
    rect(width - 10, 0, 10, height); 

    trail.push({x: screenX, y: height/2});
    if (trail.length > 25) trail.shift();
    for (let i = 0; i < trail.length; i++) {
        fill(100, 150, 255, map(i, 0, trail.length, 0, 150));
        ellipse(trail[i].x, trail[i].y, i * 1.5);
    }

    push();
    translate(screenX, height/2);
    fill(255);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'cyan';
    ellipse(0, 0, 40);
    pop();

    fill(255, 50);
    textAlign(CENTER);
    text("TAP LEFT OR RIGHT TO BALANCE", width/2, height - 30);
}

function mousePressed() {
    //Splits the screen in half to decide push direction
    let dir = mouseX < width / 2 ? -1 : 1;
    socket.emit('push', dir);//Sending the user action to the server
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}