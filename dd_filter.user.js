// ==UserScript==
// @name            WOD Dropdown Filter
// @namespace       ttang.tw
// @updateURL       https://bitbucket.org/Xyzith/wod_dd_filter/raw/sync/dd_filter.user.js
// @grant           none
// @author          Taylor Tang
// @version         1.5
// @description     Add search filter dropdown menu to wod item list
// @include         *://*.world-of-dungeons.org/wod/spiel/hero/items.php*
// @include         *://*.world-of-dungeons.org/wod/spiel/trade/trade.php*
// ==/UserScript==

(function(){
    if(!document.querySelector('.search_short')) { return false; }
    
    function chomp(str) {
        return str.replace(/[ \xA0\n\t\r]*/g, '');
    }

    function xhr(url, params, callback) {
        var x = new XMLHttpRequest();
        x.open('POST', url, true);
        x.onload = function() {callback(x);};
        x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        x.send(params);
    }

    function serialize(json) {
        var arr = [];
        for(var k in json) {
            if(json.hasOwnProperty(k)) {
                arr.push(k + '=' + json[k]);
            }
        }
        return arr.join('&');
    }
    function getPlayerId() {
        var id = document.body.innerHTML.match(/\d+\|B64_aXRlbQ__\|\d+\|\d+/);
        if(id) {
            return id[0];
        }
        return false;
    }
    var player_id = getPlayerId();
    if(!player_id) { return false; }

    var form = document.querySelector('form[name="the_form"]');
    var url = '/wod/ajax/render.php';
    var params = {
        wod_post_id: form.wod_post_id.value,
        session_hero_id: form.session_hero_id.value,
        profile_data_item_3_profile_data: form.profile_data_item_3_profile_data,
        callback_js_code_item_3_callback_js_code: form.callback_js_code_item_3_callback_js_code,
        RenderSearchProfileEditor_dialogStatus: 'open',
        ajax_class_name: 'RenderSearchProfileEditor',
        ajax_object_id: getPlayerId()
    };
    var params_str = serialize(params);


    xhr(url, params_str, function(x) {
        function applyFilter(e) {
            var value = e.target.value;
            var form_key = document.body.innerHTML.match(/item_\d+profile_id/)[0];
            if(value != -1) {
                form[form_key].value = value;
                form.submit();
            }
        }
        function renderSelect(ops) {
            function createOptions(text, value) {
                var option = document.createElement('option');
                option.textContent = text;
                option.value = value;
                return option;
            }
            var tr = document.querySelector('.search_short').rows[0];
            var td = document.createElement('td');
            var select = document.createElement('select');
            select.appendChild(createOptions('------', -1));
            for(var k in ops) {
                if(ops.hasOwnProperty(k)) {
                    select.appendChild(createOptions(ops[k], k));
                }
            }
            select.addEventListener('change', applyFilter);
            td.appendChild(select);
            tr.appendChild(td);

        }
        function getText(el) {
            var next = el.parentNode.nextSibling;
            var text = next.textContent;
            text = chomp(text).replace(/^\d+ */, '');
            return text;
        }
        var frag = document.createElement('div');
        frag.innerHTML = x.response;
        var radio = frag.querySelectorAll('input[type="radio"]');
        var filter_list = {};
        Array.prototype.forEach.call(radio, function(el) {
            filter_list[el.value] = getText(el);
        });
        renderSelect(filter_list);
    });

})();
