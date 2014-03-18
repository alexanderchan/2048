// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
	console.log(Date());
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager,0);
 	 console.log(Date());
});

