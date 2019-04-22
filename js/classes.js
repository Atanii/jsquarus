const Dir = Object.freeze({
   "up" : 10,
   "right": 20,
   "down": 30,
   "left": 40
});

class Sound {
    constructor(name, path, isLooping, isAutoPlay, appendToThisNode, type = "wav", muted = false) {
        this.id = name;
        this.node = $(
        '<audio id="' + name + '">' +
            '<source src="' + path + '" type="audio/' + type + '">' +
        '</audio>'
        );        
        this.node.attr("loop", isLooping);
        this.node.attr("autoplay", isAutoPlay);
        this.node.attr("muted", muted);
        this.node.appendTo(appendToThisNode);
    }
    play() {
        document.getElementById(this.id).play();
    }
    pause() {
        document.getElementById(this.id).pause();
    }
}

class Player {
    constructor() {
        this.boxMovedEvent = new CustomEvent('box-moved');
        this.atGoalEvent = new CustomEvent('goal-reached');
        this.atBonusEvent = new CustomEvent('bonus-reached');
        this.score = 0;
        this.fxBonus = new Sound(
            "bonus",
            "assets/sound/Atanii - JSquarus - Bonus.wav",
            false, false,
            "body"
        );
        (document.getElementById("bonus")).volume = 0.1;
        this.fxGameOver = new Sound(
            "game-over",
            "assets/sound/Atanii - JSquarus - Game Over.wav",
            false, false,
            "body"
        );
        (document.getElementById("game-over")).volume = 0.1;
    }

    set(x, y, size) {
        this.gridSize = size;
        this.x = x;
        this.y = y;        
        this.initElement();    
    }

    setGoal(goal) {
        this.goal = goal;
    }

    isBox(x, y) {
        let res = undefined;
        DEBUG && console.log("Player box collision checking: " + x + "; " + y);
        $("#gameArea").find('.box').each( function() {
            if( $(this).css('top') == y + "px" && $(this).css('left') == x + "px" ) {
                res = $(this);
                return;
            }
        }); 
        return res;
    }

    isGoal(x, y) {
        if( this.goal.x == x && this.goal.y == y ) {
            document.dispatchEvent(this.atGoalEvent);
        }
    }

    isLaser(x, y) {
        let res = false;
        const gridSize = this.gridSize;
        DEBUG && console.log("Player laser collision checking: " + x + "; " + y);
        $("#gameArea").find('.laser').each( function() {
            if( $(this).css('top') == y + "px" && $(this).css('left') == x + "px" ) {
                res = true;
                console.log("Laser hit!");
                return;
            }
        });
        DEBUG && console.log(
            "Player laser-line collision checking: " + (x + (this.gridSize / 4)) + "; " + (y + (this.gridSize / 4)) + "px"
        );
        $("#gameArea").find('.laser-line').each( function() {
            if( $(this).css('top') == ( y + (gridSize / 4) ) + "px" && 
                $(this).css('left') == ( x + (gridSize / 4) ) + "px" ) {
                res = true;
                console.log("Laser hit!");
                return;
            }
        });
        return res;
    }

    checkLaser(x, y) {
        if (this.isLaser(this.x, this.y)) {
            $('#player').addClass("hurt");
            this.fxGameOver.play();
        }
    }

    afterMove() {    
        this.checkLaser(this.x, this.y);
        this.checkBonus(this.x, this.y);
    }

    afterMoveWithBox() {        
        document.dispatchEvent(this.boxMovedEvent);
        this.checkLaser(this.x, this.y);
        this.checkBonus(this.x, this.y);
    }

    checkBonus(x, y) {
        const bonus = LevelHandler.isBonus(x, y);
        if(!!bonus) {
            bonus.remove();
            this.score++;
            this.fxBonus.play();
            document.dispatchEvent(this.atBonusEvent);            
        }
    }

    move(event) {
        switch(event.key) {
            case 't': {
                console.log("/===================\\");
                console.log("+-------------------+");
                console.log("| Score: " + this.score);
                console.log("+-------------------+")
                console.log("\\===================/");
                break;
            }
            case 'w': {
                const box = this.isBox(this.x, this.y - this.gridSize)        
                if(!!box) {
                    if(!LevelHandler.isWallOrBox(this.x, this.y - 2 * this.gridSize)) {
                        this.y -= this.gridSize;
                        box.animate({
                            top: (this.y - this.gridSize) + "px",
                            left: this.x + "px"
                        }, 200);
                        $('#player').animate({
                            top: this.y + "px",
                            left: this.x + "px"
                        }, 200, this.afterMoveWithBox.bind(this));
                    }
                }
                else if(!LevelHandler.isWall(this.x, this.y - this.gridSize)) {
                    this.y -= this.gridSize;
                    $('#player').animate({
                        top: this.y + "px",
                        left: this.x + "px"
                    }, 200, this.afterMove.bind(this));
                }
                break;
            }
            case 'd': {
                const box = this.isBox(this.x + this.gridSize, this.y);
                if(!!box) {
                    if(!LevelHandler.isWallOrBox(this.x + 2 * this.gridSize, this.y)) {
                        this.x += this.gridSize;
                        box.animate({
                            top: this.y + "px",
                            left: (this.x + this.gridSize) + "px"
                        }, 200);
                        $('#player').animate({
                            top: this.y + "px",
                            left: this.x + "px"
                        }, 200, this.afterMoveWithBox.bind(this));
                    }
                }
                else if(!LevelHandler.isWall(this.x + this.gridSize, this.y)) {
                    this.x += this.gridSize;
                    $('#player').animate({
                        top: this.y + "px",
                        left: this.x + "px"
                    }, 200, this.afterMove.bind(this));
                }
                break;
            }
            case 's': {
                const box = this.isBox(this.x, this.y + this.gridSize);
                if(!!box) {
                    if(!LevelHandler.isWallOrBox(this.x, this.y + 2 * this.gridSize)) {
                        this.y += this.gridSize;
                        box.animate({
                            top: (this.y + this.gridSize) + "px",
                            left: this.x + "px"
                        }, 200);
                        $('#player').animate({
                            top: this.y + "px",
                            left: this.x + "px"
                        }, 200, this.afterMoveWithBox.bind(this));
                    }
                }
                else if(!LevelHandler.isWall(this.x, this.y + this.gridSize)) {
                    this.y += this.gridSize;
                    $('#player').animate({
                        top: this.y + "px",
                        left: this.x + "px"
                    }, 200, this.afterMove.bind(this));
                }
                break;
            }
            case 'a': {
                const box = this.isBox(this.x - this.gridSize, this.y);
                if(!!box) {
                    if(!LevelHandler.isWallOrBox(this.x - 2 * this.gridSize, this.y)) {
                        this.x -= this.gridSize;
                        box.animate({
                            top: this.y + "px",
                            left: (this.x - this.gridSize) + "px"
                        }, 200);
                        $('#player').animate({
                            top: this.y + "px",
                            left: this.x + "px"
                        }, 200, this.afterMoveWithBox.bind(this));
                        
                    }
                }
                else if(!LevelHandler.isWall(this.x - this.gridSize, this.y)) {
                    this.x -= this.gridSize;
                    $('#player').animate({
                        top: this.y + "px",
                        left: this.x + "px"
                    }, 200, this.afterMove.bind(this));
                }
                break;
            }
            default:
                break;
        }
        this.isGoal(this.x, this.y)
    }

    initElement() {        
        this.element = $('<div id="player"></div>');           
        this.element.css({
            "position": "absolute",
            "top": this.y + "px",
            "left": this.x + "px",
            "background-color": "white",
            "width": this.gridSize + "px",
            "height": this.gridSize + "px",
            "z-index": 1
        });
        this.element.appendTo('#gameArea');
    }
}

class Laser {
    constructor(x, y, direction, size = 50, color = "red") {        
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.gridSize = size;
        this.placeLaser(x, y, direction);
    }

    static removeFormerLasers() {
        $('.laser').each(function () {
            $(this).remove();
        });
        $('.laser-line').each(function () {
            $(this).remove();
        });
    }

    placeLaserLine(x, y, direction) {
        switch(direction) {
            case Dir.up: {
                while(!LevelHandler.isWallOrBox(x * this.gridSize, (y - 1) * this.gridSize )) {
                    const laserLine = $('<div class="laser-line"></div>');
                    laserLine.css({
                        "position": "absolute",
                        "top": ( (y - 1) * this.gridSize + (this.gridSize / 4) ) + "px",
                        "left": (x * this.gridSize + (this.gridSize / 4) ) + "px",
                        "background-color": "red",
                        "width": (this.gridSize / 2) + "px",
                        "height": (this.gridSize / 2) + "px"
                    });
                    laserLine.appendTo('#gameArea');
                    DEBUG && console.log("Added laser line: " + laserLine);
                    --y;
                } // while
                break;
            }
            case Dir.right: {
                while(!LevelHandler.isWallOrBox( (x + 1) * this.gridSize, y * this.gridSize)) {
                    const laserLine = $('<div class="laser-line"></div>');
                    laserLine.css({
                        "position": "absolute",
                        "top": ( y * this.gridSize + (this.gridSize / 4) ) + "px",
                        "left": ((x + 1) * this.gridSize + (this.gridSize / 4) ) + "px",
                        "background-color": "red",
                        "width": (this.gridSize / 2) + "px",
                        "height": (this.gridSize / 2) + "px"
                    });
                    laserLine.appendTo('#gameArea');
                    DEBUG && console.log("Added laser line: " + laserLine);
                    ++x;
                } // while
                break;
            }
            case Dir.down: {
                while(!LevelHandler.isWallOrBox(x * this.gridSize, (y + 1) * this.gridSize )) {
                    const laserLine = $('<div class="laser-line"></div>');
                    laserLine.css({
                        "position": "absolute",
                        "top": ( (y + 1) * this.gridSize + (this.gridSize / 4) ) + "px",
                        "left": (x * this.gridSize + (this.gridSize / 4) ) + "px",
                        "background-color": "red",
                        "width": (this.gridSize / 2) + "px",
                        "height": (this.gridSize / 2) + "px"
                    });
                    laserLine.appendTo('#gameArea');
                    DEBUG && console.log("Added laser line: " + laserLine);
                    ++y;
                } // while
                break;
            }
            case Dir.left: {
                while(!LevelHandler.isWallOrBox( (x - 1) * this.gridSize, y * this.gridSize)) {
                    const laserLine = $('<div class="laser-line"></div>');
                    laserLine.css({
                        "position": "absolute",
                        "top": ( y * this.gridSize + (this.gridSize / 4) ) + "px",
                        "left": ((x - 1) * this.gridSize + (this.gridSize / 4) ) + "px",
                        "background-color": "red",
                        "width": (this.gridSize / 2) + "px",
                        "height": (this.gridSize / 2) + "px"
                    });
                    laserLine.appendTo('#gameArea');
                    DEBUG && console.log("Added laser line: " + laserLine);
                    --x;
                } // while
                break;
            }
            default:
                break;
        }
    }

    placeLaser(x, y, direction) {
        let xx = x / this.gridSize;
        let yy = y / this.gridSize;

        const laserGrid = $('<div class="laser"></div>');

        laserGrid.css({
            "position": "absolute",
            "top": y + "px",
            "left": x + "px",
            "background-color": "red",
            "width": this.gridSize + "px",
            "height": this.gridSize + "px"
        });
        laserGrid.appendTo('#gameArea');

        this.placeLaserLine(xx, yy, direction);
    }
}

class HighScore {
    constructor(player, show = false) {
        this.player = player;
        this.players = [
            { name: "John", score: 1 },
            { name: "Mary", score: 3 },
            { name: "Dávid", score: 2 },
            { name: "Nincs ennyi pont a játékban", score: 10 },
            { name: "Some AI..", score: 2 },
        ];        
        this.node = $(
            '<div id="highscore">' +
                '<input id="player-name" placeholder="your name (press enter to accept)"></input>' +
                '<textarea id="players-list"></textarea>' +
            '</div>'
        );
        this.node.appendTo('body');        
        $('#players-list').html(this.list());
        $('#player-name').on('keydown', this.acceptName.bind(this));
        this.show = show;
        this.updateVisibility();
    }
    toggleVisibility() {
        this.show = !this.show;
        this.updateVisibility();
    }
    updateVisibility() {
        this.node.css({
            "visibility": this.show ? "visible" : "hidden"
        });
    }    
    acceptName(event) {
        if(!this.show || event.key != 'Enter') {
            return;
        }
        const name = $('#player-name').val();
        if(!name) {
            return;
        }
        this.players.push(
            {
                name: name,
                score: this.player.score
            }
        );
        $('#player-name').val("");
        $('#players-list').html(this.list());        
    }    
    sort(ascending = false) {
        if(ascending) {
            this.players.sort((a, b) => {
                return a.score - b.score;
            });
        } else {
            this.players.sort((a, b) => {
                return b.score - a.score;
            });
        }        
    }
    list() {
        let l = "";
        this.sort();
        for(let i = 0; i < this.players.length; i++) {
            l = l.concat(
                (i + 1) + ". " + this.players[i].name + " : " + this.players[i].score + "\n"
            );
        }
        return l;
    }
}

class LevelHandler {
    constructor(gridSize = 50, levelSize = 16) {
        this.gridSize = gridSize;
        this.levelSize = levelSize;
        this.doneEvent = new CustomEvent("levelsAreReady");
        this.currentLevel = 0;
        this.maxLevels = 5;
        this.player = new Player();
        this.hs = new HighScore(this.player);
        $(window).on('keydown', event => {            
            if(!this.hs.show && !$('#player').hasClass("hurt")) {
                this.player.move(event);
            }            
        });
        $(window).on('keydown', event => {
            if(event.key == 'h') {
                this.hs.toggleVisibility();
            }
            else if(!this.hs.show && event.key == 'r') {
                this.player.score = 0;
                this.reloadCurrentLevel();
            }
        });
        $(document).on('box-moved', event => {
            Laser.removeFormerLasers();
            for(let i = 0; i < this.lasers.length; i++) {
                this.lasers[i].placeLaser(this.lasers[i].x, this.lasers[i].y, this.lasers[i].direction);
            }
        });
        $(document).on('goal-reached', event => {
            if( (this.currentLevel + 1) == this.maxLevels ) {
                // this.currentLevel = 0;
                this.hs.toggleVisibility();
            } else {
                this.currentLevel++;
                this.reloadCurrentLevel();
            }            
        });
        $(document).on('bonus-reached', event => {
            $("#score").text("Score: " + this.player.score);
        });
        this.createGameArea(gridSize * levelSize);
        this.loadLevelFiles(this.currentLevel, this.maxLevels);
        this.createScoreViewer();
        this.createInfoAndCredits_EtcTables();
        this.bgMusic = new Sound("theme", "assets/sound/Atanii - JSquarus - Theme.ogg", true, true, "body", "ogg");
        (document.getElementById("theme")).volume = 0.5;
    }

    reloadCurrentLevel() {
        delete this.lasers;
        $('#player').removeClass();
        $('#player').remove();
        $('.goal').remove();
        $('#gameArea').remove();        
        this.createGameArea(this.gridSize * this.levelSize);        
        this.loadLevel(this.currentLevel);
        $("#score").text("Score: " + this.player.score);
    }

    createGameArea(size) {
        this.gameArea = $('<div id="gameArea"></div>');
        this.gameArea.css({
            "width": size + "px",
            "height": size + "px"
        });
        this.gameArea.appendTo('body');        
    }

    createScoreViewer() {
        const scoreTable = $('<span id="score"></span>');
        scoreTable.css({
            "position": "absolute",
            "top": 5 + "px",
            "left": 5 + "px",
            "color": "white"
        });
        scoreTable.text("Score: " + this.player.score);
        scoreTable.appendTo('body');
    }

    createInfoAndCredits_EtcTables() {
        const infoTable = $('<span class="info">R: reload (scores will be lost)</span>');
        infoTable.css({
            "position": "absolute",
            "top": 5 + "px",
            "left": 123 + "px",
            "color": "darkgray"
        });
        infoTable.appendTo('body');

        const creditsTable = $('<span class="info">2019, Created by: Jeremi Emánuel Kádár</span>');
        creditsTable.css({
            "position": "absolute",
            "bottom": 10 + "px",
            "left": 5 + "px",
            "color": "darkgray"
        });
        creditsTable.appendTo('body');
    }

    loadImage(lv) {
        return new Promise( (resolve, reject) => {
            lv.onload = () => resolve(lv);
        });
    }

    async loadLevelFile(id) {
        const lv = new Image();
        lv.src = "assets/levels/level_" + id + ".png";
        await this.loadImage(lv).then( loaded => { console.log("Loaded: " + loaded); } );
        this.context.drawImage(lv, 0, 0);
        const pixels = [];
        for(let y = 0; y < this.levelSize; y++) {
            pixels.push([]);
            for(let x = 0; x < this.levelSize; x++) {
                pixels[y][x] = this.context.getImageData(x, y, 1, 1);
            }
        }
        return pixels;
    }

    async loadLevelFiles(from = 0, to = 2) {
        this.levels = [];
        
        this.context = (document.getElementById("can")).getContext("2d");

        for(let i = from; i < to; i++) {
            console.log("Loading level: " + i);
            this.levels.push( await this.loadLevelFile(i) );
        }

        $('#can').remove();

        console.log(this.levels);
        document.dispatchEvent(this.doneEvent);
    }

    placeFloor(x, y, color) {
        const floorGrid = $('<div class="floor"></div>');        
        floorGrid.css({
            "position": "absolute",
            "top": y + "px",
            "left": x + "px",
            "background-color": color,
            "width": this.gridSize + "px",
            "height": this.gridSize + "px"
        });
        floorGrid.appendTo('#gameArea');
    }

    placeGoal(x, y) {
        const goalGrid = $('<div class="goal"></div>');        
        goalGrid.css({
            "position": "absolute",
            "top": y + "px",
            "left": x + "px",
            "background-color": "skyblue",
            "width": this.gridSize + "px",
            "height": this.gridSize + "px"
        });
        goalGrid.appendTo('#gameArea');
        this.goal = { "x": x, "y": y };
        this.player.setGoal(this.goal);
    }

    placeBox(x, y) {
        const boxGrid = $('<div class="box"></div>');        
        boxGrid.css({
            "position": "absolute",
            "top": y + "px",
            "left": x + "px",
            "background-color": "yellow",
            "width": this.gridSize + "px",
            "height": this.gridSize + "px"
        });
        boxGrid.appendTo('#gameArea');
    }

    placeBonus(x, y) {
        const bonusGrid = $('<div class="bonus"></div>');        
        bonusGrid.css({
            "position": "absolute",
            "top": y + "px",
            "left": x + "px",
            "background-color": "brown",
            "width": this.gridSize + "px",
            "height": this.gridSize + "px"
        });
        bonusGrid.appendTo('#gameArea');
    }

    static isWallOrBox(x, y) {
        let res = true;
        $("#gameArea").find('.floor').each( function() {
            if( $(this).css('top') == y + "px" && $(this).css('left') == x + "px" ) {
                res = false;
                return;
            }
        });
        $("#gameArea").find('.box').each( function() {
            if( $(this).css('top') == y + "px" && $(this).css('left') == x + "px" ) {
                res = true;
                return;
            }
        });    
        return res;
    }

    static isWall(x, y) {
        let res = true;
        $("#gameArea").find('.floor').each( function() {
            if( $(this).css('top') == y + "px" && $(this).css('left') == x + "px" ) {
                res = false;
                return;
            }
        });
        return res;
    }

    static isBonus(x, y) {
        let bonus = undefined;
        $("#gameArea").find('.bonus').each( function() {
            if( $(this).css('top') == y + "px" && $(this).css('left') == x + "px" ) {
                bonus = $(this);
                return;
            }
        });
        return bonus;
    }

    loadLevel(id = 0) {
        this.lasers = [];
        for(let y = 0; y < this.levelSize; y++) {
            for(let x = 0; x < this.levelSize; x++) {
                const grid = this.levels[id][y][x].data;
                if( grid[0] == 255 && grid[1] == 0 && grid[2] == 0 ) {
                    this.placeFloor(x * this.gridSize, y * this.gridSize, "blue");
                }
                else if(grid[0] == 50 && grid[1] == 50 && grid[2] == 0) {
                    this.placeFloor(x * this.gridSize, y * this.gridSize, "gray");
                }
                else if(grid[1] == 255 && grid[0] == 0 && grid[2] == 0) {
                    this.placeFloor(x * this.gridSize, y * this.gridSize, "gray");
                    this.placeGoal(x * this.gridSize, y * this.gridSize);
                }
                else if((grid[0] == 255 && grid[0] == 255 && grid[1] == 255) || 
                        (grid[2] != 0)) {
                    this.placeFloor(x * this.gridSize, y * this.gridSize, "gray");
                }                
                if(grid[0] == 255 && grid[1] == 0 && grid[2] == 0) {
                    this.player.set(x * this.gridSize, y * this.gridSize, this.gridSize);
                }                
            }
        }
        for(let y = 0; y < this.levelSize; y++) {
            for(let x = 0; x < this.levelSize; x++) {
                const grid = this.levels[id][y][x].data;
                if( (grid[0] == 255 && grid[1] == 0 && grid[2] == 0)
                ||  (grid[0] == 255 && grid[0] == 255 && grid[1] == 255) ) {
                    continue;
                }
                if(grid[0] == 50 && grid[1] == 50 && grid[2] == 0) {
                    this.placeBonus(x * this.gridSize, y * this.gridSize);
                }
                if(grid[0] == 100 && grid[1] == 100 && grid[2] == 100) {
                    this.placeBox(x * this.gridSize, y * this.gridSize);
                }
                else if(grid[2] != 0) {
                    const l = new Laser(x * this.gridSize, y * this.gridSize, grid[2], this.gridSize);
                    this.lasers.push(l);
                }
            }
        }
    }
}