import collisions from '@/gameRoomMap/collisions';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1980;
canvas.height = 1080;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 282) {
  collisionsMap.push(collisions.slice(i, 282 + i));
}

const Boundaries = [];
const offset = { x: -1584, y: -1024 };

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 23073) {
      Boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      );
    }
  });
});

const image = new Image();
image.src = './images/OutsideMap.png';

const foregroundImage = new Image();
foregroundImage.src = './images/OutsideForeground.png';

const playerImage = new Image();
playerImage.src = './images/person_Modify.png';

const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  image: playerImage
});

const background = new Sprite({
  position: { x: offset.x, y: offset.y },
  image: image
});

const foreground = new Sprite({
  position: { x: offset.x, y: offset.y },
  image: foregroundImage
});

const keys = { w: false, a: false, s: false, d: false };
const movables = [background, foreground, ...Boundaries];

function animate() {
  window.requestAnimationFrame(animate);
  background.draw(c);
  Boundaries.forEach((boundary) => boundary.draw(c));
  player.draw(c);
  foreground.draw(c);

  let moving = true;
  player.moving = false;

  if (keys.w && !checkCollisionWithBoundaries(player, Boundaries, 0, 3)) {
    movables.forEach((movable) => (movable.position.y += 3));
  } else if (
    keys.a &&
    !checkCollisionWithBoundaries(player, Boundaries, 3, 0)
  ) {
    movables.forEach((movable) => (movable.position.x += 3));
  } else if (
    keys.s &&
    !checkCollisionWithBoundaries(player, Boundaries, 0, -3)
  ) {
    movables.forEach((movable) => (movable.position.y -= 3));
  } else if (
    keys.d &&
    !checkCollisionWithBoundaries(player, Boundaries, -3, 0)
  ) {
    movables.forEach((movable) => (movable.position.x -= 3));
  }
}

animate();

window.addEventListener('keydown', (e) => {
  if (e.key in keys) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key in keys) keys[e.key] = false;
});
