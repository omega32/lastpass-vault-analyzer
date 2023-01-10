import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'toastr/build/toastr.min.css';
import './style.css';
import './app.css';

import logo from './assets/images/logo.png';
import { OpenVault, LoadTextFile } from '../wailsjs/go/main/App';
import { XMLParser } from 'fast-xml-parser';
import _ from 'lodash';
import toastr from 'toastr';
import { BrowserOpenURL } from '../wailsjs/runtime/runtime';
import * as bootstrap from 'bootstrap';

const appNode = /** @type {HTMLDivElement} */(document.getElementById("app"));
const filterURLElement = /** @type {HTMLInputElement} */(appNode.querySelector("#filter"));
const openPanel = /** @type {HTMLButtonElement} */(document.querySelector("#open-wrapper #input"));
const urlList = /** @type {HTMLElement} */(appNode.querySelector("#url-list"));
const checkBoxRegex = /** @type {HTMLInputElement} */(appNode.querySelector("#flexCheckRegex"));
const tabContentContainer = /** @type {HTMLElement} */(appNode.querySelector('#myTabContent'));
const urlListContainer = /** @type {HTMLElement} */(appNode.querySelector('#url-list-container'));
const overviewTabPane = /** @type {HTMLElement} */(appNode.querySelector('#overview-tab-pane'));

/** @type {NodeListOf<HTMLImageElement>} */(appNode.querySelectorAll('.logo')).forEach(l => {
    l.src = logo;
});

/**
 * @typedef URLItem
 * @property {HTMLElement} node
 * @property {string} url
 * @property {Object} xmlNode
 */

const state = new (function () {
    this.filter = '';
    /** @type {URLItem[]} */
    this.URLs = [];
    this.useRegex = false;
    this.urlTotal = 0;
})();

const parser = new XMLParser({
    ignoreAttributes: false
});

toastr.options = {
    positionClass: "toast-bottom-right"
};

/**
 * @param {string} hex
 */
const hex2a = function (hex) {
    let str = '';
    for (let i = 0, l = hex.length; i < l; i += 2) {
        str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    }
    return str;
};

/**
 * @param {string} encoded
 * @returns {string}
 */
const decodeURL = function (encoded) {
    return hex2a(encoded);
};

/**
 * @param {LastPassXMLVault} vault
 */
const fillOverview = function (vault) {
    // TODO: manually count the elements that have a non empty url field.
    const cbcEnabled = vault.response?.accounts?.["@_cbc"] === "1";
    overviewTabPane.querySelector('#ov-cbc').innerHTML = `<span style="color: var(${ cbcEnabled ? '--bs-success' : '--bs-red' });">${ cbcEnabled ? 'Yes<i class="bi-patch-check-fill ms-2"></i>' : 'No<i class="bi-shield-exclamation ms-2"></i>' }</span>`;
    overviewTabPane.querySelector('#ov-accounts-version').textContent = vault.response?.accounts["@_accts_version"] || '-';

    // url count
    let urlAccounts = vault.response?.accounts?.account instanceof Array && vault.response?.accounts?.account.length || 0;
    let urlEqDomains = vault.response?.equivdomains?.equivdomain instanceof Array && vault.response?.equivdomains?.equivdomain.length || 0;
    let urlRules = vault.response?.urlrules?.urlrule instanceof Array && vault.response?.urlrules?.urlrule.length || 0;
    overviewTabPane.querySelector('#ov-accounts').textContent = urlAccounts.toString();
    overviewTabPane.querySelector('#ov-eq-domains').textContent = urlEqDomains.toString();
    overviewTabPane.querySelector('#ov-url-rules').textContent = urlRules.toString();

    // never accounts
    let nAutoLogin = vault.response?.neveraccounts?.neverautologin instanceof Array && vault.response?.neveraccounts?.neverautologin.length || 0;
    let nAccount = vault.response?.neveraccounts?.neveraccount instanceof Array && vault.response?.neveraccounts?.neveraccount.length || 0;
    let nGenerate = vault.response?.neveraccounts?.nevergenerate instanceof Array && vault.response?.neveraccounts?.nevergenerate.length || 0;
    let nShowIcons = vault.response?.neveraccounts?.nevershowicons instanceof Array && vault.response?.neveraccounts?.nevershowicons.length || 0;
    let nFormFill = vault.response?.neveraccounts?.neverformfill instanceof Array && vault.response?.neveraccounts?.neverformfill.length || 0;
    const nTotal = nAutoLogin + nAccount + nGenerate + nShowIcons + nFormFill;
    overviewTabPane.querySelector('#ov-never-accounts').textContent = '(' + nTotal.toString() + ')';
    overviewTabPane.querySelector('#ov-n-auto-login').textContent = nAutoLogin.toString();
    overviewTabPane.querySelector('#ov-n-account').textContent = nAccount.toString();
    overviewTabPane.querySelector('#ov-n-generate').textContent = nGenerate.toString();
    overviewTabPane.querySelector('#ov-n-show-icons').textContent = nShowIcons.toString();
    overviewTabPane.querySelector('#ov-n-form-fill').textContent = nFormFill.toString();

    const total = urlAccounts + urlEqDomains + urlRules + nTotal;
    overviewTabPane.querySelector('#ov-url-total').textContent = '(' + total.toString() + ')';
};

/**
 * @param {LastPassXMLVault} vault
 */
const renderVault = function (vault) {
    state.URLs = [];
    let count = 0;
    /**
     * @param {any[]} nodes
     * @param {string} source
     * @param {string} [tagName="url"]
     */
    const processURLs = function (nodes, source, tagName = "url") {
        nodes instanceof Array && nodes.length && nodes.forEach(n => {
            count++;
            const url = decodeURL(n[`@_${tagName}`]);
            const div = document.createElement('div');
            div.dataset["source"] = source;
            div.classList.add('url-node');
            div["_xmlData"] = n;
            div.innerHTML = `
                <div class="d-flex">
                    <i class="bi-globe-americas me-2" style="font-size: small;"></i>
                    <div>
                        <span>${url}</span>
                        <button class="js-show-details btn btn-dark p-0 px-1 ms-2" style="font-size: small;" title="show details" onclick="window.toggleUrlDetails(this);">
                            <i class="bi-plus-square"></i>
                        </button>
                    </div>
                </div>
            `;
            urlList.appendChild(div);
            state.URLs.push({
                node: div,
                url: url,
                xmlNode: n
            });
        });
    };
    processURLs(vault?.response?.accounts?.account, 'account');
    processURLs(vault?.response?.equivdomains?.equivdomain, 'equivdomain', 'domain');
    processURLs(vault?.response?.urlrules?.urlrule, 'urlrule');
    processURLs(vault?.response?.neveraccounts?.neveraccount, 'neveraccount' );
    processURLs(vault?.response?.neveraccounts?.neverautologin, 'neverautologin');
    processURLs(vault?.response?.neveraccounts?.neverformfill, 'neverformfill');
    processURLs(vault?.response?.neveraccounts?.nevergenerate, 'nevergenerate');
    processURLs(vault?.response?.neveraccounts?.nevershowicons, 'nevershowicons');
    state.urlTotal = count;
    appNode.querySelector("#filter-total").textContent = count.toString();
    appNode.querySelector("#filter-shown").textContent = count.toString();
    fillOverview(vault);
};

openPanel.onclick = async function () {
    const file = await OpenVault();
    if (file) {
        urlList.innerHTML = '';
        const xml = await LoadTextFile(file);
        const json = /** @type {LastPassXMLVault} */(parser.parse(xml));
        if (json?.response) {
            renderVault(json);
            resetFilter();
            openPanel.parentElement.remove();
        } else {
            toastr.error("Error loading XML vault");
        }
    }
};

/**
 * @param {string} text
 * @param {boolean} [useRegex=false]
 */
const filter = function (text, useRegex) {
    let shownCount = 0;
    /**
     * @type {(text: string, url: string) => boolean}
     */
    const comparison = useRegex ?
        (txt, url) => {
            const regex = new RegExp(txt, 'i');
            return regex.test(url);
        } :
        (txt, url) => {
            return url.toUpperCase().indexOf(txt.toUpperCase()) !== -1;
        };
    state.filter = text;
    state.URLs.forEach(a => {
        if (comparison(text, a.url)) {
            shownCount++;
            a.node.style.display = 'block';
        } else {
            a.node.style.display = 'none';
        }
    });
    appNode.querySelector("#filter-shown").textContent = shownCount.toString();
    removeAllDetails();
};

const debouncedFilter = _.debounce(filter, 150);

/**
 * @param {boolean} [force=false]
 */
const applyFilter = function (force) {
    const text = filterURLElement.value;
    if (force || text !== state.filter) {
        debouncedFilter(text, state.useRegex);
    }
};

filterURLElement.onkeyup = () => {
    applyFilter();
};
filterURLElement.focus();

const resetFilter = function () {
    filterURLElement.value = '';
    state.filter = '';
};

/**
 * @param {Event} e
 */
checkBoxRegex.onchange = function (e) {
    state.useRegex = /** @type {HTMLInputElement} */(e.target).checked;
    applyFilter(true);
};

const fixPanelLayout = function () {
    /** @type {DOMRect} */
    let pos;
    pos = tabContentContainer.getBoundingClientRect();
    tabContentContainer.style.maxHeight = window.innerHeight - pos.top - 1 + 'px';
    pos = urlListContainer.getBoundingClientRect();
    urlListContainer.style.maxHeight = window.innerHeight - pos.top - 1 + 'px';
};

window.addEventListener('resize', () => {
    fixPanelLayout();
});

fixPanelLayout();
checkBoxRegex.checked = false;

appNode.querySelectorAll('a').forEach(a => {
    a.onclick = function (e) {
        e.preventDefault();
        BrowserOpenURL(a.href);
    };
});

const removeAllDetails = function () {
    urlListContainer.querySelectorAll('.js-details').forEach(d => {
        d.parentElement.dataset["details"] = "0";
        d.remove();
    });
    urlListContainer.querySelectorAll('.js-show-details i.bi-dash-square').forEach(i => {
        i.classList.remove('bi-dash-square');
        i.classList.add('bi-plus-square');
    });
};

/**
 * @param {HTMLButtonElement} btn
 */
window["toggleUrlDetails"] = function (btn) {
    const urlNode = /** @type {HTMLElement} */(btn.parentNode.parentNode.parentNode);
    const i = urlNode.querySelector('.js-show-details').querySelector('i');
    const detailsShown = urlNode.dataset['details'] === "1";
    if (detailsShown) {
        i.classList.remove('bi-dash-square');
        i.classList.add('bi-plus-square');
        urlNode.querySelector('.js-details').remove();
    } else {
        i.classList.remove('bi-plus-square');
        i.classList.add('bi-dash-square');
        const data = urlNode["_xmlData"];
        let details = JSON.stringify(data, null, 2);
        details = details.replace(/ {2}"@_/g, '  "');
        const div = document.createElement('div');
        div.classList.add('js-details', 'px-3');
        div.innerHTML = `source: "${urlNode.dataset["source"]}",\ndata: ${details}`;
        urlNode.appendChild(div);
    }
    urlNode.dataset["details"] = detailsShown ? "0" : "1";
};
