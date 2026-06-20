const COLORS = ["#ff6f91", "#ffd166", "#06d6a0", "#5b4bff", "#18b6e8"];

export function confettiBurst(container: HTMLElement, n = 18): void {
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.background = COLORS[i % COLORS.length];
    c.style.left = 10 + Math.random() * 80 + "%";
    c.style.borderRadius = Math.random() < 0.5 ? "2px" : "50%";
    container.appendChild(c);
    const dx = (Math.random() * 2 - 1) * 120;
    const dur = 900 + Math.random() * 700;
    const rot = Math.random() * 720;
    c.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px,${300 + Math.random() * 120}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: "cubic-bezier(.3,.7,.4,1)" },
    ).onfinish = () => c.remove();
  }
}
