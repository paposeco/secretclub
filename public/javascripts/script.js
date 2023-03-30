const changeColor = function() {
  const insiderElement = document.getElementById("insider");
  if (insiderElement) {
    insiderElement.style.color = "rgb(217, 70, 239)";
  }
  setTimeout(changeBack, 1500);
};

const changeBack = function() {
  const insiderElement = document.getElementById("insider");
  if (insiderElement) {
    insiderElement.style.color = "rgb(37, 99, 235)";
  }
  setTimeout(changeColor, 1500);
};

setTimeout(changeColor, 1500);
