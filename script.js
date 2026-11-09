"use strict";

const form = document.getElementById("picker-form");
const options = document.getElementById("options");
const addButton = document.getElementById("add-option");
const errorMessage = document.getElementById("error-message");
const result = document.getElementById("result");
const resultValue = document.getElementById("result-value");
let nextInputId = 0;

// A … Z, AA, AB … と、26件を超えてもラベルを付けられる。
function optionLabel(index) {
  let label = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
  }
  return label;
}

function updateLabels() {
  Array.from(options.children).forEach((row, index) => {
    const label = optionLabel(index);
    row.querySelector("label").textContent = label;
    row.querySelector("button").setAttribute("aria-label", `選択肢${label}を削除`);
  });
}

function addOption(focus = false) {
  const row = document.createElement("div");
  row.className = "option-row";

  const input = document.createElement("input");
  input.type = "text";
  input.id = `option-${nextInputId++}`;
  input.className = "option-input";
  input.placeholder = ["例：ラーメン", "例：カレー", "例：寿司"][options.children.length] || "選択肢を入力";

  const label = document.createElement("label");
  label.className = "option-label";
  label.htmlFor = input.id;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-button";
  remove.textContent = "×";
  remove.addEventListener("click", () => {
    const nextFocus = row.nextElementSibling || row.previousElementSibling;
    row.remove();
    updateLabels();
    if (nextFocus) nextFocus.querySelector("input").focus();
    else addButton.focus();
  });

  row.append(label, input, remove);
  options.append(row);
  updateLabels();
  if (focus) input.focus();
}

// 0以上count未満の整数を一様に生成する（棄却法）。
// 2^32がcountで割り切れない場合、余った末尾の値を捨てる。
// 受理範囲の大きさがcountの倍数なので、各剰余の出現回数は等しい。
function randomIndex(count) {
  const range = 0x100000000;
  if (!Number.isInteger(count) || count < 1 || count > range) {
    throw new RangeError("選択肢の数が範囲外です。");
  }
  if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") {
    throw new Error("このブラウザでは安全な乱数を利用できません。最新のブラウザで開いてください。");
  }
  const limit = range - (range % count);
  const buffer = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % count;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const candidates = Array.from(options.querySelectorAll("input"))
    .map((input) => input.value.trim())
    .filter((value) => value.length > 0);

  errorMessage.hidden = true;
  if (candidates.length === 0) {
    resultValue.textContent = "ここに結果が表示されます";
    resultValue.classList.add("placeholder");
    errorMessage.textContent = "選択肢を1つ以上入力してください。";
    errorMessage.hidden = false;
    return;
  }

  try {
    const selected = candidates[randomIndex(candidates.length)];
    resultValue.textContent = selected;
    resultValue.classList.remove("placeholder");
    // 結果を確定してから表示だけをアニメーションする。
    result.classList.remove("reveal");
    void result.offsetWidth;
    result.classList.add("reveal");
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
  }
});

addButton.addEventListener("click", () => addOption(true));
for (let i = 0; i < 3; i += 1) addOption();
