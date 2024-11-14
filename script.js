gsap.to(".clublogo", { 
  duration: 2, 
  rotationY: 360, 
  ease: "linear",
  repeat: -1 
});
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getHanoiSolutions = (nDiscs) => {
  const solutions = [];

  const hanoi = (n, origin, destiny, aux) => {
    if (n === 1) {
      solutions.push({ disc: n, origin, destiny });
      return;
    }
    hanoi(n - 1, origin, aux, destiny);
    solutions.push({ disc: n, origin, destiny });
    hanoi(n - 1, aux, destiny, origin);
  }

  hanoi(nDiscs, 0, 1, 2);
  return solutions;
}

const towers = document.querySelectorAll('.tower');
let towerContent = [[], [], []];
let size = 3;
let discs;
const sleepTime = 300;
const MEDIUM_SPEED = 300;
const DISC_COLORS = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#3a86ff'];

const startWidth = window.innerWidth <= 500 ? 120 : 220;

const newGameBtn = document.getElementById('newGameBtn');
const discSelect = document.getElementById('discSelect');
const speedRange = document.getElementById('speedRange');
const btnSolve = document.getElementById('btnSolve');
const stepCounterDisplay = document.getElementById('stepCount');
let stepCount = 0;
let currentTower;
let originTower;

const buildTowers = (towers) => {
  towers.forEach(tower => {
    tower.innerHTML = ''; 
    const stem = document.createElement('div');
    stem.className = 'stem';
    const plate = document.createElement('div');
    plate.className = 'plate';
    tower.appendChild(stem);
    tower.appendChild(plate);
  });
}

function start() {
  towerContent = [[], [], []];
  buildTowers(towers);

  stepCount = 0;
  stepCounterDisplay.textContent = stepCount;

  for (let i = 0; i < size; i++) {
    let disc = document.createElement('div');
    disc.classList.add('disc');
    disc.draggable = true;
    disc.style.backgroundColor = DISC_COLORS[i];
    
    if (window.innerWidth <= 500) {
      disc.style.width = (startWidth - 20 * i) + 'px';
      disc.style.bottom = (i * 20) + 'px'; 
    } else {
      disc.style.width = (startWidth - 30 * i) + 'px';
      disc.style.bottom = (i * 40) + 'px';
    }
    
    towerContent[0].push(disc);
  }

  towerContent[0].forEach(disc => {
    towers[0].appendChild(disc);
  });

  towers.forEach((tower, index) => {
    tower.classList.add('t' + index);
    tower.addEventListener('dragenter', dragenter);
    tower.addEventListener('dragover', dragover);
    tower.addEventListener('drop', drop);
  });

  discs = document.querySelectorAll('.disc');

  discs.forEach(disc => {
    disc.addEventListener('dragstart', dragstart);
    disc.addEventListener('dragend', dragend);
  });
}

function dragenter(event) {
  event.preventDefault();
  if (!originTower) {
    originTower = this;
  }
}

function dragover(event) {
  event.preventDefault();
  currentTower = this;
}

function dragstart(event) {
  this.classList.add('is-dragging');
  event.dataTransfer.setData('text/plain', '');
}

function dragend() {
  this.classList.remove('is-dragging');
}

function drop(event) {
  event.preventDefault();
  let originTowerIndex = parseInt(originTower.classList[1][1]);
  let currentTowerIndex = parseInt(currentTower.classList[1][1]);
  let disc = document.querySelector('.is-dragging');
  if (isDroppable(originTowerIndex, currentTowerIndex, disc)) {
    moveTower(originTowerIndex, currentTowerIndex, disc);
  }
  originTower = undefined;
}

function moveTower(originTowerIndex, currentTowerIndex, disc) {
  towerContent[currentTowerIndex].push(towerContent[originTowerIndex].pop());
  originTower.removeChild(disc);
  currentTower.prepend(disc);
  adjustDiscPositions(currentTowerIndex);
    stepCount++;
  stepCounterDisplay.textContent = stepCount;
  checkWin();
}

function checkWin() {
  if (towerContent[1].length === size || towerContent[2].length === size) {
    setTimeout(() => {
      alert("Congratulations! You've won the game!");
      disableGame(); 
    }, 100);
  }
}

function disableGame() {
  discs.forEach(disc => {
    disc.draggable = false;
  });
}

function adjustDiscPositions(towerIndex) {
  const discs = towerContent[towerIndex];
  discs.forEach((disc, i) => {
    disc.style.bottom = (i * 40) + 'px';
    if (window.innerWidth <= 500) {
      disc.style.bottom = (i * 20) + 'px';
    } else {
      disc.style.bottom = (i * 40) + 'px';
    }
  });
}

function isDroppable(originTowerIndex, currentTowerIndex, disc) {
  return isOnTop(originTowerIndex, disc) && isDiscLessThan(currentTowerIndex, disc);
}

function isOnTop(originTowerIndex, disc) {
  let size = towerContent[originTowerIndex].length;
  return disc.style.width === towerContent[originTowerIndex][size - 1]?.style.width;
}

function isDiscLessThan(currentTowerIndex, disc) {
  let size = towerContent[currentTowerIndex].length;
  if (!towerContent[currentTowerIndex][size - 1]) {
    return true;
  } else {
    let sizeTop = parseInt(disc.style.width);
    let sizeBottom = parseInt(towerContent[currentTowerIndex][size - 1].style.width);
    return sizeTop < sizeBottom;
  }
}

function moveTopDisc(originTowerIndex, destinyTowerIndex) {
  originTower = towers[originTowerIndex];
  currentTower = towers[destinyTowerIndex];
  let disc = getTopDisc(originTowerIndex);
  moveTower(originTowerIndex, destinyTowerIndex, disc);
}

function getTopDisc(towerIndex) {
  let sizeDisc = towerContent[towerIndex].slice(-1)[0]?.style.width;
  return Array.from(discs).find(disc => disc.style.width === sizeDisc);
}

async function moves(movements) {
  for (let i = 0; i < movements.length; i++) {
    const element = movements[i];
    moveTopDisc(element.origin, element.destiny);
    await sleep(MEDIUM_SPEED); 
  }
}


class Game {
  newGame = () => {
    newGameBtn.addEventListener('click', () => {
      size = parseInt(discSelect.value);
      start();
    });

    btnSolve.onclick = () => {
      const movements = getHanoiSolutions(size);
      moves(movements);
    };
  }
}

const game = new Game();
game.newGame();
