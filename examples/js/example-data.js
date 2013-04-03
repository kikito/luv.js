var example_data = {"airplanes":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Animations example</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n\n// This Luv.js example shows off how to work with Animations\n\nvar luv = Luv();\n\nvar mustangs, lockHeed, hydro, lockHeedAngle, hydroAngle, submarine;\n\n// luv.load is normally where the game gets initialized, and where resources are loaded\nluv.load = function() {\n  // Uncomment to deactivate image aliasing on the two big planes\n  // luv.graphics.setImageSmoothing(false);\n\n  var img = luv.graphics.Image('img/1945.png');\n\n  // create 3 spritesheets: 1 for the small planes, 1 for the big ones, and\n  // one for the submarine.       Params:   sprite size,  top,left, border size\n  var s32  = luv.graphics.SpriteSheet(img,     32,32,       3,3,        1);\n  var s65  = luv.graphics.SpriteSheet(img,     65,65,     300,102,      1);\n  var sSub = luv.graphics.SpriteSheet(img,     32,98,     366,102,      1);\n\n  mustangs = [\n              //   x1    y1   frame duration\n    s32.Animation(['0-7', 1],   0.2),\n    s32.Animation(['0-7', 2],   0.3),\n    s32.Animation(['0-7', 3],   0.4),\n    s32.Animation(['0-7', 4],   0.5),\n\n              //   x1    y1    x2    y2  frame duration\n    s32.Animation([17, '6-10', 17, '9-7'], 0.6),\n    s32.Animation([18, '6-10', 18, '9-7'], 0.7),\n    s32.Animation([19, '6-10', 19, '9-7'], 0.8),\n    s32.Animation([20, '6-10', 20, '9-7'], 0.9)\n  ];\n\n  lockHeed      = s65.Animation([0, '0-2'], 0.1);\n  lockHeedAngle = 0;\n\n  hydro         = s65.Animation(['1-3', 2], 0.1);\n  hydroAngle    = 0;\n\n  submarine = sSub.Animation(\n    ['0-6', 0, '5-1', 0], // x1, y1, x2, y2\n    { 0: 1, '1-5': 0.1, 6: 1, '7-11': 0.1} // frame durations (in object format)\n  );\n};\n\n// luv.update for updating variables: the game \"thinks\" and \"moves\" here\nluv.update = function(dt) {\n  // If the image is not loaded, just return\n  if(!luv.media.isLoaded()) { return; }\n\n  // update all animations\n  for(var i=0; i < mustangs.length; i++) { mustangs[i].update(dt); }\n  lockHeed.update(dt);\n  hydro.update(dt);\n  submarine.update(dt);\n\n  // The angles of the two big planes. Try switching the signs below\n  lockHeedAngle += dt;\n  hydroAngle    -= dt;\n};\n\n// luv.draw is where the drawing actions go\nluv.draw = function() {\n  // Do nothing until the image is loaded\n  if(!luv.media.isLoaded()) { return; }\n\n  // Draw the small planes\n  for(var i=0; i < mustangs.length; i++) {\n    luv.graphics.draw(mustangs[i], (i+1)*75, (i+1)*50);\n  }\n\n  // Draw the big planes, spinning\n  luv.graphics.drawCentered(lockHeed, 100, 432, lockHeedAngle);\n  luv.graphics.drawCentered(hydro,    250, 432, hydroAngle);\n\n  // Draw the submarine. Try changing these coordinates\n  luv.graphics.draw(submarine, 500, 100);\n};\n\nluv.run();\n\n</script>\n</body>\n</html>\n","bob_the_square":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Keyboard and primitive drawing</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n// This Luv.js example shows the two different ways to use the keyboard in Luv.js\n// You can move Bob with the arrow keys (make sure to click on the game to focus\n// it first)\n\nvar luv = Luv();\n\n// This is bob. It's a Javascript object with some values inside\nvar bob = {x: 400, y: 280, dx: 0, dy: 0, w:50, h:50};\n\n// luv.update is where the game intelligence goes. In this case\n// we use it to change Bob's internal dy variable by calling\n// luv.keyboard.isDown\nluv.update = function(dt) {\n  bob.dy = 0;\n\n  if(luv.keyboard.isDown('up'))    { bob.dy = -1; }\n  if(luv.keyboard.isDown('down'))  { bob.dy = 1; }\n\n  bob.x += bob.dx * 60 * dt;\n  bob.y += bob.dy * 60 * dt;\n};\n\n// luv.keyboard.onPressed gets called every time a key is pressed. On this\n// case we use it to change bobs' dx variable\nluv.keyboard.onPressed = function(key, code) {\n  if(key == 'left')       { bob.dx = -1; }\n  else if(key == 'right') { bob.dx = 1;  }\n};\n\n// luv.keyboard.onPressed gets called every time a key is pressed. On this\n// case we use it to change bobs' dx variable\nluv.keyboard.onReleased = function(key, code) {\n  if((key == 'left' && bob.dx == -1) ||\n     (key == 'right' && bob.dx == 1)) {\n       bob.dx = 0;\n  }\n};\n\n// This big function draws bob as a series of circles, squares and arcs\n// Try changing some of the colors\nluv.draw = function() {\n  luv.graphics.setColor(255,255,0);\n  var l = bob.x - bob.w/2,\n      t = bob.y - bob.h/2,\n      w = bob.w,\n      h = bob.h;\n  luv.graphics.fillRectangle(l,t,w,h);\n\n  luv.graphics.setColor(128,128,0);\n  luv.graphics.setLineWidth(3);\n  luv.graphics.strokeRectangle(l,t,w,h);\n\n  luv.graphics.setColor(255,255,255);\n\n  var r  = w/5,\n      r2 = w/13;\n\n  var x1 = l + r + r2,\n      y = t + r + r2,\n      x2 = l + w - r - r2;\n\n  luv.graphics.fillCircle(x1, y, r);\n  luv.graphics.fillCircle(x2, y, r);\n\n  luv.graphics.setColor(0,0,0);\n  luv.graphics.setLineWidth(1);\n  luv.graphics.strokeCircle(x1,y,r);\n  luv.graphics.fillCircle(x1 + bob.dx * r2,y + bob.dy * r2,r2);\n  luv.graphics.strokeCircle(x2,y,r);\n  luv.graphics.fillCircle(x2 + bob.dx * r2,y + bob.dy * r2,r2);\n\n  luv.graphics.strokeCircle(bob.x, bob.y, r2);\n  luv.graphics.strokeArc(bob.x, bob.y, 2*r, 0, Math.PI);\n};\n\n// luv.run starts the game. If this line is removed, the game doesn't start\nluv.run();\n\n</script>\n</body>\n</html>\n","bubbles":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Drawing and updating</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n\n// This Luv.js example shows how to draw circles and move them around.\nvar luv = Luv({fullWindow: true});\n\n// This array will hold all the bubbles in the game\nvar bubbles = [];\n\n// Rand is a simplified function that returns a random name between min and max\nvar rand = function(min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min;\n};\n\n// newBubble returns a js object representing a bubble\nvar newBubble = function() {\n  var sd = luv.graphics.getDimensions();\n  return {\n    x : rand(25, sd.width - 25),\n    y : sd.height + rand(50, 100),\n    r : rand(10, 40),\n    vy: rand(30, 80)\n  };\n};\n\n// we use luv.load to initialize our game. In this case, create 100 bubbles,\n// store them inside the bubbles array, and set the background color\nluv.load = function() {\n  for(var i=1; i<100; i++) {\n    bubbles.push(newBubble());\n  }\n  luv.graphics.setBackgroundColor(255,0,30);\n};\n\n// luv.update just moves bubbles up until they exit the screen. Then, it replaces\n// them by new bubbles, which raise from the bottom.\nluv.update = function(dt) {\n  var bubble;\n\n  for(var i=0; i < bubbles.length; i++) {\n    bubble = bubbles[i];\n    bubble.y -= bubble.vy * dt;\n\n    if(bubble.y < -50) {\n      bubbles[i] = newBubble();\n    }\n  }\n};\n\n// luv.draw draws the bubbles, as a series of circles. Try changing the colors\nluv.draw = function() {\n  var sd = luv.graphics.getDimensions();\n  var bubble;\n\n  for(var i=0; i < bubbles.length; i++) {\n    bubble = bubbles[i];\n    luv.graphics.setColor(255,98,0);\n    luv.graphics.fillCircle(bubble.x, bubble.y, bubble.r);\n\n    luv.graphics.setLineWidth(bubble.r/7.0);\n    luv.graphics.setColor(255,225,200);\n    luv.graphics.strokeCircle(bubble.x, bubble.y, bubble.r);\n\n    luv.graphics.fillCircle(\n      bubble.x - bubble.r/2,\n      bubble.y - bubble.r/2.5,\n      bubble.r / 3);\n  }\n\n  luv.graphics.setColor(255,225,255);\n  var fps = Math.round(luv.timer.getFPS());\n  luv.graphics.print(\"FPS: \" + fps, sd.width - 40, 10);\n};\n\n// Don't forget to execute luv.run, or the game will not start.\nluv.run();\n\n</script>\n</body>\n</html>\n","cat_and_mouse":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Mouse tracking via imgae</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n\n// This Luv.js example shows how to load and show zoomed & rotated images, as well\n// as how to track the mouse position\n\n// Setting fullWinow to true makes the game canvas take the whole window frame\nvar luv = Luv({fullWindow: true});\n\n// cat is a plain js object\nvar cat = { x: 400, y: 300, angle: 0, sx: 1, sy: 1 };\n\n// start loading the image inside luv.load\nluv.load = function() {\n  cat.img = luv.graphics.Image('img/cat.png');\n};\n\n// luv.update makes the cat move by altering its variables.\nluv.update = function(dt) {\n  if(!luv.media.isLoaded()) { return; }\n\n  var halfPI   = Math.PI / 2,\n      mousePos = luv.mouse.getPosition(),\n      dx       = mousePos.x - cat.x,\n      dy       = mousePos.y - cat.y,\n      distance = Math.sqrt(dx*dx + dy*dy),\n      scale    = Math.min(1, Math.max(0.25, distance == 0 ? 1 : 100 / distance));\n\n  // This makes cat look at the mouse position\n  cat.angle = Math.atan2(dy, dx);\n\n  // This makes cat run towards the mouse. The further away the mouse is,\n  // the faster cat will move (until it's 5 pixels away or so)\n  if(distance > 5) {\n    cat.x += dx * dt;\n    cat.y += dy * dt;\n  }\n\n  // Cat also gets bigger when he is near the mouse position. Also, it\n  // needs to \"flip\" on the y coordinate if the mouse is to her left\n  cat.sx    = scale;\n  cat.sy    = cat.angle <= halfPI && cat.angle >= -halfPI ? scale : -scale;\n};\n\n// luv.draw draws the cat image and a laser pointer\nluv.draw = function() {\n  if(!luv.media.isLoaded()) { return; }\n\n  // draws the image with the calculated position, angle, and scale\n  luv.graphics.drawCentered(cat.img, cat.x, cat.y, cat.angle, cat.sx, cat.sy);\n\n  // draws a circle around the mouse mosition. Try making it green\n  var mousePos = luv.mouse.getPosition();\n  luv.graphics.setColor(255,0,0,125);\n  luv.graphics.fillCircle(mousePos.x, mousePos.y, 10);\n};\n\n// Without invoking this function, none of the above functions will actally run.\nluv.run();\n</script>\n</body>\n</html>\n","ding":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Simple sound example</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n\n// This Luv.js example shows how to load and play a sound.\n// Press any key (or mouse button) to play a \"ding\" sound.\n\n// On the screen you will see now many instances of the sound there are\n// on memory, and how many of them are playing. If you stop playing them,\n// they will get discarded from memory after a while.\n\nvar luv = Luv();\n\nvar dingSound;\n\n// Start loading the sound inside luv.load. Notice the two paths.\nluv.load = function() {\n  dingSound = luv.audio.Sound('sfx/ding.ogg', 'sfx/ding.mp3');\n};\n\n// This is one way to bind mouse and key presses to an action\n// In this case, they play the sound (if it has been loaded)\nluv.keyboard.onPressed = luv.mouse.onPressed = function() {\n  if(!luv.media.isLoaded()) { return; }\n  dingSound.play();\n};\n\n// luv.draw is used to display two simple text lines\nluv.draw = function() {\n  luv.graphics.print(\"Total Instances: \" + dingSound.countInstances(), 100, 100);\n  luv.graphics.print(\"Playing Instances: \" + dingSound.countPlayingInstances(), 100, 150);\n};\n\n// As always, don't forget to invoke luv.run to start the game\nluv.run();\n\n</script>\n</body>\n</html>\n","hello_luv":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Basic luv.js example</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n// This is the simplest Luv.js example possible. It just prints a message.\nvar luv = Luv();\n\n// Try changing the numbers or the message here\nluv.draw = function() {\n  luv.graphics.print(\"Hello, luv <3 <3\", 200, 300);\n};\n\nluv.run();\n\n</script>\n</body>\n</html>\n","introduction":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Basic luv.js example</title></head>\n<body>\n  <h1>❧ Welcome to the Luv.js testing page!</h1>\n\n  <p>You can try Luv.js here without having to install Luv.js or even open a text editor.</p>\n\n  <p>Feel free to type anything you want on the text field to the left. This frame will\n     automatically update as you keep adding stuff.</p>\n\n  <p>You can also click any of the links on the far left. They are pre-built examples that\n     show some of the aspects of this library.</p>\n\n  <p>If you wish to conserve a piece of code you wrote here, copy it and paste it somewhere\n     else (maybe in a proper text editor capable of saving stuff). This page doesn't save\n     have any saving capabilies.\n  </p>\n\n  <pre style=\"line-height: 1em;\">\n╱╱╱╱╭╮╱╭╮╱╱╱╱╱╱╱╱╱╱╭━╮╱╱╱╱╱╱╭╮\n╱╱╱╱┃┃╱┃┃╱╱╱╱╱╱╱╱╱╱┃╭╯╱╱╱╱╱╱┃┃\n╱╭╮╱┃╰━╯┣━━┳╮╭┳━━╮╭╯╰┳╮╭┳━╮╱┃┃\n╭╯╰╮┃╭━╮┃╭╮┃╰╯┃┃━┫╰╮╭┫┃┃┃╭╮╮╰╯\n╰╮╭╯┃┃╱┃┃╭╮┣╮╭┫┃━┫╱┃┃┃╰╯┃┃┃┃╭╮\n╱╰╯╱╰╯╱╰┻╯╰╯╰╯╰━━╯╱╰╯╰━━┻╯╰╯╰╯\n  </pre>\n  <script src=\"../luv.js\"></script>\n  <canvas id=\"canvas\" width=\"500\" height=\"200\" style=\"display: block; margin: 20px auto;\"></canvas>\n  <script>\n    var x = 100, y = 100, r=15, vx = 200, vy = 200;\n    Luv({\n      id: \"canvas\",\n      load: function() {\n        this.graphics.setColor(247, 0, 119);\n        this.graphics.setBackgroundColor(255,192,203);\n      },\n      draw: function() {\n        this.graphics.fillCircle(x,y,r);\n      },\n      update: function(dt) {\n        var d = this.graphics.getDimensions();\n        x += vx * dt;\n        y += vy * dt;\n        if((vx < 0 && x < r) || (vx > 0 && x > d.width - r)){ vx *= -1; }\n        if((vy < 0 && y < r) || (vy > 0 && y > d.height - r)){ vy *= -1; }\n      }\n    }).run();\n  </script>\n</body>\n</html>\n","paint":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Mouse and Canvas example</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n\n// This semi-advanced example shows how to draw in a canvas using the mouse\n// Try moving the mouse wheel up and down. It will change the brush size and color\n\nvar luv = Luv({fullWindow: true});\n\n// Some global variables\nvar canvas = luv.graphics.Canvas(),\n    prevPos = null,\n    radius = 2,\n    color  = 0;\n\n// luv.load in this case does very little; just sets the line cap and background color\nluv.load = function() {\n  luv.graphics.setBackgroundColor(255, 255, 255);\n  luv.graphics.setLineCap('round');\n};\n\n// luv.update is interesting, because it actually draws things... to the internal canvas.\nluv.update = function(dt) {\n  if(luv.mouse.isPressed(\"l\")) {\n    var pos = luv.mouse.getPosition()\n    luv.graphics.setCanvas(canvas);\n    if(prevPos.x === pos.x && prevPos.y === pos.y) {\n      luv.graphics.fillCircle(pos.x, pos.y, radius);\n    } else {\n      luv.graphics.line(prevPos.x, prevPos.y, pos.x, pos.y);\n    }\n  }\n};\n\n// luv.graphics basically just draws the back canvas and the brush on the screen\nluv.draw = function() {\n  luv.graphics.setLineWidth(radius * 2);\n  if(color > 255) {\n    luv.graphics.setColor(color-255, color-255, 255);\n  } else {\n    luv.graphics.setColor(0,0,color);\n  }\n  luv.graphics.draw(canvas, 0, 0);\n  var pos = luv.mouse.getPosition();\n  luv.graphics.fillCircle(pos.x, pos.y, radius);\n  prevPos = pos;\n};\n\n// luv.onResize is called when the window changes size. On this case, I use it to resize\n// the internal canvas\nluv.onResize = function(width, height) {\n  canvas.setDimensions(width, height);\n};\n\n// luv.mouse.onPressed handles both mouse presses (start drawing) and wheel (change brush)\nluv.mouse.onPressed = function(x,y,button) {\n  switch(button) {\n    case \"l\":\n      prevPos = {x: x, y: y};\n      break;\n    case \"wu\":\n      radius = Math.min(64, radius + 1);\n      color  = Math.min(510, color + 8);\n      break;\n    case \"wd\":\n      radius = Math.max(2, radius - 1);\n      color  = Math.max(0, color - 8);\n      break;\n  }\n};\n\n// Finally, never forget to invoke luv.run() when everything is ready! Otherwise the game will\n// not start\nluv.run();\n\n</script>\n</body>\n</html>\n","rectangles":"<!doctype html>\n<html><head><meta charset=\"utf-8\" /><title>Moving rectangles</title></head>\n<body>\n<script src=\"../luv.js\"></script>\n<script>\n\n// This Luv.js function displays random moving rectangles on the screen.\nvar luv = Luv({fullWindow: true});\n\nvar rand = function(min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min;\n}\n\n// This array will hold the game's rectangles\nvar rectangles = [];\n\n// luv.load creates several rectangles and inserts them into the \"rectangles\"\n// variable at the beginning of the game\nluv.load = function() {\n  var d = luv.graphics.getDimensions();\n  for(var i=0; i<200; i++) {\n    rectangles.push({\n      l: rand(0,d.width - 50), t: rand(0, d.height - 50),\n      w: rand(50,100), h: rand(50,100),\n      vx: rand(-100,100), vy: rand(-100, 100),\n      r: rand(50,255), g: rand(50,255), b: rand(50,255),\n      type: rand(0,1) ? 'fill' : 'stroke'\n    });\n  }\n};\n\n// luv.update moves the rectangles around, making them \"bounce\" with the screen borders\n// Try removing this function (the rectangles will stop moving)\nluv.update = function(dt) {\n  var d = luv.graphics.getDimensions();\n  for(var i=0; i<rectangles.length; i++) {\n    var r = rectangles[i];\n    r.l += r.vx * dt;\n    r.t += r.vy * dt;\n    if(r.l < 0)              { r.vx =  Math.abs(r.vx); }\n    if(r.l > d.width - r.w)  { r.vx = -Math.abs(r.vx); }\n    if(r.t < 0)              { r.vy =  Math.abs(r.vy); }\n    if(r.t > d.height - r.h) { r.vy = -Math.abs(r.vy); }\n  }\n};\n\n// luv.draw draws all the rectangles on their ever-changing positions.\nluv.draw = function() {\n  var rect = null;\n  for(var i=0; i<rectangles.length; i++) {\n    rect = rectangles[i];\n    luv.graphics.setColor(rect.r, rect.g, rect.b);\n\n    if(rect.type == 'fill') {\n      luv.graphics.fillRectangle(rect.l, rect.t, rect.w, rect.h);\n    } else {\n      luv.graphics.strokeRectangle(rect.l, rect.t, rect.w, rect.h);\n    }\n  }\n};\n\n// luv.run must be invoked, otherwise the game will not start\nluv.run();\n</script>\n</body>\n</html>\n"};