$(function () {
  /* ---------- DATA ---------- */
  const cities = {
    "London":    {c:"Partly cloudy", i:"⛅", t:14, h:72, w:18, p:20, u:3, d:[["⛅",16,9],["🌧️",13,8],["🌦️",14,8],["☀️",17,9],["☁️",15,10]]},
    "Tokyo":     {c:"Clear sky",     i:"☀️", t:22, h:55, w:11, p:5,  u:6, d:[["☀️",24,15],["⛅",23,16],["🌧️",19,14],["🌧️",18,13],["⛅",21,14]]},
    "New York":  {c:"Light rain",    i:"🌧️", t:12, h:80, w:22, p:70, u:2, d:[["🌧️",13,8],["☁️",14,7],["⛅",16,8],["☀️",18,9],["☀️",19,10]]},
    "Sydney":    {c:"Sunny",         i:"☀️", t:26, h:48, w:15, p:5,  u:9, d:[["☀️",27,18],["☀️",29,19],["⛅",26,18],["⛈️",23,17],["🌦️",22,16]]},
    "Reykjavik": {c:"Snow showers",  i:"🌨️", t:-1, h:78, w:30, p:60, u:1, d:[["🌨️",0,-4],["☁️",1,-3],["⛅",2,-2],["🌨️",-1,-5],["☀️",1,-4]]},
    "Kathmandu": {c:"Clear sky",     i:"☀️", t:19, h:52, w:8,  p:5,  u:5, d:[["☀️",20,6],["☀️",21,7],["⛅",19,7],["☀️",20,6],["⛅",18,5]]},
    "Pokhara":   {c:"Partly cloudy", i:"⛅", t:23, h:60, w:10, p:10, u:5, d:[["⛅",24,11],["☀️",25,10],["☀️",25,11],["🌦️",22,12],["⛅",23,11]]}
  };

  const extra = {
    "London":    {sr:"07:25", ss:"15:55", aq:35,  pr:1014},
    "Tokyo":     {sr:"06:35", ss:"16:30", aq:42,  pr:1018},
    "New York":  {sr:"06:55", ss:"16:35", aq:38,  pr:1009},
    "Sydney":    {sr:"05:40", ss:"19:50", aq:25,  pr:1016},
    "Reykjavik": {sr:"10:05", ss:"16:00", aq:12,  pr:995},
    "Kathmandu": {sr:"06:50", ss:"17:10", aq:110, pr:1018},
    "Pokhara":   {sr:"06:40", ss:"17:15", aq:70,  pr:1017}
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  let unit = "C";
  let city = "London";

  const conv = c => unit === "C" ? Math.round(c) : Math.round(c * 9 / 5 + 32);
  const aqi = v => v <= 50 ? "Good" : v <= 100 ? "Moderate" : v <= 150 ? "Sensitive" : "Unhealthy";

  /* ---------- WEATHER ---------- */
  $.each(cities, function (name) {
    $("#city").append($("<option>").text(name));
  });

  function render() {
    const d = cities[city], e = extra[city];

    // Current weather
    $("#now").html(
      `<div class="big">${d.i}</div>
       <div>
         <div class="temp">${conv(d.t)}°${unit}</div>
         <div class="cond">${city} · ${d.c}</div>
         <div class="details">
           <div><small>Humidity</small><b>${d.h}%</b></div>
           <div><small>Wind</small><b>${d.w} km/h</b></div>
           <div><small>Rain chance</small><b>${d.p}%</b></div>
           <div><small>UV index</small><b>${d.u}</b></div>
           <div><small>Feels like</small><b>${conv(d.t - Math.round(d.w / 10))}°</b></div>
           <div><small>Pressure</small><b>${e.pr} hPa</b></div>
           <div><small>Sunrise</small><b>${e.sr}</b></div>
           <div><small>Sunset</small><b>${e.ss}</b></div>
           <div><small>Air quality</small><b>${e.aq} · ${aqi(e.aq)}</b></div>
         </div>
       </div>`
    );

    // 5-day forecast
    $("#days").html(d.d.map((x, i) =>
      `<div class="day">
         <b>${dayNames[i]}</b>
         <div class="ic">${x[0]}</div>
         <div class="bar" style="width:${40 + Math.max(0, x[1] + 5) * 2}%"></div>
         <b>${conv(x[1])}°</b>
         <small style="color:var(--muted)">Low ${conv(x[2])}°</small>
       </div>`).join(""));
    $("#fsub").text(`Outlook for ${city} in °${unit}.`);

    // Hourly chart (SVG)
    const hrs = ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"];
    const off = [-4, -1, 2, 3, 0, -2];
    const vals = off.map(o => conv(d.t + o));
    const mn = Math.min(...vals), mx = Math.max(...vals), rg = Math.max(1, mx - mn);
    const pts = vals.map((v, i) => [50 + i * 100, 110 - ((v - mn) / rg) * 70]);
    $("#chart").html(
      `<svg viewBox="0 0 600 160" role="img" aria-label="Temperature through today">
         <polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" style="stroke:var(--accent)" stroke-width="3" stroke-linejoin="round"/>
         ${pts.map((p, i) =>
           `<circle cx="${p[0]}" cy="${p[1]}" r="5" style="fill:var(--accent2)"/>
            <text x="${p[0]}" y="${p[1] - 12}" text-anchor="middle" font-size="14" font-weight="700" style="fill:var(--text)">${vals[i]}°</text>
            <text x="${p[0]}" y="150" text-anchor="middle" font-size="13" style="fill:var(--muted)">${hrs[i]}</text>`).join("")}
       </svg>`
    );

    // What to wear
    let tip = d.t < 5 ? "Heavy coat, hat and gloves."
            : d.t < 15 ? "A warm jacket is a good idea."
            : d.t < 24 ? "Light layers will keep you comfortable."
            : "T-shirt weather, stay hydrated.";
    if (d.p >= 50) tip += " Carry an umbrella.";
    if (d.u >= 6) tip += " Wear sunscreen.";
    if (e.aq > 100) tip += " Air quality is poor, consider a mask outdoors.";
    $("#tip").text("👕 What to wear: " + tip);
  }

  $("#city").on("change", function () {
    city = $(this).val();
    render();
  });

  $("#uC, #uF").on("click", function () {
    unit = this.id === "uC" ? "C" : "F";
    $("#uC").toggleClass("on", unit === "C");
    $("#uF").toggleClass("on", unit === "F");
    render();
  });

  render();

  /* ---------- THEME & MENU ---------- */
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
  } catch (err) {}

  $("#theme").on("click", function () {
    const dark = getComputedStyle(root).colorScheme === "dark";
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (err) {}
  });

  $("#menu").on("click", function () { $("#nav").toggleClass("open"); });
  $("#nav a").on("click", function () { $("#nav").removeClass("open"); });

  /* ---------- WEATHER SCIENCE CARDS ---------- */
  const topics = [
    {n:"Air Pressure", t:"Basics", i:"🌡️", d:"High pressure brings calm, clear weather.", x:"Weather maps show pressure as isobars. Falling pressure usually means a storm or rain is on its way, while rising pressure points to clearing skies."},
    {n:"Humidity", t:"Basics", i:"💧", d:"How much water vapor is in the air.", x:"Warm air holds more moisture. When humid air cools to its dew point, clouds and fog form."},
    {n:"Cold Front", t:"Systems", i:"🌬️", d:"Cold air pushes under warm air.", x:"Cold fronts bring a sharp temperature drop, gusty wind and often short, heavy showers or thunderstorms."},
    {n:"Warm Front", t:"Systems", i:"☁️", d:"Warm air slides over cooler air.", x:"Warm fronts bring layered clouds, steady light rain and a gradual rise in temperature."},
    {n:"Cumulus Clouds", t:"Clouds", i:"⛅", d:"Fluffy, flat-bottomed clouds.", x:"Small cumulus signal fair weather. If they grow tall into cumulonimbus, thunderstorms may follow."},
    {n:"Cirrus Clouds", t:"Clouds", i:"🌤️", d:"Thin, wispy clouds high up.", x:"Cirrus are made of ice crystals and often appear 12 to 24 hours before a warm front arrives."},
    {n:"Weather Models", t:"Tools", i:"🖥️", d:"Computers simulate the atmosphere.", x:"Forecast models split the atmosphere into a 3D grid and use physics equations to predict how it changes over time."},
    {n:"Radar & Satellite", t:"Tools", i:"🛰️", d:"Watching weather from the ground and space.", x:"Radar detects rain and storm motion, while satellites track clouds, storms and temperatures across the globe."},
    {n:"Monsoon", t:"Nepal", i:"🌧️", d:"June to September rains across Nepal.", x:"Most of Nepal’s yearly rain falls during the summer monsoon. Heavy rain can cause landslides and floods, especially in hill areas."},
    {n:"Himalayan Weather", t:"Nepal", i:"🏔️", d:"Mountain weather changes fast.", x:"Temperature drops with altitude, and clear mornings often turn cloudy by afternoon, so trekkers start early and check forecasts."},
    {n:"Winter Fog", t:"Nepal", i:"🌫️", d:"Cold, foggy mornings in the valleys.", x:"In winter, cold air settles in valleys like Kathmandu, causing morning fog and poorer air quality until the sun warms the day."}
  ];

  let filter = "All";
  const types = ["All"].concat([...new Set(topics.map(t => t.t))]);

  function renderFilters() {
    const $f = $("#filters").empty();
    $.each(types, function (_, t) {
      $("<button>", { class: "chip" + (t === filter ? " on" : ""), text: t })
        .on("click", function () { filter = t; renderFilters(); renderGrid(); })
        .appendTo($f);
    });
  }

  function renderGrid() {
    const $g = $("#grid").empty();
    $.each(topics.filter(p => filter === "All" || p.t === filter), function (i, p) {
      const $c = $(
        `<article class="card">
           <div class="ic">${p.i}</div>
           <span class="tag">${p.t}</span>
           <h3>${p.n}</h3>
           <p>${p.d}</p>
         </article>`
      );
      $c.on("click", function () {
        $("#dIc").text(p.i);
        $("#dName").text(p.n);
        $("#dText").text(p.x);
        $("#dlg")[0].showModal();
      });
      $g.append($c);
      setTimeout(() => $c.addClass("show"), 60 * i);
    });
  }

  $("#close").on("click", function () { $("#dlg")[0].close(); });
  $("#dlg").on("click", function (e) { if (e.target === this) this.close(); });

  renderFilters();
  renderGrid();

  /* ---------- QUIZ ---------- */
  const qs = [
    {q:"What does falling air pressure usually signal?", o:["Clear skies","Stormy weather","Snow only"], a:1},
    {q:"Which clouds are thin and wispy?", o:["Cirrus","Cumulonimbus","Stratus"], a:0},
    {q:"Which instrument detects rainfall and storm movement?", o:["Barometer","Radar","Thermometer"], a:1},
    {q:"A cold front typically brings…", o:["Steady warmth","Fog only","Gusty wind and a temperature drop"], a:2}
  ];
  let qi = 0, score = 0;

  function showQ() {
    const $next = $("#next");
    if (qi >= qs.length) {
      $("#qcount").text("Finished");
      $("#qtext").text(`You scored ${score} / ${qs.length}`);
      $("#opts").empty();
      $next.text("Restart").prop("hidden", false).off("click").on("click", function () {
        qi = 0; score = 0; showQ();
      });
      return;
    }
    const q = qs[qi];
    $next.prop("hidden", true);
    $("#qcount").text(`Question ${qi + 1} of ${qs.length}`);
    $("#qtext").text(q.q);
    const $opts = $("#opts").empty();

    $.each(q.o, function (i, text) {
      $("<button>", { class: "opt", text: text })
        .on("click", function () {
          $(".opt").prop("disabled", true).eq(q.a).addClass("ok");
          if (i === q.a) score++; else $(this).addClass("bad");
          $next.text("Next").prop("hidden", false).off("click").on("click", function () {
            qi++; showQ();
          });
        })
        .appendTo($opts);
    });
  }
  showQ();

  /* ---------- FORM VALIDATION ---------- */
  $("#form").on("submit", function (e) {
    e.preventDefault();
    const rules = [
      ["#name",  v => v.trim().length >= 2, "Please enter your name."],
      ["#email", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address."],
      ["#text",  v => v.trim().length >= 10, "Message must be at least 10 characters."]
    ];
    let ok = true;
    $.each(rules, function (_, r) {
      const $el = $(r[0]);
      const bad = !r[1]($el.val());
      $el.next(".err").text(bad ? r[2] : "");
      if (bad) ok = false;
    });
    $("#ok").text(ok ? "Thanks! Your message was validated successfully." : "");
    if (ok) this.reset();
  });
});