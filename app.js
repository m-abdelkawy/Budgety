//Module Pattern

var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

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
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current, index, array) {
                current.calculatePercentage(data.totals.inc);
                return current.percentage;
            });
        },
        getPercentages: function () {
            var percArr = data.allItems.exp.map(function (current, index, array) {
                return current.getPercentage();
            });
            return percArr;
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
        btnDelete: '.item__delete--btn',
        expensesList: '.expenses__list',
        percentagelbl: '.item__percentage',
        dateLabel: '.budget__title--month',
        addtypeDDL: '.add__type'
    }
    var formatNumber = function (num, type) {
        var numSplit, int, dec, sign;
        /*
        + or - before the number,
        2 decimal numbers,
        comma separator for thousands
        2310.4578 -> + 2,310.46
        2000      -> + 2,000.00
         */
        num = Math.abs(num);
        num = num.toFixed(2);  //returns string

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

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
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

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
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.budgetIncome).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.budgetExpenses).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.expensesPercentage).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.expensesPercentage).textContent = '--';
            }
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.percentagelbl); //returns node list.
            //debugger;

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function () {
            var now, year, month, monthsArr;
            now = new Date();

            year = now.getFullYear();
            month = now.getMonth();

            monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMStrings.dateLabel).textContent = monthsArr[month] + '.' + year;
        },
        changedType: function () {
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputType + ',' + DOMStrings.inputValue); //returns a node list
            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
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

    var updatePercentages = function () {
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        //update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
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
            //calculate and update percentages
            updatePercentages();
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
            //calculate and update percentages
            updatePercentages();
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

        //event listener for type change
        document.querySelector(DOM.addtypeDDL).addEventListener('change', UICtrl.changedType);

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
            UICtrl.displayMonth();
        }
    };

})(budgetController, UIController);

//Init App
controller.init();