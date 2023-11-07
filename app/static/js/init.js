let items;
let maxGuesses = 20;
let craftingTables = [];
let isTableValid = false;
let cursor = document.getElementById("cursor");
let cursorItem = null;
let givenIngredients;
let tagsFinder;
let itemNames;
let minetip;
let ingredientSlots = {};
let highContrastMode = false;

let emojiSummaries = [];

let isDragging = false;

const greyGuess = "greyguess";
const orangeGuess = "orangeguess";
const greenGuess = "greenguess";

/**
 * Sets background of given div to given item
 * @param {HTMLElement} div
 * @param {String} item
 */
function setSlotBackground(div, item) {
  
  div.classList =
    item === null ? ["slot-item"] : ["slot-item "+item.split(":")[1]];
}

var click = document.getElementById("audio");
/**
 * Plays minecraft music in the background
 */
function playAudio() {
  click.play();
}
buttons = document.getElementsByClassName("mc-button");

/**
 * Creates an emoji map to summarise the game's guesses as right or wrong
 * and it documents their location
 * @param {Array} matchmap array of guess locations
 * @returns {Array} array full of coloured squares (green and yellow) to represent guesses
 */
function generateEmojiSummary(ismatch, matchmap) {
  if (ismatch) {
    return [
      ["🟩", "🟩", "🟩"],
      ["🟩", "🟩", "🟩"],
      ["🟩", "🟩", "🟩"],
    ];
  }

  let emojiSummary = [
    ["⬜", "⬜", "⬜"],
    ["⬜", "⬜", "⬜"],
    ["⬜", "⬜", "⬜"],
  ];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (matchmap[i][j] == 2) emojiSummary[i][j] = "🟩";
      else if (matchmap[i][j] == 3) emojiSummary[i][j] = "🟨";
    }
  }
  return emojiSummary;
}

/**
 * Set cursor image to match cursorItem
 * @param {String} item item to follow cursor
 */
function setCursor(item) {
  setSlotBackground(cursor, item);
}

/**
 * Updates remaining guesses
 */
function updateRemainingGuesses() {
  document.getElementById("guess-counter").innerText = guessCount + 1;
}

/**
 * Create ingredients table from list.  Attaches event listeners to slots.
 */
function initIngredients() {
  document.getElementById("inv-spinner").remove();

  let ingredientsList = document.getElementById("ingredientsList");
  givenIngredients.forEach((ingredient, i) => {
    let newSlot = document.createElement("div");
    let image = document.createElement("div");

    newSlot.classList.add("slot");
    newSlot.classList.add("minetext");
    newSlot["item"] = ingredient;
    image.classList.add("slot-image");

    image.setAttribute("data-mctitle", itemNames[ingredient.split(":")[1]]);
    newSlot.appendChild(image);
    newSlot.setAttribute("data-mctitle", itemNames[ingredient.split(":")[1]]);
    setSlotBackground(image, ingredient);
    ingredientsList.appendChild(newSlot);

    newSlot.addEventListener("mousedown", (e) => {
      cursorItem = e.target.parentElement["item"];
      setCursor(cursorItem);
    });

    ingredientSlots[ingredient] = newSlot;
  });
}

/**
 * Creates a new crafting table element.  Adds empty crafting table to craftingTables.
 * Adds event listeners to slots for item placing and movement.
 */
function addNewCraftingTable() {
  let ingredientsList = document.getElementById("ingredientsList");
  let newTable = document.createElement("div");
  let tableNum = craftingTables.length;
  newTable["tableNum"] = tableNum;
  newTable.classList.add("inv-background");
  newTable.classList.add("crafting-table-instance");
  newTable.classList.add("flex");

  let tableDiv = document.createElement("div");
  tableDiv.classList.add("crafting-table");
  tableDiv.setAttribute("id", "tablenumber" + tableNum);

  craftingTables.push([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);

  newTable.appendChild(tableDiv);

  let arrowDiv = document.createElement("img");
  arrowDiv.classList.add("arrow");
  arrowDiv.src = "/static/images/arrow.png";
  newTable.appendChild(arrowDiv);

  let outputDiv = document.createElement("div");
  outputDiv.classList.add("crafting-output");
  let slot = document.createElement("div");
  slot.classList.add("slot");
  addTooltip(slot);
  
  let imageDiv = document.createElement("div");
  slot.setAttribute("id", "solutiondiv" + tableNum);
  
  slot.classList.add("output-slot");
  imageDiv.classList.add("slot-image");
  slot.appendChild(imageDiv);
  addTooltip(slot);
  
  slot.addEventListener("mousedown", (e) => {
    if (!isTableValid) return;

    let { isCorrect, matchmap } = processGuess(craftingTables[tableNum]);

    // Update solution div to display the correct item, change slot background and lock table
    emojiSummaries.push(generateEmojiSummary(isCorrect, matchmap));

    // update the bottom given ingredients indicators
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let itemAtSlot = craftingTables[tableNum][i][j];

        if (itemAtSlot === null) continue;

        if (matchmap[i][j] === 2) {
          ingredientSlots[itemAtSlot].classList.remove(greyGuess);
          ingredientSlots[itemAtSlot].classList.remove(orangeGuess);
          ingredientSlots[itemAtSlot].classList.add(greenGuess);
        } else if (matchmap[i][j] == 3) {
          // if not already green
          if (!ingredientSlots[itemAtSlot].classList.contains(greenGuess)) {
            ingredientSlots[itemAtSlot].classList.remove(greyGuess);
            ingredientSlots[itemAtSlot].classList.add(orangeGuess);
          }
        } else {
          if (
            !ingredientSlots[itemAtSlot].classList.contains(greenGuess) &&
            !ingredientSlots[itemAtSlot].classList.contains(orangeGuess)
          ) {
            ingredientSlots[itemAtSlot].classList.add(greyGuess);
          }
        }
      }
    }

    if (isCorrect) {
      setSlotBackground(imageDiv, solution_item);
      for (const [rowNum, rowElements] of matchmap.entries()) {
        for (let i = 0; i < 3; i++) {
          if (rowNum === 1) {
            j = i + 4;
          } else if (rowNum === 2) {
            j = i + 7;
          } else {
            j = i + 1;
          }
          const slot = document.querySelector(
            "#table"+tableNum+"slot"+(j-1)
          );
          slot.classList.add("greenguess");
          slot.classList.add("lockedslot");
          slot.classList.remove("slot");
        }
      }
      setTimeout(() => {
        winner();
      }, 750);
    } else if (guessCount < maxGuesses) {
      for (const [rowNum, rowElements] of matchmap.entries()) {
        for (let i = 0; i < 3; i++) {
          if (rowNum === 1) {
            j = i + 4;
          } else if (rowNum === 2) {
            j = i + 7;
          } else {
            j = i + 1;
          }
          const slot = document.querySelector(
            "#table"+tableNum+"slot"+(j-1)
          );
          if (rowElements[i] === 2) {
            slot.classList.add("greenguess");
          } else if (rowElements[i] === 3) {
            slot.classList.add("orangeguess");
          }
          
          slot.classList.add("lockedslot");
          slot.classList.remove("slot");
          
        }
      }
      
      const clearButton = document.querySelector(
        "#clear-button-"+tableNum
      );
      clearButton.classList.add("locked");
      addNewCraftingTable();
      
      const guessbox = document.querySelector(
        "#guesses"
      );
      guessbox.scrollLeft = guessbox.scrollWidth;
    }

    var lockedtable = document.getElementById("tablenumber" + tableNum);
    lockedtable.replaceWith(lockedtable.cloneNode(true));
    var solutiondiv = document.getElementById("solutiondiv" + tableNum);
    solutiondiv.classList.add("lockedslot");
    
    for (let x = 0; x < 9; x++) {
      let slotID = "#table"+(tableNum)+"slot"+(x);
      
      const slot = document.querySelector(
        slotID
      );
      
      addTooltip(slot)
    }
    solutiondiv.classList.remove("slot");
    solutiondiv.replaceWith(solutiondiv.cloneNode(true));
    var solutiondiv1 = document.getElementById("solutiondiv" + tableNum);
    addTooltip(solutiondiv1)
    if (guessCount >= maxGuesses) {
      setTimeout(() => {
        loser();
      }, 750);
      return;
    }

    updateRemainingGuesses();
  });
  outputDiv.appendChild(slot);

  // Helper function - called after placing item(s)
  const checkSolution = () => {
    let checkArrangementData = checkArrangement(craftingTables[tableNum]);
    if (checkArrangementData[0]) {
      isTableValid = true;
      setSlotBackground(imageDiv, checkArrangementData[1]);
      imageDiv.setAttribute("data-mctitle", itemNames[checkArrangementData[1].split(":")[1]]);
      addTooltip(imageDiv);
    } else {
      isTableValid = false;
      setSlotBackground(imageDiv, null);
      imageDiv.setAttribute("data-mctitle", "");
    }
  };

  // Generate 9 slots
  for (let i = 0; i < 3; i++) {
    let craftingTableRow = document.createElement("div");
    craftingTableRow.classList.add("crafting-table-row");
    for (let j = 0; j < 3; j++) {
      let a = i * 3 + j;
      let slot = document.createElement("div");
      slot.setAttribute("id", "table"+tableNum+"slot"+a);
      slot.classList.add("slot");
      slot["row"] = i;
      slot["col"] = j;
      craftingTableRow.appendChild(slot);
      let imageSlotDiv = document.createElement("div");
      imageSlotDiv.classList.add("slot-image");
      slot.appendChild(imageSlotDiv);
      addTooltip(slot);

      // Slot-specific helper functions
      const swap = () => {
        setSlotBackground(imageSlotDiv, cursorItem);
        [craftingTables[tableNum][slot["row"]][slot["col"]], cursorItem] = [
          cursorItem,
          craftingTables[tableNum][slot["row"]][slot["col"]],
        ];
        imageSlotDiv.setAttribute("data-mctitle", itemNames[cursorItem.split(":")[1]]);
        setCursor(cursorItem);
      };

      const setSlotToCursor = () => {
        craftingTables[tableNum][slot["row"]][slot["col"]] = cursorItem;
        setSlotBackground(imageSlotDiv, cursorItem);
        
        imageSlotDiv.setAttribute("data-mctitle", itemNames[cursorItem.split(":")[1]]);
      };

      slot.addEventListener("mousedown", (e) => {
        if (craftingTables[tableNum][slot["row"]][slot["col"]] !== null) {
          swap();
          checkSolution();
          return;
        }

        if (cursorItem === null) return;

        isDragging = true;

        document.addEventListener(
          "mouseup",
          (e) => {
            setSlotToCursor();

            isDragging = false;
            cursorItem = null;
            setCursor(null);
            checkSolution();

            // getElements returns items lazily but we are removing items during
            // iteration, so force it to finish before we start by calling Array.from()
            for (const s of Array.from(
              newTable.getElementsByClassName("dragging")
            )) {
              s.classList.remove("dragging");
            }
          },
          { once: true }
        );
      });

      slot.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        if (craftingTables[tableNum][slot["row"]][slot["col"]] === null) {
          slot.classList.add("dragging");
          setSlotToCursor();
        }
      });
    }
    document.getElementById("minetip-tooltip").style.display = "none";
    tableDiv.appendChild(craftingTableRow);
    
  }

  let clearButtonContainer = document.createElement("div");

  let clearButton = document.createElement("div");
  clearButton.addEventListener("mouseup", (e) => {
    if(e.target.classList.contains("locked")) return;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        
        const slot = document.querySelector(
          "#table"+tableNum+"slot"+(i*3+j)
        ).children[0];
        setSlotBackground(slot, null);
      }
    }
      craftingTables[tableNum] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]
      const finishedslot = document.querySelector(
        "#solutiondiv"+tableNum+""
      ).children[0];
      setSlotBackground(finishedslot, null);
      
    triggerAudioButton("", "click");
  } ); 
  let clearButtonText = document.createElement("div");
  clearButtonText.classList.add("title");
  clearButtonText.textContent = "x";
  clearButton.appendChild(clearButtonText);
  clearButtonContainer.appendChild(clearButton);
  tableDiv.appendChild(clearButtonContainer);
  newTable.appendChild(outputDiv);
  clearButton.classList.add("clear-button");
  clearButton.classList.add("mc-button");
  clearButton.setAttribute("id","clear-button-"+tableNum);
  document.getElementById("guesses").appendChild(newTable);
}

/**
 * Creates a summary of how the match played out in the form of emoji's
 * @returns {string} all game emoji's grouped together
 */
function generateSummary() {
  let timezone = document.getElementById("timzone");
  let summaryString;
  if (timezone === null) {
    summaryString =
      "Minecraftle " +
      new Date().toISOString().slice(0, 10) +
      " " +
      guessCount +
      "/" +
      maxGuesses +
      "\n";
  } else {
    // not sure if "en-AU" breaks when timezone is set to other countries
    summaryString =
      "Minecraftle " +
      new Date()
        .toLocaleString("en-AU", { timeZone: timezone.innerText })
        .slice(0, 10) +
      " " +
      guessCount +
      "/" +
      maxGuesses +
      "\n";
  }

  for (let emojiSummary of emojiSummaries) {
    for (let row of emojiSummary) {
      summaryString += row.join("") + "\n";
    }
    summaryString += "\n";
  }
  return summaryString;
}

function sendStats(win, attempts) {
  let request = new XMLHttpRequest();
  request.open(
    "GET",
    "/api/submitgame?user_id=" +
      user_id +
      "&win=" +
      win +
      "&attempts=" +
      attempts
  );
  request.send();
  request.onload = () => {
    if (request.status === 200) {
      console.log(JSON.parse(request.response));
    } else {
      console.log("Error: " + request.status + " " + request.statusText);
    }
  };
}

const copyToClipboard = (str) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    return navigator.clipboard.writeText(str);
  return Promise.reject("The Clipboard API is not available.");
};

/**
 * Creates a popup window for game summary
 * @param {String} msg
 * @param {String} summary
 * @param {String} win
 */
function createPopup(msg, summary, win) {
  document.getElementById("popup").style = "visibility: visible;";
  document.getElementById("popupOverlay").style = "visibility: visible;";
  setSlotBackground(document.getElementById("popupSlotImage"), solution_item);
  document.getElementById("popupSlotImage").setAttribute("data-mctitle",itemNames[solution_item.split(":")[1]]);
  document.getElementById("popupContainer").style = "visibility: visible;";

  if (window.location.href.includes("random")) {
    document.getElementById("popupContent").textContent = msg + "\nNew Puzzle?";
    document.getElementById("popupCopyButton").children[0].textContent =
      "Daily";
    document.getElementById("popupCopyButton").onclick = function () {
      triggerAudioButton("/", "click");
    };
    document.getElementById("popupStatsButton").children[0].textContent =
      "Random";
    document.getElementById("popupStatsButton").onclick = function () {
      triggerAudioButton("/?random=True", "click");
      window.location.replace("/?random=True");
    };
  } else {
    document.getElementById("popupContent").textContent = msg + summary;
    document.getElementById("popupStatsButton").onclick = function () {
      triggerAudioButton("/stats/" + user_id, "click");
    };
    document.getElementById("popupCopyButton").onclick = function () {
      triggerAudioButton("", "click");
      copyToClipboard(summary);
    };
  }

  document.getElementById("close-popup").onclick = function () {
    triggerAudioButton("", "click");
    togglePopup();
  };
}

/**
 * Win message
 */
function winner() {
  let summary = generateSummary();
  let winnerMessage = "You won! Took " + guessCount + " guesses.\n";
  createPopup(winnerMessage, summary, 1);
  addShowPopupButton();
  sendStats(1, guessCount);
}

/**
 * Lose message
 */
function loser() {
  let summary = generateSummary();
  let soln = solution_item.split(":")[1]
  let loserMessage = "You lost!  The solution was " + itemNames[soln] + "\n";
  createPopup(loserMessage, summary, 0);
  addShowPopupButton();
  sendStats(0, guessCount);
}

function togglePopup() {
  let popup = document.getElementById("popup");
  let popupOverlay = document.getElementById("popupOverlay");
  let popupContainer = document.getElementById("popupContainer");
  if (popup.style.visibility === "visible") {
    popupContainer.style.visibility = "hidden";
    popupOverlay.style.visibility = "hidden";
    popup.style.visibility = "hidden";
  } else {
    popupContainer.style.visibility = "visible";
    popupOverlay.style.visibility = "visible";
    popup.style.visibility = "visible";
  }
}

function addShowPopupButton() {
  let showPopup = document.createElement("div");
  showPopup.classList.add("mc-button", "show-popup","widebutton");
  let buttonTitle = document.createElement("div");
  buttonTitle.classList.add("title", "center");
  buttonTitle.textContent = "Show Summary";
  showPopup.appendChild(buttonTitle);
  showPopup.onclick = () => {
    togglePopup();
  };
  document.getElementById("content").appendChild(showPopup);
}

function switchHighContrastMode() {
  highContrastMode = !highContrastMode;
  toggleHighContrastMode();
  setCss();
}

function setCss() {
  changeCssStyle(
    `.${greenGuess}`,
    "background-color",
    highContrastMode ? "#85c0f9" : "hsla(92, 100%, 37%, 0.859)"
  );
  changeCssStyle(
    `.${orangeGuess}`,
    "background-color",
    highContrastMode ? "#f5793a" : "#caa905"
  );
}

// Loads jsons after DOM has properly loaded
document.addEventListener("DOMContentLoaded", () => {
  addNewCraftingTable();
  givenIngredients = JSON.parse(localStorage.getItem("givenIngredients"));

    fetch("static/data/given_ingredients.json")
      .then((response) => response.json())
      .then((obj) => {
        if(!givenIngredients || !(JSON.stringify(obj) == JSON.stringify(givenIngredients)))
        {
          givenIngredients = obj;
          localStorage.setItem(
            "givenIngredients",
            JSON.stringify(givenIngredients)
          );
          window.location.reload();
        }

      });
  itemNames = JSON.parse(localStorage.getItem("itemNames"));
    fetch("static/data/item_names.json")
      .then((response) => response.json())
      .then((obj) => {
        if(!itemNames || !(JSON.stringify(obj) == JSON.stringify(itemNames)))
        {
          itemNames = obj;
          localStorage.setItem(
            "itemNames",
            JSON.stringify(itemNames)
          );
          window.location.reload();
        }

      });
    tagsFinder = JSON.parse(localStorage.getItem("tagsFinder"));
    fetch("static/data/tag_merged.json")
      .then((response) => response.json())
      .then((obj) => {
        if(!itemNames || !(JSON.stringify(obj) == JSON.stringify(tagsFinder)))
        {
          tagsFinder = obj;
          localStorage.setItem(
            "tagsFinder",
            JSON.stringify(tagsFinder)
          );
          window.location.reload();
        }

      });
  
  /*
  if (!items) {
    fetch("static/data/items.json")
      .then((response) => response.json())
      .then((obj) => {
        items = obj;
        localStorage.setItem("items", JSON.stringify(items));
        initIngredients();
      });
  } else {
  }*/
  initIngredients();

  getSolutionRecipe();
  minetip = document.getElementById("minetip-tooltip");

  // original code from https://codepen.io/devbobcorn/pen/wvzxxLv

  eventListenerAdder()
  minetip.style.display = "none";

  highContrastMode = getHighContrastMode();
  setCss();
});

// Check for dropping item if placed outside important divs.
let ingredientsDiv = document.getElementById("ingredients");
let guessesDiv = document.getElementById("guesses");
document.addEventListener("mousedown", (e) => {
  let isClickOutsideIngredients =
    ingredientsDiv.contains(e.target) || guessesDiv.contains(e.target);
  if (!isClickOutsideIngredients) {
    cursorItem = null;
    setCursor(cursorItem);
  }
});

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.pageX - 5 + "px";
  cursor.style.top = e.pageY - 5 + "px";
});

var pos = function (o, x, y, event) {
  var posX = 0, posY = 0;
  var e = event || window.event;
  if (e.pageX || e.pageY) {
      posX = e.pageX;
      posY = e.pageY;
  } else if (e.clientX || e.clientY) {
      posX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
      posY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
  }
  o.style.position = "absolute";
  o.style.top = (posY + y) + "px";
  o.style.left = (posX + x) + "px";
}
function eventListenerAdder(){
  
  document.querySelectorAll(".slot").forEach(e=>addTooltip(e));

}
function addTooltip(element){
  
  element.addEventListener("mouseover", function(event) {
    minetip.innerHTML = event.target.getAttribute("data-mctitle");
    if(minetip.innerHTML != "")
    minetip.style.display = "block";
  })
  
  element.addEventListener("mouseout", function(event) {
    minetip.style.display = "none";
    })

  element.addEventListener("mousemove", function (event) {
    if (event.clientX > window.innerWidth - document.getElementById("minetip-tooltip").getBoundingClientRect().width - 64)
    pos (minetip, -document.getElementById("minetip-tooltip").getBoundingClientRect().width, -30, event);
    else
    pos (minetip, 5, -30, event);
  });
}