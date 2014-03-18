function GameManager(size, InputManager, Actuator, ScoreManager,reset) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.scoreManager = new ScoreManager;
  this.actuator     = new Actuator;

  this.startTiles   = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("reload",this.reload.bind(this));
  this.inputManager.on("back",this.back.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));


  if(reset != 0 && jQuery.type(reset) != "undefined"){
      this.reload();
  }
  else{  //first time,init ,setup
     this.setup(0,false,false,0);
      
  }
}


GameManager.prototype.back = function () {
  this.actuator.continue();
  this.setup(0,false,false,2);
}

GameManager.prototype.reload = function () {
  this.actuator.continue();
  this.setup(0,false,false,1);
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.continue();
  this.setup(0,false,false,0);
};

// Keep playing after winning
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continue();
};

GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
GameManager.prototype.setup = function (score,won,keepPlaying,loadstate) {
  switch(loadstate){
    case 2 :{
      this.grid = new Grid(this.size,1);
    }
    case 1:{
      this.grid = new Grid(this.size,1);
    }
    default:{
      this.grid = new Grid(this.size,0);
    }
  }


  this.score       = score;
  this.over        = false;
  this.won         = won;
  this.keepPlaying = keepPlaying;

  
   switch(loadstate){
    case 2 :{
      this.backTiles();    //backward
    }
    case 1:{
      this.reloadTiles();  //load data
    }
    default:{
      this.addStartTiles();  // Add the initial tiles
    }
  }
 
  // Update the actuator
  this.actuate();

};


GameManager.prototype.backTiles = function (){
    var size = window.size;
    var data = window.data;
    console.log("in reloadTiles");
    showState(size,data);
    for(var i=0;i<size;i++){
      for(var j=0;j<size;j++){
        if(data[i][j]!=0){
           var position = new Object();
           position.x=i;
           position.y=j;
           var tile = new Tile(position,data[i][j]);        
           this.grid.insertTile(tile);
        }     
      }
    }
    
};

//load data to reset game with
GameManager.prototype.reloadTiles = function (){
    var loaddata=JSON.parse(localStorage.gamedata);
    var loadsize = loaddata[0];
    var loadtile = loaddata[1];
    copyData(loadtile,window.data,loaddata[0]);
    copyData(loadtile,window.data_bak,loaddata[0]);
    console.log("in reloadTiles");
  //  showState(loadsize,loadtile);
    showState(window.size,window.data_bak);
    for(var i=0;i<loadsize;i++){
      for(var j=0;j<loadsize;j++){
        if(loadtile[i][j]!=0){
           var position = new Object();
           position.x=i;
           position.y=j;
           var tile = new Tile(position,loadtile[i][j]);        
           this.grid.insertTile(tile);
        }     
      }
    }
    
};


// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
 //   value = 1024;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
    window.data[tile.x][tile.y]=tile.value;
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.scoreManager.get() < this.score) {
    this.scoreManager.set(this.score);
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.scoreManager.get(),
    terminated: this.isGameTerminated()
  });

};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();

    }
  });

};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;


  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
     
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }

 
 if (moved){
     copyData(window.data,window.data_bak,window.size); 
 }
 else{
     copyData(window.data_bak,window.data,window.size);
 }

};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });
      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  //console.log("("+first.x+","+first.y+")"+"("+second.x+","+second.y+")");
  return first.x === second.x && first.y === second.y;
};
