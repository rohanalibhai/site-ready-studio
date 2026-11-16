/* Site Ready Studio. Small progressive enhancements; every page works without this file. */
(function () {
  "use strict";
  var d = document, q = function (s, r) { return (r || d).querySelector(s); }, qa = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);

  /* Phone menu: close on link click, outside click or Escape. */
  var menu = q(".menu");
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) menu.removeAttribute("open"); });
    d.addEventListener("click", function (e) { if (menu.open && !menu.contains(e.target)) menu.removeAttribute("open"); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.open) { menu.removeAttribute("open"); q("summary", menu).focus(); } });
  }

  /* Social page: industry picker becomes tabs. Without JS it is a list of anchor links to stacked sections. */
  var packs = q(".packs");
  if (packs) {
    var list = q(".chips[data-tabs]"), sections = qa(".pack", packs), links = qa("a", list);
    var slugs = sections.map(function (s) { return s.id; });
    list.setAttribute("role", "tablist");
    links.forEach(function (a) {
      var slug = a.getAttribute("href").slice(1);
      a.setAttribute("role", "tab");
      a.setAttribute("aria-controls", slug);
      a.id = "tab-" + slug;
      if (a.parentNode) a.parentNode.setAttribute("role", "presentation");
    });
    sections.forEach(function (s) { s.setAttribute("role", "tabpanel"); s.setAttribute("aria-labelledby", "tab-" + s.id); s.tabIndex = -1; });
    var select = function (slug, opts) {
      if (slugs.indexOf(slug) < 0) return false;
      sections.forEach(function (s) { var on = s.id === slug; s.classList.toggle("on", on); s.hidden = !on; });
      links.forEach(function (a) { var on = a.getAttribute("aria-controls") === slug; a.setAttribute("aria-selected", on ? "true" : "false"); a.tabIndex = on ? 0 : -1; a.classList.toggle("on", on); });
      if (opts && opts.push) {
        var u = new URL(location.href); u.searchParams.set("industry", slug); u.hash = "";
        history.replaceState(null, "", u.pathname + u.search);
      }
      if (opts && opts.focus) { var t = q("#tab-" + slug); if (t) t.focus(); }
      return true;
    };
    var start = (location.hash || "").slice(1);
    if (!select(start) && !select(params.get("industry") || "")) select(slugs[0]);
    if (slugs.indexOf(start) >= 0) { var top = q(".picker"); if (top) top.scrollIntoView(); }
    list.addEventListener("click", function (e) {
      var a = e.target.closest("a[role=tab]"); if (!a) return;
      e.preventDefault(); select(a.getAttribute("aria-controls"), { push: true });
    });
    list.addEventListener("keydown", function (e) {
      var i = links.indexOf(d.activeElement); if (i < 0) return;
      var n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key], j = -1;
      if (n) j = (i + n + links.length) % links.length; else if (e.key === "Home") j = 0; else if (e.key === "End") j = links.length - 1;
      if (j < 0) return;
      e.preventDefault(); select(links[j].getAttribute("aria-controls"), { push: true, focus: true });
    });
    addEventListener("hashchange", function () { select(location.hash.slice(1)); });
  }

  /* Quote form: prefill from ?industry= ?package= ?interest= ?ref=, then build the email on submit. */
  var form = q("#qform");
  if (form) {
    var ind = params.get("industry"), pkg = params.get("package"), interest = params.get("interest"), ref = params.get("ref");
    var setSelect = function (name, val) {
      var el = form.elements[name]; if (!el || !val) return;
      for (var k = 0; k < el.options.length; k++) if (el.options[k].value === val) { el.value = val; return; }
    };
    var tick = function (key) { qa("input[name=interest]", form).forEach(function (c) { if (c.getAttribute("data-key") === key) c.checked = true; }); };
    setSelect("industry", ind);
    setSelect("package", pkg);
    if (pkg) {
      var opt = form.elements["package"] && form.elements["package"].selectedOptions[0];
      ((opt && opt.getAttribute("data-interest")) || "").split("|").forEach(function (v) { if (v) tick(v); });
    }
    if (interest) interest.split(",").forEach(tick);
    if (ref && form.elements.ref) form.elements.ref.value = ref.slice(0, 80);
    var email = form.getAttribute("data-email"), note = q("#formNote");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var f = new FormData(form), g = function (k) { return (f.get(k) || "").toString().trim(); };
      var sel = function (name) { var el = form.elements[name]; return el && el.value ? el.selectedOptions[0].textContent.trim() : ""; };
      var wants = f.getAll("interest").join(", ");
      var lines = [
        "Name: " + g("name"),
        "Business: " + g("business"),
        "Type of business: " + (sel("industry") || "Not said"),
        "Interested in: " + (wants || "Not said"),
        "Package: " + (sel("package") || "Not sure yet"),
        "Current site: " + (g("site") || "none"),
        "", g("msg")
      ];
      if (g("ref")) lines.push("", "(Came from: " + g("ref") + ")");
      var subject = "Quote request: " + (g("business") || "new request");
      location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      if (note) note.textContent = "Your email app should open with this message filled in. Press send there. If nothing opened, write to " + email + ".";
    });
  }
})();
