     (function() {
        var on = addEventListener,
          $ = function(q) {
            return document.querySelector(q);
          },
          $$ = function(q) {
            return document.querySelectorAll(q);
          },
          $body = document.body,
          $inner = $(".inner"),
          client = (function() {
            var o = {
                browser: "other",
                browserVersion: 0,
                os: "other",
                osVersion: 0,
                mobile: false,
                canUse: null
              },
              ua = navigator.userAgent,
              a,
              i;
            a = [
              ["firefox", /Firefox\/([0-9\.]+)/],
              ["edge", /Edge\/([0-9\.]+)/],
              ["safari", /Version\/([0-9\.]+).+Safari/],
              ["chrome", /Chrome\/([0-9\.]+)/],
              ["chrome", /CriOS\/([0-9\.]+)/],
              ["ie", /Trident\/.+rv:([0-9]+)/]
            ];
            for (i = 0; i < a.length; i++) {
              if (ua.match(a[i][1])) {
                o.browser = a[i][0];
                o.browserVersion = parseFloat(RegExp.$1);
                break;
              }
            }
            a = [
              [
                "ios",
                /([0-9_]+) like Mac OS X/,
                function(v) {
                  return v.replace("_", ".").replace("_", "");
                }
              ],
              [
                "ios",
                /CPU like Mac OS X/,
                function(v) {
                  return 0;
                }
              ],
              [
                "ios",
                /iPad; CPU/,
                function(v) {
                  return 0;
                }
              ],
              ["android", /Android ([0-9\.]+)/, null],
              [
                "mac",
                /Macintosh.+Mac OS X ([0-9_]+)/,
                function(v) {
                  return v.replace("_", ".").replace("_", "");
                }
              ],
              ["windows", /Windows NT ([0-9\.]+)/, null],
              ["undefined", /Undefined/, null]
            ];
            for (i = 0; i < a.length; i++) {
              if (ua.match(a[i][1])) {
                o.os = a[i][0];
                o.osVersion = parseFloat(
                  a[i][2] ? a[i][2](RegExp.$1) : RegExp.$1
                );
                break;
              }
            }
            if (
              o.os == "mac" &&
              "ontouchstart" in window &&
              ((screen.width == 1024 && screen.height == 1366) ||
                (screen.width == 834 && screen.height == 1112) ||
                (screen.width == 810 && screen.height == 1080) ||
                (screen.width == 768 && screen.height == 1024))
            )
              o.os = "ios";
            o.mobile = o.os == "android" || o.os == "ios";
            var _canUse = document.createElement("div");
            o.canUse = function(p) {
              var e = _canUse.style,
                up = p.charAt(0).toUpperCase() + p.slice(1);
              return (
                p in e ||
                "Moz" + up in e ||
                "Webkit" + up in e ||
                "O" + up in e ||
                "ms" + up in e
              );
            };
            return o;
          })(),
          trigger = function(t) {
            if (client.browser == "ie") {
              var e = document.createEvent("Event");
              e.initEvent(t, false, true);
              dispatchEvent(e);
            } else dispatchEvent(new Event(t));
          },
          cssRules = function(selectorText) {
            var ss = document.styleSheets,
              a = [],
              f = function(s) {
                var r = s.cssRules,
                  i;
                for (i = 0; i < r.length; i++) {
                  if (
                    r[i] instanceof CSSMediaRule &&
                    matchMedia(r[i].conditionText).matches
                  )
                    f(r[i]);
                  else if (
                    r[i] instanceof CSSStyleRule &&
                    r[i].selectorText == selectorText
                  )
                    a.push(r[i]);
                }
              },
              x,
              i;
            for (i = 0; i < ss.length; i++) f(ss[i]);
            return a;
          },
          thisHash = function() {
            var h = location.hash ? location.hash.substring(1) : null,
              a;
            if (!h) return null;
            if (h.match(/\?/)) {
              a = h.split("?");
              h = a[0];
              history.replaceState(undefined, undefined, "#" + h);
              window.location.search = a[1];
            }
            if (h.length > 0 && !h.match(/^[a-zA-Z]/)) h = "x" + h;
            if (typeof h == "string") h = h.toLowerCase();
            return h;
          },
          scrollToElement = function(e, style, duration) {
            var y, cy, dy, start, easing, offset, f;
            if (!e) y = 0;
            else {
              offset =
                (e.dataset.scrollOffset
                  ? parseInt(e.dataset.scrollOffset)
                  : 0) *
                parseFloat(getComputedStyle(document.documentElement).fontSize);
              switch (
                e.dataset.scrollBehavior ? e.dataset.scrollBehavior : "default"
              ) {
                case "default":
                default:
                  y = e.offsetTop + offset;
                  break;
                case "center":
                  if (e.offsetHeight < window.innerHeight)
                    y =
                      e.offsetTop -
                      (window.innerHeight - e.offsetHeight) / 2 +
                      offset;
                  else y = e.offsetTop - offset;
                  break;
                case "previous":
                  if (e.previousElementSibling)
                    y =
                      e.previousElementSibling.offsetTop +
                      e.previousElementSibling.offsetHeight +
                      offset;
                  else y = e.offsetTop + offset;
                  break;
              }
            }
            if (!style) style = "smooth";
            if (!duration) duration = 750;
            if (style == "instant") {
              window.scrollTo(0, y);
              return;
            }
            start = Date.now();
            cy = window.scrollY;
            dy = y - cy;
            switch (style) {
              case "linear":
                easing = function(t) {
                  return t;
                };
                break;
              case "smooth":
                easing = function(t) {
                  return t < 0.5
                    ? 4 * t * t * t
                    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                };
                break;
            }
            f = function() {
              var t = Date.now() - start;
              if (t >= duration) window.scroll(0, y);
              else {
                window.scroll(0, cy + dy * easing(t / duration));
                requestAnimationFrame(f);
              }
            };
            f();
          },
          scrollToTop = function() {
            scrollToElement(null);
          },
          loadElements = function(parent) {
            var a, e, x, i;
            a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
            for (i = 0; i < a.length; i++) {
              a[i].src = a[i].dataset.src;
              a[i].dataset.src = "";
            }
            a = parent.querySelectorAll("video[autoplay]");
            for (i = 0; i < a.length; i++) {
              if (a[i].paused) a[i].play();
            }
            e = parent.querySelector('[data-autofocus="1"]');
            x = e ? e.tagName : null;
            switch (x) {
              case "FORM":
                e = e.querySelector(
                  ".field input, .field select, .field textarea"
                );
                if (e) e.focus();
                break;
              default:
                break;
            }
          },
          unloadElements = function(parent) {
            var a, e, x, i;
            a = parent.querySelectorAll('iframe[data-src=""]');
            for (i = 0; i < a.length; i++) {
              if (a[i].dataset.srcUnload === "0") continue;
              a[i].dataset.src = a[i].src;
              a[i].src = "";
            }
            a = parent.querySelectorAll("video");
            for (i = 0; i < a.length; i++) {
              if (!a[i].paused) a[i].pause();
            }
            e = $(":focus");
            if (e) e.blur();
          };
        window._scrollToTop = scrollToTop;
        var thisURL = function() {
          return window.location.href
            .replace(window.location.search, "")
            .replace(/#$/, "");
        };
        var getVar = function(name) {
          var a = window.location.search.substring(1).split("&"),
            b,
            k;
          for (k in a) {
            b = a[k].split("=");
            if (b[0] == name) return b[1];
          }
          return null;
        };
        var errors = {
          handle: function(handler) {
            window.onerror = function(message, url, line, column, error) {
              handler(error.message);
              return true;
            };
          },
          unhandle: function() {
            window.onerror = null;
          }
        };
        on("load", function() {
          setTimeout(function() {
            $body.className = $body.className.replace(
              /\bis-loading\b/,
              "is-playing"
            );
            setTimeout(function() {
              $body.className = $body.className.replace(
                /\bis-playing\b/,
                "is-ready"
              );
            }, 2750);
          }, 100);
        });
        loadElements(document.body);
        var style, sheet, rule;
        style = document.createElement("style");
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        sheet = style.sheet;
        if (client.os == "android") {
          (function() {
            sheet.insertRule("body::after { }", 0);
            rule = sheet.cssRules[0];
            var f = function() {
              rule.style.cssText =
                "height: " + Math.max(screen.width, screen.height) + "px";
            };
            on("load", f);
            on("orientationchange", f);
            on("touchmove", f);
          })();
          $body.classList.add("is-touch");
        } else if (client.os == "ios") {
          if (client.osVersion <= 11)
            (function() {
              sheet.insertRule("body::after { }", 0);
              rule = sheet.cssRules[0];
              rule.style.cssText = "-webkit-transform: scale(1.0)";
            })();
          if (client.osVersion <= 11)
            (function() {
              sheet.insertRule("body.ios-focus-fix::before { }", 0);
              rule = sheet.cssRules[0];
              rule.style.cssText = "height: calc(100% + 60px)";
              on(
                "focus",
                function(event) {
                  $body.classList.add("ios-focus-fix");
                },
                true
              );
              on(
                "blur",
                function(event) {
                  $body.classList.remove("ios-focus-fix");
                },
                true
              );
            })();
          $body.classList.add("is-touch");
        } else if (client.browser == "ie") {
          if (!("matches" in Element.prototype))
            Element.prototype.matches =
              Element.prototype.msMatchesSelector ||
              Element.prototype.webkitMatchesSelector;
          (function() {
            var a = cssRules("body::before"),
              r;
            if (a.length > 0) {
              r = a[0];
              if (r.style.width.match("calc")) {
                r.style.opacity = 0.9999;
                setTimeout(function() {
                  r.style.opacity = 1;
                }, 100);
              } else {
                document.styleSheets[0].addRule(
                  "body::before",
                  "content: none !important;"
                );
                $body.style.backgroundImage = r.style.backgroundImage.replace(
                  'url("images/',
                  'url("image_2021-06-04_162347-min.png'
                );
                $body.style.backgroundPosition = r.style.backgroundPosition;
                $body.style.backgroundRepeat = r.style.backgroundRepeat;
                $body.style.backgroundColor = r.style.backgroundColor;
                $body.style.backgroundAttachment = "fixed";
                $body.style.backgroundSize = r.style.backgroundSize;
              }
            }
          })();
          (function() {
            var t, f;
            f = function() {
              var mh, h, s, xx, x, i;
              x = $("#wrapper");
              x.style.height = "auto";
              if (x.scrollHeight <= innerHeight) x.style.height = "100vh";
              xx = $$(".container.full");
              for (i = 0; i < xx.length; i++) {
                x = xx[i];
                s = getComputedStyle(x);
                x.style.minHeight = "";
                x.style.height = "";
                mh = s.minHeight;
                x.style.minHeight = 0;
                x.style.height = "";
                h = s.height;
                if (mh == 0) continue;
                x.style.height = h > mh ? "auto" : mh;
              }
            };
            f();
            on("resize", function() {
              clearTimeout(t);
              t = setTimeout(f, 250);
            });
            on("load", f);
          })();
        } else if (client.browser == "edge") {
          (function() {
            var xx = $$(".container > .inner > div:last-child"),
              x,
              y,
              i;
            for (i = 0; i < xx.length; i++) {
              x = xx[i];
              y = getComputedStyle(x.parentNode);
              if (y.display != "flex" && y.display != "inline-flex") continue;
              x.style.marginLeft = "-1px";
            }
          })();
        }
        if (!client.canUse("object-fit")) {
          (function() {
            var xx = $$(".image[data-position]"),
              x,
              w,
              c,
              i,
              src;
            for (i = 0; i < xx.length; i++) {
              x = xx[i];
              c = x.firstElementChild;
              if (c.tagName != "IMG") {
                w = c;
                c = c.firstElementChild;
              }
              if (c.parentNode.classList.contains("deferred")) {
                c.parentNode.classList.remove("deferred");
                src = c.getAttribute("data-src");
                c.removeAttribute("data-src");
              } else src = c.getAttribute("src");
              c.style["backgroundImage"] = "url('" + src + "')";
              c.style["backgroundSize"] = "cover";
              c.style["backgroundPosition"] = x.dataset.position;
              c.style["backgroundRepeat"] = "no-repeat";
              c.src =
                "data:image/svg+xml;charset=utf8," +
                escape(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"></svg>'
                );
              if (
                x.classList.contains("full") &&
                (x.parentNode && x.parentNode.classList.contains("full")) &&
                (x.parentNode.parentNode &&
                  x.parentNode.parentNode.parentNode &&
                  x.parentNode.parentNode.parentNode.classList.contains(
                    "container"
                  )) &&
                x.parentNode.children.length == 1
              ) {
                (function(x, w) {
                  var p = x.parentNode.parentNode,
                    f = function() {
                      x.style["height"] = "0px";
                      clearTimeout(t);
                      t = setTimeout(function() {
                        if (getComputedStyle(p).flexDirection == "row") {
                          if (w) w.style["height"] = "100%";
                          x.style["height"] = p.scrollHeight + 1 + "px";
                        } else {
                          if (w) w.style["height"] = "auto";
                          x.style["height"] = "auto";
                        }
                      }, 125);
                    },
                    t;
                  on("resize", f);
                  on("load", f);
                  f();
                })(x, w);
              }
            }
          })();
          (function() {
            var xx = $$(".gallery img"),
              x,
              p,
              i,
              src;
            for (i = 0; i < xx.length; i++) {
              x = xx[i];
              p = x.parentNode;
              if (p.classList.contains("deferred")) {
                p.classList.remove("deferred");
                src = x.getAttribute("data-src");
              } else src = x.getAttribute("src");
              p.style["backgroundImage"] = "url('" + src + "')";
              p.style["backgroundSize"] = "cover";
              p.style["backgroundPosition"] = "center";
              p.style["backgroundRepeat"] = "no-repeat";
              x.style["opacity"] = "0";
            }
          })();
        }
        function timer(id, options) {
          var _this = this,
            f;
          this.id = id;
          this.timestamp = options.timestamp;
          this.duration = options.duration;
          this.mode = options.mode;
          this.precision = options.precision;
          this.completeUrl = options.completeUrl;
          this.completion = options.completion;
          this.persistent = options.persistent;
          this.labelStyle = options.labelStyle;
          this.completed = false;
          this.status = null;
          this.$timer = document.getElementById(this.id);
          this.$parent = document.querySelector("#" + _this.$timer.id + " ul");
          this.days = { $li: null, $digit: null, $components: null };
          this.hours = { $li: null, $digit: null, $components: null };
          this.minutes = { $li: null, $digit: null, $components: null };
          this.seconds = { $li: null, $digit: null, $components: null };
          this.init();
        }
        timer.prototype.init = function() {
          var _this = this,
            kt,
            kd;
          kt = this.id + "-timestamp";
          kd = this.id + "-duration";
          switch (this.mode) {
            case "duration":
              this.timestamp = parseInt(Date.now() / 1000) + this.duration;
              if (this.persistent) {
                if (registry.get(kd) != this.duration) registry.unset(kt);
                registry.set(kd, this.duration);
                if (registry.exists(kt))
                  this.timestamp = parseInt(registry.get(kt));
                else registry.set(kt, this.timestamp);
              } else {
                if (registry.exists(kt)) registry.unset(kt);
                if (registry.exists(kd)) registry.unset(kd);
              }
              break;
            default:
              break;
          }
          window.setInterval(function() {
            _this.updateDigits();
            _this.updateSize();
          }, 250);
          this.updateDigits();
          on("resize", function() {
            _this.updateSize();
          });
          this.updateSize();
        };
        timer.prototype.updateSize = function() {
          var $items,
            $item,
            $digit,
            $components,
            $component,
            $label,
            $sublabel,
            $symbols,
            w,
            iw,
            h,
            f,
            i,
            j,
            found;
          $items = document.querySelectorAll(
            "#" + this.$timer.id + " ul li .item"
          );
          $symbols = document.querySelectorAll(
            "#" + this.$timer.id + " .symbol"
          );
          $components = document.querySelectorAll(
            "#" + this.$timer.id + " .component"
          );
          h = 0;
          f = 0;
          for (j = 0; j < $components.length; j++) {
            $components[j].style.lineHeight = "";
            $components[j].style.height = "";
          }
          for (j = 0; j < $symbols.length; j++) {
            $symbols[j].style.fontSize = "";
            $symbols[j].style.lineHeight = "";
            $symbols[j].style.height = "";
          }
          for (i = 0; i < $items.length; i++) {
            $item = $items[i];
            $component = $item.children[0].children[0];
            w = $component.offsetWidth;
            iw = $item.offsetWidth;
            $digit = $item.children[0];
            $digit.style.fontSize = "";
            $digit.style.fontSize = w * 1.65 + "px";
            h = Math.max(h, $digit.offsetHeight);
            f = Math.max(f, w * 1.65);
            if ($item.children.length > 1) {
              $label = $item.children[1];
              found = false;
              for (j = 0; j < $label.children.length; j++) {
                $sublabel = $label.children[j];
                $sublabel.style.display = "";
                if (!found && $sublabel.offsetWidth < iw) {
                  found = true;
                  $sublabel.style.display = "";
                } else $sublabel.style.display = "none";
              }
            }
          }
          if ($items.length == 1) {
            var x = $items[0].children[0],
              xs = getComputedStyle(x),
              xsa = getComputedStyle(x, ":after");
            if (xsa.content != "none")
              h =
                parseInt(xsa.height) -
                parseInt(xs.marginTop) -
                parseInt(xs.marginBottom) +
                24;
          }
          for (j = 0; j < $components.length; j++) {
            $components[j].style.lineHeight = h + "px";
            $components[j].style.height = h + "px";
          }
          for (j = 0; j < $symbols.length; j++) {
            $symbols[j].style.fontSize = f * 0.5 + "px";
            $symbols[j].style.lineHeight = h + "px";
            $symbols[j].style.height = h + "px";
          }
          this.$parent.style.height = "";
          this.$parent.style.height = this.$parent.offsetHeight + "px";
        };
        timer.prototype.updateDigits = function() {
          var _this = this,
            x = [
              {
                class: "days",
                digit: 0,
                label: { full: "Days", abbreviated: "Days", initialed: "D" }
              },
              {
                class: "hours",
                digit: 0,
                label: { full: "Hours", abbreviated: "Hrs", initialed: "H" }
              },
              {
                class: "minutes",
                digit: 0,
                label: { full: "Minutes", abbreviated: "Mins", initialed: "M" }
              },
              {
                class: "seconds",
                digit: 0,
                label: { full: "Seconds", abbreviated: "Secs", initialed: "S" }
              }
            ],
            now,
            diff,
            zeros,
            status,
            i,
            j,
            x,
            z,
            t,
            s;
          now = parseInt(Date.now() / 1000);
          switch (this.mode) {
            case "countdown":
            case "duration":
              if (this.timestamp >= now) diff = this.timestamp - now;
              else {
                diff = 0;
                if (!this.completed) {
                  this.completed = true;
                  if (this.completion) this.completion();
                  if (this.completeUrl)
                    window.setTimeout(function() {
                      window.location.href = _this.completeUrl;
                    }, 1000);
                }
              }
              break;
            default:
            case "default":
              if (this.timestamp >= now) diff = this.timestamp - now;
              else diff = now - this.timestamp;
              break;
          }
          x[0].digit = Math.floor(diff / 86400);
          diff -= x[0].digit * 86400;
          x[1].digit = Math.floor(diff / 3600);
          diff -= x[1].digit * 3600;
          x[2].digit = Math.floor(diff / 60);
          diff -= x[2].digit * 60;
          x[3].digit = diff;
          zeros = 0;
          for (i = 0; i < x.length; i++)
            if (x[i].digit == 0) zeros++;
            else break;
          while (zeros > 0 && x.length > this.precision) {
            x.shift();
            zeros--;
          }
          z = [];
          for (i = 0; i < x.length; i++) z.push(x[i].class);
          status = z.join("-");
          if (status == this.status) {
            var $digit, $components;
            for (i = 0; i < x.length; i++) {
              $digit = document.querySelector(
                "#" + this.id + " ." + x[i].class + " .digit"
              );
              $components = document.querySelectorAll(
                "#" + this.id + " ." + x[i].class + " .digit .component"
              );
              if (!$digit) continue;
              z = [];
              t = String(x[i].digit);
              if (x[i].digit < 10) {
                z.push("0");
                z.push(t);
              } else for (j = 0; j < t.length; j++) z.push(t.substr(j, 1));
              $digit.classList.remove("count1", "count2", "count3", "count4");
              $digit.classList.add("count" + z.length);
              if ($components.length == z.length) {
                for (j = 0; j < $components.length && j < z.length; j++)
                  $components[j].innerHTML = z[j];
              } else {
                s = "";
                for (j = 0; j < $components.length && j < z.length; j++)
                  s +=
                    '<span class="component x' +
                    Math.random() +
                    '">' +
                    z[j] +
                    "</span>";
                $digit.innerHTML = s;
              }
            }
          } else {
            s = "";
            for (i = 0; i < x.length && i < this.precision; i++) {
              z = [];
              t = String(x[i].digit);
              if (x[i].digit < 10) {
                z.push("0");
                z.push(t);
              } else for (j = 0; j < t.length; j++) z.push(t.substr(j, 1));
              if (i > 0)
                s +=
                  '<li class="delimiter">' +
                  '<span class="symbol">:</span>' +
                  "</li>";
              s +=
                '<li class="number ' + x[i].class + '">' + '<div class="item">';
              s += '<span class="digit count' + t.length + '">';
              for (j = 0; j < z.length; j++)
                s += '<span class="component">' + z[j] + "</span>";
              s += "</span>";
              switch (this.labelStyle) {
                default:
                case "full":
                  s +=
                    '<span class="label">' +
                    '<span class="full">' +
                    x[i].label.full +
                    "</span>" +
                    '<span class="abbreviated">' +
                    x[i].label.abbreviated +
                    "</span>" +
                    '<span class="initialed">' +
                    x[i].label.initialed +
                    "</span>" +
                    "</span>";
                  break;
                case "abbreviated":
                  s +=
                    '<span class="label">' +
                    '<span class="abbreviated">' +
                    x[i].label.abbreviated +
                    "</span>" +
                    '<span class="initialed">' +
                    x[i].label.initialed +
                    "</span>" +
                    "</span>";
                  break;
                case "initialed":
                  s +=
                    '<span class="label">' +
                    '<span class="initialed">' +
                    x[i].label.initialed +
                    "</span>" +
                    "</span>";
                  break;
                case "none":
                  break;
              }
              s += "</div>" + "</li>";
            }
            _this.$parent.innerHTML = s;
            this.status = status;
          }
        };
        new timer("timer01", {
          mode: "default",
          precision: 4,
          completeUrl: "",
          timestamp: 1623279601,
          labelStyle: "full"
        });
      })();
