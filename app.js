//Module Pattern

var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current, index, array) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, _description, _value) {
            var newItem, ID;
            //debugger;
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            //Create new object
            switch (type) {
                case 'inc':
                    newItem = new Income(ID, _description, _value);
                    break;
                case 'exp':
                    newItem = new Expense(ID, _description, _value);
                    break;
                default:
                    break;
            }

            //push into the data structure
            data.allItems[type].push(newItem);

            console.log(data);

            //return the new element
            return newItem;
        },
        calculateBudget: function () {
            var totalBudget, percentage;
            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        deleteItem: function (_type, _id) {
            var ids, idIndex;
            //map method returns a brand new array
            ids = data.allItems[_type].map(function (current, index, array) {
                return current.id;
            });

            idIndex = ids.indexOf(_id);

            if (idIndex !== -1) {
                data.allItems[_type].splice(idIndex, 1);
            }
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };
})();

var UIController = (function () {
    var DOMStrings = {
        inputValue: '.add__value',
        inputDescription: '.add__description',
        inputType: '.add__type',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncome: '.budget__income--value',
        budgetExpenses: '.budget__expenses--value',
        expensesPercentage: '.budget__expenses--percentage',
        container: '.container',
        btnDelete: '.item__delete--btn'
    }
    return {
        getInput: function () {
            return {
                valueAdded: parseFloat(document.querySelector(DOMStrings.inputValue).value),
                description: document.querySelector(DOMStrings.inputDescription).value,
                type: document.querySelector(DOMStrings.inputType).value   //either inc or exp
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create HTML string with pacehoder text
            if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
            <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
            <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div></div></div>`;
            }
            else if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">
                    <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">
                    <i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('afterend', newHtml);

        },
        deleteListItem: function (selectorId) {
            document.getElementById(selectorId).parentNode.removeChild(document.getElementById(selectorId));
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue); //returns List

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (currentItem, index, entireArray) {
                currentItem.value = "";
            });

            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetValue).textContent = obj.budget;
            document.querySelector(DOMStrings.budgetIncome).textContent = obj.totalInc;
            document.querySelector(DOMStrings.budgetExpenses).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.expensesPercentage).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.expensesPercentage).textContent = '--';
            }
        },
        getDOMStrings: function () {
            return DOMStrings;
        }
    }
})();


//Global App Controller
var controller = (function (budgetCtrl, UICtrl) {


    var updateBudget = function () {

        //04. calculate the budget
        budgetCtrl.calculateBudget();
        //return the budget
        var budgetData = budgetCtrl.getBudget();
        //05. display the budget on the UI
        console.log(budgetData);
        UICtrl.displayBudget(budgetData);

    };

    var ctrlAddItem = function () {
        var rinput, newItem;
        //01. Get the field input data
        input = UICtrl.getInput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.valueAdded) && input.valueAdded > 0) {
            //02. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.valueAdded);
            //03. add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //clear fields
            UICtrl.clearFields();
            //Calculate and update the budget
            updateBudget();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, Id;
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            Id = parseInt(splitId[1]);

            //Delete the element from the Data structure
            budgetCtrl.deleteItem(type, Id);

            //Delete the element from the UI
            UICtrl.deleteListItem(itemId);
            //Update and show the new budget
            updateBudget();
        }


    };

    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        //adding Items by (+) button in the html
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);

        //adding by Enter button
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        //event delegation (for deleting an item)
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    return {
        init: function () {
            console.log('app started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

//Init App
controller.init();