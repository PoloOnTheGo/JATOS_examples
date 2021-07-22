// Wait till the browser is ready to render the game (avoids glitches)
jatos.onLoad(function () {
  jatos.addAbortButton();
  window.requestAnimationFrame(function () {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  });
});

