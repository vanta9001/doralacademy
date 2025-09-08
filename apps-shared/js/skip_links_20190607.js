function ada_keyboard() {

	this.KEY_CODE_1 = 49;
	this.KEY_CODE_2 = 50;
	this.KEY_CODE_3 = 51;
	this.KEY_CODE_ENTER = 13;
	this.KEY_CODE_SPACE = 32;
	this.KEY_CODE_TAB = 9;

    const adak = this;

    this.config = {
        skipLinkToMainContent: _skipLinkToMainContent,
        skipLinkToMainNav: _skipLinkToMainNav
    };

    /* 2147483647 is the maximum 32bit integer possible which is the highest
     * available z-index value and is the value used for skip links. This function
     * checks for other elements with this same z-index and if one is found it's
     * z-index is reduced to ensure the skip links are never overlayed by any element.
     * additionally, there is a css rule declared above checking for this same z-index
     * value within inline style tags. */
    this.scanZindex = function () {
        jAria('#top, #top *, #header, #header *, #index-top, #index-top *').filter(function () {
            return parseInt(jAria(this).css('z-index')) == 2147483647;
        }).each(function () {
            jAria(this).css("z-index", 2147483646);
        });
    }

    /* #nav_items_0 can be used to ID the main menu of any site using the new Navigation module.
     * I have come across some (very view) sites that either use a static menu or just don't
     * have the #nav_items_0 ID. In those cases the wrapper ID #menu is used*/
    this.correctMenuShortcut = function () {
        if (jAria("#nav_items_0").length > 0) return;
        jAria(".skip-to-mainMenu").attr("href", "#menu");
    }

    /* This function is called from an external script after that script corrects
     * the DOM placement of the main menu and main content shortcuts. */
    this.clearSpecialIndex = function () {
        jAria("#at-header, #at-main_menu").removeAttr("tabindex");
    }

    //
    this.addEvents = function () {
        jAria(".ada-shortcut").click(function (e) {
            e.preventDefault();
            adak.shortcutClick(this);
        });

        jAria(".ada-shortcut").bind("blur mouseleave mouseout", function (e) {
            jAria(".ada-shortcut").removeClass("onscreen");
        });

		jAria(document.body).mousedown(function (e) {
            if (e.target.classList.contains("ada-shortcut")) {
                return;
            }

            if (jAria("#skip-links-helper").css('left') !== '-9999px') {
                jAria("#skip-links-helper").css('left', '-9999px');
            }
		});

        jAria(document.body).keydown(function (e) {
            if (adak.hasAnyShortcutFocus() && e.keyCode === adak.KEY_CODE_SPACE) {
                e.preventDefault();
                jAria("#skip-links-helper").css('left', '-9999px');
                e.target.click();
            }

            if (e.keyCode === adak.KEY_CODE_ENTER) {
                jAria("#skip-links-helper").css('left', '-9999px');
            }
        });

        if (typeof ENAccToolbar !== "undefined") {
            jAria(document.body).keydown(function (e) {
                if (e.keyCode === adak.KEY_CODE_1) {
                    jAria("#skip-links-helper").css('left', '20px');
                    let target = document.getElementById("at-header");
                    if (target != null) {
                        adak.bruteForceFocus(target);
                    }
                }

                if (e.keyCode === adak.KEY_CODE_2) {
                    jAria("#skip-links-helper").css('left', '-9999px');
                    document.getElementById("at-header").click();
                }

                if (e.keyCode === adak.KEY_CODE_3) {
                    jAria("#skip-links-helper").css('left', '-9999px');
                    document.getElementById("at-main_menu").click();
                }
            });
        }
    }

    //
    this.shortcutClick = function (element) {
        jAria("#skip-links-helper").css('left', '-9999px');
        var skipTo = "#" + element.href.split("#")[1];
        var shortcut = jAria(skipTo);
        shortcut.addClass("onscreen");
        var target = document.getElementById(element.href.split("#")[1]);
        if (target != null) {
            adak.bruteForceFocus(target);
        }
    }

    /* Because of unreliability with certain screen readers' focus indications and a lack of
     * a way to check for success leaves a brute force focus as the most reliable method of
     * sending both the browser & screen reader focus to an element. Known to occur with
     * Mac's Voiceover screen reader. */
    this.bruteForceFocus = function (target) {
        var ms = 10, repetitions = 10, haveRepeated = 0;
        var current_tab_index = target.getAttribute("tabindex");
        current_tab_index = (current_tab_index !== typeof undefined && current_tab_index !== false && current_tab_index !== null)
            ? current_tab_index : "";
        target.setAttribute("tabindex", 0);
        target.blur();
        var interval = window.setInterval(function () {
            target.focus();
            haveRepeated++;
            if (haveRepeated >= repetitions) {
                window.clearInterval(interval);
                target.setAttribute("tabindex", current_tab_index);
            }
        }, ms);
    }

    /* The home page area of each school has a unique index file which would require
     * manually importing back to top skip links from the main content area of each school.
     * to avoid this we are adding the back to top shortcut with js*/
    this.createAdditionalShortcuts = function () {
        if (_isHomepage) {
            var ada_content_div = jAria("<div>", {
                "id": "content-shortcut-target",
                "class": "offscreen",
                "aria-label": "Main Content",
                "role": "region"
            });
            jAria("#index-wrapper, .contentIndex").prepend(ada_content_div);
        } else {
            jAria("#at-header").attr("href", "#pageTitle");
        }
        adak.initIframeSkipLinks();
    }

    /* Iframe Shortcuts for widgets like Twitter, Facebook, and Instagram widgets
     */
    adak.loaded_iframes = 0;

    this.insertAfter = function (element, referenceNode) {
        referenceNode.parentNode.insertBefore(element, referenceNode.nextSibling);
    }

    /* Shortcuts are added to widgets three seconds after page load,
     * an additional sweep is done at 10 seconds in case a widget was slow to load.
     * widgets loaded in the first sweep are ignored in the second.
     */
    this.initIframeSkipLinks = function () {
        window.setTimeout(function () {
            adak.createIframeShortcuts(document.getElementsByTagName("iframe"));
        }, 3000);

        window.setTimeout(function () {
            adak.createIframeShortcuts(document.getElementsByTagName("iframe"));
        }, 10000);
    }

    this.createIframeShortcuts = function (iframes) {
        var body_rect = document.body.getBoundingClientRect();
        var total_frames = iframes.length;
        for (var i = 0; i < total_frames - 1; i++) {
            if (iframes[i].style.display !== 'none'
                && !iframes[i].hasAttribute("skippable")
                && ((iframes[i].hasAttribute("href") && (iframes[i].getAttribute("href").match("facebook|cdn.lightweight") != null)))
                || (iframes[i].hasAttribute("id") && (iframes[i].getAttribute("id").indexOf("twitter") > -1))
            ) {
                var focus_style = "background-color:#fff; color:#000; left:0; position: absolute; padding:4px 6px;";
                var blur_style = "left:-9999em; position: absolute;";
                var title = iframes[i].title;
                var position = window.getComputedStyle(iframes[i], null).getPropertyValue("position");
                var height = window.getComputedStyle(iframes[i], null).getPropertyValue("height");

                var margin_fallback = false;
                if (position === "absolute") {
                    margin_fallback = true;
                }

                var relative_widget_wrapperA = document.createElement('div');
                relative_widget_wrapperA.setAttribute("style", "height:0;position:relative;z-index:2147483647;");
                relative_widget_wrapperA.setAttribute("class", "ada_widget_shortcut_wrapper");
                iframes[i].parentNode.insertBefore(relative_widget_wrapperA, iframes[i]);

                var relative_widget_wrapperB = document.createElement('div');
                relative_widget_wrapperB.setAttribute("style", "height:0;position:relative;z-index:2147483647;" + ((margin_fallback) ? ("margin-top:" + height) : ""));
                relative_widget_wrapperB.setAttribute("class", "ada_widget_shortcut_wrapper");

                var shortcutA = document.createElement('a');
                shortcutA.setAttribute("href", "#" + adak.loaded_iframes + "_skip_before");
                shortcutA.setAttribute("id", adak.loaded_iframes + "_skip_after");
                shortcutA.setAttribute("style", "" + blur_style + "");
                shortcutA.setAttribute("class", "ada_widget_skip ada_widget_skiplink_before");
                shortcutA.appendChild(document.createTextNode("Skip Beyond the " + title + " Widget"));

                var shortcutB = document.createElement('a');
                shortcutB.setAttribute("href", "#" + adak.loaded_iframes + "_skip_after");
                shortcutB.setAttribute("id", adak.loaded_iframes + "_skip_before");
                shortcutB.setAttribute("style", "" + blur_style + "");
                shortcutB.setAttribute("class", "ada_widget_skip ada_widget_skiplink_after");
                shortcutB.appendChild(document.createTextNode("Skip Before the " + title + " Widget"));

                adak.insertAfter(relative_widget_wrapperB, iframes[i]);

                relative_widget_wrapperA.append(shortcutA);
                relative_widget_wrapperB.append(shortcutB);

                shortcutA.setAttribute("onfocus", "javascript: this.style = '" + focus_style + " top:4px;'");
                shortcutA.setAttribute("onblur", "javascript: this.style = '" + blur_style + " top:4px;'");
                shortcutB.setAttribute("onfocus", "javascript: this.style = '" + focus_style + " top:" + -(shortcutB.clientHeight + 12) + "px;'");
                shortcutB.setAttribute("onblur", "javascript: this.style = '" + blur_style + "  top:" + -(shortcutB.clientHeight + 12) + "px;'");

                jAria("#" + adak.loaded_iframes + "_skip_before, #" + adak.loaded_iframes + "_skip_after").bind("click", function (e) {
                    e.preventDefault();
                    adak.shortcutClick(this);
                });

                iframes[i].setAttribute("skippable", "true");
                adak.loaded_iframes = adak.loaded_iframes + 1;
            }
        }
    }

    // event handler
    this.listen = function (elem, evt, handler) {
        if (elem.addEventListener) {
            elem.addEventListener(evt, handler, false);
            return true;
        } else if (elem.attachEvent) {
            return elem.attachEvent('on' + evt, handler);
        } else {
            evt = 'on' + evt;
            if (typeof elem[evt] === 'function') {
                handler = (function (f1, f2) {
                    return function () {
                        f1.apply(this, arguments);
                        f2.apply(this, arguments);
                    }
                })(elem[evt], handler);
            }
            elem[evt] = handler;
            return true;
        }
        return false;
    }

    this.hasAnyShortcutFocus = function () {
        return document.activeElement.classList.contains("ada-shortcut");
    }
}

var ada_keyboard = new ada_keyboard();
var main_menu;
if (ada_keyboard.config.skipLinkToMainNav) {
    main_menu = new MainMenu()
}