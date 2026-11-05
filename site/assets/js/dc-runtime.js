/*
 * Grow Wings design-component runtime.
 *
 * Renders the canvas design files (*.dc.html) with Preact. Each component is a
 * template (plain HTML with {{holes}}, <sc-for>, <sc-if> and <dc-import>) plus a
 * logic class (`class Component extends DCLogic { renderVals() {...} }`).
 *
 * The same file runs in two places:
 *   - at build time in Node, to pre-render every page to static HTML;
 *   - in the browser, to hydrate that HTML so tabs, sliders and forms work.
 */
(function (global) {
  'use strict';

  var preact = global.preact;
  var h = preact.h;
  var Fragment = preact.Fragment;
  var registry = {};

  var HOLE_ALL = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var HOLE_ANY = /\{\{\s*([^}]+?)\s*\}\}/g;

  // HTML parsers lower-case attribute names; SVG needs a few of them camel-cased.
  var SVG_ATTRS = {
    viewbox: 'viewBox', preserveaspectratio: 'preserveAspectRatio',
    gradientunits: 'gradientUnits', gradienttransform: 'gradientTransform',
    patternunits: 'patternUnits', clippathunits: 'clipPathUnits',
    markerwidth: 'markerWidth', markerheight: 'markerHeight',
    refx: 'refX', refy: 'refY', pathlength: 'pathLength'
  };

  function literal(expr) {
    if (expr === 'true') return { v: true };
    if (expr === 'false') return { v: false };
    if (expr === 'null') return { v: null };
    if (expr === 'undefined') return { v: undefined };
    if (/^-?\d+(\.\d+)?$/.test(expr)) return { v: Number(expr) };
    var q = /^(['"])(.*)\1$/.exec(expr);
    if (q) return { v: q[2] };
    return null;
  }

  function lookup(expr, ctx) {
    var lit = literal(expr);
    if (lit) return lit.v;
    var parts = expr.split('.');
    var head = parts[0];
    var cur;
    var found = false;
    for (var i = ctx.scope.length - 1; i >= 0; i--) {
      if (Object.prototype.hasOwnProperty.call(ctx.scope[i], head)) {
        cur = ctx.scope[i][head];
        found = true;
        break;
      }
    }
    if (!found) cur = ctx.vals ? ctx.vals[head] : undefined;
    for (var j = 1; j < parts.length; j++) {
      if (cur == null) return undefined;
      cur = cur[parts[j]];
    }
    return cur;
  }

  function str(v) {
    return v == null ? '' : String(v);
  }

  function interpolate(text, ctx) {
    return text.replace(HOLE_ANY, function (_, expr) { return str(lookup(expr, ctx)); });
  }

  function attrValue(raw, ctx) {
    var m = HOLE_ALL.exec(raw);
    if (m) return lookup(m[1], ctx);
    if (raw.indexOf('{{') === -1) return raw;
    return interpolate(raw, ctx);
  }

  function camel(name) {
    return name.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }

  function attrsOf(node) {
    var out = [];
    var list = node.attributes || [];
    for (var i = 0; i < list.length; i++) out.push({ name: list[i].name, value: list[i].value });
    return out;
  }

  function getAttr(node, name) {
    var v = node.getAttribute(name);
    return v == null ? '' : v;
  }

  function compileNodes(nodes, ctx, inSvg) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = compileNode(nodes[i], ctx, inSvg);
      if (r == null) continue;
      if (Array.isArray(r)) { for (var k = 0; k < r.length; k++) out.push(r[k]); }
      else out.push(r);
    }
    return out;
  }

  function compileNode(node, ctx, inSvg) {
    if (node.nodeType === 3) {
      var text = node.nodeValue;
      // JSX-style: drop whitespace-only runs that contain a line break.
      if (/^\s*$/.test(text) && /\n/.test(text)) return null;
      return text.indexOf('{{') === -1 ? text : interpolate(text, ctx);
    }
    if (node.nodeType !== 1) return null;

    var tag = (node.localName || node.tagName || '').toLowerCase();

    if (tag === 'sc-for') {
      var list = attrValue(getAttr(node, 'list'), ctx) || [];
      var as = getAttr(node, 'as') || 'item';
      var kids = [];
      for (var i = 0; i < list.length; i++) {
        var frame = { $index: i };
        frame[as] = list[i];
        ctx.scope.push(frame);
        var c = compileNodes(node.childNodes, ctx, inSvg);
        ctx.scope.pop();
        for (var k = 0; k < c.length; k++) kids.push(c[k]);
      }
      return kids;
    }

    if (tag === 'sc-if') {
      return attrValue(getAttr(node, 'value'), ctx) ? compileNodes(node.childNodes, ctx, inSvg) : null;
    }

    if (tag === 'dc-import') {
      var name = getAttr(node, 'name');
      var Comp = registry[name];
      if (!Comp) throw new Error('dc-import: unknown component "' + name + '"');
      var cprops = {};
      attrsOf(node).forEach(function (a) {
        if (a.name === 'name' || a.name.indexOf('hint-') === 0) return;
        cprops[camel(a.name)] = attrValue(a.value, ctx);
      });
      return h(Comp, cprops);
    }

    var svg = inSvg || tag === 'svg';
    var props = {};
    attrsOf(node).forEach(function (a) {
      var n = a.name;
      if (n.indexOf('hint-') === 0) return;
      var v = attrValue(a.value, ctx);
      var low = n.toLowerCase();
      if (low.slice(0, 2) === 'on') {
        if (typeof v !== 'function') return;
        // React semantics: onChange on a text field fires on every keystroke.
        if (low === 'onchange' && (tag === 'input' || tag === 'textarea')) n = 'onInput';
        else n = 'on' + low.charAt(2).toUpperCase() + low.slice(3);
      } else if (svg && SVG_ATTRS[low]) {
        n = SVG_ATTRS[low];
      }
      props[n] = v;
    });

    var children = tag === 'textarea' ? [] : compileNodes(node.childNodes, ctx, svg && tag !== 'foreignobject');
    return h.apply(null, [tag, props].concat(children));
  }

  /**
   * Register a component.
   * @param {string} name  component name, as used by <dc-import name="...">
   * @param {Node} root     node whose children are the template
   * @param {string} logic  source of `class Component extends DCLogic {...}`
   */
  function define(name, root, logic) {
    var nodes = root.childNodes;
    var DCLogic = function DCLogic(props, context) {
      preact.Component.call(this, props, context);
    };
    DCLogic.prototype = Object.create(preact.Component.prototype);
    DCLogic.prototype.constructor = DCLogic;
    DCLogic.prototype.render = function () {
      var vals = typeof this.renderVals === 'function' ? this.renderVals() : {};
      return h.apply(null, [Fragment, null].concat(compileNodes(nodes, { vals: vals || {}, scope: [] }, false)));
    };
    // eslint-disable-next-line no-new-func
    var Comp = new Function('DCLogic', '"use strict";\n' + (logic || 'class Component extends DCLogic {}') + '\n;return Component;')(DCLogic);
    Comp.displayName = name;
    registry[name] = Comp;
    return Comp;
  }

  function get(name) { return registry[name]; }

  /** Browser entry point: register every <template data-dc> and hydrate #app. */
  function boot() {
    var doc = global.document;
    var templates = doc.querySelectorAll('template[data-dc]');
    for (var i = 0; i < templates.length; i++) {
      var t = templates[i];
      var name = t.getAttribute('data-dc');
      var logicEl = doc.querySelector('script[type="text/x-dc"][data-for="' + name + '"]');
      define(name, t.content, logicEl ? logicEl.textContent : '');
    }
    var app = doc.getElementById('app');
    var Root = registry[app.getAttribute('data-root')];
    var props = {};
    try { props = JSON.parse(app.getAttribute('data-props') || '{}'); } catch (e) { props = {}; }
    preact.hydrate(h(Root, props), app);
  }

  global.DC = { define: define, get: get, boot: boot, h: h };
})(typeof window !== 'undefined' ? window : globalThis);
