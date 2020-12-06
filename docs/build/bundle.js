
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self$1(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    // external events
    const FINALIZE_EVENT_NAME = "finalize";
    const CONSIDER_EVENT_NAME = "consider";

    /**
     * @typedef {Object} Info
     * @property {string} trigger
     * @property {string} id
     * @property {string} source
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchFinalizeEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(FINALIZE_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    /**
     * Dispatches a consider event
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchConsiderEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(CONSIDER_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    // internal events
    const DRAGGED_ENTERED_EVENT_NAME = "draggedEntered";
    const DRAGGED_LEFT_EVENT_NAME = "draggedLeft";
    const DRAGGED_OVER_INDEX_EVENT_NAME = "draggedOverIndex";
    const DRAGGED_LEFT_DOCUMENT_EVENT_NAME = "draggedLeftDocument";
    function dispatchDraggedElementEnteredContainer(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_ENTERED_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }
    function dispatchDraggedElementLeftContainer(containerEl, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_EVENT_NAME, {
                detail: {draggedEl}
            })
        );
    }
    function dispatchDraggedElementIsOverIndex(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_OVER_INDEX_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }
    function dispatchDraggedLeftDocument(draggedEl) {
        window.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, {
                detail: {draggedEl}
            })
        );
    }

    const TRIGGERS = {
        DRAG_STARTED: "dragStarted",
        DRAGGED_ENTERED: DRAGGED_ENTERED_EVENT_NAME,
        DRAGGED_OVER_INDEX: DRAGGED_OVER_INDEX_EVENT_NAME,
        DRAGGED_LEFT: DRAGGED_LEFT_EVENT_NAME,
        DROPPED_INTO_ZONE: "droppedIntoZone",
        DROPPED_INTO_ANOTHER: "droppedIntoAnother",
        DROPPED_OUTSIDE_OF_ANY: "droppedOutsideOfAny",
        DRAG_STOPPED: "dragStopped"
    };
    const SOURCES = {
        POINTER: "pointer",
        KEYBOARD: "keyboard"
    };

    const SHADOW_ITEM_MARKER_PROPERTY_NAME = "isDndShadowItem";
    let ITEM_ID_KEY = "id";
    let activeDndZoneCount = 0;
    function incrementActiveDropZoneCount() {
        activeDndZoneCount++;
    }
    function decrementActiveDropZoneCount() {
        if (activeDndZoneCount === 0) {
            throw new Error("Bug! trying to decrement when there are no dropzones");
        }
        activeDndZoneCount--;
    }

    const isOnServer = typeof window === "undefined";

    // This is based off https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms/57876601#57876601
    // It removes the transforms that are potentially applied by the flip animations
    function adjustedBoundingRect(el) {
        let ta;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const tx = style.transform;

        if (tx) {
            let sx, sy, dx, dy;
            if (tx.startsWith("matrix3d(")) {
                ta = tx.slice(9, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[5];
                dx = +ta[12];
                dy = +ta[13];
            } else if (tx.startsWith("matrix(")) {
                ta = tx.slice(7, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[3];
                dx = +ta[4];
                dy = +ta[5];
            } else {
                return rect;
            }

            const to = style.transformOrigin;
            const x = rect.x - dx - (1 - sx) * parseFloat(to);
            const y = rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(" ") + 1));
            const w = sx ? rect.width / sx : el.offsetWidth;
            const h = sy ? rect.height / sy : el.offsetHeight;
            return {
                x: x,
                y: y,
                width: w,
                height: h,
                top: y,
                right: x + w,
                bottom: y + h,
                left: x
            };
        } else {
            return rect;
        }
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position and removes transforms)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRectNoTransforms(el) {
        const rect = adjustedBoundingRect(el);
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRect(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * finds the center :)
     * @typedef {Object} Rect
     * @property {number} top
     * @property {number} bottom
     * @property {number} left
     * @property {number} right
     * @param {Rect} rect
     * @return {{x: number, y: number}}
     */
    function findCenter(rect) {
        return {
            x: (rect.left + rect.right) / 2,
            y: (rect.top + rect.bottom) / 2
        };
    }

    /**
     * @typedef {Object} Point
     * @property {number} x
     * @property {number} y
     * @param {Point} pointA
     * @param {Point} pointB
     * @return {number}
     */
    function calcDistance(pointA, pointB) {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }

    /**
     * @param {Point} point
     * @param {Rect} rect
     * @return {boolean|boolean}
     */
    function isPointInsideRect(point, rect) {
        return point.y <= rect.bottom && point.y >= rect.top && point.x >= rect.left && point.x <= rect.right;
    }

    /**
     * find the absolute coordinates of the center of a dom element
     * @param el {HTMLElement}
     * @returns {{x: number, y: number}}
     */
    function findCenterOfElement(el) {
        return findCenter(getAbsoluteRect(el));
    }

    /**
     * @param {HTMLElement} elA
     * @param {HTMLElement} elB
     * @return {boolean}
     */
    function isCenterOfAInsideB(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const rectOfB = getAbsoluteRectNoTransforms(elB);
        return isPointInsideRect(centerOfA, rectOfB);
    }

    /**
     * @param {HTMLElement|ChildNode} elA
     * @param {HTMLElement|ChildNode} elB
     * @return {number}
     */
    function calcDistanceBetweenCenters(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const centerOfB = findCenterOfElement(elB);
        return calcDistance(centerOfA, centerOfB);
    }

    /**
     * @param {HTMLElement} el - the element to check
     * @returns {boolean} - true if the element in its entirety is off screen including the scrollable area (the normal dom events look at the mouse rather than the element)
     */
    function isElementOffDocument(el) {
        const rect = getAbsoluteRect(el);
        return rect.right < 0 || rect.left > document.documentElement.scrollWidth || rect.bottom < 0 || rect.top > document.documentElement.scrollHeight;
    }

    /**
     * If the point is inside the element returns its distances from the sides, otherwise returns null
     * @param {Point} point
     * @param {HTMLElement} el
     * @return {null|{top: number, left: number, bottom: number, right: number}}
     */
    function calcInnerDistancesBetweenPointAndSidesOfElement(point, el) {
        const rect = getAbsoluteRect(el);
        if (!isPointInsideRect(point, rect)) {
            return null;
        }
        return {
            top: point.y - rect.top,
            bottom: rect.bottom - point.y,
            left: point.x - rect.left,
            // TODO - figure out what is so special about right (why the rect is too big)
            right: Math.min(rect.right, document.documentElement.clientWidth) - point.x
        };
    }

    /**
     * @typedef {Object} Index
     * @property {number} index - the would be index
     * @property {boolean} isProximityBased - false if the element is actually over the index, true if it is not over it but this index is the closest
     */
    /**
     * Find the index for the dragged element in the list it is dragged over
     * @param {HTMLElement} floatingAboveEl
     * @param {HTMLElement} collectionBelowEl
     * @returns {Index|null} -  if the element is over the container the Index object otherwise null
     */
    function findWouldBeIndex(floatingAboveEl, collectionBelowEl) {
        if (!isCenterOfAInsideB(floatingAboveEl, collectionBelowEl)) {
            return null;
        }
        const children = collectionBelowEl.children;
        // the container is empty, floating element should be the first
        if (children.length === 0) {
            return {index: 0, isProximityBased: true};
        }
        // the search could be more efficient but keeping it simple for now
        // a possible improvement: pass in the lastIndex it was found in and check there first, then expand from there
        for (let i = 0; i < children.length; i++) {
            if (isCenterOfAInsideB(floatingAboveEl, children[i])) {
                return {index: i, isProximityBased: false};
            }
        }
        // this can happen if there is space around the children so the floating element has
        //entered the container but not any of the children, in this case we will find the nearest child
        let minDistanceSoFar = Number.MAX_VALUE;
        let indexOfMin = undefined;
        // we are checking all of them because we don't know whether we are dealing with a horizontal or vertical container and where the floating element entered from
        for (let i = 0; i < children.length; i++) {
            const distance = calcDistanceBetweenCenters(floatingAboveEl, children[i]);
            if (distance < minDistanceSoFar) {
                minDistanceSoFar = distance;
                indexOfMin = i;
            }
        }
        return {index: indexOfMin, isProximityBased: true};
    }

    const SCROLL_ZONE_PX = 25;

    function makeScroller() {
        let scrollingInfo;
        function resetScrolling() {
            scrollingInfo = {directionObj: undefined, stepPx: 0};
        }
        resetScrolling();
        // directionObj {x: 0|1|-1, y:0|1|-1} - 1 means down in y and right in x
        function scrollContainer(containerEl) {
            const {directionObj, stepPx} = scrollingInfo;
            if (directionObj) {
                containerEl.scrollBy(directionObj.x * stepPx, directionObj.y * stepPx);
                window.requestAnimationFrame(() => scrollContainer(containerEl));
            }
        }
        function calcScrollStepPx(distancePx) {
            return SCROLL_ZONE_PX - distancePx;
        }

        /**
         * If the pointer is next to the sides of the element to scroll, will trigger scrolling
         * Can be called repeatedly with updated pointer and elementToScroll values without issues
         * @return {boolean} - true if scrolling was needed
         */
        function scrollIfNeeded(pointer, elementToScroll) {
            if (!elementToScroll) {
                return false;
            }
            const distances = calcInnerDistancesBetweenPointAndSidesOfElement(pointer, elementToScroll);
            if (distances === null) {
                resetScrolling();
                return false;
            }
            const isAlreadyScrolling = !!scrollingInfo.directionObj;
            let [scrollingVertically, scrollingHorizontally] = [false, false];
            // vertical
            if (elementToScroll.scrollHeight > elementToScroll.clientHeight) {
                if (distances.bottom < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: 1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.bottom);
                } else if (distances.top < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: -1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.top);
                }
                if (!isAlreadyScrolling && scrollingVertically) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            // horizontal
            if (elementToScroll.scrollWidth > elementToScroll.clientWidth) {
                if (distances.right < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: 1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.right);
                } else if (distances.left < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: -1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.left);
                }
                if (!isAlreadyScrolling && scrollingHorizontally) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            resetScrolling();
            return false;
        }

        return {
            scrollIfNeeded,
            resetScrolling
        };
    }

    /**
     * @param {Object} object
     * @return {string}
     */
    function toString(object) {
        return JSON.stringify(object, null, 2);
    }

    /**
     * Finds the depth of the given node in the DOM tree
     * @param {HTMLElement} node
     * @return {number} - the depth of the node
     */
    function getDepth(node) {
        if (!node) {
            throw new Error("cannot get depth of a falsy node");
        }
        return _getDepth(node, 0);
    }
    function _getDepth(node, countSoFar = 0) {
        if (!node.parentElement) {
            return countSoFar - 1;
        }
        return _getDepth(node.parentElement, countSoFar + 1);
    }

    /**
     * A simple util to shallow compare objects quickly, it doesn't validate the arguments so pass objects in
     * @param {Object} objA
     * @param {Object} objB
     * @return {boolean} - true if objA and objB are shallow equal
     */
    function areObjectsShallowEqual(objA, objB) {
        if (Object.keys(objA).length !== Object.keys(objB).length) {
            return false;
        }
        for (const keyA in objA) {
            if (!{}.hasOwnProperty.call(objB, keyA) || objB[keyA] !== objA[keyA]) {
                return false;
            }
        }
        return true;
    }

    const INTERVAL_MS = 200;
    const TOLERANCE_PX = 10;
    const {scrollIfNeeded, resetScrolling} = makeScroller();
    let next;

    /**
     * Tracks the dragged elements and performs the side effects when it is dragged over a drop zone (basically dispatching custom-events scrolling)
     * @param {Set<HTMLElement>} dropZones
     * @param {HTMLElement} draggedEl
     * @param {number} [intervalMs = INTERVAL_MS]
     */
    function observe(draggedEl, dropZones, intervalMs = INTERVAL_MS) {
        // initialization
        let lastDropZoneFound;
        let lastIndexFound;
        let lastIsDraggedInADropZone = false;
        let lastCentrePositionOfDragged;
        // We are sorting to make sure that in case of nested zones of the same type the one "on top" is considered first
        const dropZonesFromDeepToShallow = Array.from(dropZones).sort((dz1, dz2) => getDepth(dz2) - getDepth(dz1));

        /**
         * The main function in this module. Tracks where everything is/ should be a take the actions
         */
        function andNow() {
            const currentCenterOfDragged = findCenterOfElement(draggedEl);
            const scrolled = scrollIfNeeded(currentCenterOfDragged, lastDropZoneFound);
            // we only want to make a new decision after the element was moved a bit to prevent flickering
            if (
                !scrolled &&
                lastCentrePositionOfDragged &&
                Math.abs(lastCentrePositionOfDragged.x - currentCenterOfDragged.x) < TOLERANCE_PX &&
                Math.abs(lastCentrePositionOfDragged.y - currentCenterOfDragged.y) < TOLERANCE_PX
            ) {
                next = window.setTimeout(andNow, intervalMs);
                return;
            }
            if (isElementOffDocument(draggedEl)) {
                dispatchDraggedLeftDocument(draggedEl);
                return;
            }

            lastCentrePositionOfDragged = currentCenterOfDragged;
            // this is a simple algorithm, potential improvement: first look at lastDropZoneFound
            let isDraggedInADropZone = false;
            for (const dz of dropZonesFromDeepToShallow) {
                const indexObj = findWouldBeIndex(draggedEl, dz);
                if (indexObj === null) {
                    // it is not inside
                    continue;
                }
                const {index} = indexObj;
                isDraggedInADropZone = true;
                // the element is over a container
                if (dz !== lastDropZoneFound) {
                    lastDropZoneFound && dispatchDraggedElementLeftContainer(lastDropZoneFound, draggedEl);
                    dispatchDraggedElementEnteredContainer(dz, indexObj, draggedEl);
                    lastDropZoneFound = dz;
                    lastIndexFound = index;
                } else if (index !== lastIndexFound) {
                    dispatchDraggedElementIsOverIndex(dz, indexObj, draggedEl);
                    lastIndexFound = index;
                }
                // we handle looping with the 'continue' statement above
                break;
            }
            // the first time the dragged element is not in any dropzone we need to notify the last dropzone it was in
            if (!isDraggedInADropZone && lastIsDraggedInADropZone && lastDropZoneFound) {
                dispatchDraggedElementLeftContainer(lastDropZoneFound, draggedEl);
                lastDropZoneFound = undefined;
                lastIndexFound = undefined;
                lastIsDraggedInADropZone = false;
            } else {
                lastIsDraggedInADropZone = true;
            }
            next = window.setTimeout(andNow, intervalMs);
        }
        andNow();
    }

    // assumption - we can only observe one dragged element at a time, this could be changed in the future
    function unobserve() {
        clearTimeout(next);
        resetScrolling();
    }

    const INTERVAL_MS$1 = 300;
    let mousePosition;

    /**
     * Do not use this! it is visible for testing only until we get over the issue Cypress not triggering the mousemove listeners
     * // TODO - make private (remove export)
     * @param {{clientX: number, clientY: number}} e
     */
    function updateMousePosition(e) {
        const c = e.touches ? e.touches[0] : e;
        mousePosition = {x: c.clientX, y: c.clientY};
    }
    const {scrollIfNeeded: scrollIfNeeded$1, resetScrolling: resetScrolling$1} = makeScroller();
    let next$1;

    function loop$1() {
        if (mousePosition) {
            scrollIfNeeded$1(mousePosition, document.documentElement);
        }
        next$1 = window.setTimeout(loop$1, INTERVAL_MS$1);
    }

    /**
     * will start watching the mouse pointer and scroll the window if it goes next to the edges
     */
    function armWindowScroller() {
        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("touchmove", updateMousePosition);
        loop$1();
    }

    /**
     * will stop watching the mouse pointer and won't scroll the window anymore
     */
    function disarmWindowScroller() {
        window.removeEventListener("mousemove", updateMousePosition);
        window.removeEventListener("touchmove", updateMousePosition);
        mousePosition = undefined;
        window.clearTimeout(next$1);
        resetScrolling$1();
    }

    const TRANSITION_DURATION_SECONDS = 0.2;

    /**
     * private helper function - creates a transition string for a property
     * @param {string} property
     * @return {string} - the transition string
     */
    function trs(property) {
        return `${property} ${TRANSITION_DURATION_SECONDS}s ease`;
    }
    /**
     * clones the given element and applies proper styles and transitions to the dragged element
     * @param {HTMLElement} originalElement
     * @return {Node} - the cloned, styled element
     */
    function createDraggedElementFrom(originalElement) {
        const rect = originalElement.getBoundingClientRect();
        const draggedEl = originalElement.cloneNode(true);
        copyStylesFromTo(originalElement, draggedEl);
        draggedEl.id = `dnd-action-dragged-el`;
        draggedEl.style.position = "fixed";
        draggedEl.style.top = `${rect.top}px`;
        draggedEl.style.left = `${rect.left}px`;
        draggedEl.style.margin = "0";
        // we can't have relative or automatic height and width or it will break the illusion
        draggedEl.style.boxSizing = "border-box";
        draggedEl.style.height = `${rect.height}px`;
        draggedEl.style.width = `${rect.width}px`;
        draggedEl.style.transition = `${trs("width")}, ${trs("height")}, ${trs("background-color")}, ${trs("opacity")}, ${trs("color")} `;
        // this is a workaround for a strange browser bug that causes the right border to disappear when all the transitions are added at the same time
        window.setTimeout(() => (draggedEl.style.transition += `, ${trs("top")}, ${trs("left")}`), 0);
        draggedEl.style.zIndex = "9999";
        draggedEl.style.cursor = "grabbing";

        return draggedEl;
    }

    /**
     * styles the dragged element to a 'dropped' state
     * @param {HTMLElement} draggedEl
     */
    function moveDraggedElementToWasDroppedState(draggedEl) {
        draggedEl.style.cursor = "grab";
    }

    /**
     * Morphs the dragged element style, maintains the mouse pointer within the element
     * @param {HTMLElement} draggedEl
     * @param {HTMLElement} copyFromEl - the element the dragged element should look like, typically the shadow element
     * @param {number} currentMouseX
     * @param {number} currentMouseY
     * @param {function} transformDraggedElement - function to transform the dragged element, does nothing by default.
     */
    function morphDraggedElementToBeLike(draggedEl, copyFromEl, currentMouseX, currentMouseY, transformDraggedElement) {
        const newRect = copyFromEl.getBoundingClientRect();
        const draggedElRect = draggedEl.getBoundingClientRect();
        const widthChange = newRect.width - draggedElRect.width;
        const heightChange = newRect.height - draggedElRect.height;
        if (widthChange || heightChange) {
            const relativeDistanceOfMousePointerFromDraggedSides = {
                left: (currentMouseX - draggedElRect.left) / draggedElRect.width,
                top: (currentMouseY - draggedElRect.top) / draggedElRect.height
            };
            draggedEl.style.height = `${newRect.height}px`;
            draggedEl.style.width = `${newRect.width}px`;
            draggedEl.style.left = `${parseFloat(draggedEl.style.left) - relativeDistanceOfMousePointerFromDraggedSides.left * widthChange}px`;
            draggedEl.style.top = `${parseFloat(draggedEl.style.top) - relativeDistanceOfMousePointerFromDraggedSides.top * heightChange}px`;
        }

        /// other properties
        copyStylesFromTo(copyFromEl, draggedEl);
        transformDraggedElement();
    }

    /**
     *
     * @param {HTMLElement} copyFromEl
     * @param {HTMLElement} copyToEl
     */
    function copyStylesFromTo(copyFromEl, copyToEl) {
        const computedStyle = window.getComputedStyle(copyFromEl);
        Array.from(computedStyle)
            .filter(
                s =>
                    s.startsWith("background") ||
                    s.startsWith("padding") ||
                    s.startsWith("font") ||
                    s.startsWith("text") ||
                    s.startsWith("align") ||
                    s.startsWith("justify") ||
                    s.startsWith("display") ||
                    s.startsWith("flex") ||
                    s.startsWith("border") ||
                    s === "opacity" ||
                    s === "color" ||
                    s === "list-style-type"
            )
            .forEach(s => copyToEl.style.setProperty(s, computedStyle.getPropertyValue(s), computedStyle.getPropertyPriority(s)));
    }

    /**
     * makes the element compatible with being draggable
     * @param {HTMLElement} draggableEl
     * @param {boolean} dragDisabled
     */
    function styleDraggable(draggableEl, dragDisabled) {
        draggableEl.draggable = false;
        draggableEl.ondragstart = () => false;
        if (!dragDisabled) {
            draggableEl.style.userSelect = "none";
            draggableEl.style.cursor = "grab";
        } else {
            draggableEl.style.userSelect = "";
            draggableEl.style.cursor = "";
        }
    }

    /**
     * Hides the provided element so that it can stay in the dom without interrupting
     * @param {HTMLElement} dragTarget
     */
    function hideOriginalDragTarget(dragTarget) {
        dragTarget.style.display = "none";
        dragTarget.style.position = "fixed";
        dragTarget.style.zIndex = "-5";
    }

    /**
     * styles the shadow element
     * @param {HTMLElement} shadowEl
     */
    function styleShadowEl(shadowEl) {
        shadowEl.style.visibility = "hidden";
    }

    /**
     * will mark the given dropzones as visually active
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object (so the styles can be removed)
     */
    function styleActiveDropZones(dropZones, getStyles = () => {}) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = styles[style];
            });
        });
    }

    /**
     * will remove the 'active' styling from given dropzones
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object
     */
    function styleInactiveDropZones(dropZones, getStyles = () => {}) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = "";
            });
        });
    }

    const DEFAULT_DROP_ZONE_TYPE = "--any--";
    const MIN_OBSERVATION_INTERVAL_MS = 100;
    const MIN_MOVEMENT_BEFORE_DRAG_START_PX = 3;
    const DEFAULT_DROP_TARGET_STYLE = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };

    let originalDragTarget;
    let draggedEl;
    let draggedElData;
    let draggedElType;
    let originDropZone;
    let originIndex;
    let shadowElData;
    let shadowElDropZone;
    let dragStartMousePosition;
    let currentMousePosition;
    let isWorkingOnPreviousDrag = false;
    let finalizingPreviousDrag = false;

    // a map from type to a set of drop-zones
    const typeToDropZones = new Map();
    // important - this is needed because otherwise the config that would be used for everyone is the config of the element that created the event listeners
    const dzToConfig = new Map();
    // this is needed in order to be able to cleanup old listeners and avoid stale closures issues (as the listener is defined within each zone)
    const elToMouseDownListener = new WeakMap();

    /* drop-zones registration management */
    function registerDropZone(dropZoneEl, type) {
        if (!typeToDropZones.has(type)) {
            typeToDropZones.set(type, new Set());
        }
        if (!typeToDropZones.get(type).has(dropZoneEl)) {
            typeToDropZones.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone(dropZoneEl, type) {
        typeToDropZones.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones.get(type).size === 0) {
            typeToDropZones.delete(type);
        }
    }

    /* functions to manage observing the dragged element and trigger custom drag-events */
    function watchDraggedElement() {
        armWindowScroller();
        const dropZones = typeToDropZones.get(draggedElType);
        for (const dz of dropZones) {
            dz.addEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.addEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.addEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.addEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop);
        // it is important that we don't have an interval that is faster than the flip duration because it can cause elements to jump bach and forth
        const observationIntervalMs = Math.max(
            MIN_OBSERVATION_INTERVAL_MS,
            ...Array.from(dropZones.keys()).map(dz => dzToConfig.get(dz).dropAnimationDurationMs)
        );
        observe(draggedEl, dropZones, observationIntervalMs * 1.07);
    }
    function unWatchDraggedElement() {
        disarmWindowScroller();
        const dropZones = typeToDropZones.get(draggedElType);
        for (const dz of dropZones) {
            dz.removeEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.removeEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.removeEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.removeEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop);
        unobserve();
    }

    /* custom drag-events handlers */
    function handleDraggedEntered(e) {
        let {items, dropFromOthersDisabled} = dzToConfig.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        // this deals with another race condition. in rare occasions (super rapid operations) the list hasn't updated yet
        items = items.filter(i => i[ITEM_ID_KEY] !== shadowElData[ITEM_ID_KEY]);
        const {index, isProximityBased} = e.detail.indexObj;
        const shadowElIdx = isProximityBased && index === e.currentTarget.children.length - 1 ? index + 1 : index;
        shadowElDropZone = e.currentTarget;
        items.splice(shadowElIdx, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_ENTERED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }
    function handleDraggedLeft(e) {
        const {items, dropFromOthersDisabled} = dzToConfig.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        const shadowElIdx = items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
        items.splice(shadowElIdx, 1);
        shadowElDropZone = undefined;
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_LEFT, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }
    function handleDraggedIsOverIndex(e) {
        const {items, dropFromOthersDisabled} = dzToConfig.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        const {index} = e.detail.indexObj;
        const shadowElIdx = items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
        items.splice(shadowElIdx, 1);
        items.splice(index, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_OVER_INDEX, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }

    // Global mouse/touch-events handlers
    function handleMouseMove(e) {
        e.preventDefault();
        const c = e.touches ? e.touches[0] : e;
        currentMousePosition = {x: c.clientX, y: c.clientY};
        draggedEl.style.transform = `translate3d(${currentMousePosition.x - dragStartMousePosition.x}px, ${
        currentMousePosition.y - dragStartMousePosition.y
    }px, 0)`;
    }

    function handleDrop() {
        finalizingPreviousDrag = true;
        // cleanup
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleMouseMove);
        window.removeEventListener("mouseup", handleDrop);
        window.removeEventListener("touchend", handleDrop);
        unWatchDraggedElement();
        moveDraggedElementToWasDroppedState(draggedEl);
        let finalizeFunction;
        if (shadowElDropZone) {
            let {items, type} = dzToConfig.get(shadowElDropZone);
            styleInactiveDropZones(typeToDropZones.get(type), dz => dzToConfig.get(dz).dropTargetStyle);
            let shadowElIdx = items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
            // the handler might remove the shadow element, ex: dragula like copy on drag
            if (shadowElIdx === -1) shadowElIdx = originIndex;
            items = items.map(item => (item[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? draggedElData : item));
            finalizeFunction = function finalizeWithinZone() {
                dispatchFinalizeEvent(shadowElDropZone, items, {
                    trigger: TRIGGERS.DROPPED_INTO_ZONE,
                    id: draggedElData[ITEM_ID_KEY],
                    source: SOURCES.POINTER
                });
                if (shadowElDropZone !== originDropZone) {
                    // letting the origin drop zone know the element was permanently taken away
                    dispatchFinalizeEvent(originDropZone, dzToConfig.get(originDropZone).items, {
                        trigger: TRIGGERS.DROPPED_INTO_ANOTHER,
                        id: draggedElData[ITEM_ID_KEY],
                        source: SOURCES.POINTER
                    });
                }
                shadowElDropZone.children[shadowElIdx].style.visibility = "";
                cleanupPostDrop();
            };
            animateDraggedToFinalPosition(shadowElIdx, finalizeFunction);
        } else {
            let {items, type} = dzToConfig.get(originDropZone);
            styleInactiveDropZones(typeToDropZones.get(type), dz => dzToConfig.get(dz).dropTargetStyle);
            items.splice(originIndex, 0, shadowElData);
            shadowElDropZone = originDropZone;
            dispatchConsiderEvent(originDropZone, items, {
                trigger: TRIGGERS.DROPPED_OUTSIDE_OF_ANY,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
            finalizeFunction = function finalizeBackToOrigin() {
                const finalItems = [...items];
                finalItems.splice(originIndex, 1, draggedElData);
                dispatchFinalizeEvent(originDropZone, finalItems, {
                    trigger: TRIGGERS.DROPPED_OUTSIDE_OF_ANY,
                    id: draggedElData[ITEM_ID_KEY],
                    source: SOURCES.POINTER
                });
                shadowElDropZone.children[originIndex].style.visibility = "";
                cleanupPostDrop();
            };
            window.setTimeout(() => animateDraggedToFinalPosition(originIndex, finalizeFunction), 0);
        }
    }

    // helper function for handleDrop
    function animateDraggedToFinalPosition(shadowElIdx, callback) {
        const shadowElRect = shadowElDropZone.children[shadowElIdx].getBoundingClientRect();
        const newTransform = {
            x: shadowElRect.left - parseFloat(draggedEl.style.left),
            y: shadowElRect.top - parseFloat(draggedEl.style.top)
        };
        const {dropAnimationDurationMs} = dzToConfig.get(shadowElDropZone);
        const transition = `transform ${dropAnimationDurationMs}ms ease`;
        draggedEl.style.transition = draggedEl.style.transition ? draggedEl.style.transition + "," + transition : transition;
        draggedEl.style.transform = `translate3d(${newTransform.x}px, ${newTransform.y}px, 0)`;
        window.setTimeout(callback, dropAnimationDurationMs);
    }

    /* cleanup */
    function cleanupPostDrop() {
        draggedEl.remove();
        originalDragTarget.remove();
        draggedEl = undefined;
        originalDragTarget = undefined;
        draggedElData = undefined;
        draggedElType = undefined;
        originDropZone = undefined;
        originIndex = undefined;
        shadowElData = undefined;
        shadowElDropZone = undefined;
        dragStartMousePosition = undefined;
        currentMousePosition = undefined;
        isWorkingOnPreviousDrag = false;
        finalizingPreviousDrag = false;
    }

    function dndzone(node, options) {
        const config = {
            items: undefined,
            type: undefined,
            flipDurationMs: 0,
            dragDisabled: false,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE,
            transformDraggedElement: () => {}
        };
        let elToIdx = new Map();

        function addMaybeListeners() {
            window.addEventListener("mousemove", handleMouseMoveMaybeDragStart, {passive: false});
            window.addEventListener("touchmove", handleMouseMoveMaybeDragStart, {passive: false, capture: false});
            window.addEventListener("mouseup", handleFalseAlarm, {passive: false});
            window.addEventListener("touchend", handleFalseAlarm, {passive: false});
        }
        function removeMaybeListeners() {
            window.removeEventListener("mousemove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("touchmove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("mouseup", handleFalseAlarm);
            window.removeEventListener("touchend", handleFalseAlarm);
        }
        function handleFalseAlarm() {
            removeMaybeListeners();
            originalDragTarget = undefined;
            dragStartMousePosition = undefined;
            currentMousePosition = undefined;
        }

        function handleMouseMoveMaybeDragStart(e) {
            e.preventDefault();
            const c = e.touches ? e.touches[0] : e;
            currentMousePosition = {x: c.clientX, y: c.clientY};
            if (
                Math.abs(currentMousePosition.x - dragStartMousePosition.x) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX ||
                Math.abs(currentMousePosition.y - dragStartMousePosition.y) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX
            ) {
                removeMaybeListeners();
                handleDragStart();
            }
        }
        function handleMouseDown(e) {
            // prevents responding to any button but left click which equals 0 (which is falsy)
            if (e.button) {
                return;
            }
            if (isWorkingOnPreviousDrag) {
                return;
            }
            e.stopPropagation();
            const c = e.touches ? e.touches[0] : e;
            dragStartMousePosition = {x: c.clientX, y: c.clientY};
            currentMousePosition = {...dragStartMousePosition};
            originalDragTarget = e.currentTarget;
            addMaybeListeners();
        }

        function handleDragStart() {
            isWorkingOnPreviousDrag = true;

            // initialising globals
            const currentIdx = elToIdx.get(originalDragTarget);
            originIndex = currentIdx;
            originDropZone = originalDragTarget.parentElement;
            const {items, type} = config;
            draggedElData = {...items[currentIdx]};
            draggedElType = type;
            shadowElData = {...draggedElData, [SHADOW_ITEM_MARKER_PROPERTY_NAME]: true};

            // creating the draggable element
            draggedEl = createDraggedElementFrom(originalDragTarget);
            // We will keep the original dom node in the dom because touch events keep firing on it, we want to re-add it after the framework removes it
            function keepOriginalElementInDom() {
                const {items: itemsNow} = config;
                if (!draggedEl.parentElement && (!itemsNow[originIndex] || draggedElData[ITEM_ID_KEY] !== itemsNow[originIndex][ITEM_ID_KEY])) {
                    document.body.appendChild(draggedEl);
                    // to prevent the outline from disappearing
                    draggedEl.focus();
                    watchDraggedElement();
                    hideOriginalDragTarget(originalDragTarget);
                    document.body.appendChild(originalDragTarget);
                } else {
                    window.requestAnimationFrame(keepOriginalElementInDom);
                }
            }
            window.requestAnimationFrame(keepOriginalElementInDom);

            styleActiveDropZones(
                Array.from(typeToDropZones.get(config.type)).filter(dz => dz === originDropZone || !dzToConfig.get(dz).dropFromOthersDisabled),
                dz => dzToConfig.get(dz).dropTargetStyle
            );

            // removing the original element by removing its data entry
            items.splice(currentIdx, 1);
            dispatchConsiderEvent(originDropZone, items, {trigger: TRIGGERS.DRAG_STARTED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});

            // handing over to global handlers - starting to watch the element
            window.addEventListener("mousemove", handleMouseMove, {passive: false});
            window.addEventListener("touchmove", handleMouseMove, {passive: false, capture: false});
            window.addEventListener("mouseup", handleDrop, {passive: false});
            window.addEventListener("touchend", handleDrop, {passive: false});
        }

        function configure({
            items = undefined,
            flipDurationMs: dropAnimationDurationMs = 0,
            type: newType = DEFAULT_DROP_ZONE_TYPE,
            dragDisabled = false,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE,
            transformDraggedElement = () => {}
        }) {
            config.dropAnimationDurationMs = dropAnimationDurationMs;
            if (config.type && newType !== config.type) {
                unregisterDropZone(node, config.type);
            }
            config.type = newType;
            registerDropZone(node, newType);

            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.transformDraggedElement = transformDraggedElement;

            // realtime update for dropTargetStyle
            if (isWorkingOnPreviousDrag && !finalizingPreviousDrag && !areObjectsShallowEqual(dropTargetStyle, config.dropTargetStyle)) {
                styleInactiveDropZones([node], () => config.dropTargetStyle);
                styleActiveDropZones([node], () => dropTargetStyle);
            }
            config.dropTargetStyle = dropTargetStyle;

            // realtime update for dropFromOthersDisabled
            if (isWorkingOnPreviousDrag && config.dropFromOthersDisabled !== dropFromOthersDisabled) {
                if (dropFromOthersDisabled) {
                    styleInactiveDropZones([node], dz => dzToConfig.get(dz).dropTargetStyle);
                } else {
                    styleActiveDropZones([node], dz => dzToConfig.get(dz).dropTargetStyle);
                }
            }
            config.dropFromOthersDisabled = dropFromOthersDisabled;

            dzToConfig.set(node, config);
            for (let idx = 0; idx < node.children.length; idx++) {
                const draggableEl = node.children[idx];
                styleDraggable(draggableEl, dragDisabled);
                if (config.items[idx][SHADOW_ITEM_MARKER_PROPERTY_NAME]) {
                    morphDraggedElementToBeLike(draggedEl, draggableEl, currentMousePosition.x, currentMousePosition.y, () =>
                        config.transformDraggedElement(draggedEl, draggedElData, idx)
                    );
                    styleShadowEl(draggableEl);
                    continue;
                }
                draggableEl.removeEventListener("mousedown", elToMouseDownListener.get(draggableEl));
                draggableEl.removeEventListener("touchstart", elToMouseDownListener.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("mousedown", handleMouseDown);
                    draggableEl.addEventListener("touchstart", handleMouseDown);
                    elToMouseDownListener.set(draggableEl, handleMouseDown);
                }
                // updating the idx
                elToIdx.set(draggableEl, idx);
            }
        }
        configure(options);

        return {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                unregisterDropZone(node, config.type);
                dzToConfig.delete(node);
            }
        };
    }

    const INSTRUCTION_IDs = {
        DND_ZONE_ACTIVE: "dnd-zone-active",
        DND_ZONE_DRAG_DISABLED: "dnd-zone-drag-disabled"
    };
    const ID_TO_INSTRUCTION = {
        [INSTRUCTION_IDs.DND_ZONE_ACTIVE]: "Tab to one the items and press space-bar or enter to start dragging it",
        [INSTRUCTION_IDs.DND_ZONE_DRAG_DISABLED]: "This is a disabled drag and drop list"
    };

    const ALERT_DIV_ID = "dnd-action-aria-alert";
    let alertsDiv;
    /**
     * Initializes the static aria instructions so they can be attached to zones
     * @return {{DND_ZONE_ACTIVE: string, DND_ZONE_DRAG_DISABLED: string} | null} - the IDs for static aria instruction (to be used via aria-describedby) or null on the server
     */
    function initAria() {
        if (isOnServer) return null;

        // setting the dynamic alerts
        alertsDiv = document.createElement("div");
        (function initAlertsDiv() {
            alertsDiv.id = ALERT_DIV_ID;
            // tab index -1 makes the alert be read twice on chrome for some reason
            //alertsDiv.tabIndex = -1;
            alertsDiv.style.position = "fixed";
            alertsDiv.style.bottom = "0";
            alertsDiv.style.left = "0";
            alertsDiv.style.zIndex = "-5";
            alertsDiv.style.opacity = "0";
            alertsDiv.style.height = "0";
            alertsDiv.style.width = "0";
            alertsDiv.setAttribute("role", "alert");
        })();
        document.body.prepend(alertsDiv);

        // setting the instructions
        Object.entries(ID_TO_INSTRUCTION).forEach(([id, txt]) => document.body.prepend(instructionToHiddenDiv(id, txt)));
        return {...INSTRUCTION_IDs};
    }
    function instructionToHiddenDiv(id, txt) {
        const div = document.createElement("div");
        div.id = id;
        div.innerHTML = `<p>${txt}</p>`;
        div.style.display = "none";
        div.style.position = "fixed";
        div.style.zIndex = "-5";
        return div;
    }

    /**
     * Will make the screen reader alert the provided text to the user
     * @param {string} txt
     */
    function alertToScreenReader(txt) {
        alertsDiv.innerHTML = "";
        const alertText = document.createTextNode(txt);
        alertsDiv.appendChild(alertText);
        // this is needed for Safari
        alertsDiv.style.display = "none";
        alertsDiv.style.display = "inline";
    }

    const DEFAULT_DROP_ZONE_TYPE$1 = "--any--";
    const DEFAULT_DROP_TARGET_STYLE$1 = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };

    let isDragging = false;
    let draggedItemType;
    let focusedDz;
    let focusedDzLabel = "";
    let focusedItem;
    let focusedItemId;
    let focusedItemLabel = "";
    const allDragTargets = new WeakSet();
    const elToKeyDownListeners = new WeakMap();
    const elToFocusListeners = new WeakMap();
    const dzToHandles = new Map();
    const dzToConfig$1 = new Map();
    const typeToDropZones$1 = new Map();

    /* TODO (potentially)
     * what's the deal with the black border of voice-reader not following focus?
     * maybe keep focus on the last dragged item upon drop?
     */

    const INSTRUCTION_IDs$1 = initAria();

    /* drop-zones registration management */
    function registerDropZone$1(dropZoneEl, type) {
        if (typeToDropZones$1.size === 0) {
            window.addEventListener("keydown", globalKeyDownHandler);
            window.addEventListener("click", globalClickHandler);
        }
        if (!typeToDropZones$1.has(type)) {
            typeToDropZones$1.set(type, new Set());
        }
        if (!typeToDropZones$1.get(type).has(dropZoneEl)) {
            typeToDropZones$1.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone$1(dropZoneEl, type) {
        typeToDropZones$1.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones$1.get(type).size === 0) {
            typeToDropZones$1.delete(type);
        }
        if (typeToDropZones$1.size === 0) {
            window.removeEventListener("keydown", globalKeyDownHandler);
            window.removeEventListener("click", globalClickHandler);
        }
    }

    function globalKeyDownHandler(e) {
        if (!isDragging) return;
        switch (e.key) {
            case "Escape": {
                handleDrop$1();
                break;
            }
        }
    }

    function globalClickHandler() {
        if (!isDragging) return;
        if (!allDragTargets.has(document.activeElement)) {
            handleDrop$1();
        }
    }

    function handleZoneFocus(e) {
        if (!isDragging) return;
        const newlyFocusedDz = e.currentTarget;
        if (newlyFocusedDz === focusedDz) return;

        focusedDzLabel = newlyFocusedDz.getAttribute("aria-label") || "";
        const {items: originItems} = dzToConfig$1.get(focusedDz);
        const originItem = originItems.find(item => item[ITEM_ID_KEY] === focusedItemId);
        const originIdx = originItems.indexOf(originItem);
        const itemToMove = originItems.splice(originIdx, 1)[0];
        const {items: targetItems, autoAriaDisabled} = dzToConfig$1.get(newlyFocusedDz);
        if (
            newlyFocusedDz.getBoundingClientRect().top < focusedDz.getBoundingClientRect().top ||
            newlyFocusedDz.getBoundingClientRect().left < focusedDz.getBoundingClientRect().left
        ) {
            targetItems.push(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the end of the list ${focusedDzLabel}`);
            }
        } else {
            targetItems.unshift(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the beginning of the list ${focusedDzLabel}`);
            }
        }
        const dzFrom = focusedDz;
        dispatchFinalizeEvent(dzFrom, originItems, {trigger: TRIGGERS.DROPPED_INTO_ANOTHER, id: focusedItemId, source: SOURCES.KEYBOARD});
        dispatchFinalizeEvent(newlyFocusedDz, targetItems, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
        focusedDz = newlyFocusedDz;
    }

    function triggerAllDzsUpdate() {
        dzToHandles.forEach(({update}, dz) => update(dzToConfig$1.get(dz)));
    }

    function handleDrop$1(dispatchConsider = true) {
        if (!dzToConfig$1.get(focusedDz).autoAriaDisabled) {
            alertToScreenReader(`Stopped dragging item ${focusedItemLabel}`);
        }
        if (allDragTargets.has(document.activeElement)) {
            document.activeElement.blur();
        }
        if (dispatchConsider) {
            dispatchConsiderEvent(focusedDz, dzToConfig$1.get(focusedDz).items, {
                trigger: TRIGGERS.DRAG_STOPPED,
                id: focusedItemId,
                source: SOURCES.KEYBOARD
            });
        }
        styleInactiveDropZones(typeToDropZones$1.get(draggedItemType), dz => dzToConfig$1.get(dz).dropTargetStyle);
        focusedItem = null;
        focusedItemId = null;
        focusedItemLabel = "";
        draggedItemType = null;
        focusedDz = null;
        focusedDzLabel = "";
        isDragging = false;
        triggerAllDzsUpdate();
    }
    //////
    function dndzone$1(node, options) {
        const config = {
            items: undefined,
            type: undefined,
            dragDisabled: false,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE$1,
            autoAriaDisabled: false
        };

        function swap(arr, i, j) {
            if (arr.length <= 1) return;
            arr.splice(j, 1, arr.splice(i, 1, arr[j])[0]);
        }

        function handleKeyDown(e) {
            switch (e.key) {
                case "Enter":
                case " ": {
                    // we don't want to affect nested input elements
                    if ((e.target.value !== undefined || e.target.isContentEditable) && !allDragTargets.has(e.target)) {
                        return;
                    }
                    e.preventDefault(); // preventing scrolling on spacebar
                    e.stopPropagation();
                    if (isDragging) {
                        // TODO - should this trigger a drop? only here or in general (as in when hitting space or enter outside of any zone)?
                        handleDrop$1();
                    } else {
                        // drag start
                        handleDragStart(e);
                    }
                    break;
                }
                case "ArrowDown":
                case "ArrowRight": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig$1.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx < children.length - 1) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx + 2} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx + 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
                case "ArrowUp":
                case "ArrowLeft": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig$1.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx > 0) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx - 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
            }
        }
        function handleDragStart(e) {
            if (!config.autoAriaDisabled) {
                alertToScreenReader(
                    `Started dragging item ${focusedItemLabel}. Use the arrow keys to move it within its list ${focusedDzLabel}, or tab to another list in order to move the item into it`
                );
            }
            setCurrentFocusedItem(e.currentTarget);
            focusedDz = node;
            draggedItemType = config.type;
            isDragging = true;
            styleActiveDropZones(
                Array.from(typeToDropZones$1.get(config.type)).filter(dz => dz === focusedDz || !dzToConfig$1.get(dz).dropFromOthersDisabled),
                dz => dzToConfig$1.get(dz).dropTargetStyle
            );
            dispatchConsiderEvent(node, dzToConfig$1.get(node).items, {trigger: TRIGGERS.DRAG_STARTED, id: focusedItemId, source: SOURCES.KEYBOARD});
            triggerAllDzsUpdate();
        }

        function handleClick(e) {
            if (!isDragging) return;
            if (e.currentTarget === focusedItem) return;
            e.stopPropagation();
            handleDrop$1(false);
            handleDragStart(e);
        }
        function setCurrentFocusedItem(draggableEl) {
            const {items} = dzToConfig$1.get(node);
            const children = Array.from(node.children);
            const focusedItemIdx = children.indexOf(draggableEl);
            focusedItem = draggableEl;
            focusedItemId = items[focusedItemIdx][ITEM_ID_KEY];
            focusedItemLabel = children[focusedItemIdx].getAttribute("aria-label") || "";
        }

        function configure({
            items = [],
            type: newType = DEFAULT_DROP_ZONE_TYPE$1,
            dragDisabled = false,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE$1,
            autoAriaDisabled = false
        }) {
            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.dropFromOthersDisabled = dropFromOthersDisabled;
            config.dropTargetStyle = dropTargetStyle;
            config.autoAriaDisabled = autoAriaDisabled;
            if (!autoAriaDisabled) {
                node.setAttribute("aria-disabled", dragDisabled);
                node.setAttribute("role", "list");
                node.setAttribute("aria-describedby", dragDisabled ? INSTRUCTION_IDs$1.DND_ZONE_DRAG_DISABLED : INSTRUCTION_IDs$1.DND_ZONE_ACTIVE);
            }
            if (config.type && newType !== config.type) {
                unregisterDropZone$1(node, config.type);
            }
            config.type = newType;
            registerDropZone$1(node, newType);
            dzToConfig$1.set(node, config);

            node.tabIndex =
                isDragging &&
                (node === focusedDz ||
                    focusedItem.contains(node) ||
                    config.dropFromOthersDisabled ||
                    (focusedDz && config.type !== dzToConfig$1.get(focusedDz).type))
                    ? -1
                    : 0;
            node.addEventListener("focus", handleZoneFocus);

            for (let i = 0; i < node.children.length; i++) {
                const draggableEl = node.children[i];
                allDragTargets.add(draggableEl);
                draggableEl.tabIndex = isDragging ? -1 : 0;
                if (!autoAriaDisabled) {
                    draggableEl.setAttribute("role", "listitem");
                }
                draggableEl.removeEventListener("keydown", elToKeyDownListeners.get(draggableEl));
                draggableEl.removeEventListener("click", elToFocusListeners.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("keydown", handleKeyDown);
                    elToKeyDownListeners.set(draggableEl, handleKeyDown);
                    draggableEl.addEventListener("click", handleClick);
                    elToFocusListeners.set(draggableEl, handleClick);
                }
                if (isDragging && config.items[i][ITEM_ID_KEY] === focusedItemId) {
                    // if it is a nested dropzone, it was re-rendered and we need to refresh our pointer
                    focusedItem = draggableEl;
                    // without this the element loses focus if it moves backwards in the list
                    draggableEl.focus();
                }
            }
        }
        configure(options);

        const handles = {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                unregisterDropZone$1(node, config.type);
                dzToConfig$1.delete(node);
                dzToHandles.delete(node);
            }
        };
        dzToHandles.set(node, handles);
        return handles;
    }

    /**
     * A custom action to turn any container to a dnd zone and all of its direct children to draggables
     * Supports mouse, touch and keyboard interactions.
     * Dispatches two events that the container is expected to react to by modifying its list of items,
     * which will then feed back in to this action via the update function
     *
     * @typedef {Object} Options
     * @property {Array} items - the list of items that was used to generate the children of the given node (the list used in the #each block
     * @property {string} [type] - the type of the dnd zone. children dragged from here can only be dropped in other zones of the same type, default to a base type
     * @property {number} [flipDurationMs] - if the list animated using flip (recommended), specifies the flip duration such that everything syncs with it without conflict, defaults to zero
     * @property {boolean} [dragDisabled]
     * @property {boolean} [dropFromOthersDisabled]
     * @property {Object} [dropTargetStyle]
     * @property {Function} [transformDraggedElement]
     * @param {HTMLElement} node - the element to enhance
     * @param {Options} options
     * @return {{update: function, destroy: function}}
     */
    function dndzone$2(node, options) {
        validateOptions(options);
        const pointerZone = dndzone(node, options);
        const keyboardZone = dndzone$1(node, options);
        return {
            update: newOptions => {
                validateOptions(newOptions);
                pointerZone.update(newOptions);
                keyboardZone.update(newOptions);
            },
            destroy: () => {
                pointerZone.destroy();
                keyboardZone.destroy();
            }
        };
    }

    function validateOptions(options) {
        /*eslint-disable*/
        const {
            items,
            flipDurationMs,
            type,
            dragDisabled,
            dropFromOthersDisabled,
            dropTargetStyle,
            transformDraggedElement,
            autoAriaDisabled,
            ...rest
        } = options;
        /*eslint-enable*/
        if (Object.keys(rest).length > 0) {
            console.warn(`dndzone will ignore unknown options`, rest);
        }
        if (!items) {
            throw new Error("no 'items' key provided to dndzone");
        }
        const itemWithMissingId = items.find(item => !{}.hasOwnProperty.call(item, ITEM_ID_KEY));
        if (itemWithMissingId) {
            throw new Error(`missing '${ITEM_ID_KEY}' property for item ${toString(itemWithMissingId)}`);
        }
    }

    /* src/Svg.svelte generated by Svelte v3.29.4 */

    const file = "src/Svg.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let path;
    	let path_d_value;
    	let svg_viewBox_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			attr_dev(path, "stroke", /*stroke*/ ctx[1]);
    			attr_dev(path, "d", path_d_value = /*svgs*/ ctx[4][/*name*/ ctx[2]].d);
    			add_location(path, file, 22, 1, 20958);
    			attr_dev(svg, "width", /*size*/ ctx[3]);
    			attr_dev(svg, "height", /*size*/ ctx[3]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "" + (/*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[0] + " " + /*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[1] + " " + /*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[2] + " " + /*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[3]));
    			add_location(svg, file, 21, 0, 20783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}

    			if (dirty & /*stroke*/ 2) {
    				attr_dev(path, "stroke", /*stroke*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 4 && path_d_value !== (path_d_value = /*svgs*/ ctx[4][/*name*/ ctx[2]].d)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*size*/ 8) {
    				attr_dev(svg, "width", /*size*/ ctx[3]);
    			}

    			if (dirty & /*size*/ 8) {
    				attr_dev(svg, "height", /*size*/ ctx[3]);
    			}

    			if (dirty & /*name*/ 4 && svg_viewBox_value !== (svg_viewBox_value = "" + (/*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[0] + " " + /*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[1] + " " + /*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[2] + " " + /*svgs*/ ctx[4][/*name*/ ctx[2]].viewbox[3]))) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Svg", slots, []);

    	let svgs = {
    		Paragraph: {
    			d: "M448 48v32a16 16 0 0 1-16 16h-48v368a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16V96h-32v368a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16V352h-32a160 160 0 0 1 0-320h240a16 16 0 0 1 16 16z",
    			viewbox: [0, 0, 448, 512]
    		},
    		Image: {
    			d: "M440,72H40c-22.08,0.026-39.974,17.92-40,40v256c0.026,22.08,17.92,39.974,40,40h400c2.245,0.009,4.486-0.187,6.696-0.584C465.945,404.194,480.037,387.517,480,368V112C479.974,89.919,462.08,72.026,440,72z M40,392c-12.435-0.002-22.81-9.501-23.904-21.888L175.6,265.824L337.808,392H40z M464,368c0.013,11.742-8.492,21.761-20.08,23.656c-1.294,0.233-2.606,0.348-3.92,0.344h-76.136l-105.992-82.488l94.784-75.792L464,300.528V368z M464,281.872l-107.88-64.728c-2.868-1.725-6.506-1.482-9.12,0.608l-102.136,81.68l-63.96-49.744c-2.695-2.094-6.421-2.249-9.28-0.384L16,351.056V112c0-13.255,10.745-24,24-24h400c13.255,0,24,10.745,24,24V281.872z M240,120c-26.51,0-48,21.49-48,48c0.026,26.499,21.501,47.974,48,48c26.51,0,48-21.49,48-48C288,141.49,266.51,120,240,120z M240,200c-17.673,0-32-14.327-32-32s14.327-32,32-32c17.673,0,32,14.327,32,32S257.673,200,240,200z",
    			viewbox: [0, 0, 480, 480]
    		},
    		Video: {
    			d: "m344.808594 220.992188-113.113282-61.890626c-6.503906-3.558593-14.191406-3.425781-20.566406.351563-6.378906 3.78125-10.183594 10.460937-10.183594 17.875v122.71875c0 7.378906 3.78125 14.046875 10.117188 17.832031 3.308594 1.976563 6.976562 2.96875 10.652344 2.96875 3.367187 0 6.742187-.832031 9.847656-2.503906l113.117188-60.824219c6.714843-3.613281 10.90625-10.59375 10.9375-18.222656.027343-7.628906-4.113282-14.640625-10.808594-18.304687zm-113.859375 63.617187v-91.71875l84.539062 46.257813zm0 0 m288.234375 -121.527344-.023437-.234375c-.433594-4.121094-4.75-40.777344-22.570313-59.421875-20.597656-21.929688-43.949219-24.59375-55.179687-25.871094-.929688-.105469-1.78125-.203125-2.542969-.304688l-.894531-.09375c-67.6875-4.921874-169.910157-5.5937495-170.933594-5.59765575l-.089844-.00390625-.089844.00390625c-1.023437.00390625-103.246094.67578175-171.542968 5.59765575l-.902344.09375c-.726563.097657-1.527344.1875-2.398438.289063-11.101562 1.28125-34.203125 3.949219-54.859375 26.671875-16.972656 18.445312-21.878906 54.316406-22.382812 58.347656l-.058594.523438c-.152344 1.714844-3.765625 42.539062-3.765625 83.523437v38.3125c0 40.984375 3.613281 81.808594 3.765625 83.527344l.027344.257813c.433593 4.054687 4.746093 40.039062 22.484375 58.691406 19.367187 21.195312 43.855468 24 57.027344 25.507812 2.082031.238282 3.875.441406 5.097656.65625l1.183594.164063c39.082031 3.71875 161.617187 5.550781 166.8125 5.625l.15625.003906.15625-.003906c1.023437-.003907 103.242187-.675781 170.929687-5.597657l.894531-.09375c.855469-.113281 1.816406-.214843 2.871094-.324218 11.039062-1.171875 34.015625-3.605469 54.386719-26.019532 16.972656-18.449218 21.882812-54.320312 22.382812-58.347656l.058594-.523437c.152344-1.71875 3.769531-42.539063 3.769531-83.523438v-38.3125c-.003906-40.984375-3.617187-81.804687-3.769531-83.523437zm-26.238281 121.835937c0 37.933594-3.3125 77-3.625 80.585938-1.273438 9.878906-6.449219 32.574219-14.71875 41.5625-12.75 14.027343-25.847656 15.417969-35.410156 16.429687-1.15625.121094-2.226563.238282-3.195313.359375-65.46875 4.734375-163.832031 5.460938-168.363281 5.488281-5.082032-.074218-125.824219-1.921874-163.714844-5.441406-1.941406-.316406-4.039062-.558594-6.25-.808594-11.214844-1.285156-26.566406-3.042968-38.371094-16.027343l-.277344-.296875c-8.125-8.464844-13.152343-29.6875-14.429687-41.148438-.238281-2.710937-3.636719-42.238281-3.636719-80.703125v-38.3125c0-37.890625 3.304688-76.914062 3.625-80.574219 1.519532-11.636718 6.792969-32.957031 14.71875-41.574218 13.140625-14.453125 26.996094-16.054688 36.160156-17.113282.875-.101562 1.691407-.195312 2.445313-.292968 66.421875-4.757813 165.492187-5.464844 169.046875-5.492188 3.554688.023438 102.589844.734375 168.421875 5.492188.808594.101562 1.691406.203125 2.640625.3125 9.425781 1.074218 23.671875 2.699218 36.746094 16.644531l.121094.128906c8.125 8.464844 13.152343 30.058594 14.429687 41.75.226563 2.558594 3.636719 42.171875 3.636719 80.71875zm0 0",
    			viewbox: [0, 0, 576, 512]
    		},
    		Section: {
    			d: "m9.5 24h-8c-.827 0-1.5-.673-1.5-1.5v-21c0-.827.673-1.5 1.5-1.5h8c.827 0 1.5.673 1.5 1.5v21c0 .827-.673 1.5-1.5 1.5zm-8-23c-.276 0-.5.224-.5.5v21c0 .276.224.5.5.5h8c.276 0 .5-.224.5-.5v-21c0-.276-.224-.5-.5-.5zm22.5 6h-8c-.827 0-1.5-.673-1.5-1.5v-3c0-.827.673-1.5 1.5-1.5h8c.827 0 1.5.673 1.5 1.5v3c0 .827-.673 1.5-1.5 1.5zm-8-5c-.276 0-.5.224-.5.5v3c0 .276.224.5.5.5h8c.276 0 .5-.224.5-.5v-3c0-.276-.224-.5-.5-.5zm22.5 15h-8c-.827 0-1.5-.673-1.5-1.5v-3c0-.827.673-1.5 1.5-1.5h8c.827 0 1.5.673 1.5 1.5v3c0 .827-.673 1.5-1.5 1.5zm-8-5c-.276 0-.5.224-.5.5v3c0 .276.224.5.5.5h8c.276 0 .5-.224.5-.5v-3c0-.276-.224-.5-.5-.5zm22.5 24h-8c-.827 0-1.5-.673-1.5-1.5v-3c0-.827.673-1.5 1.5-1.5h8c.827 0 1.5.673 1.5 1.5v3c0 .827-.673 1.5-1.5 1.5zm-8-5c-.276 0-.5.224-.5.5v3c0 .276.224.5.5.5h8c.276 0 .5-.224.5-.5v-3c0-.276-.224-.5-.5-.5z",
    			viewbox: [0, 0, 24, 24]
    		},
    		Editor: {
    			d: "m370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0 m6.628906 -203.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0",
    			viewbox: [0, -1, 401.52289, 401]
    		},
    		Move: {
    			d: "M418.742,203.942c-0.3-0.2-0.5-0.5-0.8-0.8l-50.6-44.8c-4.1-3.6-10.5-3.2-14.1,0.9c-3.6,4.1-3.2,10.4,0.8,14l30.9,27.4h-164.3v-164.3l27.3,30.8c3.7,4.1,10,4.5,14.1,0.8s4.5-10,0.8-14.1l-44.8-50.5c-3.7-4.1-10-4.5-14.1-0.8c-0.3,0.3-0.6,0.5-0.8,0.8l-44.8,50.5c-3.6,4.1-3.2,10.5,0.9,14.1c4.1,3.6,10.4,3.2,14-0.8l27.3-30.8v164.3h-164.2l30.8-27.3c4.1-3.7,4.5-10,0.8-14.1c-3.7-4.1-10-4.5-14.1-0.8l-50.5,44.8c-4.1,3.7-4.5,10-0.8,14.1c0.3,0.3,0.5,0.6,0.8,0.8l50.5,44.8c4.1,3.6,10.5,3.2,14.1-0.9c3.6-4.1,3.2-10.4-0.8-14l-30.8-27.4h164.3v164.3l-27.3-30.8c-3.7-4.1-10-4.5-14.1-0.8c-4.1,3.7-4.5,10-0.8,14.1l44.8,50.5c3.7,4.1,10,4.5,14.1,0.8c0.3-0.3,0.6-0.5,0.8-0.8l44.8-50.5c3.6-4.1,3.2-10.5-0.9-14.1c-4.1-3.6-10.4-3.2-14,0.8l-27.4,30.8v-164.3h164.3l-30.8,27.3c-4.1,3.7-4.5,10-0.8,14.1c3.7,4.1,10,4.5,14.1,0.8l50.5-44.8C422.042,214.342,422.442,208.042,418.742,203.942z",
    			viewbox: [0, 0, 421.285, 421.285]
    		},
    		Code: {
    			d: "M325.762,70.513l-17.706-4.854c-2.279-0.76-4.524-0.521-6.707,0.715c-2.19,1.237-3.669,3.094-4.429,5.568L190.426,440.53c-0.76,2.475-0.522,4.809,0.715,6.995c1.237,2.19,3.09,3.665,5.568,4.425l17.701,4.856c2.284,0.766,4.521,0.526,6.71-0.712c2.19-1.243,3.666-3.094,4.425-5.564L332.042,81.936c0.759-2.474,0.523-4.808-0.716-6.999C330.088,72.747,328.237,71.272,325.762,70.513z M166.167,142.465c0-2.474-0.953-4.665-2.856-6.567l-14.277-14.276c-1.903-1.903-4.093-2.857-6.567-2.857s-4.665,0.955-6.567,2.857L2.856,254.666C0.95,256.569,0,258.759,0,261.233c0,2.474,0.953,4.664,2.856,6.566l133.043,133.044c1.902,1.906,4.089,2.854,6.567,2.854s4.665-0.951,6.567-2.854l14.277-14.268c1.903-1.902,2.856-4.093,2.856-6.57c0-2.471-0.953-4.661-2.856-6.563L51.107,261.233l112.204-112.201C165.217,147.13,166.167,144.939,166.167,142.465z M519.614,254.663L386.567,121.619c-1.902-1.902-4.093-2.857-6.563-2.857c-2.478,0-4.661,0.955-6.57,2.857l-14.271,14.275c-1.902,1.903-2.851,4.09-2.851,6.567s0.948,4.665,2.851,6.567l112.206,112.204L359.163,373.442c-1.902,1.902-2.851,4.093-2.851,6.563c0,2.478,0.948,4.668,2.851,6.57l14.271,14.268c1.909,1.906,4.093,2.854,6.57,2.854c2.471,0,4.661-0.951,6.563-2.854L519.614,267.8c1.903-1.902,2.854-4.096,2.854-6.57C522.468,258.755,521.517,256.565,519.614,254.663z",
    			viewbox: [0, 0, 522.468, 522.469]
    		},
    		Authorization: {
    			d: "M240.954,329.111c-4.55-4.573-11.904-4.573-16.454-0.023l-43.136,43.171h-30.092c-6.435,0-11.636,5.213-11.636,11.648v23.284h-23.273c-6.435,0-11.636,5.213-11.636,11.648v23.284H81.455c-6.423,0-11.636,5.213-11.636,11.648v30.115l-4.817,4.818H23.273v-41.751l194.397-194.56c4.55-4.538,4.55-11.916,0.012-16.465l-3.409-3.421c-3.107-3.095-4.806-7.215-4.806-11.602v-0.047c0-6.435-5.201-11.625-11.636-11.625c-6.435,0-11.636,5.236-11.636,11.671c0,8.297,2.525,16.209,7.215,22.842L3.409,433.896C1.222,436.084,0,439.039,0,442.135v58.228c0,6.423,5.213,11.636,11.636,11.636h58.182c3.084,0,6.051-1.233,8.227-3.409l11.636-11.648c2.188-2.188,3.409-5.143,3.409-8.227v-23.284h23.273c6.435,0,11.636-5.213,11.636-11.648v-23.284h23.273c6.435,0,11.636-5.213,11.636-11.648v-23.284h23.273c3.095,0,6.051-1.233,8.227-3.409l46.545-46.58C245.504,341.026,245.504,333.66,240.954,329.111z M421.318,136.959l-46.545-46.58c-13.708-13.743-37.655-13.743-51.363,0c-14.161,14.173-14.161,37.236,0,51.398l46.545,46.58c6.854,6.865,15.977,10.647,25.681,10.647c9.705,0,18.828-3.782,25.681-10.647C435.479,174.184,435.479,151.121,421.318,136.959z M404.864,171.88c-4.934,4.934-13.521,4.934-18.455,0l-46.545-46.58c-5.073-5.085-5.073-13.37,0-18.467c2.467-2.467,5.737-3.828,9.228-3.828s6.761,1.361,9.228,3.828l46.545,46.58C409.949,158.498,409.949,166.795,404.864,171.88z M500.364,146.187L365.545,11.263c-15.023-15.011-41.158-15.023-56.18,0L197.818,122.891c-7.505,7.505-11.636,17.489-11.636,28.113c0,10.624,4.131,20.608,11.636,28.113l111.546,111.628l-6.842,6.854c-3.095,3.095-7.215,4.806-11.59,4.806h-0.012c-4.387,0-8.518-1.711-11.625-4.817l-32.524-32.547c-4.55-4.55-11.904-4.55-16.454,0l-64,64.047c-4.55,4.55-4.55,11.916,0,16.465c2.269,2.269,5.248,3.409,8.227,3.409s5.958-1.14,8.227-3.409l55.773-55.808l24.297,24.308c7.505,7.505,17.466,11.636,28.09,11.636c0.012,0,0.023,0,0.035,0c10.589-0.012,20.538-4.154,28.009-11.636l15.069-15.081c4.55-4.55,4.55-11.916,0-16.465L214.272,162.641c-3.119-3.107-4.817-7.238-4.817-11.636c0-4.399,1.699-8.529,4.817-11.648L325.818,27.74c6.225-6.237,17.047-6.225,23.273,0L483.91,162.664c3.119,3.107,4.818,7.238,4.818,11.636s-1.699,8.529-4.818,11.648L372.364,297.564c-3.119,3.119-7.238,4.829-11.636,4.829c-6.435,0-11.636,5.213-11.636,11.648c0,6.435,5.201,11.648,11.636,11.648c10.601,0,20.585-4.131,28.09-11.648l111.546-111.628 C507.869,194.908,512,184.924,512,174.3C512,163.665,507.869,153.681,500.364,146.187z",
    			viewbox: [0, 0, 512, 512]
    		},
    		Connection: {
    			d: "m52 24c.256 0 .512-.098.707-.293l5-5-1.414-1.414-4.293 4.293-1.293-1.293-1.414 1.414 2 2c.195.195.451.293.707.293z M0 0 m54 46c-2.282 0-4.339.966-5.798 2.504l-15.599-11.432c.882-1.489 1.397-3.22 1.397-5.072 0-.859-.12-1.688-.325-2.484l13.224-4.846c1.333 2.568 4.013 4.33 7.101 4.33 4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8c0 .617.077 1.215.21 1.792l-13.225 4.847c-.985-2.022-2.628-3.659-4.653-4.638l1.899-5.205c.57.13 1.16.204 1.769.204 4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8c0 3.097 1.772 5.782 4.352 7.111l-1.9 5.206c-.786-.2-1.605-.317-2.452-.317-1.616 0-3.139.394-4.492 1.078l-4.403-6.925c1.767-1.469 2.895-3.681 2.895-6.153 0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8c1.223 0 2.378-.284 3.416-.777l4.405 6.93c-2.322 1.833-3.821 4.665-3.821 7.847 0 3.023 1.354 5.732 3.481 7.567l-3.753 5.361c-1.114-.59-2.382-.928-3.728-.928-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8c0-2.347-1.022-4.454-2.637-5.919l3.754-5.363c1.446.813 3.11 1.282 4.883 1.282 2.944 0 5.586-1.286 7.418-3.318l15.596 11.43c-.644 1.153-1.014 2.477-1.014 3.888 0 4.411 3.589 8 8 8s8-3.589 8-8-3.589-8-8-8zm0-31c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6zm-28-5c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6zm-22 0c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6zm12 42c0 3.309-2.691 6-6 6s-6-2.691-6-6 2.691-6 6-6 6 2.691 6 6zm8-12c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm30 20c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z M0 0 m8 52.586-1.293-1.293-1.414 1.414 2 2c.195.195.451.293.707.293s.512-.098.707-.293l5-5-1.414-1.414z",
    			viewbox: [0, 0, 64, 64]
    		},
    		Equation: {
    			d: "M426.024,86.447H209.705l-84.911,298.911c-2.568,7.967-9.854,13.482-18.22,13.771c-0.236,0-0.464,0.006-0.688,0.006c-8.092,0-15.41-4.924-18.436-12.478l-34.714-86.782H19.851C8.884,299.876,0,290.986,0,280.022c0-10.965,8.893-19.854,19.851-19.854H66.18c8.109,0,15.421,4.941,18.436,12.483l19.237,48.09l72.472-260.218c2.639-8.213,10.279-13.781,18.903-13.781h230.798c10.97,0,19.854,8.89,19.854,19.851S436.988,86.447,426.024,86.447zM436.723,353.227l-78.259-87.904l74.576-82.783c1.318-1.454,1.638-3.547,0.857-5.341c-0.804-1.791-2.577-2.946-4.54-2.946h-47.18c-1.442,0-2.802,0.629-3.759,1.72l-50.059,58.047l-49.674-58.029c-0.939-1.103-2.317-1.738-3.771-1.738h-49.334c-1.956,0-3.729,1.149-4.521,2.929c-0.81,1.785-0.479,3.875,0.824,5.332l73.743,82.81l-77.641,87.923c-1.297,1.465-1.605,3.552-0.813,5.325c0.813,1.785,2.586,2.92,4.528,2.92h48.9c1.472,0,2.867-0.65,3.807-1.785l51.819-62.181l53.05,62.229c0.951,1.11,2.328,1.743,3.782,1.743h49.97c1.962,0,3.735-1.141,4.527-2.926C438.354,356.779,438.035,354.692,436.723,353.227z",
    			viewbox: [0, 0, 445.878, 445.878]
    		},
    		Trash: {
    			d: "M491.362,593.727H102.374c-20.865,0-37.84-16.975-37.84-37.84v-448.5h464.668v448.5C529.202,576.752,512.228,593.727,491.362,593.727z M79.677,122.529v433.357c0,12.516,10.182,22.697,22.697,22.697h388.989c12.516,0,22.697-10.182,22.697-22.697V122.529H79.677zM550.8,91.913H42.927V58.382c0-20.86,16.973-37.831,37.835-37.831h192.852C276.618,8.58,286.12,0,297.506,0c11.399,0,20.907,8.578,23.905,20.551H512.97c20.859,0,37.83,16.971,37.83,37.831V91.913L550.8,91.913z M58.07,76.77h477.587V58.382c0-12.51-10.178-22.688-22.688-22.688h-205.57l-0.148-7.42c-0.145-7.24-4.516-13.131-9.745-13.131c-5.219,0-9.586,5.893-9.736,13.136l-0.154,7.415H80.762c-12.512,0-22.692,10.177-22.692,22.688V76.77zM144.621,546.275c-15.949,0-28.924-12.977-28.924-28.926V196.011c0-15.95,12.975-28.926,28.924-28.926c15.95,0,28.926,12.976,28.926,28.926V517.35C173.547,533.299,160.571,546.275,144.621,546.275z M144.621,182.228c-7.599,0-13.781,6.183-13.781,13.783V517.35c0,7.6,6.183,13.783,13.781,13.783c7.601,0,13.783-6.184,13.783-13.783V196.011C158.404,188.411,152.222,182.228,144.621,182.228zM243.094,546.275c-15.95,0-28.925-12.977-28.925-28.926V196.011c0-15.95,12.976-28.926,28.925-28.926c15.949,0,28.925,12.976,28.925,28.926V517.35C272.019,533.299,259.043,546.275,243.094,546.275z M243.094,182.228c-7.6,0-13.782,6.183-13.782,13.783V517.35c0,7.6,6.183,13.783,13.782,13.783s13.782-6.184,13.782-13.783V196.011C256.876,188.411,250.694,182.228,243.094,182.228zM341.565,546.275c-15.949,0-28.926-12.977-28.926-28.926V196.011c0-15.95,12.977-28.926,28.926-28.926s28.926,12.976,28.926,28.926V517.35C370.491,533.299,357.515,546.275,341.565,546.275z M341.565,182.228c-7.6,0-13.783,6.183-13.783,13.783V517.35c0,7.6,6.184,13.783,13.783,13.783s13.783-6.184,13.783-13.783V196.011C355.347,188.411,349.165,182.228,341.565,182.228zM440.038,546.275c-15.955,0-28.934-12.977-28.934-28.926V196.011c0-15.95,12.979-28.926,28.934-28.926c15.949,0,28.924,12.976,28.924,28.926V517.35C468.962,533.299,455.987,546.275,440.038,546.275z M440.038,182.228c-7.605,0-13.791,6.183-13.791,13.783V517.35c0,7.6,6.186,13.783,13.791,13.783c7.6,0,13.781-6.184,13.781-13.783V196.011C453.819,188.411,447.638,182.228,440.038,182.228z",
    			viewbox: [0, 0, 593.727, 593.727]
    		},
    		Cut: {
    			d: "M362.601,320.387c-12.648,0-25.079,2.644-36.487,7.708l-32.028-65.17c3.332-6.697,5.079-14.073,5.079-21.639c0-5.148-0.837-10.27-2.429-15.143c2.464-2.075,4.93-4.235,7.377-6.481c14.119-12.958,26.64-27.893,37.217-44.388c10.887-16.979,19.642-34.991,26.022-53.538c6.592-19.165,10.563-38.719,11.802-58.117c0.642-10.049,0.567-19.721-0.221-28.746c-0.685-7.831-1.648-16.21-4.059-24.471l-0.061-0.233c-0.339-1.315-1.044-4.052-3.352-6.455c-2.592-2.698-6.181-4.032-9.852-3.65c-3.747,0.386-7.211,2.573-9.265,5.851c-1.562,2.49-2.865,4.992-4.126,7.412c-0.391,0.749-0.78,1.496-1.173,2.233c-2.011,3.773-4.03,7.541-6.049,11.31c-4.265,7.96-8.471,16.08-12.577,24.009c-9.026,17.425-17.713,34.714-25.758,50.802c-8.545,17.092-16.807,34.152-25.948,53.082c-6.284,13.016-12.388,25.923-18.227,38.515c-2.631-0.437-5.301-0.667-7.998-0.667c-2.707,0-5.387,0.232-8.03,0.673c-0.479-1.031-0.956-2.064-1.436-3.095c-8.294-17.817-16.782-35.479-24.718-51.911c-8.752-18.124-18.007-36.628-26.172-52.954c-8.69-17.377-17.318-34.196-25.646-49.992c-3.641-6.905-7.885-14.93-12.183-22.777l-2.52-4.579l-0.125-0.244c-0.792-1.563-3.201-6.318-9.037-7.49c-1.977-0.397-11.983-1.708-14.946,11.7c-0.035,0.158-0.066,0.307-0.099,0.439c-4.005,16.14-5.117,34.891-3.306,55.731c1.717,19.759,6.131,39.388,13.121,58.341c7.036,19.081,16.08,36.904,26.882,52.975c10.966,16.315,23.669,30.858,37.756,43.223c1.378,1.21,2.778,2.399,4.186,3.572c-1.576,4.85-2.404,9.946-2.404,15.066c0,7.566,1.747,14.942,5.08,21.639l-32.196,65.511c-11.611-5.289-24.318-8.049-37.298-8.049c-49.516,0-89.8,40.284-89.8,89.8c0,49.517,40.284,89.801,89.8,89.801c0.391,0,0.778-0.008,1.188-0.021c10.986-0.257,20.838-6.505,25.756-16.329c0.032-0.062,0.063-0.123,0.094-0.185l86.052-175.097l86.051,175.096c5.014,10.202,15.192,16.54,26.564,16.54c0.614,0,1.251-0.023,1.942-0.071c23.365-0.632,45.275-10.236,61.724-27.062c16.528-16.907,25.63-39.164,25.63-62.672C452.401,360.672,412.117,320.387,362.601,320.387z M277.15,200.556c5.633-12.132,11.527-24.574,17.575-37.097c9.108-18.863,17.338-35.858,25.826-52.835c8.011-16.021,16.66-33.233,25.667-50.625c4.036-7.791,8.208-15.848,12.407-23.685c0.102-0.19,0.204-0.381,0.306-0.571c0.026,0.291,0.052,0.582,0.078,0.871c0.701,8.025,0.764,16.683,0.186,25.73c-1.125,17.616-4.744,35.409-10.755,52.886c-5.862,17.041-13.918,33.61-23.946,49.248c-9.648,15.046-21.055,28.655-33.904,40.448c-1.352,1.24-2.708,2.454-4.064,3.637l-0.001,0.017c-2.776-3.06-5.924-5.758-9.381-8.022L277.15,200.556z M178.873,168.269c-9.914-14.751-18.23-31.149-24.716-48.738c-6.374-17.283-10.397-35.166-11.96-53.152c-0.958-11.024-1.021-21.316-0.194-30.781c1.674,3.148,3.286,6.201,4.793,9.06c8.261,15.67,16.823,32.361,25.45,49.61c8.136,16.269,17.357,34.707,26.05,52.706c7.904,16.366,16.354,33.95,24.596,51.654c0.302,0.65,0.604,1.3,0.907,1.949h0.009c-3.472,2.277-6.632,4.992-9.415,8.072l-0.001-0.016c-0.39-0.337-0.779-0.676-1.166-1.016C200.434,196.391,188.876,183.152,178.873,168.269z M238.037,288.35l-91.493,186.166c-0.021,0.042-0.042,0.084-0.063,0.126c-1.59,3.213-4.803,5.256-8.386,5.33c-0.044,0.001-0.089,0.002-0.133,0.004c-0.195,0.007-0.378,0.012-0.563,0.012c-38.488,0-69.8-31.313-69.8-69.801c0-38.487,31.313-69.8,69.8-69.8c12.986,0,25.603,3.538,36.485,10.232c2.399,1.475,5.307,1.87,8.015,1.09c2.706-0.782,4.957-2.669,6.199-5.196l32.74-66.618l-0.024-0.044c5.126,3.951,10.988,6.848,17.268,8.499H238.037zM226.547,257.065c-3.098-4.687-4.735-10.143-4.735-15.778c0-4.754,1.127-9.279,3.351-13.453c3.295-6.187,8.713-10.946,15.254-13.401c3.224-1.209,6.612-1.822,10.071-1.822c3.457-0.002,6.84,0.609,10.056,1.815c6.542,2.451,11.961,7.205,15.26,13.386c2.23,4.179,3.36,8.712,3.36,13.475c0,5.635-1.637,11.092-4.735,15.778c-5.337,8.076-14.287,12.897-23.941,12.897C240.834,269.962,231.884,265.141,226.547,257.065z M364.313,479.933c-0.173,0.004-0.347,0.013-0.52,0.026c-3.929,0.3-7.577-1.815-9.303-5.329l-91.548-186.28h-0.045c6.28-1.651,12.141-4.548,17.268-8.499l-0.024,0.044l32.524,66.18c1.233,2.511,3.462,4.39,6.145,5.181c2.684,0.794,5.574,0.423,7.973-1.015c10.75-6.446,23.136-9.854,35.818-9.854c38.488,0,69.8,31.313,69.8,69.8C432.401,447.73,401.857,479.018,364.313,479.933zM362.601,359.553c-10.626,0-20.784,3.246-29.373,9.387c-3.981,2.846-5.317,8.154-3.159,12.546l35.374,71.977c1.717,3.495,5.246,5.591,8.974,5.591c0.97,0,1.955-0.142,2.924-0.438c21.135-6.461,35.896-26.376,35.896-48.429C413.235,382.267,390.52,359.553,362.601,359.553z M379.114,435.938l-26.839-54.611c3.275-1.17,6.755-1.773,10.326-1.773c16.892,0,30.635,13.742,30.635,30.634C393.235,420.679,387.705,430.373,379.114,435.938zM167.679,369.586c-8.76-6.563-19.23-10.032-30.28-10.032c-27.92,0-50.635,22.714-50.635,50.634c0,22.6,15.201,42.65,36.965,48.759c0.898,0.252,1.807,0.373,2.704,0.373c3.734,0,7.259-2.102,8.973-5.59l35.252-71.729C172.778,377.683,171.527,372.469,167.679,369.586z M121.619,436.437c-9.024-5.453-14.855-15.362-14.855-26.25c0-16.892,13.743-30.634,30.635-30.634c3.888,0,7.653,0.705,11.159,2.07L121.619,436.437z",
    			viewbox: [0, 0, 499.995, 499.995]
    		}
    	};

    	let { fill = "salmon" } = $$props;
    	let { stroke = "" } = $$props;
    	let { name = "paragraph" } = $$props;
    	let { size = 18 } = $$props;
    	const writable_props = ["fill", "stroke", "name", "size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("stroke" in $$props) $$invalidate(1, stroke = $$props.stroke);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ svgs, fill, stroke, name, size });

    	$$self.$inject_state = $$props => {
    		if ("svgs" in $$props) $$invalidate(4, svgs = $$props.svgs);
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("stroke" in $$props) $$invalidate(1, stroke = $$props.stroke);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, stroke, name, size, svgs];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { fill: 0, stroke: 1, name: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get fill() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stroke() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stroke(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Paragraph.svelte generated by Svelte v3.29.4 */

    const { console: console_1 } = globals;
    const file$1 = "src/Paragraph.svelte";

    // (41:0) {:else}
    function create_else_block(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "contenteditable", "false");
    			if (/*nodes*/ ctx[0][/*id*/ ctx[2]].content.text === void 0) add_render_callback(() => /*span_input_handler_1*/ ctx[10].call(span));
    			add_location(span, file$1, 41, 2, 943);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (/*nodes*/ ctx[0][/*id*/ ctx[2]].content.text !== void 0) {
    				span.innerHTML = /*nodes*/ ctx[0][/*id*/ ctx[2]].content.text;
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "keyup", /*keyup_handler_1*/ ctx[9], false, false, false),
    					listen_dev(span, "input", /*span_input_handler_1*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nodes, id*/ 5 && /*nodes*/ ctx[0][/*id*/ ctx[2]].content.text !== span.innerHTML) {
    				span.innerHTML = /*nodes*/ ctx[0][/*id*/ ctx[2]].content.text;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(41:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:0) {#if opt.edit}
    function create_if_block(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "contenteditable", "true");
    			if (/*nodes*/ ctx[0][/*id*/ ctx[2]].content.text === void 0) add_render_callback(() => /*span_input_handler*/ ctx[8].call(span));
    			add_location(span, file$1, 39, 2, 832);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (/*nodes*/ ctx[0][/*id*/ ctx[2]].content.text !== void 0) {
    				span.innerHTML = /*nodes*/ ctx[0][/*id*/ ctx[2]].content.text;
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "keyup", /*keyup_handler*/ ctx[7], false, false, false),
    					listen_dev(span, "input", /*span_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nodes, id*/ 5 && /*nodes*/ ctx[0][/*id*/ ctx[2]].content.text !== span.innerHTML) {
    				span.innerHTML = /*nodes*/ ctx[0][/*id*/ ctx[2]].content.text;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:0) {#if opt.edit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*opt*/ ctx[1].edit) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Paragraph", slots, []);
    	let { opt } = $$props;
    	let { width } = $$props;
    	let { nodes } = $$props;
    	let { id } = $$props;
    	let { depth } = $$props;
    	let { view } = $$props;

    	async function post(id) {
    		try {
    			const options = {
    				method: "put",
    				headers: {
    					"Content-Type": "application/json",
    					"Accept": "application/json",
    					"authorization": "Basic " + btoa(opt.user + ":" + opt.pwd)
    				},
    				body: JSON.stringify(nodes[id])
    			};

    			const response = await fetch(opt.url + id, options);
    			const data = await response.json();
    			$$invalidate(0, nodes[id]._rev = data.rev, nodes);
    			console.log(options);
    			console.log(data);
    		} catch(err) {
    			console.log(err);
    		}
    	}

    	let timer;

    	function debounce() {
    		console.log("start debounce");
    		clearTimeout(timer);

    		timer = setTimeout(
    			() => {
    				post(id);
    			},
    			1500
    		);
    	}

    	const writable_props = ["opt", "width", "nodes", "id", "depth", "view"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Paragraph> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = () => debounce();

    	function span_input_handler() {
    		nodes[id].content.text = this.innerHTML;
    		$$invalidate(0, nodes);
    		$$invalidate(2, id);
    	}

    	const keyup_handler_1 = () => debounce();

    	function span_input_handler_1() {
    		nodes[id].content.text = this.innerHTML;
    		$$invalidate(0, nodes);
    		$$invalidate(2, id);
    	}

    	$$self.$$set = $$props => {
    		if ("opt" in $$props) $$invalidate(1, opt = $$props.opt);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("depth" in $$props) $$invalidate(5, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(6, view = $$props.view);
    	};

    	$$self.$capture_state = () => ({
    		opt,
    		width,
    		nodes,
    		id,
    		depth,
    		view,
    		post,
    		timer,
    		debounce
    	});

    	$$self.$inject_state = $$props => {
    		if ("opt" in $$props) $$invalidate(1, opt = $$props.opt);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("depth" in $$props) $$invalidate(5, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(6, view = $$props.view);
    		if ("timer" in $$props) timer = $$props.timer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodes,
    		opt,
    		id,
    		debounce,
    		width,
    		depth,
    		view,
    		keyup_handler,
    		span_input_handler,
    		keyup_handler_1,
    		span_input_handler_1
    	];
    }

    class Paragraph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			opt: 1,
    			width: 4,
    			nodes: 0,
    			id: 2,
    			depth: 5,
    			view: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Paragraph",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*opt*/ ctx[1] === undefined && !("opt" in props)) {
    			console_1.warn("<Paragraph> was created without expected prop 'opt'");
    		}

    		if (/*width*/ ctx[4] === undefined && !("width" in props)) {
    			console_1.warn("<Paragraph> was created without expected prop 'width'");
    		}

    		if (/*nodes*/ ctx[0] === undefined && !("nodes" in props)) {
    			console_1.warn("<Paragraph> was created without expected prop 'nodes'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console_1.warn("<Paragraph> was created without expected prop 'id'");
    		}

    		if (/*depth*/ ctx[5] === undefined && !("depth" in props)) {
    			console_1.warn("<Paragraph> was created without expected prop 'depth'");
    		}

    		if (/*view*/ ctx[6] === undefined && !("view" in props)) {
    			console_1.warn("<Paragraph> was created without expected prop 'view'");
    		}
    	}

    	get opt() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opt(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodes() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodes(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depth() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depth(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get view() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set view(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Image.svelte generated by Svelte v3.29.4 */

    const file$2 = "src/Image.svelte";

    // (11:0) {#if view!="header"}
    function create_if_block$1(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let span;
    	let i;
    	let t1_value = /*nodes*/ ctx[1][/*id*/ ctx[2]].content.caption + "";
    	let t1;
    	let span_contenteditable_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			i = element("i");
    			t1 = text(t1_value);
    			if (img.src !== (img_src_value = /*nodes*/ ctx[1][/*id*/ ctx[2]].content.src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1uzweta");
    			add_location(img, file$2, 12, 0, 147);
    			add_location(i, file$2, 13, 58, 247);
    			attr_dev(span, "contenteditable", span_contenteditable_value = /*opt*/ ctx[0].edit);
    			set_style(span, "color", "salmon");
    			add_location(span, file$2, 13, 4, 193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			append_dev(i, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nodes, id*/ 6 && img.src !== (img_src_value = /*nodes*/ ctx[1][/*id*/ ctx[2]].content.src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*nodes, id*/ 6 && t1_value !== (t1_value = /*nodes*/ ctx[1][/*id*/ ctx[2]].content.caption + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*opt*/ 1 && span_contenteditable_value !== (span_contenteditable_value = /*opt*/ ctx[0].edit)) {
    				attr_dev(span, "contenteditable", span_contenteditable_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:0) {#if view!=\\\"header\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*view*/ ctx[3] != "header" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*view*/ ctx[3] != "header") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Image", slots, []);
    	let { opt } = $$props;
    	let { nodes } = $$props;
    	let { width } = $$props;
    	let { depth } = $$props;
    	let { id } = $$props;
    	let { view } = $$props;
    	const writable_props = ["opt", "nodes", "width", "depth", "id", "view"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("opt" in $$props) $$invalidate(0, opt = $$props.opt);
    		if ("nodes" in $$props) $$invalidate(1, nodes = $$props.nodes);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(5, depth = $$props.depth);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("view" in $$props) $$invalidate(3, view = $$props.view);
    	};

    	$$self.$capture_state = () => ({ opt, nodes, width, depth, id, view });

    	$$self.$inject_state = $$props => {
    		if ("opt" in $$props) $$invalidate(0, opt = $$props.opt);
    		if ("nodes" in $$props) $$invalidate(1, nodes = $$props.nodes);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(5, depth = $$props.depth);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("view" in $$props) $$invalidate(3, view = $$props.view);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 16) ;
    	};

    	return [opt, nodes, id, view, width, depth];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			opt: 0,
    			nodes: 1,
    			width: 4,
    			depth: 5,
    			id: 2,
    			view: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*opt*/ ctx[0] === undefined && !("opt" in props)) {
    			console.warn("<Image> was created without expected prop 'opt'");
    		}

    		if (/*nodes*/ ctx[1] === undefined && !("nodes" in props)) {
    			console.warn("<Image> was created without expected prop 'nodes'");
    		}

    		if (/*width*/ ctx[4] === undefined && !("width" in props)) {
    			console.warn("<Image> was created without expected prop 'width'");
    		}

    		if (/*depth*/ ctx[5] === undefined && !("depth" in props)) {
    			console.warn("<Image> was created without expected prop 'depth'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<Image> was created without expected prop 'id'");
    		}

    		if (/*view*/ ctx[3] === undefined && !("view" in props)) {
    			console.warn("<Image> was created without expected prop 'view'");
    		}
    	}

    	get opt() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opt(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodes() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodes(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depth() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depth(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get view() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set view(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Video.svelte generated by Svelte v3.29.4 */

    const file$3 = "src/Video.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "video svelte-8d79jf");
    			attr_dev(iframe, "title", "title");
    			if (iframe.src !== (iframe_src_value = /*nodes*/ ctx[0][/*id*/ ctx[1]].content.src)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$3, 12, 0, 168);
    			attr_dev(div, "class", "container svelte-8d79jf");
    			add_location(div, file$3, 11, 0, 144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, iframe);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nodes, id*/ 3 && iframe.src !== (iframe_src_value = /*nodes*/ ctx[0][/*id*/ ctx[1]].content.src)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Video", slots, []);
    	let { nodes } = $$props;
    	let { id } = $$props;
    	let { opt } = $$props;
    	let { width } = $$props;
    	let { depth } = $$props;
    	let { view } = $$props;
    	const writable_props = ["nodes", "id", "opt", "width", "depth", "view"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("opt" in $$props) $$invalidate(2, opt = $$props.opt);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(4, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(5, view = $$props.view);
    	};

    	$$self.$capture_state = () => ({ nodes, id, opt, width, depth, view });

    	$$self.$inject_state = $$props => {
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("opt" in $$props) $$invalidate(2, opt = $$props.opt);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(4, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(5, view = $$props.view);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*opt*/ 4) ;

    		if ($$self.$$.dirty & /*width*/ 8) ;
    	};

    	return [nodes, id, opt, width, depth, view];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			nodes: 0,
    			id: 1,
    			opt: 2,
    			width: 3,
    			depth: 4,
    			view: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodes*/ ctx[0] === undefined && !("nodes" in props)) {
    			console.warn("<Video> was created without expected prop 'nodes'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<Video> was created without expected prop 'id'");
    		}

    		if (/*opt*/ ctx[2] === undefined && !("opt" in props)) {
    			console.warn("<Video> was created without expected prop 'opt'");
    		}

    		if (/*width*/ ctx[3] === undefined && !("width" in props)) {
    			console.warn("<Video> was created without expected prop 'width'");
    		}

    		if (/*depth*/ ctx[4] === undefined && !("depth" in props)) {
    			console.warn("<Video> was created without expected prop 'depth'");
    		}

    		if (/*view*/ ctx[5] === undefined && !("view" in props)) {
    			console.warn("<Video> was created without expected prop 'view'");
    		}
    	}

    	get nodes() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodes(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opt() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opt(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depth() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depth(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get view() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set view(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    if (window.Prism)
        console.warn('Prism has already been initiated. Please ensure that svelte-prism is imported first.');

    window.Prism = window.Prism || {};
    window.Prism.manual = true;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var prism = createCommonjsModule(function (module) {
    /* **********************************************
         Begin prism-core.js
    ********************************************** */

    /// <reference lib="WebWorker"/>

    var _self = (typeof window !== 'undefined')
    	? window   // if in browser
    	: (
    		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
    		? self // if in worker
    		: {}   // if in node js
    	);

    /**
     * Prism: Lightweight, robust, elegant syntax highlighting
     *
     * @license MIT <https://opensource.org/licenses/MIT>
     * @author Lea Verou <https://lea.verou.me>
     * @namespace
     * @public
     */
    var Prism = (function (_self){

    // Private helper vars
    var lang = /\blang(?:uage)?-([\w-]+)\b/i;
    var uniqueId = 0;


    var _ = {
    	/**
    	 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
    	 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
    	 * additional languages or plugins yourself.
    	 *
    	 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
    	 *
    	 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
    	 * empty Prism object into the global scope before loading the Prism script like this:
    	 *
    	 * ```js
    	 * window.Prism = window.Prism || {};
    	 * Prism.manual = true;
    	 * // add a new <script> to load Prism's script
    	 * ```
    	 *
    	 * @default false
    	 * @type {boolean}
    	 * @memberof Prism
    	 * @public
    	 */
    	manual: _self.Prism && _self.Prism.manual,
    	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

    	/**
    	 * A namespace for utility methods.
    	 *
    	 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
    	 * change or disappear at any time.
    	 *
    	 * @namespace
    	 * @memberof Prism
    	 */
    	util: {
    		encode: function encode(tokens) {
    			if (tokens instanceof Token) {
    				return new Token(tokens.type, encode(tokens.content), tokens.alias);
    			} else if (Array.isArray(tokens)) {
    				return tokens.map(encode);
    			} else {
    				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
    			}
    		},

    		/**
    		 * Returns the name of the type of the given value.
    		 *
    		 * @param {any} o
    		 * @returns {string}
    		 * @example
    		 * type(null)      === 'Null'
    		 * type(undefined) === 'Undefined'
    		 * type(123)       === 'Number'
    		 * type('foo')     === 'String'
    		 * type(true)      === 'Boolean'
    		 * type([1, 2])    === 'Array'
    		 * type({})        === 'Object'
    		 * type(String)    === 'Function'
    		 * type(/abc+/)    === 'RegExp'
    		 */
    		type: function (o) {
    			return Object.prototype.toString.call(o).slice(8, -1);
    		},

    		/**
    		 * Returns a unique number for the given object. Later calls will still return the same number.
    		 *
    		 * @param {Object} obj
    		 * @returns {number}
    		 */
    		objId: function (obj) {
    			if (!obj['__id']) {
    				Object.defineProperty(obj, '__id', { value: ++uniqueId });
    			}
    			return obj['__id'];
    		},

    		/**
    		 * Creates a deep clone of the given object.
    		 *
    		 * The main intended use of this function is to clone language definitions.
    		 *
    		 * @param {T} o
    		 * @param {Record<number, any>} [visited]
    		 * @returns {T}
    		 * @template T
    		 */
    		clone: function deepClone(o, visited) {
    			visited = visited || {};

    			var clone, id;
    			switch (_.util.type(o)) {
    				case 'Object':
    					id = _.util.objId(o);
    					if (visited[id]) {
    						return visited[id];
    					}
    					clone = /** @type {Record<string, any>} */ ({});
    					visited[id] = clone;

    					for (var key in o) {
    						if (o.hasOwnProperty(key)) {
    							clone[key] = deepClone(o[key], visited);
    						}
    					}

    					return /** @type {any} */ (clone);

    				case 'Array':
    					id = _.util.objId(o);
    					if (visited[id]) {
    						return visited[id];
    					}
    					clone = [];
    					visited[id] = clone;

    					(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
    						clone[i] = deepClone(v, visited);
    					});

    					return /** @type {any} */ (clone);

    				default:
    					return o;
    			}
    		},

    		/**
    		 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
    		 *
    		 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
    		 *
    		 * @param {Element} element
    		 * @returns {string}
    		 */
    		getLanguage: function (element) {
    			while (element && !lang.test(element.className)) {
    				element = element.parentElement;
    			}
    			if (element) {
    				return (element.className.match(lang) || [, 'none'])[1].toLowerCase();
    			}
    			return 'none';
    		},

    		/**
    		 * Returns the script element that is currently executing.
    		 *
    		 * This does __not__ work for line script element.
    		 *
    		 * @returns {HTMLScriptElement | null}
    		 */
    		currentScript: function () {
    			if (typeof document === 'undefined') {
    				return null;
    			}
    			if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
    				return /** @type {any} */ (document.currentScript);
    			}

    			// IE11 workaround
    			// we'll get the src of the current script by parsing IE11's error stack trace
    			// this will not work for inline scripts

    			try {
    				throw new Error();
    			} catch (err) {
    				// Get file src url from stack. Specifically works with the format of stack traces in IE.
    				// A stack will look like this:
    				//
    				// Error
    				//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
    				//    at Global code (http://localhost/components/prism-core.js:606:1)

    				var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
    				if (src) {
    					var scripts = document.getElementsByTagName('script');
    					for (var i in scripts) {
    						if (scripts[i].src == src) {
    							return scripts[i];
    						}
    					}
    				}
    				return null;
    			}
    		},

    		/**
    		 * Returns whether a given class is active for `element`.
    		 *
    		 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
    		 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
    		 * given class is just the given class with a `no-` prefix.
    		 *
    		 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
    		 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
    		 * ancestors have the given class or the negated version of it, then the default activation will be returned.
    		 *
    		 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
    		 * version of it, the class is considered active.
    		 *
    		 * @param {Element} element
    		 * @param {string} className
    		 * @param {boolean} [defaultActivation=false]
    		 * @returns {boolean}
    		 */
    		isActive: function (element, className, defaultActivation) {
    			var no = 'no-' + className;

    			while (element) {
    				var classList = element.classList;
    				if (classList.contains(className)) {
    					return true;
    				}
    				if (classList.contains(no)) {
    					return false;
    				}
    				element = element.parentElement;
    			}
    			return !!defaultActivation;
    		}
    	},

    	/**
    	 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
    	 *
    	 * @namespace
    	 * @memberof Prism
    	 * @public
    	 */
    	languages: {
    		/**
    		 * Creates a deep copy of the language with the given id and appends the given tokens.
    		 *
    		 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
    		 * will be overwritten at its original position.
    		 *
    		 * ## Best practices
    		 *
    		 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
    		 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
    		 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
    		 *
    		 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
    		 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
    		 *
    		 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
    		 * @param {Grammar} redef The new tokens to append.
    		 * @returns {Grammar} The new language created.
    		 * @public
    		 * @example
    		 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
    		 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
    		 *     // at its original position
    		 *     'comment': { ... },
    		 *     // CSS doesn't have a 'color' token, so this token will be appended
    		 *     'color': /\b(?:red|green|blue)\b/
    		 * });
    		 */
    		extend: function (id, redef) {
    			var lang = _.util.clone(_.languages[id]);

    			for (var key in redef) {
    				lang[key] = redef[key];
    			}

    			return lang;
    		},

    		/**
    		 * Inserts tokens _before_ another token in a language definition or any other grammar.
    		 *
    		 * ## Usage
    		 *
    		 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
    		 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
    		 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
    		 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
    		 * this:
    		 *
    		 * ```js
    		 * Prism.languages.markup.style = {
    		 *     // token
    		 * };
    		 * ```
    		 *
    		 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
    		 * before existing tokens. For the CSS example above, you would use it like this:
    		 *
    		 * ```js
    		 * Prism.languages.insertBefore('markup', 'cdata', {
    		 *     'style': {
    		 *         // token
    		 *     }
    		 * });
    		 * ```
    		 *
    		 * ## Special cases
    		 *
    		 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
    		 * will be ignored.
    		 *
    		 * This behavior can be used to insert tokens after `before`:
    		 *
    		 * ```js
    		 * Prism.languages.insertBefore('markup', 'comment', {
    		 *     'comment': Prism.languages.markup.comment,
    		 *     // tokens after 'comment'
    		 * });
    		 * ```
    		 *
    		 * ## Limitations
    		 *
    		 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
    		 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
    		 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
    		 * deleting properties which is necessary to insert at arbitrary positions.
    		 *
    		 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
    		 * Instead, it will create a new object and replace all references to the target object with the new one. This
    		 * can be done without temporarily deleting properties, so the iteration order is well-defined.
    		 *
    		 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
    		 * you hold the target object in a variable, then the value of the variable will not change.
    		 *
    		 * ```js
    		 * var oldMarkup = Prism.languages.markup;
    		 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
    		 *
    		 * assert(oldMarkup !== Prism.languages.markup);
    		 * assert(newMarkup === Prism.languages.markup);
    		 * ```
    		 *
    		 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
    		 * object to be modified.
    		 * @param {string} before The key to insert before.
    		 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
    		 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
    		 * object to be modified.
    		 *
    		 * Defaults to `Prism.languages`.
    		 * @returns {Grammar} The new grammar object.
    		 * @public
    		 */
    		insertBefore: function (inside, before, insert, root) {
    			root = root || /** @type {any} */ (_.languages);
    			var grammar = root[inside];
    			/** @type {Grammar} */
    			var ret = {};

    			for (var token in grammar) {
    				if (grammar.hasOwnProperty(token)) {

    					if (token == before) {
    						for (var newToken in insert) {
    							if (insert.hasOwnProperty(newToken)) {
    								ret[newToken] = insert[newToken];
    							}
    						}
    					}

    					// Do not insert token which also occur in insert. See #1525
    					if (!insert.hasOwnProperty(token)) {
    						ret[token] = grammar[token];
    					}
    				}
    			}

    			var old = root[inside];
    			root[inside] = ret;

    			// Update references in other language definitions
    			_.languages.DFS(_.languages, function(key, value) {
    				if (value === old && key != inside) {
    					this[key] = ret;
    				}
    			});

    			return ret;
    		},

    		// Traverse a language definition with Depth First Search
    		DFS: function DFS(o, callback, type, visited) {
    			visited = visited || {};

    			var objId = _.util.objId;

    			for (var i in o) {
    				if (o.hasOwnProperty(i)) {
    					callback.call(o, i, o[i], type || i);

    					var property = o[i],
    					    propertyType = _.util.type(property);

    					if (propertyType === 'Object' && !visited[objId(property)]) {
    						visited[objId(property)] = true;
    						DFS(property, callback, null, visited);
    					}
    					else if (propertyType === 'Array' && !visited[objId(property)]) {
    						visited[objId(property)] = true;
    						DFS(property, callback, i, visited);
    					}
    				}
    			}
    		}
    	},

    	plugins: {},

    	/**
    	 * This is the most high-level function in Prism’s API.
    	 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
    	 * each one of them.
    	 *
    	 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
    	 *
    	 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
    	 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
    	 * @memberof Prism
    	 * @public
    	 */
    	highlightAll: function(async, callback) {
    		_.highlightAllUnder(document, async, callback);
    	},

    	/**
    	 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
    	 * {@link Prism.highlightElement} on each one of them.
    	 *
    	 * The following hooks will be run:
    	 * 1. `before-highlightall`
    	 * 2. `before-all-elements-highlight`
    	 * 3. All hooks of {@link Prism.highlightElement} for each element.
    	 *
    	 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
    	 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
    	 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
    	 * @memberof Prism
    	 * @public
    	 */
    	highlightAllUnder: function(container, async, callback) {
    		var env = {
    			callback: callback,
    			container: container,
    			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
    		};

    		_.hooks.run('before-highlightall', env);

    		env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

    		_.hooks.run('before-all-elements-highlight', env);

    		for (var i = 0, element; element = env.elements[i++];) {
    			_.highlightElement(element, async === true, env.callback);
    		}
    	},

    	/**
    	 * Highlights the code inside a single element.
    	 *
    	 * The following hooks will be run:
    	 * 1. `before-sanity-check`
    	 * 2. `before-highlight`
    	 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
    	 * 4. `before-insert`
    	 * 5. `after-highlight`
    	 * 6. `complete`
    	 *
    	 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
    	 * the element's language.
    	 *
    	 * @param {Element} element The element containing the code.
    	 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
    	 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
    	 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
    	 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
    	 *
    	 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
    	 * asynchronous highlighting to work. You can build your own bundle on the
    	 * [Download page](https://prismjs.com/download.html).
    	 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
    	 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
    	 * @memberof Prism
    	 * @public
    	 */
    	highlightElement: function(element, async, callback) {
    		// Find language
    		var language = _.util.getLanguage(element);
    		var grammar = _.languages[language];

    		// Set language on the element, if not present
    		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

    		// Set language on the parent, for styling
    		var parent = element.parentElement;
    		if (parent && parent.nodeName.toLowerCase() === 'pre') {
    			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
    		}

    		var code = element.textContent;

    		var env = {
    			element: element,
    			language: language,
    			grammar: grammar,
    			code: code
    		};

    		function insertHighlightedCode(highlightedCode) {
    			env.highlightedCode = highlightedCode;

    			_.hooks.run('before-insert', env);

    			env.element.innerHTML = env.highlightedCode;

    			_.hooks.run('after-highlight', env);
    			_.hooks.run('complete', env);
    			callback && callback.call(env.element);
    		}

    		_.hooks.run('before-sanity-check', env);

    		if (!env.code) {
    			_.hooks.run('complete', env);
    			callback && callback.call(env.element);
    			return;
    		}

    		_.hooks.run('before-highlight', env);

    		if (!env.grammar) {
    			insertHighlightedCode(_.util.encode(env.code));
    			return;
    		}

    		if (async && _self.Worker) {
    			var worker = new Worker(_.filename);

    			worker.onmessage = function(evt) {
    				insertHighlightedCode(evt.data);
    			};

    			worker.postMessage(JSON.stringify({
    				language: env.language,
    				code: env.code,
    				immediateClose: true
    			}));
    		}
    		else {
    			insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
    		}
    	},

    	/**
    	 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
    	 * and the language definitions to use, and returns a string with the HTML produced.
    	 *
    	 * The following hooks will be run:
    	 * 1. `before-tokenize`
    	 * 2. `after-tokenize`
    	 * 3. `wrap`: On each {@link Token}.
    	 *
    	 * @param {string} text A string with the code to be highlighted.
    	 * @param {Grammar} grammar An object containing the tokens to use.
    	 *
    	 * Usually a language definition like `Prism.languages.markup`.
    	 * @param {string} language The name of the language definition passed to `grammar`.
    	 * @returns {string} The highlighted HTML.
    	 * @memberof Prism
    	 * @public
    	 * @example
    	 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
    	 */
    	highlight: function (text, grammar, language) {
    		var env = {
    			code: text,
    			grammar: grammar,
    			language: language
    		};
    		_.hooks.run('before-tokenize', env);
    		env.tokens = _.tokenize(env.code, env.grammar);
    		_.hooks.run('after-tokenize', env);
    		return Token.stringify(_.util.encode(env.tokens), env.language);
    	},

    	/**
    	 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
    	 * and the language definitions to use, and returns an array with the tokenized code.
    	 *
    	 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
    	 *
    	 * This method could be useful in other contexts as well, as a very crude parser.
    	 *
    	 * @param {string} text A string with the code to be highlighted.
    	 * @param {Grammar} grammar An object containing the tokens to use.
    	 *
    	 * Usually a language definition like `Prism.languages.markup`.
    	 * @returns {TokenStream} An array of strings and tokens, a token stream.
    	 * @memberof Prism
    	 * @public
    	 * @example
    	 * let code = `var foo = 0;`;
    	 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
    	 * tokens.forEach(token => {
    	 *     if (token instanceof Prism.Token && token.type === 'number') {
    	 *         console.log(`Found numeric literal: ${token.content}`);
    	 *     }
    	 * });
    	 */
    	tokenize: function(text, grammar) {
    		var rest = grammar.rest;
    		if (rest) {
    			for (var token in rest) {
    				grammar[token] = rest[token];
    			}

    			delete grammar.rest;
    		}

    		var tokenList = new LinkedList();
    		addAfter(tokenList, tokenList.head, text);

    		matchGrammar(text, tokenList, grammar, tokenList.head, 0);

    		return toArray(tokenList);
    	},

    	/**
    	 * @namespace
    	 * @memberof Prism
    	 * @public
    	 */
    	hooks: {
    		all: {},

    		/**
    		 * Adds the given callback to the list of callbacks for the given hook.
    		 *
    		 * The callback will be invoked when the hook it is registered for is run.
    		 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
    		 *
    		 * One callback function can be registered to multiple hooks and the same hook multiple times.
    		 *
    		 * @param {string} name The name of the hook.
    		 * @param {HookCallback} callback The callback function which is given environment variables.
    		 * @public
    		 */
    		add: function (name, callback) {
    			var hooks = _.hooks.all;

    			hooks[name] = hooks[name] || [];

    			hooks[name].push(callback);
    		},

    		/**
    		 * Runs a hook invoking all registered callbacks with the given environment variables.
    		 *
    		 * Callbacks will be invoked synchronously and in the order in which they were registered.
    		 *
    		 * @param {string} name The name of the hook.
    		 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
    		 * @public
    		 */
    		run: function (name, env) {
    			var callbacks = _.hooks.all[name];

    			if (!callbacks || !callbacks.length) {
    				return;
    			}

    			for (var i=0, callback; callback = callbacks[i++];) {
    				callback(env);
    			}
    		}
    	},

    	Token: Token
    };
    _self.Prism = _;


    // Typescript note:
    // The following can be used to import the Token type in JSDoc:
    //
    //   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

    /**
     * Creates a new token.
     *
     * @param {string} type See {@link Token#type type}
     * @param {string | TokenStream} content See {@link Token#content content}
     * @param {string|string[]} [alias] The alias(es) of the token.
     * @param {string} [matchedStr=""] A copy of the full string this token was created from.
     * @class
     * @global
     * @public
     */
    function Token(type, content, alias, matchedStr) {
    	/**
    	 * The type of the token.
    	 *
    	 * This is usually the key of a pattern in a {@link Grammar}.
    	 *
    	 * @type {string}
    	 * @see GrammarToken
    	 * @public
    	 */
    	this.type = type;
    	/**
    	 * The strings or tokens contained by this token.
    	 *
    	 * This will be a token stream if the pattern matched also defined an `inside` grammar.
    	 *
    	 * @type {string | TokenStream}
    	 * @public
    	 */
    	this.content = content;
    	/**
    	 * The alias(es) of the token.
    	 *
    	 * @type {string|string[]}
    	 * @see GrammarToken
    	 * @public
    	 */
    	this.alias = alias;
    	// Copy of the full string this token was created from
    	this.length = (matchedStr || '').length | 0;
    }

    /**
     * A token stream is an array of strings and {@link Token Token} objects.
     *
     * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
     * them.
     *
     * 1. No adjacent strings.
     * 2. No empty strings.
     *
     *    The only exception here is the token stream that only contains the empty string and nothing else.
     *
     * @typedef {Array<string | Token>} TokenStream
     * @global
     * @public
     */

    /**
     * Converts the given token or token stream to an HTML representation.
     *
     * The following hooks will be run:
     * 1. `wrap`: On each {@link Token}.
     *
     * @param {string | Token | TokenStream} o The token or token stream to be converted.
     * @param {string} language The name of current language.
     * @returns {string} The HTML representation of the token or token stream.
     * @memberof Token
     * @static
     */
    Token.stringify = function stringify(o, language) {
    	if (typeof o == 'string') {
    		return o;
    	}
    	if (Array.isArray(o)) {
    		var s = '';
    		o.forEach(function (e) {
    			s += stringify(e, language);
    		});
    		return s;
    	}

    	var env = {
    		type: o.type,
    		content: stringify(o.content, language),
    		tag: 'span',
    		classes: ['token', o.type],
    		attributes: {},
    		language: language
    	};

    	var aliases = o.alias;
    	if (aliases) {
    		if (Array.isArray(aliases)) {
    			Array.prototype.push.apply(env.classes, aliases);
    		} else {
    			env.classes.push(aliases);
    		}
    	}

    	_.hooks.run('wrap', env);

    	var attributes = '';
    	for (var name in env.attributes) {
    		attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
    	}

    	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
    };

    /**
     * @param {string} text
     * @param {LinkedList<string | Token>} tokenList
     * @param {any} grammar
     * @param {LinkedListNode<string | Token>} startNode
     * @param {number} startPos
     * @param {RematchOptions} [rematch]
     * @returns {void}
     * @private
     *
     * @typedef RematchOptions
     * @property {string} cause
     * @property {number} reach
     */
    function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
    	for (var token in grammar) {
    		if (!grammar.hasOwnProperty(token) || !grammar[token]) {
    			continue;
    		}

    		var patterns = grammar[token];
    		patterns = Array.isArray(patterns) ? patterns : [patterns];

    		for (var j = 0; j < patterns.length; ++j) {
    			if (rematch && rematch.cause == token + ',' + j) {
    				return;
    			}

    			var patternObj = patterns[j],
    				inside = patternObj.inside,
    				lookbehind = !!patternObj.lookbehind,
    				greedy = !!patternObj.greedy,
    				lookbehindLength = 0,
    				alias = patternObj.alias;

    			if (greedy && !patternObj.pattern.global) {
    				// Without the global flag, lastIndex won't work
    				var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
    				patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
    			}

    			/** @type {RegExp} */
    			var pattern = patternObj.pattern || patternObj;

    			for ( // iterate the token list and keep track of the current token/string position
    				var currentNode = startNode.next, pos = startPos;
    				currentNode !== tokenList.tail;
    				pos += currentNode.value.length, currentNode = currentNode.next
    			) {

    				if (rematch && pos >= rematch.reach) {
    					break;
    				}

    				var str = currentNode.value;

    				if (tokenList.length > text.length) {
    					// Something went terribly wrong, ABORT, ABORT!
    					return;
    				}

    				if (str instanceof Token) {
    					continue;
    				}

    				var removeCount = 1; // this is the to parameter of removeBetween

    				if (greedy && currentNode != tokenList.tail.prev) {
    					pattern.lastIndex = pos;
    					var match = pattern.exec(text);
    					if (!match) {
    						break;
    					}

    					var from = match.index + (lookbehind && match[1] ? match[1].length : 0);
    					var to = match.index + match[0].length;
    					var p = pos;

    					// find the node that contains the match
    					p += currentNode.value.length;
    					while (from >= p) {
    						currentNode = currentNode.next;
    						p += currentNode.value.length;
    					}
    					// adjust pos (and p)
    					p -= currentNode.value.length;
    					pos = p;

    					// the current node is a Token, then the match starts inside another Token, which is invalid
    					if (currentNode.value instanceof Token) {
    						continue;
    					}

    					// find the last node which is affected by this match
    					for (
    						var k = currentNode;
    						k !== tokenList.tail && (p < to || typeof k.value === 'string');
    						k = k.next
    					) {
    						removeCount++;
    						p += k.value.length;
    					}
    					removeCount--;

    					// replace with the new match
    					str = text.slice(pos, p);
    					match.index -= pos;
    				} else {
    					pattern.lastIndex = 0;

    					var match = pattern.exec(str);
    				}

    				if (!match) {
    					continue;
    				}

    				if (lookbehind) {
    					lookbehindLength = match[1] ? match[1].length : 0;
    				}

    				var from = match.index + lookbehindLength,
    					matchStr = match[0].slice(lookbehindLength),
    					to = from + matchStr.length,
    					before = str.slice(0, from),
    					after = str.slice(to);

    				var reach = pos + str.length;
    				if (rematch && reach > rematch.reach) {
    					rematch.reach = reach;
    				}

    				var removeFrom = currentNode.prev;

    				if (before) {
    					removeFrom = addAfter(tokenList, removeFrom, before);
    					pos += before.length;
    				}

    				removeRange(tokenList, removeFrom, removeCount);

    				var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
    				currentNode = addAfter(tokenList, removeFrom, wrapped);

    				if (after) {
    					addAfter(tokenList, currentNode, after);
    				}

    				if (removeCount > 1) {
    					// at least one Token object was removed, so we have to do some rematching
    					// this can only happen if the current pattern is greedy
    					matchGrammar(text, tokenList, grammar, currentNode.prev, pos, {
    						cause: token + ',' + j,
    						reach: reach
    					});
    				}
    			}
    		}
    	}
    }

    /**
     * @typedef LinkedListNode
     * @property {T} value
     * @property {LinkedListNode<T> | null} prev The previous node.
     * @property {LinkedListNode<T> | null} next The next node.
     * @template T
     * @private
     */

    /**
     * @template T
     * @private
     */
    function LinkedList() {
    	/** @type {LinkedListNode<T>} */
    	var head = { value: null, prev: null, next: null };
    	/** @type {LinkedListNode<T>} */
    	var tail = { value: null, prev: head, next: null };
    	head.next = tail;

    	/** @type {LinkedListNode<T>} */
    	this.head = head;
    	/** @type {LinkedListNode<T>} */
    	this.tail = tail;
    	this.length = 0;
    }

    /**
     * Adds a new node with the given value to the list.
     * @param {LinkedList<T>} list
     * @param {LinkedListNode<T>} node
     * @param {T} value
     * @returns {LinkedListNode<T>} The added node.
     * @template T
     */
    function addAfter(list, node, value) {
    	// assumes that node != list.tail && values.length >= 0
    	var next = node.next;

    	var newNode = { value: value, prev: node, next: next };
    	node.next = newNode;
    	next.prev = newNode;
    	list.length++;

    	return newNode;
    }
    /**
     * Removes `count` nodes after the given node. The given node will not be removed.
     * @param {LinkedList<T>} list
     * @param {LinkedListNode<T>} node
     * @param {number} count
     * @template T
     */
    function removeRange(list, node, count) {
    	var next = node.next;
    	for (var i = 0; i < count && next !== list.tail; i++) {
    		next = next.next;
    	}
    	node.next = next;
    	next.prev = node;
    	list.length -= i;
    }
    /**
     * @param {LinkedList<T>} list
     * @returns {T[]}
     * @template T
     */
    function toArray(list) {
    	var array = [];
    	var node = list.head.next;
    	while (node !== list.tail) {
    		array.push(node.value);
    		node = node.next;
    	}
    	return array;
    }


    if (!_self.document) {
    	if (!_self.addEventListener) {
    		// in Node.js
    		return _;
    	}

    	if (!_.disableWorkerMessageHandler) {
    		// In worker
    		_self.addEventListener('message', function (evt) {
    			var message = JSON.parse(evt.data),
    				lang = message.language,
    				code = message.code,
    				immediateClose = message.immediateClose;

    			_self.postMessage(_.highlight(code, _.languages[lang], lang));
    			if (immediateClose) {
    				_self.close();
    			}
    		}, false);
    	}

    	return _;
    }

    // Get current script and highlight
    var script = _.util.currentScript();

    if (script) {
    	_.filename = script.src;

    	if (script.hasAttribute('data-manual')) {
    		_.manual = true;
    	}
    }

    function highlightAutomaticallyCallback() {
    	if (!_.manual) {
    		_.highlightAll();
    	}
    }

    if (!_.manual) {
    	// If the document state is "loading", then we'll use DOMContentLoaded.
    	// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
    	// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
    	// might take longer one animation frame to execute which can create a race condition where only some plugins have
    	// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
    	// See https://github.com/PrismJS/prism/issues/2102
    	var readyState = document.readyState;
    	if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
    		document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
    	} else {
    		if (window.requestAnimationFrame) {
    			window.requestAnimationFrame(highlightAutomaticallyCallback);
    		} else {
    			window.setTimeout(highlightAutomaticallyCallback, 16);
    		}
    	}
    }

    return _;

    })(_self);

    if ( module.exports) {
    	module.exports = Prism;
    }

    // hack for components to work correctly in node.js
    if (typeof commonjsGlobal !== 'undefined') {
    	commonjsGlobal.Prism = Prism;
    }

    // some additional documentation/types

    /**
     * The expansion of a simple `RegExp` literal to support additional properties.
     *
     * @typedef GrammarToken
     * @property {RegExp} pattern The regular expression of the token.
     * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
     * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
     * @property {boolean} [greedy=false] Whether the token is greedy.
     * @property {string|string[]} [alias] An optional alias or list of aliases.
     * @property {Grammar} [inside] The nested grammar of this token.
     *
     * The `inside` grammar will be used to tokenize the text value of each token of this kind.
     *
     * This can be used to make nested and even recursive language definitions.
     *
     * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
     * each another.
     * @global
     * @public
    */

    /**
     * @typedef Grammar
     * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
     * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
     * @global
     * @public
     */

    /**
     * A function which will invoked after an element was successfully highlighted.
     *
     * @callback HighlightCallback
     * @param {Element} element The element successfully highlighted.
     * @returns {void}
     * @global
     * @public
    */

    /**
     * @callback HookCallback
     * @param {Object<string, any>} env The environment variables of the hook.
     * @returns {void}
     * @global
     * @public
     */


    /* **********************************************
         Begin prism-markup.js
    ********************************************** */

    Prism.languages.markup = {
    	'comment': /<!--[\s\S]*?-->/,
    	'prolog': /<\?[\s\S]+?\?>/,
    	'doctype': {
    		// https://www.w3.org/TR/xml/#NT-doctypedecl
    		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    		greedy: true,
    		inside: {
    			'internal-subset': {
    				pattern: /(\[)[\s\S]+(?=\]>$)/,
    				lookbehind: true,
    				greedy: true,
    				inside: null // see below
    			},
    			'string': {
    				pattern: /"[^"]*"|'[^']*'/,
    				greedy: true
    			},
    			'punctuation': /^<!|>$|[[\]]/,
    			'doctype-tag': /^DOCTYPE/,
    			'name': /[^\s<>'"]+/
    		}
    	},
    	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
    	'tag': {
    		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
    		greedy: true,
    		inside: {
    			'tag': {
    				pattern: /^<\/?[^\s>\/]+/,
    				inside: {
    					'punctuation': /^<\/?/,
    					'namespace': /^[^\s>\/:]+:/
    				}
    			},
    			'attr-value': {
    				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
    				inside: {
    					'punctuation': [
    						{
    							pattern: /^=/,
    							alias: 'attr-equals'
    						},
    						/"|'/
    					]
    				}
    			},
    			'punctuation': /\/?>/,
    			'attr-name': {
    				pattern: /[^\s>\/]+/,
    				inside: {
    					'namespace': /^[^\s>\/:]+:/
    				}
    			}

    		}
    	},
    	'entity': [
    		{
    			pattern: /&[\da-z]{1,8};/i,
    			alias: 'named-entity'
    		},
    		/&#x?[\da-f]{1,8};/i
    	]
    };

    Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
    	Prism.languages.markup['entity'];
    Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

    // Plugin to make entity title show the real entity, idea by Roman Komarov
    Prism.hooks.add('wrap', function (env) {

    	if (env.type === 'entity') {
    		env.attributes['title'] = env.content.replace(/&amp;/, '&');
    	}
    });

    Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
    	/**
    	 * Adds an inlined language to markup.
    	 *
    	 * An example of an inlined language is CSS with `<style>` tags.
    	 *
    	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
    	 * case insensitive.
    	 * @param {string} lang The language key.
    	 * @example
    	 * addInlined('style', 'css');
    	 */
    	value: function addInlined(tagName, lang) {
    		var includedCdataInside = {};
    		includedCdataInside['language-' + lang] = {
    			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
    			lookbehind: true,
    			inside: Prism.languages[lang]
    		};
    		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

    		var inside = {
    			'included-cdata': {
    				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    				inside: includedCdataInside
    			}
    		};
    		inside['language-' + lang] = {
    			pattern: /[\s\S]+/,
    			inside: Prism.languages[lang]
    		};

    		var def = {};
    		def[tagName] = {
    			pattern: RegExp(/(<__[\s\S]*?>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
    			lookbehind: true,
    			greedy: true,
    			inside: inside
    		};

    		Prism.languages.insertBefore('markup', 'cdata', def);
    	}
    });

    Prism.languages.html = Prism.languages.markup;
    Prism.languages.mathml = Prism.languages.markup;
    Prism.languages.svg = Prism.languages.markup;

    Prism.languages.xml = Prism.languages.extend('markup', {});
    Prism.languages.ssml = Prism.languages.xml;
    Prism.languages.atom = Prism.languages.xml;
    Prism.languages.rss = Prism.languages.xml;


    /* **********************************************
         Begin prism-css.js
    ********************************************** */

    (function (Prism) {

    	var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

    	Prism.languages.css = {
    		'comment': /\/\*[\s\S]*?\*\//,
    		'atrule': {
    			pattern: /@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,
    			inside: {
    				'rule': /^@[\w-]+/,
    				'selector-function-argument': {
    					pattern: /(\bselector\s*\((?!\s*\))\s*)(?:[^()]|\((?:[^()]|\([^()]*\))*\))+?(?=\s*\))/,
    					lookbehind: true,
    					alias: 'selector'
    				},
    				'keyword': {
    					pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
    					lookbehind: true
    				}
    				// See rest below
    			}
    		},
    		'url': {
    			// https://drafts.csswg.org/css-values-3/#urls
    			pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
    			greedy: true,
    			inside: {
    				'function': /^url/i,
    				'punctuation': /^\(|\)$/,
    				'string': {
    					pattern: RegExp('^' + string.source + '$'),
    					alias: 'url'
    				}
    			}
    		},
    		'selector': RegExp('[^{}\\s](?:[^{};"\']|' + string.source + ')*?(?=\\s*\\{)'),
    		'string': {
    			pattern: string,
    			greedy: true
    		},
    		'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
    		'important': /!important\b/i,
    		'function': /[-a-z0-9]+(?=\()/i,
    		'punctuation': /[(){};:,]/
    	};

    	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

    	var markup = Prism.languages.markup;
    	if (markup) {
    		markup.tag.addInlined('style', 'css');

    		Prism.languages.insertBefore('inside', 'attr-value', {
    			'style-attr': {
    				pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
    				inside: {
    					'attr-name': {
    						pattern: /^\s*style/i,
    						inside: markup.tag.inside
    					},
    					'punctuation': /^\s*=\s*['"]|['"]\s*$/,
    					'attr-value': {
    						pattern: /.+/i,
    						inside: Prism.languages.css
    					}
    				},
    				alias: 'language-css'
    			}
    		}, markup.tag);
    	}

    }(Prism));


    /* **********************************************
         Begin prism-clike.js
    ********************************************** */

    Prism.languages.clike = {
    	'comment': [
    		{
    			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
    			lookbehind: true
    		},
    		{
    			pattern: /(^|[^\\:])\/\/.*/,
    			lookbehind: true,
    			greedy: true
    		}
    	],
    	'string': {
    		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    		greedy: true
    	},
    	'class-name': {
    		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
    		lookbehind: true,
    		inside: {
    			'punctuation': /[.\\]/
    		}
    	},
    	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
    	'boolean': /\b(?:true|false)\b/,
    	'function': /\w+(?=\()/,
    	'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
    	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    	'punctuation': /[{}[\];(),.:]/
    };


    /* **********************************************
         Begin prism-javascript.js
    ********************************************** */

    Prism.languages.javascript = Prism.languages.extend('clike', {
    	'class-name': [
    		Prism.languages.clike['class-name'],
    		{
    			pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
    			lookbehind: true
    		}
    	],
    	'keyword': [
    		{
    			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
    			lookbehind: true
    		},
    		{
    			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
    			lookbehind: true
    		},
    	],
    	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
    	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
    	'function': /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
    });

    Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

    Prism.languages.insertBefore('javascript', 'keyword', {
    	'regex': {
    		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
    		lookbehind: true,
    		greedy: true,
    		inside: {
    			'regex-source': {
    				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
    				lookbehind: true,
    				alias: 'language-regex',
    				inside: Prism.languages.regex
    			},
    			'regex-flags': /[a-z]+$/,
    			'regex-delimiter': /^\/|\/$/
    		}
    	},
    	// This must be declared before keyword because we use "function" inside the look-forward
    	'function-variable': {
    		pattern: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
    		alias: 'function'
    	},
    	'parameter': [
    		{
    			pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		},
    		{
    			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
    			lookbehind: true,
    			inside: Prism.languages.javascript
    		}
    	],
    	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
    });

    Prism.languages.insertBefore('javascript', 'string', {
    	'template-string': {
    		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
    		greedy: true,
    		inside: {
    			'template-punctuation': {
    				pattern: /^`|`$/,
    				alias: 'string'
    			},
    			'interpolation': {
    				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
    				lookbehind: true,
    				inside: {
    					'interpolation-punctuation': {
    						pattern: /^\${|}$/,
    						alias: 'punctuation'
    					},
    					rest: Prism.languages.javascript
    				}
    			},
    			'string': /[\s\S]+/
    		}
    	}
    });

    if (Prism.languages.markup) {
    	Prism.languages.markup.tag.addInlined('script', 'javascript');
    }

    Prism.languages.js = Prism.languages.javascript;


    /* **********************************************
         Begin prism-file-highlight.js
    ********************************************** */

    (function () {
    	if (typeof self === 'undefined' || !self.Prism || !self.document) {
    		return;
    	}

    	var Prism = window.Prism;

    	var LOADING_MESSAGE = 'Loading…';
    	var FAILURE_MESSAGE = function (status, message) {
    		return '✖ Error ' + status + ' while fetching file: ' + message;
    	};
    	var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

    	var EXTENSIONS = {
    		'js': 'javascript',
    		'py': 'python',
    		'rb': 'ruby',
    		'ps1': 'powershell',
    		'psm1': 'powershell',
    		'sh': 'bash',
    		'bat': 'batch',
    		'h': 'c',
    		'tex': 'latex'
    	};

    	var STATUS_ATTR = 'data-src-status';
    	var STATUS_LOADING = 'loading';
    	var STATUS_LOADED = 'loaded';
    	var STATUS_FAILED = 'failed';

    	var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
    		+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

    	var lang = /\blang(?:uage)?-([\w-]+)\b/i;

    	/**
    	 * Sets the Prism `language-xxxx` or `lang-xxxx` class to the given language.
    	 *
    	 * @param {HTMLElement} element
    	 * @param {string} language
    	 * @returns {void}
    	 */
    	function setLanguageClass(element, language) {
    		var className = element.className;
    		className = className.replace(lang, ' ') + ' language-' + language;
    		element.className = className.replace(/\s+/g, ' ').trim();
    	}


    	Prism.hooks.add('before-highlightall', function (env) {
    		env.selector += ', ' + SELECTOR;
    	});

    	Prism.hooks.add('before-sanity-check', function (env) {
    		var pre = /** @type {HTMLPreElement} */ (env.element);
    		if (pre.matches(SELECTOR)) {
    			env.code = ''; // fast-path the whole thing and go to complete

    			pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

    			// add code element with loading message
    			var code = pre.appendChild(document.createElement('CODE'));
    			code.textContent = LOADING_MESSAGE;

    			var src = pre.getAttribute('data-src');

    			var language = env.language;
    			if (language === 'none') {
    				// the language might be 'none' because there is no language set;
    				// in this case, we want to use the extension as the language
    				var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
    				language = EXTENSIONS[extension] || extension;
    			}

    			// set language classes
    			setLanguageClass(code, language);
    			setLanguageClass(pre, language);

    			// preload the language
    			var autoloader = Prism.plugins.autoloader;
    			if (autoloader) {
    				autoloader.loadLanguages(language);
    			}

    			// load file
    			var xhr = new XMLHttpRequest();
    			xhr.open('GET', src, true);
    			xhr.onreadystatechange = function () {
    				if (xhr.readyState == 4) {
    					if (xhr.status < 400 && xhr.responseText) {
    						// mark as loaded
    						pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

    						// highlight code
    						code.textContent = xhr.responseText;
    						Prism.highlightElement(code);

    					} else {
    						// mark as failed
    						pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

    						if (xhr.status >= 400) {
    							code.textContent = FAILURE_MESSAGE(xhr.status, xhr.statusText);
    						} else {
    							code.textContent = FAILURE_EMPTY_MESSAGE;
    						}
    					}
    				}
    			};
    			xhr.send(null);
    		}
    	});

    	Prism.plugins.fileHighlight = {
    		/**
    		 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
    		 *
    		 * Note: Elements which are already loaded or currently loading will not be touched by this method.
    		 *
    		 * @param {ParentNode} [container=document]
    		 */
    		highlight: function highlight(container) {
    			var elements = (container || document).querySelectorAll(SELECTOR);

    			for (var i = 0, element; element = elements[i++];) {
    				Prism.highlightElement(element);
    			}
    		}
    	};

    	var logged = false;
    	/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
    	Prism.fileHighlight = function () {
    		if (!logged) {
    			console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
    			logged = true;
    		}
    		Prism.plugins.fileHighlight.highlight.apply(this, arguments);
    	};

    })();
    });

    const blocks = '(if|else if|await|then|catch|each|html|debug)';

    Prism.languages.svelte = Prism.languages.extend('markup', {
    	each: {
    		pattern: new RegExp(
    			'{[#/]each' +
    				'(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}'
    		),
    		inside: {
    			'language-javascript': [
    				{
    					pattern: /(as[\s\S]*)\([\s\S]*\)(?=\s*\})/,
    					lookbehind: true,
    					inside: Prism.languages['javascript'],
    				},
    				{
    					pattern: /(as[\s]*)[\s\S]*(?=\s*)/,
    					lookbehind: true,
    					inside: Prism.languages['javascript'],
    				},
    				{
    					pattern: /(#each[\s]*)[\s\S]*(?=as)/,
    					lookbehind: true,
    					inside: Prism.languages['javascript'],
    				},
    			],
    			keyword: /[#/]each|as/,
    			punctuation: /{|}/,
    		},
    	},
    	block: {
    		pattern: new RegExp(
    			'{[#:/@]/s' +
    				blocks +
    				'(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}'
    		),
    		inside: {
    			punctuation: /^{|}$/,
    			keyword: [new RegExp('[#:/@]' + blocks + '( )*'), /as/, /then/],
    			'language-javascript': {
    				pattern: /[\s\S]*/,
    				inside: Prism.languages['javascript'],
    			},
    		},
    	},
    	tag: {
    		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?:"[^"]*"|'[^']*'|{[\s\S]+?}(?=[\s/>])))|(?=[\s/>])))+)?\s*\/?>/i,
    		greedy: true,
    		inside: {
    			tag: {
    				pattern: /^<\/?[^\s>\/]+/i,
    				inside: {
    					punctuation: /^<\/?/,
    					namespace: /^[^\s>\/:]+:/,
    				},
    			},
    			'language-javascript': {
    				pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
    				inside: Prism.languages['javascript'],
    			},
    			'attr-value': {
    				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
    				inside: {
    					punctuation: [
    						/^=/,
    						{
    							pattern: /^(\s*)["']|["']$/,
    							lookbehind: true,
    						},
    					],
    					'language-javascript': {
    						pattern: /{[\s\S]+}/,
    						inside: Prism.languages['javascript'],
    					},
    				},
    			},
    			punctuation: /\/?>/,
    			'attr-name': {
    				pattern: /[^\s>\/]+/,
    				inside: {
    					namespace: /^[^\s>\/:]+:/,
    				},
    			},
    		},
    	},
    	'language-javascript': {
    		pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
    		lookbehind: true,
    		inside: Prism.languages['javascript'],
    	},
    });

    Prism.languages.svelte['tag'].inside['attr-value'].inside['entity'] =
    	Prism.languages.svelte['entity'];

    Prism.hooks.add('wrap', env => {
    	if (env.type === 'entity') {
    		env.attributes['title'] = env.content.replace(/&amp;/, '&');
    	}
    });

    Object.defineProperty(Prism.languages.svelte.tag, 'addInlined', {
    	value: function addInlined(tagName, lang) {
    		const includedCdataInside = {};
    		includedCdataInside['language-' + lang] = {
    			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
    			lookbehind: true,
    			inside: Prism.languages[lang],
    		};
    		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

    		const inside = {
    			'included-cdata': {
    				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    				inside: includedCdataInside,
    			},
    		};
    		inside['language-' + lang] = {
    			pattern: /[\s\S]+/,
    			inside: Prism.languages[lang],
    		};

    		const def = {};
    		def[tagName] = {
    			pattern: RegExp(
    				/(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(
    					/__/g,
    					tagName
    				),
    				'i'
    			),
    			lookbehind: true,
    			greedy: true,
    			inside,
    		};

    		Prism.languages.insertBefore('svelte', 'cdata', def);
    	},
    });

    Prism.languages.svelte.tag.addInlined('style', 'css');
    Prism.languages.svelte.tag.addInlined('script', 'javascript');

    /* node_modules/svelte-prism/src/Prism.svelte generated by Svelte v3.29.4 */
    const file$4 = "node_modules/svelte-prism/src/Prism.svelte";

    // (37:4) {:else}
    function create_else_block$1(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*formattedCode*/ ctx[2], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*formattedCode*/ 4) html_tag.p(/*formattedCode*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(37:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#if language === 'none'}
    function create_if_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*formattedCode*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*formattedCode*/ 4) set_data_dev(t, /*formattedCode*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(35:4) {#if language === 'none'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let code0;
    	let t;
    	let pre;
    	let code1;
    	let code1_class_value;
    	let pre_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	function select_block_type(ctx, dirty) {
    		if (/*language*/ ctx[0] === "none") return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			code0 = element("code");
    			if (default_slot) default_slot.c();
    			t = space();
    			pre = element("pre");
    			code1 = element("code");
    			if_block.c();
    			set_style(code0, "display", "none");
    			add_location(code0, file$4, 28, 0, 766);
    			attr_dev(code1, "class", code1_class_value = "language-" + /*language*/ ctx[0]);
    			add_location(code1, file$4, 33, 2, 902);
    			attr_dev(pre, "class", pre_class_value = "language-" + /*language*/ ctx[0]);
    			attr_dev(pre, "command-line", "");
    			attr_dev(pre, "data-output", "2-17");
    			add_location(pre, file$4, 32, 0, 834);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, code0, anchor);

    			if (default_slot) {
    				default_slot.m(code0, null);
    			}

    			/*code0_binding*/ ctx[7](code0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, pre, anchor);
    			append_dev(pre, code1);
    			if_block.m(code1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(code1, null);
    				}
    			}

    			if (!current || dirty & /*language*/ 1 && code1_class_value !== (code1_class_value = "language-" + /*language*/ ctx[0])) {
    				attr_dev(code1, "class", code1_class_value);
    			}

    			if (!current || dirty & /*language*/ 1 && pre_class_value !== (pre_class_value = "language-" + /*language*/ ctx[0])) {
    				attr_dev(pre, "class", pre_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(code0);
    			if (default_slot) default_slot.d(detaching);
    			/*code0_binding*/ ctx[7](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(pre);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const prism$1 = prism;
    const highlight = prism.highlightElement;
    const globalConfig = { transform: x => x };

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Prism", slots, ['default']);
    	let { language = "javascript" } = $$props;
    	let { source = "" } = $$props;
    	let { transform = x => x } = $$props;
    	let element, formattedCode;

    	function highlightCode() {
    		const grammar = prism$1.languages[language];
    		let body = source || element.textContent;
    		body = globalConfig.transform(body);
    		body = transform(body);

    		$$invalidate(2, formattedCode = language === "none"
    		? body
    		: prism$1.highlight(body, grammar, language));
    	}

    	function code0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("language" in $$new_props) $$invalidate(0, language = $$new_props.language);
    		if ("source" in $$new_props) $$invalidate(3, source = $$new_props.source);
    		if ("transform" in $$new_props) $$invalidate(4, transform = $$new_props.transform);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		_prism: prism,
    		prism: prism$1,
    		highlight,
    		globalConfig,
    		tick,
    		language,
    		source,
    		transform,
    		element,
    		formattedCode,
    		highlightCode
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), $$new_props));
    		if ("language" in $$props) $$invalidate(0, language = $$new_props.language);
    		if ("source" in $$props) $$invalidate(3, source = $$new_props.source);
    		if ("transform" in $$props) $$invalidate(4, transform = $$new_props.transform);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    		if ("formattedCode" in $$props) $$invalidate(2, formattedCode = $$new_props.formattedCode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$props && (source || element) && highlightCode();
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		language,
    		element,
    		formattedCode,
    		source,
    		transform,
    		$$scope,
    		slots,
    		code0_binding
    	];
    }

    class Prism$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { language: 0, source: 3, transform: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prism",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get language() {
    		throw new Error("<Prism>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Prism>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get source() {
    		throw new Error("<Prism>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<Prism>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transform() {
    		throw new Error("<Prism>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transform(value) {
    		throw new Error("<Prism>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Code.svelte generated by Svelte v3.29.4 */
    const file$5 = "src/Code.svelte";

    // (19:0) <Prism language="html" >
    function create_default_slot(ctx) {
    	let t_value = /*nodes*/ ctx[0][/*id*/ ctx[1]].content.text + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nodes, id*/ 3 && t_value !== (t_value = /*nodes*/ ctx[0][/*id*/ ctx[1]].content.text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(19:0) <Prism language=\\\"html\\\" >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let link;
    	let t;
    	let div;
    	let prism;
    	let current;

    	prism = new Prism$1({
    			props: {
    				language: "html",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			div = element("div");
    			create_component(prism.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://unpkg.com/prism-theme-night-owl@1.4.0/build/light.css");
    			add_location(link, file$5, 1, 1, 15);
    			attr_dev(div, "contentedit", "true");
    			add_location(div, file$5, 15, 0, 290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(prism, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const prism_changes = {};

    			if (dirty & /*$$scope, nodes, id*/ 67) {
    				prism_changes.$$scope = { dirty, ctx };
    			}

    			prism.$set(prism_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prism.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prism.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(prism);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Code", slots, []);
    	let { nodes } = $$props;
    	let { id } = $$props;
    	let { opt } = $$props;
    	let { width } = $$props;
    	let { depth } = $$props;
    	let { view } = $$props;
    	const writable_props = ["nodes", "id", "opt", "width", "depth", "view"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Code> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("opt" in $$props) $$invalidate(2, opt = $$props.opt);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(4, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(5, view = $$props.view);
    	};

    	$$self.$capture_state = () => ({
    		Prism: Prism$1,
    		nodes,
    		id,
    		opt,
    		width,
    		depth,
    		view
    	});

    	$$self.$inject_state = $$props => {
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("opt" in $$props) $$invalidate(2, opt = $$props.opt);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(4, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(5, view = $$props.view);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nodes, id, opt, width, depth, view];
    }

    class Code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			nodes: 0,
    			id: 1,
    			opt: 2,
    			width: 3,
    			depth: 4,
    			view: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Code",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodes*/ ctx[0] === undefined && !("nodes" in props)) {
    			console.warn("<Code> was created without expected prop 'nodes'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<Code> was created without expected prop 'id'");
    		}

    		if (/*opt*/ ctx[2] === undefined && !("opt" in props)) {
    			console.warn("<Code> was created without expected prop 'opt'");
    		}

    		if (/*width*/ ctx[3] === undefined && !("width" in props)) {
    			console.warn("<Code> was created without expected prop 'width'");
    		}

    		if (/*depth*/ ctx[4] === undefined && !("depth" in props)) {
    			console.warn("<Code> was created without expected prop 'depth'");
    		}

    		if (/*view*/ ctx[5] === undefined && !("view" in props)) {
    			console.warn("<Code> was created without expected prop 'view'");
    		}
    	}

    	get nodes() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodes(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opt() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opt(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depth() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depth(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get view() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set view(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Section.svelte generated by Svelte v3.29.4 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/Section.svelte";

    // (12:0) {#if nodes[backgroundImageID]}
    function create_if_block$3(ctx) {
    	let section;
    	let h1;
    	let raw_value = /*nodes*/ ctx[1][/*id*/ ctx[2]].content.title + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			attr_dev(h1, "class", "svelte-1hoto61");
    			add_location(h1, file$6, 13, 4, 562);
    			attr_dev(section, "class", "masthead svelte-1hoto61");
    			attr_dev(section, "role", "img");
    			attr_dev(section, "aria-label", "Image Description");
    			set_style(section, "background-image", "url(" + /*nodes*/ ctx[1][/*backgroundImageID*/ ctx[3]].content.src + ")");
    			add_location(section, file$6, 12, 4, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			h1.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = listen_dev(h1, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nodes, id*/ 6 && raw_value !== (raw_value = /*nodes*/ ctx[1][/*id*/ ctx[2]].content.title + "")) h1.innerHTML = raw_value;
    			if (dirty & /*nodes*/ 2) {
    				set_style(section, "background-image", "url(" + /*nodes*/ ctx[1][/*backgroundImageID*/ ctx[3]].content.src + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(12:0) {#if nodes[backgroundImageID]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*nodes*/ ctx[1][/*backgroundImageID*/ ctx[3]] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*nodes*/ ctx[1][/*backgroundImageID*/ ctx[3]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, []);
    	let { opt } = $$props;
    	let { nodes } = $$props;
    	let { id } = $$props;
    	let { width } = $$props;
    	let { depth } = $$props;
    	let { view } = $$props;
    	let backgroundImageID = nodes[id].links.filter(x => x.view == "header")[0].id;
    	const writable_props = ["opt", "nodes", "id", "width", "depth", "view"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		opt.history.push(opt.base);
    		$$invalidate(0, opt.base = id, opt);
    		console.log(id);
    	};

    	$$self.$$set = $$props => {
    		if ("opt" in $$props) $$invalidate(0, opt = $$props.opt);
    		if ("nodes" in $$props) $$invalidate(1, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(5, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(6, view = $$props.view);
    	};

    	$$self.$capture_state = () => ({
    		Image,
    		opt,
    		nodes,
    		id,
    		width,
    		depth,
    		view,
    		backgroundImageID
    	});

    	$$self.$inject_state = $$props => {
    		if ("opt" in $$props) $$invalidate(0, opt = $$props.opt);
    		if ("nodes" in $$props) $$invalidate(1, nodes = $$props.nodes);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("depth" in $$props) $$invalidate(5, depth = $$props.depth);
    		if ("view" in $$props) $$invalidate(6, view = $$props.view);
    		if ("backgroundImageID" in $$props) $$invalidate(3, backgroundImageID = $$props.backgroundImageID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [opt, nodes, id, backgroundImageID, width, depth, view, click_handler];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			opt: 0,
    			nodes: 1,
    			id: 2,
    			width: 4,
    			depth: 5,
    			view: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*opt*/ ctx[0] === undefined && !("opt" in props)) {
    			console_1$1.warn("<Section> was created without expected prop 'opt'");
    		}

    		if (/*nodes*/ ctx[1] === undefined && !("nodes" in props)) {
    			console_1$1.warn("<Section> was created without expected prop 'nodes'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console_1$1.warn("<Section> was created without expected prop 'id'");
    		}

    		if (/*width*/ ctx[4] === undefined && !("width" in props)) {
    			console_1$1.warn("<Section> was created without expected prop 'width'");
    		}

    		if (/*depth*/ ctx[5] === undefined && !("depth" in props)) {
    			console_1$1.warn("<Section> was created without expected prop 'depth'");
    		}

    		if (/*view*/ ctx[6] === undefined && !("view" in props)) {
    			console_1$1.warn("<Section> was created without expected prop 'view'");
    		}
    	}

    	get opt() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opt(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodes() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodes(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depth() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depth(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get view() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set view(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Options.svelte generated by Svelte v3.29.4 */

    function create_fragment$7(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Options", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Options> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Options extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Options",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Style.svelte generated by Svelte v3.29.4 */

    function create_fragment$8(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Style", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Style> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Style extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Style",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Connection.svelte generated by Svelte v3.29.4 */

    function create_fragment$9(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Connection", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Connection> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Connection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Connection",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Authorization.svelte generated by Svelte v3.29.4 */

    function create_fragment$a(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Authorization", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Authorization> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Authorization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Authorization",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Svega.svelte generated by Svelte v3.29.4 */

    function create_fragment$b(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Svega", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svega> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Svega extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svega",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Data.svelte generated by Svelte v3.29.4 */

    function create_fragment$c(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Data", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Data> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Data extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Data",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/CouchDB.svelte generated by Svelte v3.29.4 */

    function create_fragment$d(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CouchDB", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CouchDB> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class CouchDB extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CouchDB",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/Content.svelte generated by Svelte v3.29.4 */

    const { console: console_1$2 } = globals;
    const file$7 = "src/Content.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (145:0) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[22].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$7, 145, 1, 3783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 4 && t_value !== (t_value = /*error*/ ctx[22].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(145:0) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (128:0) {:then go}
    function create_then_block(ctx) {
    	let switch_instance;
    	let updating_nodes;
    	let updating_opt;
    	let t;
    	let if_block_anchor;
    	let current;

    	function switch_instance_nodes_binding(value) {
    		/*switch_instance_nodes_binding*/ ctx[10].call(null, value);
    	}

    	function switch_instance_opt_binding(value) {
    		/*switch_instance_opt_binding*/ ctx[11].call(null, value);
    	}

    	var switch_value = /*comp*/ ctx[6][/*nodes*/ ctx[0][/*id*/ ctx[2]].type];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			id: /*id*/ ctx[2],
    			width: /*width*/ ctx[4],
    			depth: /*depth*/ ctx[3],
    			view: /*view*/ ctx[5]
    		};

    		if (/*nodes*/ ctx[0] !== void 0) {
    			switch_instance_props.nodes = /*nodes*/ ctx[0];
    		}

    		if (/*opt*/ ctx[1] !== void 0) {
    			switch_instance_props.opt = /*opt*/ ctx[1];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, "nodes", switch_instance_nodes_binding));
    		binding_callbacks.push(() => bind(switch_instance, "opt", switch_instance_opt_binding));
    	}

    	let if_block = /*nodes*/ ctx[0][/*id*/ ctx[2]].links && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*id*/ 4) switch_instance_changes.id = /*id*/ ctx[2];
    			if (dirty & /*width*/ 16) switch_instance_changes.width = /*width*/ ctx[4];
    			if (dirty & /*depth*/ 8) switch_instance_changes.depth = /*depth*/ ctx[3];
    			if (dirty & /*view*/ 32) switch_instance_changes.view = /*view*/ ctx[5];

    			if (!updating_nodes && dirty & /*nodes*/ 1) {
    				updating_nodes = true;
    				switch_instance_changes.nodes = /*nodes*/ ctx[0];
    				add_flush_callback(() => updating_nodes = false);
    			}

    			if (!updating_opt && dirty & /*opt*/ 2) {
    				updating_opt = true;
    				switch_instance_changes.opt = /*opt*/ ctx[1];
    				add_flush_callback(() => updating_opt = false);
    			}

    			if (switch_value !== (switch_value = /*comp*/ ctx[6][/*nodes*/ ctx[0][/*id*/ ctx[2]].type])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, "nodes", switch_instance_nodes_binding));
    					binding_callbacks.push(() => bind(switch_instance, "opt", switch_instance_opt_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, t.parentNode, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (/*nodes*/ ctx[0][/*id*/ ctx[2]].links) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*nodes, id*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(128:0) {:then go}",
    		ctx
    	});

    	return block;
    }

    // (132:1) {#if nodes[id].links}
    function create_if_block$4(ctx) {
    	let section;
    	let dndzone_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*depth*/ ctx[3] <= /*opt*/ ctx[1].depth && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block) if_block.c();
    			attr_dev(section, "class", "svelte-1d0natg");
    			add_location(section, file$7, 132, 2, 3231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block) if_block.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(dndzone_action = dndzone$2.call(null, section, {
    						items: /*nodes*/ ctx[0][/*id*/ ctx[2]].links,
    						flipDurationMs,
    						type: "dnd",
    						dragDisabled: /*opt*/ ctx[1].dragDisabled
    					})),
    					listen_dev(section, "consider", /*handleDndConsider*/ ctx[7], false, false, false),
    					listen_dev(section, "finalize", /*handleDndFinalize*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*depth*/ ctx[3] <= /*opt*/ ctx[1].depth) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*depth, opt*/ 10) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dndzone_action && is_function(dndzone_action.update) && dirty & /*nodes, id, opt*/ 7) dndzone_action.update.call(null, {
    				items: /*nodes*/ ctx[0][/*id*/ ctx[2]].links,
    				flipDurationMs,
    				type: "dnd",
    				dragDisabled: /*opt*/ ctx[1].dragDisabled
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(132:1) {#if nodes[id].links}",
    		ctx
    	});

    	return block;
    }

    // (136:3) {#if depth<=opt.depth}
    function create_if_block_1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*nodes*/ ctx[0][/*id*/ ctx[2]].links;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*link*/ ctx[19].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*addRemove, nodes, id, width, depth, opt*/ 31) {
    				const each_value = /*nodes*/ ctx[0][/*id*/ ctx[2]].links;
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, fix_and_outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(136:3) {#if depth<=opt.depth}",
    		ctx
    	});

    	return block;
    }

    // (137:4) {#each nodes[id].links as link (link.id)}
    function create_each_block(key_2, ctx) {
    	let div;
    	let content;
    	let updating_nodes;
    	let updating_opt;
    	let t;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	let mounted;
    	let dispose;

    	function content_nodes_binding(value) {
    		/*content_nodes_binding*/ ctx[12].call(null, value);
    	}

    	function content_opt_binding(value) {
    		/*content_opt_binding*/ ctx[13].call(null, value);
    	}

    	let content_props = {
    		id: /*link*/ ctx[19].id,
    		width: /*width*/ ctx[4],
    		depth: /*depth*/ ctx[3] + 1,
    		view: /*link*/ ctx[19].view
    	};

    	if (/*nodes*/ ctx[0] !== void 0) {
    		content_props.nodes = /*nodes*/ ctx[0];
    	}

    	if (/*opt*/ ctx[1] !== void 0) {
    		content_props.opt = /*opt*/ ctx[1];
    	}

    	content = new Content({ props: content_props, $$inline: true });
    	binding_callbacks.push(() => bind(content, "nodes", content_nodes_binding));
    	binding_callbacks.push(() => bind(content, "opt", content_opt_binding));

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[14](/*link*/ ctx[19], ...args);
    	}

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(content.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item svelte-1d0natg");
    			add_location(div, file$7, 137, 6, 3489);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(content, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const content_changes = {};
    			if (dirty & /*nodes, id*/ 5) content_changes.id = /*link*/ ctx[19].id;
    			if (dirty & /*width*/ 16) content_changes.width = /*width*/ ctx[4];
    			if (dirty & /*depth*/ 8) content_changes.depth = /*depth*/ ctx[3] + 1;
    			if (dirty & /*nodes, id*/ 5) content_changes.view = /*link*/ ctx[19].view;

    			if (!updating_nodes && dirty & /*nodes*/ 1) {
    				updating_nodes = true;
    				content_changes.nodes = /*nodes*/ ctx[0];
    				add_flush_callback(() => updating_nodes = false);
    			}

    			if (!updating_opt && dirty & /*opt*/ 2) {
    				updating_opt = true;
    				content_changes.opt = /*opt*/ ctx[1];
    				add_flush_callback(() => updating_opt = false);
    			}

    			content.$set(content_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: flipDurationMs });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(content);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(137:4) {#each nodes[id].links as link (link.id)}",
    		ctx
    	});

    	return block;
    }

    // (125:16)   loading {id}
    function create_pending_block(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("loading ");
    			t1 = text(/*id*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 4) set_data_dev(t1, /*id*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(125:16)   loading {id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 18,
    		error: 22,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*get*/ ctx[9](/*id*/ ctx[2]), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*id*/ 4 && promise !== (promise = /*get*/ ctx[9](/*id*/ ctx[2])) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[18] = child_ctx[22] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const flipDurationMs = 400;

    function addRemove(event, id) {
    	console.log(event.offsetY / event.currentTarget.getBoundingClientRect().height);
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Content", slots, []);
    	let { nodes } = $$props;
    	let { opt } = $$props;
    	let { id } = $$props;
    	let { depth } = $$props;
    	let { width } = $$props;
    	let { view } = $$props;
    	let key;
    	let exempt = ["Header"];

    	let comp = {
    		Paragraph,
    		Image,
    		Video,
    		Code,
    		Svg,
    		Section,
    		Options,
    		Style,
    		Connection,
    		Authorization,
    		Svega,
    		Data
    	};

    	function handleDndConsider(e) {
    		$$invalidate(0, nodes[id].links = e.detail.items, nodes);
    	}

    	function handleDndFinalize(e) {
    		$$invalidate(0, nodes[id].links = e.detail.items, nodes);
    		post(id);
    		console.log("update node with links");
    	}

    	async function post(id) {
    		try {
    			const options = {
    				method: "put",
    				headers: {
    					"Content-Type": "application/json",
    					"Accept": "application/json",
    					"authorization": "Basic " + btoa(opt.user + ":" + opt.pwd)
    				},
    				body: JSON.stringify(nodes[id])
    			};

    			const response = await fetch(opt.url + id, options);
    			const data = await response.json();
    			$$invalidate(0, nodes[id]._rev = data.rev, nodes);
    			console.log(options);
    			console.log(data);
    		} catch(err) {
    			console.log(err);
    		}
    	}

    	async function get(id) {
    		try {
    			if (Array.isArray(id)) {
    				const options = {
    					method: "post",
    					headers: { "Content-Type": "application/json" },
    					body: JSON.stringify({
    						keys: id.map(el => el.id),
    						include_docs: true
    					})
    				};

    				const response = await fetch(opt.url + "_all_docs", options);
    				const data = await response.json();
    				const add = [];

    				data.rows.forEach(el => {
    					$$invalidate(0, nodes[el.id] = el.doc, nodes);

    					if (nodes[el.id].hasOwnProperty("links")) {
    						if (nodes[el.id].links.length > 0) {
    							nodes[el.id].links.forEach(link => add.push(link));
    						}

    						
    					}

    					
    				});

    				if (add.length > 0) {
    					await get(add);
    				}

    				 // not sure how add coulc be empty as links.length has to be >0
    				return data;
    			} else {
    				if (nodes[id]) {
    					//IF nodes[id].links and these not in keys(nodes) then bulk-fetch these
    					return nodes[id]; //don't fetch it twice
    				} else {
    					const response = await fetch(opt.url + id);

    					//console.log(response)
    					const data = await response.json();

    					$$invalidate(0, nodes[id] = data, nodes);

    					if (data.hasOwnProperty("links")) {
    						await get(data.links);
    					}

    					return nodes[id];
    				}
    			}
    		} catch(err) {
    			console.log(id);
    			console.log(err);
    			return err;
    		}
    	}

    	const writable_props = ["nodes", "opt", "id", "depth", "width", "view"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_nodes_binding(value) {
    		nodes = value;
    		$$invalidate(0, nodes);
    	}

    	function switch_instance_opt_binding(value) {
    		opt = value;
    		$$invalidate(1, opt);
    	}

    	function content_nodes_binding(value) {
    		nodes = value;
    		$$invalidate(0, nodes);
    	}

    	function content_opt_binding(value) {
    		opt = value;
    		$$invalidate(1, opt);
    	}

    	const click_handler = (link, event) => addRemove(event, link.id);

    	$$self.$$set = $$props => {
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("opt" in $$props) $$invalidate(1, opt = $$props.opt);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("depth" in $$props) $$invalidate(3, depth = $$props.depth);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("view" in $$props) $$invalidate(5, view = $$props.view);
    	};

    	$$self.$capture_state = () => ({
    		flip,
    		dndzone: dndzone$2,
    		Svg,
    		Paragraph,
    		Image,
    		Video,
    		Code,
    		Section,
    		Options,
    		Style,
    		Connection,
    		Authorization,
    		Svega,
    		Data,
    		CouchDB,
    		check_outros,
    		nodes,
    		opt,
    		id,
    		depth,
    		width,
    		view,
    		key,
    		exempt,
    		comp,
    		flipDurationMs,
    		handleDndConsider,
    		handleDndFinalize,
    		post,
    		get,
    		addRemove
    	});

    	$$self.$inject_state = $$props => {
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("opt" in $$props) $$invalidate(1, opt = $$props.opt);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("depth" in $$props) $$invalidate(3, depth = $$props.depth);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("view" in $$props) $$invalidate(5, view = $$props.view);
    		if ("key" in $$props) key = $$props.key;
    		if ("exempt" in $$props) exempt = $$props.exempt;
    		if ("comp" in $$props) $$invalidate(6, comp = $$props.comp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodes,
    		opt,
    		id,
    		depth,
    		width,
    		view,
    		comp,
    		handleDndConsider,
    		handleDndFinalize,
    		get,
    		switch_instance_nodes_binding,
    		switch_instance_opt_binding,
    		content_nodes_binding,
    		content_opt_binding,
    		click_handler
    	];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			nodes: 0,
    			opt: 1,
    			id: 2,
    			depth: 3,
    			width: 4,
    			view: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodes*/ ctx[0] === undefined && !("nodes" in props)) {
    			console_1$2.warn("<Content> was created without expected prop 'nodes'");
    		}

    		if (/*opt*/ ctx[1] === undefined && !("opt" in props)) {
    			console_1$2.warn("<Content> was created without expected prop 'opt'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console_1$2.warn("<Content> was created without expected prop 'id'");
    		}

    		if (/*depth*/ ctx[3] === undefined && !("depth" in props)) {
    			console_1$2.warn("<Content> was created without expected prop 'depth'");
    		}

    		if (/*width*/ ctx[4] === undefined && !("width" in props)) {
    			console_1$2.warn("<Content> was created without expected prop 'width'");
    		}

    		if (/*view*/ ctx[5] === undefined && !("view" in props)) {
    			console_1$2.warn("<Content> was created without expected prop 'view'");
    		}
    	}

    	get nodes() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodes(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opt() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opt(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depth() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depth(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get view() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set view(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */

    const { console: console_1$3 } = globals;
    const file$8 = "src/App.svelte";

    // (66:0) {#if menuWidth=="100%"}
    function create_if_block$5(ctx) {
    	let span0;
    	let svg0;
    	let t0;
    	let span1;
    	let svg1;
    	let t1;
    	let span2;
    	let svg2;
    	let t2;
    	let span3;
    	let svg3;
    	let t3;
    	let span4;
    	let svg4;
    	let t4;
    	let span5;
    	let svg5;
    	let t5;
    	let span6;
    	let svg6;
    	let t6;
    	let span7;
    	let svg7;
    	let t7;
    	let span8;
    	let svg8;
    	let t8;
    	let span9;
    	let svg9;
    	let t9;
    	let span10;
    	let svg10;
    	let t10;
    	let span11;
    	let svg11;
    	let current;
    	let mounted;
    	let dispose;

    	svg0 = new Svg({
    			props: {
    				name: "Connection",
    				size: "30",
    				fill: "black"
    			},
    			$$inline: true
    		});

    	svg1 = new Svg({
    			props: {
    				name: "Authorization",
    				size: "30",
    				fill: "black"
    			},
    			$$inline: true
    		});

    	svg2 = new Svg({
    			props: { name: "Trash", size: "30", fill: "black" },
    			$$inline: true
    		});

    	svg3 = new Svg({
    			props: { name: "Cut", size: "30", fill: "black" },
    			$$inline: true
    		});

    	svg4 = new Svg({
    			props: {
    				name: "Section",
    				size: "30",
    				fill: "black"
    			},
    			$$inline: true
    		});

    	svg5 = new Svg({
    			props: { name: "Code", size: "30", fill: "black" },
    			$$inline: true
    		});

    	svg6 = new Svg({
    			props: { name: "Video", size: "30", fill: "black" },
    			$$inline: true
    		});

    	svg7 = new Svg({
    			props: { name: "Image", size: "30", fill: "black" },
    			$$inline: true
    		});

    	svg8 = new Svg({
    			props: {
    				name: "Paragraph",
    				size: "30",
    				fill: "black"
    			},
    			$$inline: true
    		});

    	svg9 = new Svg({
    			props: {
    				name: "Editor",
    				size: "30",
    				fill: /*opt*/ ctx[1].edit ? "olive" : "crimson"
    			},
    			$$inline: true
    		});

    	svg10 = new Svg({
    			props: {
    				name: "Move",
    				size: "30",
    				fill: /*opt*/ ctx[1].dragDisabled ? "crimson" : "olive"
    			},
    			$$inline: true
    		});

    	svg11 = new Svg({
    			props: {
    				name: "Equation",
    				size: "30",
    				fill: "black"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			create_component(svg0.$$.fragment);
    			t0 = space();
    			span1 = element("span");
    			create_component(svg1.$$.fragment);
    			t1 = space();
    			span2 = element("span");
    			create_component(svg2.$$.fragment);
    			t2 = space();
    			span3 = element("span");
    			create_component(svg3.$$.fragment);
    			t3 = space();
    			span4 = element("span");
    			create_component(svg4.$$.fragment);
    			t4 = space();
    			span5 = element("span");
    			create_component(svg5.$$.fragment);
    			t5 = space();
    			span6 = element("span");
    			create_component(svg6.$$.fragment);
    			t6 = space();
    			span7 = element("span");
    			create_component(svg7.$$.fragment);
    			t7 = space();
    			span8 = element("span");
    			create_component(svg8.$$.fragment);
    			t8 = space();
    			span9 = element("span");
    			create_component(svg9.$$.fragment);
    			t9 = space();
    			span10 = element("span");
    			create_component(svg10.$$.fragment);
    			t10 = space();
    			span11 = element("span");
    			create_component(svg11.$$.fragment);
    			attr_dev(span0, "class", "control svelte-wssk20");
    			add_location(span0, file$8, 66, 1, 1676);
    			attr_dev(span1, "class", "control svelte-wssk20");
    			add_location(span1, file$8, 67, 1, 1754);
    			attr_dev(span2, "class", "control svelte-wssk20");
    			add_location(span2, file$8, 68, 1, 1835);
    			attr_dev(span3, "class", "control svelte-wssk20");
    			add_location(span3, file$8, 69, 1, 1908);
    			attr_dev(span4, "class", "control svelte-wssk20");
    			add_location(span4, file$8, 70, 1, 1979);
    			attr_dev(span5, "class", "control svelte-wssk20");
    			add_location(span5, file$8, 71, 1, 2054);
    			attr_dev(span6, "class", "control svelte-wssk20");
    			add_location(span6, file$8, 72, 1, 2126);
    			attr_dev(span7, "class", "control svelte-wssk20");
    			add_location(span7, file$8, 73, 1, 2199);
    			attr_dev(span8, "class", "control svelte-wssk20");
    			add_location(span8, file$8, 74, 1, 2272);
    			attr_dev(span9, "class", "control svelte-wssk20");
    			add_location(span9, file$8, 75, 1, 2349);
    			attr_dev(span10, "class", "control svelte-wssk20");
    			add_location(span10, file$8, 76, 1, 2481);
    			attr_dev(span11, "class", "control svelte-wssk20");
    			add_location(span11, file$8, 77, 1, 2635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			mount_component(svg0, span0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span1, anchor);
    			mount_component(svg1, span1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span2, anchor);
    			mount_component(svg2, span2, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span3, anchor);
    			mount_component(svg3, span3, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span4, anchor);
    			mount_component(svg4, span4, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span5, anchor);
    			mount_component(svg5, span5, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, span6, anchor);
    			mount_component(svg6, span6, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, span7, anchor);
    			mount_component(svg7, span7, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, span8, anchor);
    			mount_component(svg8, span8, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, span9, anchor);
    			mount_component(svg9, span9, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, span10, anchor);
    			mount_component(svg10, span10, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, span11, anchor);
    			mount_component(svg11, span11, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span9, "click", /*click_handler*/ ctx[11], false, false, false),
    					listen_dev(span10, "click", /*click_handler_1*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const svg9_changes = {};
    			if (dirty & /*opt*/ 2) svg9_changes.fill = /*opt*/ ctx[1].edit ? "olive" : "crimson";
    			svg9.$set(svg9_changes);
    			const svg10_changes = {};
    			if (dirty & /*opt*/ 2) svg10_changes.fill = /*opt*/ ctx[1].dragDisabled ? "crimson" : "olive";
    			svg10.$set(svg10_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svg0.$$.fragment, local);
    			transition_in(svg1.$$.fragment, local);
    			transition_in(svg2.$$.fragment, local);
    			transition_in(svg3.$$.fragment, local);
    			transition_in(svg4.$$.fragment, local);
    			transition_in(svg5.$$.fragment, local);
    			transition_in(svg6.$$.fragment, local);
    			transition_in(svg7.$$.fragment, local);
    			transition_in(svg8.$$.fragment, local);
    			transition_in(svg9.$$.fragment, local);
    			transition_in(svg10.$$.fragment, local);
    			transition_in(svg11.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svg0.$$.fragment, local);
    			transition_out(svg1.$$.fragment, local);
    			transition_out(svg2.$$.fragment, local);
    			transition_out(svg3.$$.fragment, local);
    			transition_out(svg4.$$.fragment, local);
    			transition_out(svg5.$$.fragment, local);
    			transition_out(svg6.$$.fragment, local);
    			transition_out(svg7.$$.fragment, local);
    			transition_out(svg8.$$.fragment, local);
    			transition_out(svg9.$$.fragment, local);
    			transition_out(svg10.$$.fragment, local);
    			transition_out(svg11.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			destroy_component(svg0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span1);
    			destroy_component(svg1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span2);
    			destroy_component(svg2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span3);
    			destroy_component(svg3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span4);
    			destroy_component(svg4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span5);
    			destroy_component(svg5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(span6);
    			destroy_component(svg6);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(span7);
    			destroy_component(svg7);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(span8);
    			destroy_component(svg8);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(span9);
    			destroy_component(svg9);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(span10);
    			destroy_component(svg10);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(span11);
    			destroy_component(svg11);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(66:0) {#if menuWidth==\\\"100%\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import Content from './Content.svelte'  import { dndzone }
    function create_catch_block$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>  import Content from './Content.svelte'  import { dndzone }",
    		ctx
    	});

    	return block;
    }

    // (82:0) {:then go}
    function create_then_block$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(82:0) {:then go}",
    		ctx
    	});

    	return block;
    }

    // (81:24)  {:then go}
    function create_pending_block$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(81:24)  {:then go}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let section;
    	let content;
    	let updating_nodes;
    	let updating_opt;
    	let t0;
    	let div;
    	let t1;
    	let await_block_anchor;
    	let promise;
    	let current;
    	let mounted;
    	let dispose;

    	function content_nodes_binding(value) {
    		/*content_nodes_binding*/ ctx[9].call(null, value);
    	}

    	function content_opt_binding(value) {
    		/*content_opt_binding*/ ctx[10].call(null, value);
    	}

    	let content_props = { id: /*opt*/ ctx[1].base, depth: 1 };

    	if (/*nodes*/ ctx[0] !== void 0) {
    		content_props.nodes = /*nodes*/ ctx[0];
    	}

    	if (/*opt*/ ctx[1] !== void 0) {
    		content_props.opt = /*opt*/ ctx[1];
    	}

    	content = new Content({ props: content_props, $$inline: true });
    	binding_callbacks.push(() => bind(content, "nodes", content_nodes_binding));
    	binding_callbacks.push(() => bind(content, "opt", content_opt_binding));
    	let if_block = /*menuWidth*/ ctx[3] == "100%" && create_if_block$5(ctx);

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 18
    	};

    	handle_promise(promise = /*getID*/ ctx[5](newNodes), info);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(content.$$.fragment);
    			t0 = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			await_block_anchor = empty();
    			info.block.c();
    			attr_dev(section, "class", "svelte-wssk20");
    			add_location(section, file$8, 60, 0, 1378);
    			attr_dev(div, "class", "back svelte-wssk20");
    			set_style(div, "width", /*menuWidth*/ ctx[3]);
    			add_location(div, file$8, 64, 0, 1469);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(content, section, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*_handleKeydown*/ ctx[4], false, false, false),
    					listen_dev(window, "keyup", /*keyup_handler*/ ctx[8], false, false, false),
    					listen_dev(div, "mousedown", self$1(/*mousedown_handler*/ ctx[13]), false, false, false),
    					listen_dev(div, "mouseup", self$1(/*mouseup_handler*/ ctx[14]), false, false, false),
    					listen_dev(div, "touchstart", self$1(/*touchstart_handler*/ ctx[15]), { passive: true }, false, false),
    					listen_dev(div, "touchend", self$1(/*touchend_handler*/ ctx[16]), { passive: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const content_changes = {};
    			if (dirty & /*opt*/ 2) content_changes.id = /*opt*/ ctx[1].base;

    			if (!updating_nodes && dirty & /*nodes*/ 1) {
    				updating_nodes = true;
    				content_changes.nodes = /*nodes*/ ctx[0];
    				add_flush_callback(() => updating_nodes = false);
    			}

    			if (!updating_opt && dirty & /*opt*/ 2) {
    				updating_opt = true;
    				content_changes.opt = /*opt*/ ctx[1];
    				add_flush_callback(() => updating_opt = false);
    			}

    			content.$set(content_changes);

    			if (/*menuWidth*/ ctx[3] == "100%") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*menuWidth*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*menuWidth*/ 8) {
    				set_style(div, "width", /*menuWidth*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(content);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const newNodes = "957fd8f002d38bd256c615b4c84cd5fc";

    function toggle(x) {
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let nodes = {};

    	let opt = {
    		"depth": 1,
    		"base": "root",
    		url: "https://9231c9c3-121c-4b8e-bbfd-ac275ec62eb9-bluemix.cloudantnosqldb.appdomain.cloud/test/",
    		"edit": false,
    		"history": [],
    		"dragDisabled": true,
    		"user": "apikey-81f76e82d4154627812593832eb9c4cb",
    		"pwd": "8918d591770b9449c2012979b0f9101b5416e1c6"
    	};

    	let key = false;

    	function _handleKeydown(event) {
    		$$invalidate(2, key = event.which);
    	}

    	async function getID(id) {
    		if (!nodes[id]) {
    			await fetch(opt.url + id).then(res => res.json()).then(data => {
    				$$invalidate(0, nodes[id] = data, nodes);
    				console.log(id);
    			}).catch(function (error) {
    				console.log(error);
    			});
    		}
    	}

    	let start;
    	let menuWidth = "40px";

    	function startTimer() {
    		start = Date.now();
    	}

    	function check() {
    		const elapsed = Date.now() - start;

    		if (elapsed < 500) {
    			if (opt.history.length > 0) {
    				$$invalidate(1, opt.base = opt.history[opt.history.length - 1], opt);
    				opt.history.pop();
    			}
    		} else {
    			if (menuWidth == "40px") {
    				$$invalidate(3, menuWidth = "100%");
    			} else {
    				$$invalidate(3, menuWidth = "40px");
    			}
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = () => $$invalidate(2, key = false);

    	function content_nodes_binding(value) {
    		nodes = value;
    		$$invalidate(0, nodes);
    	}

    	function content_opt_binding(value) {
    		opt = value;
    		($$invalidate(1, opt), $$invalidate(2, key));
    	}

    	const click_handler = () => {
    		$$invalidate(1, opt.edit = !opt.edit, opt);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(1, opt.dragDisabled = !opt.dragDisabled, opt);
    	};

    	const mousedown_handler = () => startTimer();
    	const mouseup_handler = () => check();
    	const touchstart_handler = () => startTimer();
    	const touchend_handler = () => check();

    	$$self.$capture_state = () => ({
    		Content,
    		dndzone: dndzone$2,
    		Svg,
    		nodes,
    		opt,
    		key,
    		_handleKeydown,
    		newNodes,
    		getID,
    		start,
    		menuWidth,
    		startTimer,
    		check,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("nodes" in $$props) $$invalidate(0, nodes = $$props.nodes);
    		if ("opt" in $$props) $$invalidate(1, opt = $$props.opt);
    		if ("key" in $$props) $$invalidate(2, key = $$props.key);
    		if ("start" in $$props) start = $$props.start;
    		if ("menuWidth" in $$props) $$invalidate(3, menuWidth = $$props.menuWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*key, opt*/ 6) {
    			 if (key == 68) {
    				$$invalidate(1, opt.drag = !opt.drag, opt);
    			} else if (key == 69) {
    				$$invalidate(1, opt.edit = !opt.edit, opt);
    			} // add authorization
    		}
    	};

    	return [
    		nodes,
    		opt,
    		key,
    		menuWidth,
    		_handleKeydown,
    		getID,
    		startTimer,
    		check,
    		keyup_handler,
    		content_nodes_binding,
    		content_opt_binding,
    		click_handler,
    		click_handler_1,
    		mousedown_handler,
    		mouseup_handler,
    		touchstart_handler,
    		touchend_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
