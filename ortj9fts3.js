let currentRiskType = "percent";
let currentTradeType = "long";
let currentATRPeriod = 14;
let currentLanguage = "ru";
let stopMultiplier = 0.4;
let takeMultiplier = 1.2;

const translations = {
    ru: {
        title: "РИСК КАЛЬКУЛЯТОР",
        atrTitle: "ATR КАЛЬКУЛЯТОР",
        deposit: "Депозит:",
        risk: "Риск на сделку:",
        coin: "Цена входа:",
        bar: "Бар",
        high: "High",
        low: "Low",
        long: "ЛОНГ",
        short: "ШОРТ",
        fixed: "Фикс",
        atrCalc: "Рассчитать",
        calcBtn: "Рассчитать",
        risk_label: "Риск:",
        trade_type_label: "Тип сделки:",
        stop_label: "Стоп ({X} ATR):",
        take_label: "Тейк ({X} ATR):",
        position_size_label: "Размер позиции:",
        position_volume_label: "Объём позиции:",
        stop_loss_label: "Стоп-лосс:",
        take_profit_label: "Тейк-профит:",
        rr_ratio_label: "Прибыль/риск:",
        copy_title: "Скопировать в буфер",
        warnings: {
	fill: "⚠️ Заполните поля корректно!",
	atr: "⚠️ ATR слишком мал, позиция неадекватно большая!",
	risk: "⚠️ Риск превышает депозит!",
	atrInput: "⚠️ Введите хотя бы одну пару значений High и Low!",
	highLow: "⚠️ Значение Low не может быть больше High!"
        },
    },
    en: {
        title: "RISK CALC",
        atrTitle: "ATR CALC",
        deposit: "Deposit:",
        risk: "Risk per trade:",
        coin: "Entry price:",
        bar: "Bar",
        high: "High",
        low: "Low",
        long: "LONG",
        short: "SHORT",
        fixed: "Fixed",
        atrCalc: "Calculate",
        calcBtn: "Calculate",
        risk_label: "Risk:",
        trade_type_label: "Trade Type:",
        stop_label: "Stop ({X} ATR):",
        take_label: "Take ({X} ATR):",
        position_size_label: "Position Size:",
        position_volume_label: "Position Volume:",
        stop_loss_label: "Stop-Loss:",
        take_profit_label: "Take-Profit:",
        rr_ratio_label: "Reward/Risk:",
        copy_title: "Copy to clipboard",
        warnings: {
	fill: "⚠️ Fill in the fields correctly!",
	atr: "⚠️ ATR too small, position too large!",
	risk: "⚠️ Risk exceeds deposit!",
	atrInput: "⚠️ Enter at least one pair of High and Low values!",
	highLow: "⚠️ Low cannot be greater than High!"
        },
    },
};

function updateFavicon(accentColor = "#00ffaa") {
    const svg = `
	<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
	<path fill="${accentColor}" fill-rule="evenodd"
	d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16s-7.163 16-16 
	16m7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84l-1.728-.43l-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 
	6l-.708 2.839q-.565-.127-1.104-.26l.002-.009l-2.384-.595l-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 
	3.235q.073.017.18.057l-.183-.045l-1.13 4.532c-.086.212-.303.531-.793.41c.018.025-1.256-.313-1.256-.313l-.858 1.978l2.25.561c.418.105.828.215
	1.231.318l-.715 2.872l1.727.43l.708-2.84q.707.19 1.378.357l-.706 2.828l1.728.43l.715-2.866c2.948.558 5.164.333 
	6.097-2.333c.752-2.146-.037-3.385-1.588-4.192c1.13-.26 1.98-1.003 2.207-2.538m-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293
	4.929.872 4.37 3.11m.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733"/>
	</svg>`;
    const svgDataUrl = "data:image/svg+xml," + encodeURIComponent(svg);
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.href = svgDataUrl;
}

function toggleActiveButtons(ids, active) {
    ids.forEach((id) => document.getElementById(id).classList.toggle("active", id === active));
}

function toggleLanguage() {
    currentLanguage = currentLanguage === "ru" ? "en" : "ru";
    localStorage.setItem("language", currentLanguage);
    window.langTexts = translations[currentLanguage];
    const langToggle = document.getElementById("langToggle");
    langToggle.textContent = currentLanguage.toUpperCase();
    langToggle.classList.toggle("en", currentLanguage === "en");
    updateTranslations();
    calculate();
    document.getElementById("langToggle").textContent = currentLanguage.toUpperCase();
}

function updateTranslations() {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const translation = translations[currentLanguage][key];
        if (translation) {
	el.textContent = translation;
        }
    });
    const titledElements = document.querySelectorAll("[data-i18n-title]");
    titledElements.forEach((el) => {
        const key = el.getAttribute("data-i18n-title");
        const translation = translations[currentLanguage][key];
        if (translation) {
	el.title = translation;
        }
    });
}

function setOption({ key, value, buttons, activeId, updateStyle = false, extra = () => {} }) {
    switch (key) {
        case "riskType": currentRiskType = value; break;
        case "tradeType": currentTradeType = value; break;
        case "ATRPeriod":
            currentATRPeriod = value;
            stopMultiplier = value === 14 ? 0.4 : 0.6;
            takeMultiplier = value === 14 ? 1.2 : 1.8;
            document.getElementById("atrPeriodLabel").textContent = value;
            break;
    }
    localStorage.setItem(key, value);
    if (buttons && activeId) toggleActiveButtons(buttons, activeId);
    if (updateStyle) {
        const root = document.documentElement;
        const isShort = value === "short";
        root.style.setProperty("--accent", isShort ? "#ff5555" : "#00ffaa");
        root.style.setProperty("--shadow-color", isShort ? "rgba(255, 85, 85, 0.3)" : "rgba(0, 255, 170, 0.3)");
        root.style.setProperty("--copy-hover", isShort ? "#e14444" : "#00db8b");
        updateFavicon(getComputedStyle(root).getPropertyValue("--accent").trim());
    }
    extra();
    calculate();
}

function setRiskType(type) {
    setOption({
        key: "riskType",
        value: type,
        buttons: ["btnPercent", "btnFixed"],
        activeId: type === "percent" ? "btnPercent" : "btnFixed"
    });
}

function setTradeType(type) {
    setOption({
        key: "tradeType",
        value: type,
        buttons: ["btnLong", "btnShort"],
        activeId: type === "long" ? "btnLong" : "btnShort",
        updateStyle: true
    });
}

function setATRPeriod(p) {
    setOption({
        key: "ATRPeriod",
        value: p,
        buttons: ["btnATR14", "btnATR5"],
        activeId: `btnATR${p}`
    });
}

function formatNumber(value) {
    if (value === 0) return "0";
    let formatted;
    if (value < 0.000001) {
        formatted = value.toExponential(2);
    } else if (value < 1) {
        formatted = value.toFixed(8);
    } else if (value < 100) {
        formatted = value.toFixed(6);
    } else {
        formatted = value.toFixed(2);
    }
    return formatted.replace(/\.?0+$/, "");
}

function openAtrModal() {
    document.getElementById("atr-modal").style.display = "flex";
    const atrInputs = document.getElementById("atr-inputs");
    atrInputs.innerHTML = `
	<table><thead><tr><th data-i18n="bar">Бар</th>
	<th data-i18n="high">High</th><th data-i18n="low">Low</th>
	</tr></thead><tbody>
	${Array.from({ length: currentATRPeriod },(_, i) => `<tr><td>${i + 1}</td>
	<td><input type="number" min="0" step="0.01" id="high${i}"></td>
	<td><input type="number" min="0" step="0.01" id="low${i}"></td>
	</tr>`).join("")}</tbody></table>`;
    for (let i = 0; i < currentATRPeriod; i++) {
        const highKey = `atr_high_${i}`;
        const lowKey = `atr_low_${i}`;
        const highEl = document.getElementById(`high${i}`);
        const lowEl = document.getElementById(`low${i}`);
        if (sessionStorage.getItem(highKey)) {
            highEl.value = sessionStorage.getItem(highKey);
        }
        if (sessionStorage.getItem(lowKey)) {
            lowEl.value = sessionStorage.getItem(lowKey);
        }
            highEl.addEventListener("input", () => {
            sessionStorage.setItem(highKey, highEl.value);
        });
        lowEl.addEventListener("input", () => {
            sessionStorage.setItem(lowKey, lowEl.value);
        });
	}
    document.getElementById("atr-result").textContent = "";
    updateTranslations();
    setTimeout(() => {
        const firstInput = document.getElementById("high0");
        if (firstInput) firstInput.focus();
    }, 0);
}

function calculateATR() {
    let sum = 0,
        count = 0,
        invalidPair = false;
    for (let i = 0; i < currentATRPeriod; i++) {
        const high = parseFloat(document.getElementById(`high${i}`).value);
        const low = parseFloat(document.getElementById(`low${i}`).value);
        if (!isNaN(high) && !isNaN(low)) {
            if (low > high) {
                invalidPair = true;
                break;
            }
            sum += high - low;
            count++;
        }
    }
    const resultElem = document.getElementById("atr-result");
    if (invalidPair) {
        resultElem.textContent = window.langTexts.warnings.highLow;
        return;
	}
    if (count === 0) {
        resultElem.textContent = window.langTexts.warnings.atrInput;
    } else {
        const atr = sum / count;
        const formattedATR = formatNumber(atr);
        resultElem.textContent = `ATR (${count}): ${formattedATR}`;
        document.getElementById("atr").value = formattedATR;
        localStorage.setItem("atr", formattedATR);
        calculate();
    }
}

function calculate() {
    const deposit = parseFloat(document.getElementById("deposit").value);
    const riskValue = parseFloat(document.getElementById("riskValue").value);
    const CoinPrice = parseFloat(document.getElementById("CoinPrice").value);
    const atr = parseFloat(document.getElementById("atr").value);
    const resultDiv = document.getElementById("result");
    const copyBtn = document.getElementById("copyBtn");
    if ([deposit, riskValue, CoinPrice, atr].some((v) => isNaN(v) || v <= 0)) {
        resultDiv.innerHTML = `<span style='color:white; font-weight:bold;'>${window.langTexts.warnings.fill}</span>`;
        copyBtn.style.display = "none";
        return;
    }
    let stopMultiplier = currentATRPeriod === 14 ? 0.4 : 0.6;
    let takeMultiplier = currentATRPeriod === 14 ? 1.2 : 1.8;
    const stop = atr * stopMultiplier;
    if (stop < 0.01) {
        resultDiv.innerHTML = `<span style='color:white; font-weight:bold;'>${window.langTexts.warnings.atr}</span>`;
        copyBtn.style.display = "none";
        return;
    }
    const take = atr * takeMultiplier;
    const riskAmount = currentRiskType === "percent" ? deposit * (riskValue / 100) : riskValue;
    if (riskAmount > deposit) {
        resultDiv.innerHTML = `<span style='color:white; font-weight:bold;'>${window.langTexts.warnings.risk}</span>`;
        copyBtn.style.display = "none";
        return;
    }
    const CoinSize = riskAmount / stop;
    const positionSize = CoinSize * CoinPrice;
    let stopLoss, takeProfit;
    if (currentTradeType === "long") {
        stopLoss = CoinPrice - stop;
        takeProfit = CoinPrice + take;
    } else {
        stopLoss = CoinPrice + stop;
        takeProfit = CoinPrice - take;
    }
    const rrRatio = take / stop;
    const stopLabel = translations[currentLanguage].stop_label.replace("{X}", stopMultiplier);
    const takeLabel = translations[currentLanguage].take_label.replace("{X}", takeMultiplier);
    resultDiv.innerHTML = `
	<strong data-i18n="trade_type_label">Тип сделки:</strong> ${currentTradeType.toUpperCase()}<br>
	<strong data-i18n="risk_label">Риск:</strong> ${formatNumber(riskAmount)}<br>
	<strong data-i18n="stop_loss_label">Стоп-лосс:</strong> ${formatNumber(stopLoss)}<br>
	<strong data-i18n="take_profit_label">Тейк-профит:</strong> ${formatNumber(takeProfit)}<br>
	<strong>${stopLabel}</strong> ${formatNumber(stop)}<br>
	<strong>${takeLabel}</strong> ${formatNumber(take)}<br>
	<strong data-i18n="position_size_label">Размер позиции:</strong> ${formatNumber(CoinSize)}<br>
	<strong data-i18n="position_volume_label">Объём позиции:</strong> ${formatNumber(positionSize)}<br>
	<strong data-i18n="rr_ratio_label">Прибыль/риск:</strong> ${formatNumber(rrRatio)} : 1`;
    updateTranslations();
    copyBtn.textContent = "⧉";
    copyBtn.classList.remove("glow");
    copyBtn.style.display = "block";
    window.data_to_tg = {
	dep: deposit,
	risk: riskValue,
	coin: formatNumber(CoinPrice),
	atr: atr,
	atrPer: currentATRPeriod,
	type: currentTradeType.toUpperCase(),
	riskType: currentRiskType,
	stopMult: stopMultiplier,
	takeMult: takeMultiplier,
	stop: formatNumber(stop),
	take: formatNumber(take),
	riskAmount: formatNumber(riskAmount),
	coinSize: formatNumber(CoinSize),
	pos: formatNumber(positionSize),
	loss: formatNumber(stopLoss),
	profit: formatNumber(takeProfit),
	ratio: formatNumber(rrRatio),
	language: currentLanguage
	};
}

function copyResultToClipboard() {
    const text = document.getElementById("result").innerText;
    const btn = document.getElementById("copyBtn");
    const data = JSON.stringify({hex: 111, rgb: 111});
    Telegram.WebApp.sendData(JSON.stringify(window.data_to_tg));
    console.log("📦 data_to_tg:", window.data_to_tg);
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "( ͡ᵔ ͜ʖ ͡ᵔ )";
        btn.classList.add("glow");
        setTimeout(() => {
	btn.textContent = "⧉";
	btn.classList.remove("glow");
        }, 800);
    });
}

document.addEventListener("click", (e) => {
    const modal = document.getElementById("atr-modal");
    if (!modal || modal.style.display === "none") return;
    if (e.target === modal || e.target.id === "closeAtrBtn") {
        modal.style.display = "none";
    }
});

window.addEventListener("DOMContentLoaded", () => {
    currentLanguage = localStorage.getItem("language") || "ru";
    document.getElementById("langToggle").textContent = currentLanguage.toUpperCase();
    document.getElementById("langToggle").classList.toggle("en", currentLanguage === "en");
    window.langTexts = translations[currentLanguage];
    updateTranslations();
    currentRiskType = localStorage.getItem("riskType") || "percent";
    currentTradeType = localStorage.getItem("tradeType") || "long";
    currentATRPeriod = parseInt(localStorage.getItem("ATRPeriod")) || 14;
    setRiskType(currentRiskType);
    setTradeType(currentTradeType);
    setATRPeriod(currentATRPeriod);
    updateFavicon(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
    ["deposit", "riskValue", "CoinPrice", "atr"].forEach(id => {
        const input = document.getElementById(id);
        input.value = localStorage.getItem(id) || input.value;
        input.addEventListener("input", () => {
        localStorage.setItem(id, input.value);
        });
    });
    calculate();
    document.getElementById("deposit").focus();
});
