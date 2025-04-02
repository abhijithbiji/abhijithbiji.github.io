function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");

    if (menu && icon) {  // Ensure both elements exist
        menu.classList.toggle("open");
        icon.classList.toggle("open");
    }
}

const canvas = document.getElementById("dna-canvas");
const ctx = canvas.getContext("2d");

// Resize canvas to full screen
function resizeCanvas() {
    const heroSection = document.querySelector(".hero-section");
    const rect = heroSection.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
  
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const dnaImg = new Image();
dnaImg.src = "./assets/dna.svg"; // Or full path to your SVG file

const MAX_SPEED = 1.0;
const strandCount = 30;
const strands = [];

let dragged = null;
let offset = { x: 0, y: 0 };

// Initialize DNA strands
for (let i = 0; i < strandCount; i++) {
    strands.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        width: 60,
        height: 60,
        radius: 40,
        rotation: Math.random() * 360,           // Random rotation in degrees
        opacity: 0.1       // Random opacity between 0.5 and 1.0
      });      
}

// Collision detection between two strands
function isColliding(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

// Limit the speed of any strand
function limitSpeed(s) {
  const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
  if (speed > MAX_SPEED) {
    const scale = MAX_SPEED / speed;
    s.vx *= scale;
    s.vy *= scale;
  }
}

// Handle simple bounce between two strands
function resolveCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const angle = Math.atan2(dy, dx);
  const speed = 1;

  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  a.vx -= vx;
  a.vy -= vy;
  b.vx += vx;
  b.vy += vy;

  limitSpeed(a);
  limitSpeed(b);
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < strands.length; i++) {
    const s = strands[i];

    if (s !== dragged) {
      s.x += s.vx;
      s.y += s.vy;

      // Wall bounce
      if (s.x < 0 || s.x + s.width > canvas.width) s.vx *= -1;
      if (s.y < 0 || s.y + s.height > canvas.height) s.vy *= -1;

      limitSpeed(s);
    }

    // Collision with other strands
    for (let j = i + 1; j < strands.length; j++) {
      if (isColliding(s, strands[j])) {
        resolveCollision(s, strands[j]);
      }
    }

    ctx.save();
    ctx.globalAlpha = s.opacity;
    ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.drawImage(dnaImg, -s.width / 2, -s.height / 2, s.width, s.height);
    ctx.restore();

  }

  requestAnimationFrame(animate);
}
animate();

// Mouse drag functionality
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  strands.forEach((s) => {
    if (
      mouseX >= s.x &&
      mouseX <= s.x + s.width &&
      mouseY >= s.y &&
      mouseY <= s.y + s.height
    ) {
      dragged = s;
      offset.x = mouseX - s.x;
      offset.y = mouseY - s.y;
    }
  });
});

canvas.addEventListener("mousemove", (e) => {
  if (dragged) {
    const rect = canvas.getBoundingClientRect();
    dragged.x = e.clientX - rect.left - offset.x;
    dragged.y = e.clientY - rect.top - offset.y;
  }
});

canvas.addEventListener("mouseup", () => {
  dragged = null;
});
