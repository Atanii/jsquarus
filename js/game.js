const DEBUG = false;

const handler = new LevelHandler(50, 16);

$(document).on('levelsAreReady', () => {
    handler.loadLevel();
});