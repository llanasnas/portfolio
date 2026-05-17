export interface HeroCodeLine {
  html: string;
}

export const CODE_LINES: HeroCodeLine[] = [
  { html: '<span class="com">// pair_program.ts</span>' },
  {
    html: '<span class="kw">import</span> <span class="pl">{ gerard }</span> <span class="kw">from</span> <span class="str">"@portfolio"</span><span class="pn">;</span>',
  },
  { html: "" },
  {
    html: '<span class="kw">await</span> <span class="pl">gerard</span><span class="pn">.</span><span class="fn">collaborate</span><span class="pn">({</span>',
  },
  {
    html: '  <span class="pl">with</span><span class="pn">:</span> <span class="str">"you"</span><span class="pn">,</span>',
  },
  {
    html: '  <span class="pl">on</span><span class="pn">:</span> <span class="str">"the future"</span><span class="pn">,</span>',
  },
  {
    html: '  <span class="pl">stack</span><span class="pn">:</span> <span class="pn">[</span><span class="str">"react"</span><span class="pn">,</span> <span class="str">"ai"</span><span class="pn">],</span>',
  },
  { html: '<span class="pn">});</span>' },
  { html: "" },
  {
    html: '<span class="com">→ shipping <span class="num">∞</span> ideas</span>',
  },
];

export function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "");
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || "";
}

export function renderPartial(html: string, n: number): string {
  if (!html) return "";
  let out = "";
  let count = 0;
  let i = 0;
  while (i < html.length && count < n) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) break;
      out += html.slice(i, end + 1);
      i = end + 1;
    } else {
      out += html[i];
      count++;
      i++;
    }
  }
  const opens = [...out.matchAll(/<(\w+)[^>]*>/g)].map((m) => m[1]);
  const closes = [...out.matchAll(/<\/(\w+)>/g)].map((m) => m[1]);
  const stack: string[] = [];
  opens.forEach((o) => stack.push(o));
  closes.forEach((c) => {
    const idx = stack.lastIndexOf(c);
    if (idx >= 0) stack.splice(idx, 1);
  });
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}
